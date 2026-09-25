import crypto from "node:crypto";
export const generateOtpEmail = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};