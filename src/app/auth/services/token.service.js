
import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
import { env } from "../../../lib/config/env.js";

export const signAccess = (user) =>
    jwt.sign({ sub: user.id, role: user.role }, env.jwt.accessSecret, {
        expiresIn: env.jwt.accessExpires,
    });

export const signRefresh = (user, family) =>
    jwt.sign({ sub: user.id, family }, env.jwt.refreshSecret, {
        expiresIn: env.jwt.refreshExpires,
        jwtid: randomUUID(),
    });

export const verifyAccess = (token) => jwt.verify(token, env.jwt.accessSecret);

export const verifyRefresh = (token) => jwt.verify(token, env.jwt.refreshSecret);

export const hash = (token) => createHash("sha256").update(token).digest("hex");