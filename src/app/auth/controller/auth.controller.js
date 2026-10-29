import * as authServices from "../services/auth.service.js";
import { toMins } from "../../../pkg/utils/time.js";
import { AppError } from "../../../lib/gobalErrorHandler/appError.js";
import { validateBody } from "../../../lib/validation/validation.js";
import {
    forgetPasswordDto, googleLoginDto,
    loginDto, refreshTokenDto,
    registerDto,
    sendOtpDto,
    verifyAccountDto,
} from "../Dto/auth.dto.js";
import {loginWithGoogle} from "../services/auth.service.js";
import {setAuthCookies} from "../../../lib/auth/utils.cookies.js";

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
        const { email, tokens , password } = data;
        const token = await authServices.loginUser(email, password);

        if (!tokens){
            return res.json({
                message:"Check Your Inbox",
                success: true,
            })
        }
        setAuthCookies(res ,tokens)
        res.status(200).json({
            message: "Successfully logged in",
            token,
            tokens,
        });
    } catch (err) {
        next(err);
    }
};

export const twoStepVerification =  async (req,res,next)=>
{
    try
    {
       const  {email , code} =req.body;
       const ans = await authServices.enable2Verification(email, code);
       res.status(200).json({
           success: true,
           message: "Successfully verified by two step Verification ",
       })
    }
    catch (e)
    {
        next(e);
    }
}

const sendOtp = async (req, res, next) => {
    try {
        const data = validateBody(sendOtpDto, req.body);
        const { email } = data;
        await authServices.sendOtpEmail(email);
        res.status(200).json({
            message: "OTP sent successfully",
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

        return res.status(200).json({
            message: "Password reset successfully",
            success: true,
            user: userData,
        });
    } catch (err) {
        next(err);
    }
};

const loginWithGoogleC = async (req, res, next) => {
    try {

        const data = validateBody(googleLoginDto, req.body);
        const { accessToken, refreshToken, user } = await authServices.loginWithGoogle(data.idToken);

        setAuthCookies(res , refreshToken)
        res.status(200).json({
            message: "Successfully logged in",
            data:{
                accessToken,
                refreshToken,
                user
            }
        })
    }catch(err) {
        next(err);
    }
}

const refresh = async (req, res, next) => {
    try {
        const data = validateBody(refreshTokenDto, req.body);
        const { accessToken, refreshToken } = await authServices.refreshSession(data.refreshToken);
        setAuthCookies(res, refreshToken);
        res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        next(err);
    }
};

export async function verifyCodeToLogin(req, res, next) {
    try {
        const { email, code } = req.body;
        const result = await authServices.verifyAfter2StepVer(email, code);
        res.cookie("access_Token" , result.accessToken , {
            httpOnly: true,
            maxAge: toMins(1, "hours"),
        });
        res.cookie("refresh_Token" , result.refreshToken , {
            httpOnly: true,
            maxAge: toMins(7, "days"),
            path:"/api/auth/refresh-token"
        })
        res.status(200).json({
            success: true,
            message: "Two-step verification successful",
            data: result.user,
        });
    } catch (e) {
        next(e);
    }
}

export { createUser, verifyUser, login, sendOtp, forgetPassword ,  loginWithGoogleC , refresh};