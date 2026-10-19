import {z} from 'zod';
import {Types} from "mongoose";
export const messageDto = z.object({
    receiverId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid receiver id'),
    content: z.string().trim().min(1).max(2000),
});