import * as authServices from "../services/auth.service.js";
import {toMins} from "../../../common/utils/time.js";
import {sendOtpEmail} from "../services/auth.service.js";
import {AppError} from "../../../common/utils/appError.js";
const createUser = async (req, res, next) => {
    try {
        const userData = await authServices.createUser(req.body);

        res.status(201).json({
            message: "Successfully created user",
            user: userData
        });
    } catch (err) {
        next(err);
    }
};
const verifyUser = async (req, res, next) => {
    try {
        const {email,code} = req.body;
        const userData = await authServices.verifyUser({email, code});
        res.status(201).json({
            message: "Successfully verify user",
            user: userData
        })
    }catch (err) {
        next(err);
    }
}
const login = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        const token = await authServices.loginUser(email, password);
        res.cookie('access_Token', token ,
            {
                httpOnly: true,
                maxAge: toMins(1 , "hours"),
            }
        );
        res.status(201).json({
            message: "Successfully logged in",
            token: token
        })
    } catch (err) {
        next(err);
    }
}
const  sendOtp= async (req, res, next) => {
    try {
        const {email} = req.body;
        const userData = await authServices.sendOtpEmail(email);
        res.status(201).json({
            message: "Successfully verify user",
            user: userData
        })
    }catch (err) {
        next(err);
    }
}
const forgetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            throw new AppError("Email, code and newPassword are required", 400);
        }
        const userData = await authServices.forgetPassword(email, code, newPassword);
        res.status(200).json({
            message: "Password reset successfully",
            user: userData
        });
    } catch (e) {
        next(e);
    }
};
export {
    createUser,
    verifyUser,
    login,
    sendOtp,
    forgetPassword
};