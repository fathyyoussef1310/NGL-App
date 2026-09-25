import User from "../model/user.model.js";

const createUser = async (userData) => {
    const user = await User.create(userData);
    return user.save();
};
const checkUserByEmail = async (email) => {
    const  userExists =  await User.findOne({
        email
    }).select("+password");
    return userExists;
}
const verifyAccount = async (email , code) => {
    const user = await User.findOne({
        email,
        code
    });
    return user;
};
const updateUserByEmail = async (email, updatedData) => {
    return User.findOneAndUpdate(
        { email },
        updatedData,
        { returnDocument: 'after' }
    );
};
export  {
    createUser,
    checkUserByEmail,
    verifyAccount,
    updateUserByEmail,
}