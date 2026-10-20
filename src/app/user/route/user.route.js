import express from "express";
import { toMins } from "../../../pkg/utils/time.js";
import { withCache } from "../../../lib/cache/withCache.js";
import User from "../model/user.model.js";
import {uploadSingle , uploadsFields ,uploadNone , uploadMultiple} from "../../../lib/media/multer.js";
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

userRouter.post("/",uploadSingle('pp') ,(req,res,next)=>{
res.json('ok')
})

userRouter.post("/upload-cv",uploadSingle('Cv') ,(req,res,next)=>{
res.json('ok')
})
userRouter.post("/upload-product-photos", uploadMultiple("photo"), (req, res) => {
    res.json(req.files);
});

userRouter.post("/upload-cover-image",
    uploadsFields([{ name: "cover1", maxCount: 1 }]),
    (req, res) => {
        res.json(req.files);
    }
);


export default userRouter;