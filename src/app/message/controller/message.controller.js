import * as messageService from '../services/message.service.js';
import {validateBody} from "../../../lib/validation/validation.js";
import {messageDto} from "../dto/message.dto.js";

export async function sendMessage(req, res, next) {
    try {
        const { content, receiverId ,} = validateBody(messageDto, req.body);
        const senderId = req.user?.id;

        const data = await messageService.sendMessage({ content, receiverId, senderId });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data,
        });
    } catch (err) {
        next(err);
    }
}

export async function getAllMessages(req, res, next) {
    try {
        const message = await messageService.getAllMessages(req.user.id);
        res.status(200).json({
            success: true,
            data:message,
        })
    }catch(err) {
        next(err);
    }
}