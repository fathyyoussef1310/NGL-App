import * as userRepo from "../../auth/repository/auth.repo.js";
import Otp from "../../auth/model/Otp.model.js";
import * as nodemailer from "../../../lib/email/nodeMailer.js";
import * as otpRepository from "../../auth/repository/otp.repository.js";
import {toMins} from "../../../pkg/utils/time.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {AppError} from "../../../lib/gobalErrorHandler/appError.js";
import {generateOtpEmail} from "../../../lib/utils/otp.generator.js";
import {logger} from "../../../pkg/logger/logger.js";
import {generateToken} from "../../../lib/utils/genrateToken.js";
import {comparePassword, hashPassword} from "../../../lib/utils/bcrypt.js";
import {verifyGoogleToken} from "../../../lib/utils/googleauth.js";
import * as authRepo from "./auth.service.js";
import {OAuth2Client} from "google-auth-library";
import {mailJetProvider} from "../../../lib/email/initEmail.js";

export const createUser = async (userData) => {
    const hashedPassword = await hashPassword(userData.password);
    try {
        const user = await userRepo.createUser({...userData,
            password: hashedPassword
        });
        if (!user) {
            throw new AppError("Failed to create user", 400);
        }
        const code = generateOtpEmail();
        await Otp.create({
            code,
            email: user.email,
            expiredAt: new Date(
                Date.now() + toMins(5, "minutes")
            )
        });
        await mailJetProvider.sendEmail(
            userData.email,
            'Verification Code',
            `<h1>Your verification code is ${code}</h1>`
        );
        return user;

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

    if (otp.code !== userData.code) {
        throw new AppError("Invalid OTP code!", 400);
    }

    const userUpdated = await userRepo.updateUserByEmail(
        userData.email,
        {isVerified: true}
    );

    await otpRepository.deleteOtp(userData.email);

    return userUpdated;
};

export const loginUser = async (email, password) => {
    const user = await userRepo.checkUserByEmail(email);
    if (!user) {
        throw new AppError("Invalid email or password!", 401);
    }

    if (user.isVerified !== true) {
        throw new AppError("This email not verified!", 403);
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
        throw new AppError("Invalid email or password!", 401);
    }
    return generateToken({ id: user._id, email: user.email, name: user.name });

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
        expiredAt: new Date(Date.now() + toMins(5, "minutes"))
    });

    await mailJetProvider.sendEmail(email,
        'NGL-APP',
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
        password: hashedPassword
    });

    await otpRepository.deleteOtp(email);

    return updatedUser;
};

export let loginWithGoogle = async (email, clientId) => {
    const payload = await verifyGoogleToken(payload.email)
    const user = await  authRepo.createUser({
        email : payload.email,
        name: payload.name,
        provider : true,
        isVerified: true,
    })
    return generateToken({ id: user._id, email: user.email, name: user.name });
}