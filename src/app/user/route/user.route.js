import Router from 'express';
import  * as userController from'../controller/user.controller.js';

const userRouter = Router();

userRouter.post('/register', userController.createUser);
userRouter.patch('/update-account',userController.verifyUser)
userRouter.post('/login' , userController.login)
userRouter.post('/send-otp' , userController.sendOtp)
///// send Otp next 
export default userRouter;