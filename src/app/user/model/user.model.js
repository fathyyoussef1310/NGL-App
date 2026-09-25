import mongoose, {Schema , model} from 'mongoose'

const userSchema = new  Schema({
 name: {
     type: String,
     required: true,
     minlength: 3,
     maxlength: 20,
     trim: true,
 },
    password: {
        type: String,
        required: true,
        select: false
    },
    email:{
     required: true,
     type:String,
     unique:true,
     trim:true,
     lowercase:true
    },
    isDeleted:{
     type: Boolean,
     default: false
    },
    dob:Date,
    gender: String,
    createdAt:{
     type:Date,
     default:Date.now
    },
    isVerified:{
     type: Boolean,
     default: false
    }
} ,   {
    timestamps: true,
})


const User = model('User', userSchema)

export default User;