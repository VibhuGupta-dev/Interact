import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserInfo extends Document {
    name: string;
    email: string;
    role: string;
    password?: string; 
    googleId?: string; 
    image?: string;
}

const userSchema: Schema<UserInfo> = new Schema({
    name: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ["User", "Owner"],
        default: "User",
        required: true
    },
    password: {
        type: String,
        required: false 
    },
    googleId: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    }
}, { timestamps: true }); 

const userModel: Model<UserInfo> = mongoose.model<UserInfo>("user", userSchema);

export default userModel;