
import Message from '../model/message.model.js';

export async function createMessage(data) {
    return Message.create(data);
}

export async function getAllMessages(userId) {
    return Message.find({
        receiver: userId,
    },{

    },{
        populate:{path:"sender"}
    });
}