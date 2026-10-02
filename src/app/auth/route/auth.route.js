import Router from 'express';
import  * as authController from'../controller/auth.controller.js';

const authRouter = Router();

authRouter.post('/register', authController.createUser);
authRouter.patch('/update-account',authController.verifyUser)
authRouter.post('/login' , authController.login)
authRouter.post('/send-otp' , authController.sendOtp)
authRouter.patch('/reset-Password' , authController.forgetPassword)
///// send Otp next
export default authRouter;