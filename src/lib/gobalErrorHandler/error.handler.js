
import { logger } from "../../pkg/logger/logger.js";

export function globalErrorHandler(err, req, res, next) {

    logger.error(err.message, {
        stack: err.stack,
        correlationId: req.correlationId,
        message: err.message,
        error: err,
    });

    if (res.headersSent) {
        return next(err);
    }

    if (err.isOperational === true) {
        return res.status(err.statusCode || 400).json({
            message: err.message,
            success: false,
            code: req.correlationId,
        });
    }

    return res.status(500).json({
        message: "Server Error",
        success: false,
        stack: err.stack
    });
}
