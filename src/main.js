import "./common/db/db.js";
import express from "express";
import Otp from "./app/auth/model/Otp.model.js";
import {AppError} from "./common/utils/appError.js";
import {logger} from "./common/logger/logger.js";
import cors from "cors";
import authRouter from "./app/auth/route/auth.route.js";
const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());
app.use('/auth', authRouter);
app.use((err, req, res, next) => {
    logger.error(err.message, err);
    if (err.isOperational === true) {
        return res.status(err.statusCode).json({
            message: err.message,
            success: false,
        });
    }

    return res.status(500).json({
        message: "Server Error",
        success: false,
        stack: err.stack
    });
});
app.listen(3000, () => {
    logger.info(`http://localhost:3000` ,);
});

