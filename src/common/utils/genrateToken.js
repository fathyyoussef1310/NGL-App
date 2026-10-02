// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRETKEY, { expiresIn: "1h" });
};