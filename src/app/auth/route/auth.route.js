import Router from 'express';
import  * as authController from'../controller/auth.controller.js';
import {loginWithGoogle} from "../services/auth.service.js";
import {idempotency} from "../../../lib/idempotency/idempotency.js";

const authRouter = Router();

authRouter.post('/register', authController.createUser);
authRouter.patch('/update-account',authController.verifyUser)
authRouter.post('/login' , authController.login)
authRouter.post('/login-with-google' , authController.loginWithGoogleC)
authRouter.post('/send-otp' , authController.sendOtp)
authRouter.patch('/reset-Password' , idempotency(),authController.forgetPassword)
authRouter.post("/refresh-token", authController.refresh);
authRouter.patch('/two-step-verification' , authController.twoStepVerification)
authRouter.post('/two-step-verification-login' , authController.verifyCodeToLogin)

export default authRouter;