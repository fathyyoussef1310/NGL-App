import Router from 'express';
import  * as authController from'../controller/auth.controller.js';
import {loginWithGoogle} from "../services/auth.service.js";

const authRouter = Router();

authRouter.post('/register', authController.createUser);
authRouter.patch('/update-account',authController.verifyUser)
authRouter.post('/login' , authController.login)
authRouter.post('/login-with-google' , authController.loginWithGoogleC)
authRouter.post('/send-otp' , authController.sendOtp)
authRouter.patch('/reset-Password' , authController.forgetPassword)

export default authRouter;