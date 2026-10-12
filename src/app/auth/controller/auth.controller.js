import * as authServices from "../services/auth.service.js";
import { toMins } from "../../../pkg/utils/time.js";
import { AppError } from "../../../lib/gobalErrorHandler/appError.js";
import { validateBody } from "../../../lib/validation/validation.js";
import {
    forgetPasswordDto,
    loginDto,
    registerDto,
    sendOtpDto,
    verifyAccountDto,
} from "../Dto/auth.dto.js";
import {loginWithGoogle} from "../services/auth.service.js";

const createUser = async (req, res, next) => {
    try {
        const data = validateBody(registerDto, req.body);
        const userData = await authServices.createUser(data);

        res.status(201).json({
            message: "Successfully created user",
            user: userData,
        });
    } catch (err) {
        next(err);
    }
};

const verifyUser = async (req, res, next) => {
    try {
        const data = validateBody(verifyAccountDto, req.body);
        const { email, code } = data;
        const userData = await authServices.verifyUser({ email, code });

        res.status(200).json({
            message: "Account verified successfully",
            user: userData,
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const data = validateBody(loginDto, req.body);
        const { email, password } = data;
        const token = await authServices.loginUser(email, password);

        res.cookie("access_Token", token, {
            httpOnly: true,
            maxAge: toMins(1, "hours"),
        });

        res.status(200).json({
            message: "Successfully logged in",
            token,
        });
    } catch (err) {
        next(err);
    }
};

const sendOtp = async (req, res, next) => {
    try {
        const data = validateBody(sendOtpDto, req.body);
        const { email } = data;
        const userData = await authServices.sendOtpEmail(email);

        res.status(200).json({
            message: "OTP sent successfully",
            user: userData,
        });
    } catch (err) {
        next(err);
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        const data = validateBody(forgetPasswordDto, req.body);
        const { email, code, newPassword } = data;

        const userData = await authServices.forgetPassword(email, code, newPassword);

        res.status(200).json({
            message: "Password reset successfully",
            user: userData,
        });
    } catch (err) {
        next(err);
    }
};

const loginWithGoogleC = async (req, res, next) => {
    try {
        const token = await authServices.loginWithGoogle(req.body.idToken);
        res.cookie("access_Token", token, {
            httpOnly: true,
            maxAge: toMins(1, "hours"),
        })
        res.status(200).json({
            message: "Successfully logged in",
            data:token,
        })
    }catch(err) {
        next(err);
    }
}

export { createUser, verifyUser, login, sendOtp, forgetPassword ,  loginWithGoogleC };