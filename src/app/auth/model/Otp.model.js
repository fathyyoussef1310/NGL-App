import { Schema, model } from "mongoose";

const otpSchema = new Schema({
        code: {type: String,
            required: true,
            length: 6,
        },
        email: {type: String,
            required: true,
            trim: true,},
        isDone: {type: Boolean, default: false,},
        expiredAt: {type: Date,
            required: true, index: {
                expires: 60,
            },
        }
    },
    {
        timestamps: true,
    }
);

const Otp = model("Otp", otpSchema);

export default Otp;