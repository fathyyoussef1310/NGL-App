import * as messageRepository from '../repository/message.repo.js';
import * as userRepository from '../../user/repository/user.repo.js';
import {AppError} from "../../../lib/gobalErrorHandler/appError.js";

export async function sendMessage({ content, receiverId, senderId }) {
    const user = await userRepository.findUserById(receiverId);
    if (!user) {
        throw new AppError('User does not exist', 404);
    }
    return await messageRepository.createMessage({
        content,
        sender: senderId,
        receiver: receiverId,
    });
}

export async function getAllMessages(userId) {
    const messages = await messageRepository.getAllMessages(userId);
    if (!messages) {
        throw new AppError('No messages found for this user.', 404);
    }
    return messages;
}