import {logger} from "../../pkg/logger/logger.js";

export function globalErrorHandler(err,req, res,next) {
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
}