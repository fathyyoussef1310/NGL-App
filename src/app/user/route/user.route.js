import express from "express";
import { toMins } from "../../../pkg/utils/time.js";
import { withCache } from "../../../lib/cache/withCache.js";
import User from "../model/user.model.js";

const userRouter = express.Router();

userRouter.get("/get-All-Users", withCache(toMins(99)),
    async (req, res, next) => {
        try {
            const users = await User.find({});
            res.json({
                data: users,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default userRouter;