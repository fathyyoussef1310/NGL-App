import {Schema,model} from 'mongoose';
const messageSchema = new Schema({
    content:{type:String , required: true , maxlength: 255 , trim:true},
    author:{type:Schema.Types.ObjectId , required: true , maxlength: 255 , ref:'User'},
    receiver:{type:String , required: true , ref:'User'},
    isDeleted:{type:Boolean , default: false},
    createdAt:{type:Date, default: Date.now},
    updatedAt:{type:Date, default: Date.now},
} , {
    timestamps: true,
})

const Message = model('Message', messageSchema);
export default Message;