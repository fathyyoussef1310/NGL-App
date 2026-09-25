import Otp from "../model/Otp.model.js";

export const getOtpByEmail = async function(email) {
    const otp = await  Otp.findOne({
        email:email
    })
    return otp;
}
export const generateOtp = async function(email) {
    const otp = await Otp.create()
    return otp;
}
export const deleteOtp = async function(email) {
    const deletedOtp = await Otp.deleteMany({
        email :email
    });
        return deletedOtp;
}