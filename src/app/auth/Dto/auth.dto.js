import { z } from 'zod';

export const registerDto = z.object({
    name: z.string().toLowerCase().trim().min(3).max(50),
    email: z.string().toLowerCase().trim().email().min(5).max(100),
    password: z.string().trim().min(6).max(50), // من غير toLowerCase
}).strict();

export const verifyAccountDto = z.object({
    email: z.string().toLowerCase().trim().email({message:"Invalid Email format"}).min(5).max(100),
    code: z.string().trim().min(4).max(10),
});

export const loginDto = z.object({
    email: z.string().toLowerCase().trim().email().min(5).max(100),
    password: z.string().trim().min(6).max(50),
});

export const sendOtpDto = z.object({
    email: z.string().toLowerCase().trim().email().min(5).max(100),
});

export const forgetPasswordDto = z.object({
    email: z.string().toLowerCase().trim().email().min(5).max(100),
    code: z.string().trim().min(4).max(10),
    newPassword: z.string().trim().min(6).max(50), // ← مطابق للـ body اللي بتبعتُه
});


export const refreshTokenDto = z.object({
    refreshToken: z.string().min(1, "refreshToken is required"),
});

export const googleLoginDto = z.object({
    idToken: z.string().min(1, "idToken is required"),
});