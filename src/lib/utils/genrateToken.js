// utils/generateToken.js
import jwt from "jsonwebtoken";
import {env} from "../config/env.js";

export const generateToken = (payload) => {
    return jwt.sign(payload, env.jwt.secret, { expiresIn: "1h" });
};