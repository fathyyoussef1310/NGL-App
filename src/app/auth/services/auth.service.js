import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import * as userRepo from "../../auth/repository/auth.repo.js";
import * as otpRepository from "../../auth/repository/otp.repository.js";
import * as refreshTokenRepo from "../repository/refresh-token.repoistory.js";
import * as tokensServices from "./token.service.js";

import Otp from "../../auth/model/Otp.model.js";
import { AppError } from "../../../lib/gobalErrorHandler/appError.js";
import { generateOtpEmail } from "../../../lib/utils/otp.generator.js";
import { comparePassword, hashPassword } from "../../../lib/utils/bcrypt.js";
import { verifyGoogleToken } from "../../../lib/utils/googleauth.js";
import { mailJetProvider } from "../../../lib/email/initEmail.js";
import { cacheProvider } from "../../../lib/cache/init.js";
import { toMins } from "../../../pkg/utils/time.js";


const OTP_TTL_MS = toMins(5, "minutes");
const OTP_CACHE_PREFIX = "OTP:";

// Helpers for Code Optimize
const toPublicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
});

async function issuePair(user, family) {
    const accessToken = tokensServices.signAccess(user);
    const refreshToken = tokensServices.signRefresh(user, family);

    const decoded = jwt.decode(refreshToken);
    if (!decoded?.exp) {
        throw new AppError("Failed to issue refresh token", 500);
    }

    await refreshTokenRepo.create({
        user: user.id,
        family,
        tokenHash: tokensServices.hash(refreshToken),
        expiresAt: new Date(decoded.exp * 1000),
    });

    return { accessToken, refreshToken };
}

async function createAndStoreOtp(email) {
    const code = generateOtpEmail();
    await otpRepository.deleteOtp(email);
    await cacheProvider.del(`${OTP_CACHE_PREFIX}${email}`);

    await Otp.create({code, email,
        expiredAt: new Date(Date.now() + OTP_TTL_MS),
    });

    await cacheProvider.set(`${OTP_CACHE_PREFIX}${email}`, code, OTP_TTL_MS);

    return code;
}

async function validateAndConsumeOtp(email, code) {

    let stored = await cacheProvider.get(`${OTP_CACHE_PREFIX}${email}`);

    if (!stored) {
        const otpDoc = await otpRepository.getOtpByEmail(email);
        if (!otpDoc) {
            throw new AppError("OTP expired, please request a new one!", 400);
        }
        stored = otpDoc.code;
    }

    if (String(stored) !== String(code)) {
        throw new AppError("Invalid OTP code!", 400);
    }
    await Promise.all([
        cacheProvider.del(`${OTP_CACHE_PREFIX}${email}`),
        otpRepository.deleteOtp(email),
    ]);
}

async function requireUserByEmail(email) {
    const user = await userRepo.checkUserByEmail(email);
    if (!user) {
        throw new AppError("This email doesn't exist!", 404);
    }
    return user;
}

async function verifyOtpAndUpdateUser(email, code, updateData) {
    await requireUserByEmail(email);
    await validateAndConsumeOtp(email, code);

    const updated = await userRepo.updateUserByEmail(email, updateData);
    return toPublicUser(updated);
}

export const createUser = async (userData) => {
    const hashedPassword = await hashPassword(userData.password);

    try {
        const user = await userRepo.createUser({
            ...userData,
            password: hashedPassword,
        });

        if (!user) {
            throw new AppError("Failed to create user", 400);
        }

        const code = await createAndStoreOtp(user.email);

        await mailJetProvider.sendEmail(
            user.email,
            "Verification Code",
            `<h1>Your verification code is ${code}</h1>`
        );

        return toPublicUser(user);
    } catch (err) {
        if (err.code === 11000) {
            throw new AppError("Email already exists", 409);
        }
        throw err;
    }
};

export const verifyUser = async ({ email, code }) => {
    const user = await requireUserByEmail(email);

    if (user.isVerified) {
        throw new AppError("This email is already verified!", 409);
    }

    return verifyOtpAndUpdateUser(email, code, { isVerified: true });
};

export const enable2Verification = async (email, code) => {
    return verifyOtpAndUpdateUser(email, code, {
        twoStepVerification: true,
    });
};

export const verifyAfter2StepVer = async (email, code) => {
    const user = await requireUserByEmail(email);

    await validateAndConsumeOtp(email, code);

    const pair = await issuePair(user, crypto.randomUUID());

    return {
        ...pair,
        user: toPublicUser(user),
    };
};

export const loginUser = async (email, password) => {
    const user = await requireUserByEmail(email);

    if (user.isVerified !== true) {
        throw new AppError("This email is not verified!", 403);
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
        throw new AppError("Invalid email or password!", 401);
    }
    if (user.twoStepVerification === true) {
        const code = await createAndStoreOtp(email);
        await mailJetProvider.sendEmail(
            email, "2-Step Verification Code", `<h3>Your code is ${code}</h3>`
        );
        return {requires2FA: true, message: "OTP sent to your email",};
    }
    const pair = await issuePair(user, crypto.randomUUID());
    return {...pair, user: toPublicUser(user),};
};

export const loginWithGoogle = async (idToken) => {
    const payload = await verifyGoogleToken(idToken);

    if (!payload.email_verified) {
        throw new AppError("Google email not verified", 401);
    }

    let user = await userRepo.checkUserByEmail(payload.email);

    if (!user) {
        user = await userRepo.createUser({
            email: payload.email,
            name: payload.name,
            provider: true,
            isVerified: true,
        });
    }

    const pair = await issuePair(user, crypto.randomUUID());

    return {
        ...pair,
        user: toPublicUser(user),
    };
};

export const sendOtpEmail = async (email) => {
    await requireUserByEmail(email);

    const code = await createAndStoreOtp(email);

    await mailJetProvider.sendEmail(
        email,
        "NGL-APP Verification",
        `<h1>Your verification code is ${code}</h1>`
    );
};

export const forgetPassword = async (email, code, newPassword) => {
    const user = await requireUserByEmail(email);
    await validateAndConsumeOtp(email, code);

    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = await userRepo.updateUserByEmail(email, {
        password: hashedPassword,
    });
    await refreshTokenRepo.revokeAllForUser(updatedUser.id);

    return toPublicUser(updatedUser);
};

export const refreshSession = async (refreshToken) => {
    let payload;
    try {
        payload = tokensServices.verifyRefresh(refreshToken);
    } catch {
        throw new AppError("Invalid refresh token", 401);
    }
    const tokenHash = tokensServices.hash(refreshToken);
    const stored = await refreshTokenRepo.findByHash(tokenHash);
    if (!stored) {
        throw new AppError("Invalid refresh token", 401);
    }
    if (stored.revokedAt) {
        await refreshTokenRepo.revokeFamily(stored.family);
        throw new AppError("Token reuse detected", 401);
    }
    const user = await userRepo.findUserById(payload.sub);
    if (!user) {
        throw new AppError("User not found", 401);
    }
    const revoked = await refreshTokenRepo.revokeIfActive(stored.id);
    if (!revoked) {
        await refreshTokenRepo.revokeFamily(stored.family);
        throw new AppError("Token reuse detected", 401);
    }
  return issuePair(user, stored.family);
};