import multer, { diskStorage } from "multer";
import path from "path";
import { AppError } from "../gobalErrorHandler/appError.js";

function fileUploads(allowedTypes) {
    return multer({
        fileFilter: function (req, file, cb) {
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new AppError("Invalid file type."));
            }
            cb(null, true);
        },
        storage: diskStorage({destination: "uploads",
            filename: (req, file, cb) => {
                const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
                cb(null, unique + path.extname(file.originalname));
            },
        }),
    });
}

export function uploadSingle(field, allowedTypes = ['image/png', 'image/jpeg'])
{
    return fileUploads(allowedTypes).single(field);
}

export function uploadMultiple(field, maxCount = 10,
    allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ])
{
    return fileUploads(allowedTypes).array(field, maxCount);
}

export function uploadsFields(fields, allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png'
    ]
) {
    return fileUploads(allowedTypes).fields(fields);
}

export function uploadNone() {
    return fileUploads().none();
}