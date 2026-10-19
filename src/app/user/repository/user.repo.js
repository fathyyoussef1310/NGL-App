import User from '../model/user.model.js'
export async function findUserById(id) {
    return User.findOne({
        _id: id , isDeleted: false ,
    },)
}