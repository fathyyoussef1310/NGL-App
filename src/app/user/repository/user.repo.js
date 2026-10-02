import User from "../model/user.model.js";

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

export {
    createUser,
    checkUserByEmail,
    verifyAccount,
    updateUserByEmail
};