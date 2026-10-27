import crypto from "node:crypto";
import * as userRepo from "../../auth/repository/auth.repo.js";
import Otp from "../../auth/model/Otp.model.js";
import * as otpRepository from "../../auth/repository/otp.repository.js";
import * as tokens from "./token.service.js";
import { toMins } from "../../../pkg/utils/time.js";
import { AppError } from "../../../lib/gobalErrorHandler/appError.js";
import { generateOtpEmail } from "../../../lib/utils/otp.generator.js";
import { comparePassword, hashPassword } from "../../../lib/utils/bcrypt.js";
import { verifyGoogleToken } from "../../../lib/utils/googleauth.js";
import { mailJetProvider } from "../../../lib/email/initEmail.js";
import * as refreshTokenRepo from "../repository/refresh-token.repoistory.js";
// ---------- helpers ----------
import jwt from "jsonwebtoken";

async function issuePair(user, family) {
    const accessToken = tokens.signAccess(user);
    const refreshToken = tokens.signRefresh(user, family);

    const { exp } = jwt.decode(refreshToken);

    await refreshTokenRepo.create({
        user: user.id,
        family,
        tokenHash: tokens.hash(refreshToken),
        expiresAt: new Date(exp * 1000),
    });

    return { accessToken, refreshToken };
}

const toPublicUser = (user) => ({ id: user.id, email: user.email, name: user.name });


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

        const code = generateOtpEmail();
        await Otp.create({
            code,
            email: user.email,
            expiredAt: new Date(Date.now() + toMins(5, "minutes")),
        });

        await mailJetProvider.sendEmail(
            userData.email,
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

export const verifyUser = async (userData) => {
    const user = await userRepo.checkUserByEmail(userData.email);

    if (!user) {
        throw new AppError("This email doesn't exist!", 404);
    }
    if (user.isVerified === true) {
        throw new AppError("This email already verified!", 409);
    }

    const otp = await otpRepository.getOtpByEmail(userData.email);
    if (!otp) {
        throw new AppError("This OTP expired, please resend OTP!", 400);
    }
    if (String(otp.code) !== String(userData.code)) {
        throw new AppError("Invalid OTP code!", 400);
    }

    const userUpdated = await userRepo.updateUserByEmail(userData.email, {
        isVerified: true,
    });

    await otpRepository.deleteOtp(userData.email);

    return toPublicUser(userUpdated);
};


export const loginUser = async (email, password) => {
    const user = await userRepo.checkUserByEmail(email);
    if (!user) throw new AppError("Invalid email or password!", 401);
    if (user.isVerified !== true) throw new AppError("This email not verified!", 403);
    const match = await comparePassword(password, user.password);
    if (!match) throw new AppError("Invalid email or password!", 401);
    const pair = await issuePair(user, crypto.randomUUID());
    return { ...pair, user: toPublicUser(user) };
};

export const loginWithGoogle = async (idToken) => {
    const payload = await verifyGoogleToken(idToken);
    if (!payload.email_verified) throw new AppError("Google email not verified", 401);
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
    return { ...pair, user: toPublicUser(user) };
};

export const sendOtpEmail = async (email) => {
    const user = await userRepo.checkUserByEmail(email);
    if (!user) {
        throw new AppError("This email doesn't exist!", 404);
    }

    await otpRepository.deleteOtp(email);

    const code = generateOtpEmail();
    await Otp.create({
        code,
        email,
        expiredAt: new Date(Date.now() + toMins(5, "minutes")),
    });

    await mailJetProvider.sendEmail(
        email,
        "NGL-APP",
        `<h1>Your verification code is ${code}</h1>`
    );
};

export const forgetPassword = async (email, code, newPassword) => {
    const user = await userRepo.checkUserByEmail(email);
    if (!user) {
        throw new AppError("This email doesn't exist!", 404);
    }

    const otp = await otpRepository.getOtpByEmail(email);
    if (!otp) {
        throw new AppError("This OTP expired, please resend OTP!", 400);
    }
    if (String(otp.code) !== String(code)) {
        throw new AppError("Invalid OTP code!", 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = await userRepo.updateUserByEmail(email, {
        password: hashedPassword,
    });
    await refreshTokenRepo.revokeAllForUser(updatedUser.id);
    await otpRepository.deleteOtp(email);
    return toPublicUser(updatedUser);
};

export const refreshSession = async (refreshToken) => {
    let payload;
    try {
        payload = tokens.verifyRefresh(refreshToken);
    } catch {
        throw new AppError("Invalid refresh token", 401);
    }

    const stored = await refreshTokenRepo.findByHash(tokens.hash(refreshToken));
    if (!stored) throw new AppError("Invalid refresh token", 401);

    if (stored.revokedAt) {
        await refreshTokenRepo.revokeFamily(stored.family);
        throw new AppError("Token reuse detected", 401);
    }

    const user = await userRepo.findUserById(payload.sub);
    if (!user) throw new AppError("User not found", 401);
    const ok = await refreshTokenRepo.revokeIfActive(stored.id);
    if (!ok) {
        await refreshTokenRepo.revokeFamily(stored.family);
        throw new AppError("Token reuse detected", 401);
    }
    return issuePair(user, stored.family);
};