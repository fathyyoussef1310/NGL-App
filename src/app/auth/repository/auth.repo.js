import User from "../../user/model/user.model.js";
import {OAuth2Client} from "google-auth-library";
import {AppError} from "../../../lib/gobalErrorHandler/appError.js";
import * as authRepo from "../services/auth.service.js";

const createUser = async (userData) => {
    return await User.create(userData);
};

const checkUserByEmail = async (email) => {
    return await User.findOne({
        email
    }).select("+password");
};

const verifyAccount = async (email, code) => {
    return await User.findOne({
        email,
        code
    });
};
const updateUserByEmail = async (email, updatedData) => {
    return await User.findOneAndUpdate(
        { email },
        updatedData,
        { returnDocument: "after" }
    );
};

export const LoginWithGoogle = async (userToken) => {
    return await User.create(userToken);
}

export const findUserById = (id) => User.findById(id);

export {
    createUser,
    checkUserByEmail,
    verifyAccount,
    updateUserByEmail
};