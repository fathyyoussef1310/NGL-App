import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    content: { type: String, required: true, maxlength: 255, trim: true },
    receiver: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    isDeleted: { type: Boolean, default: false },
    sender: { type: Schema.Types.ObjectId, required: false, ref: 'User', index: true },
}, {
    timestamps: true,
});

const Message = model('Message', messageSchema);
export default Message;