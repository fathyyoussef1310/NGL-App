import app from "bcrypt/promises.js";
import authRouter from "./app/auth/route/auth.route.js";
import {Router} from 'express';
import userRouter from "./app/user/route/user.route.js";
import messageRouter from "./app/message/route/message.route.js";
export const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/message', messageRouter);
