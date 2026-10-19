import {AppError} from "../gobalErrorHandler/appError.js";
import jwt from "jsonwebtoken";
import {env} from "../config/env.js";
export  function authGuard(req, res, next) {
    try{
        const token = req.cookies.access_Token;
        if (!token) {
            throw new AppError('No token provided', 403);
        }
        req.user = jwt.verify(token, env.jwt.secret)
        next()
    }catch(e){
        next(e);
    }
}