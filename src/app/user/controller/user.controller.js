import * as userService from "../services/user.service.js";
import {toMins} from "../../../common/utils/time.js";
import {sendOtpEmail} from "../services/user.service.js";
const createUser = async (req, res, next) => {
    try {
        const userData = await userService.createUser(req.body);

        res.status(201).json({
            message: "Successfully created user",
            user: userData
        });
    } catch (err) {
        next(err);
    }
};
const verifyUser = async (req, res, next) => {
    try {
        const {email,code} = req.body;
        const userData = await userService.verifyUser({email, code});
        res.status(201).json({
            message: "Successfully verify user",
            user: userData
        })
    }catch (err) {
        next(err);
    }
}
const login = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        const token = await userService.loginUser(email, password);
        res.cookie('access_Token', token ,
            {
                httpOnly: true,
                maxAge: toMins(1 , "hours"),
            }
        );
        res.status(201).json({
            message: "Successfully logged in",
        })
    } catch (err) {
        next(err);
    }
}
const  sendOtp= async (req, res, next) => {
    try {
        const {email} = req.body;
        const userData = await userService.sendOtpEmail(email);
        res.status(201).json({
            message: "Successfully verify user",
            user: userData
        })
    }catch (err) {
        next(err);
    }
}
export {
    createUser,
    verifyUser,
    login,
    sendOtp
};