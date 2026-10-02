import * as userRepo from "../../user/repository/user.repo.js";
import Otp from "../../auth/model/Otp.model.js";
import * as nodemailer from "../../../common/email/nodeMailer.js";
import * as otpRepository from "../../auth/repository/otp.repository.js";
import {toMins} from "../../../common/utils/time.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {AppError} from "../../../common/utils/appError.js";
import {generateOtpEmail} from "../../../common/utils/otp.generator.js";
import {logger} from "../../../common/logger/logger.js";
import {generateToken} from "../../../common/utils/genrateToken.js";
import {comparePassword, hashPassword} from "../../../common/utils/bcrypt.js";

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

        await nodemailer.sendEmail(user.email, code);

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
    logger.info("code:", code);

    await Otp.create({
        code,
        email,
        expiredAt: new Date(Date.now() + toMins(5, "minutes"))
    });

    await nodemailer.sendEmail(
        email,
        code
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