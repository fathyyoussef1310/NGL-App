import express from "express";
import { toMins } from "../../../pkg/utils/time.js";
import { withCache } from "../../../lib/cache/withCache.js";
import User from "../model/user.model.js";
import {
    uploadSingle,
    uploadsFields,
    uploadNone,
    uploadMultiple
} from "../../../lib/media/multer.js";
import { fileValidation } from "../../../pkg/fileValidation/fileValidation.js";

const userRouter = express.Router();

userRouter.get("/get-All-Users", withCache(toMins(99)),
    async (req, res, next) => {
        try {const users = await User.find({});
            res.json({
                data: users,
            });
        } catch (err) {
            next(err);
        }
    }
);
userRouter.post("/upload-cover-image",
    uploadSingle("pp"),
    fileValidation([
        "image/jpeg",
        "image/png",
        "image/webp"
    ]),
    (req, res, next) => {
        console.log(req.file);

        res.json("ok");
    }
);
userRouter.post("/upload-cv", uploadSingle("Cv" ,["application/pdf"]),
    fileValidation(["application/pdf"]),
    (req, res, next) => {

        res.json("ok");
    }
);

userRouter.post("/upload-product-photos", uploadMultiple("photo", 2) , fileValidation([
        "application/pdf",
        "image/png",
    ]), (req, res) => {
        res.json(req.files);
    }
);
userRouter.post("/upload-cover-images", uploadsFields([{
            name: "cover1",
            maxCount: 1
        }
    ]), (req, res) => {
        res.json(req.files);
    }
);


export default userRouter;