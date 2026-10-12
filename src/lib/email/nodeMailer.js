import nodemailer from "nodemailer";
import { config } from "dotenv";
import {env} from "../config/env.js";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.nodeMailer.user,
        pass: env.nodeMailer.password
    }
});

export async function sendEmail(email, code) {
    const message = await transporter.sendMail({
        from:`"NGL-APP" <${env.nodeMailer.user}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${code}`,
    });
    return message;
}