import mongoose , {Schema , Document , Model}  from "mongoose";

export interface UserInfo extends Document {
    name : String,
    email : String,
    role : String,
    password : String,
}

const userSchema : Schema<UserInfo> = new Schema({
    name : {
        required : true,
        type : String
    },
    email : {
        required : true,
        type: String
    },
    role : {
        enum : ["User" , "Owner"],
        default : "User",
        type : String ,
        required : true
    },
    password : {
        type : String,
        required : true
    }
})

const userModel : Model<UserInfo> = mongoose.model<UserInfo>("user" , userSchema)

export default userModel;