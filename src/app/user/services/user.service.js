import * as userRepo from "../repository/user.repo.js";
import Otp from "../../auth/model/Otp.model.js";
import * as nodemailer from "../../../common/email/nodeMailer.js";
import * as otpRepository from "../../auth/repository/otp.repository.js";
import {toMins} from "../../../common/utils/time.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {AppError} from "../../../common/utils/appError.js";
import OtpModel from "../../auth/model/Otp.model.js";
import {generateOtpEmail} from "../../../common/utils/otp.generator.js";
export const createUser = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await userRepo.createUser({
        ...userData,
        password: hashedPassword
    });

    const code = "128811";

    await Otp.create({
        code,
        email: user.email,
        expiredAt: new Date(Date.now() + toMins(5, "minutes"))
    });

    await nodemailer.sendOtpEmail(userData.email, code);

    return user;
};
export const verifyUser = async (userData) => {
    const user =  await userRepo.checkUserByEmail(userData.email);
    if (!user) {
        throw new  AppError("This Email Doesn't Exist!");
    }
    if (user.isVerified === true) {
        throw new AppError("This email already verified!");
    }
    const otp = await otpRepository.getOtpByEmail(userData.email);
    if (!otp) {
        throw new AppError("This Otp Expires please resend Otp!");
    }
    if (otp.code !== userData.code) {
        throw new AppError("This code Invalid !");
    }
    const userUpdated = await  userRepo.updateUserByEmail(userData.email, {isVerified: true})
    await otpRepository.deleteOtp(userData.email)
    return userUpdated;
}
export const loginUser = async (email, password) => {
    const user = await userRepo.checkUserByEmail(email);

    if (!user) {
        throw new AppError("This email doesn't Exist Or Password doesn't exist!");
    }

    if (user.isVerified !== true) {
        throw new AppError("This email not verified!");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new AppError("This email Has Invalid Credentials!");
    }

    const jwtToken = jwt.sign(
        {
            email: user.email,
            userId: user._id
        },
        process.env.JWT_SECRETKEY,
        {
            expiresIn: toMins(1, "hours")
        }
    );

    return jwtToken;
};

export const sendOtpEmail = async (email, message) => {
    const user = await userRepo.checkUserByEmail(email);
    if (!user) {
        throw new AppError("This email doesn't Exist!");
    }
    await otpRepository.deleteOtp(email);
    const code = generateOtpEmail();
    console.log("code:", code);
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