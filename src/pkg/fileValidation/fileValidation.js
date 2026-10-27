
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import { AppError } from "../../lib/gobalErrorHandler/appError.js";

// Middleware to validate file type by magic number (file signatures)
export const fileValidation = (allowedTypes = ["image/png", "image/jpeg"]) => {
    return async (req, res, next) => {
        try {
            if (!req.file) {
                return next(new AppError("No file uploaded", 400));
            }

            // Get the file path
            const filePath = req.file.path;
          const buffer = fs.readFileSync(filePath);
            const type = await fileTypeFromBuffer(buffer);
            if (!type || !allowedTypes.includes(type.mime)) {
                return next(new AppError("Invalid file type", 400));
            }
            return next();
        } catch (error) {
            console.error("File validation error:", error);
            return next(new AppError("Internal server error", 500));
        }
    };
};
