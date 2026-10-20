import multer, { diskStorage } from "multer";
import path from "path";

function fileUploads() {
    return multer({
        storage: diskStorage({
            destination: "uploads",
            filename: (req, file, cb) => {
                const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
                cb(null, unique + path.extname(file.originalname));
            },
        }),
    });
}

export function uploadSingle(field) {
    return fileUploads().single(field);
}

export function uploadMultiple(field, maxCount = 10) {
    return fileUploads().array(field, maxCount);
}

export function uploadsFields(fields) {
    return fileUploads().fields(fields);
}

export function uploadNone() {
    return fileUploads().none();
}