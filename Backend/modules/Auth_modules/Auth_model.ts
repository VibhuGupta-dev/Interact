import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserInfo extends Document {
    name: string;
    email: string;
    role: string;
    password?: string; // Optional kiya kyunki Google users ke paas password nahi hota
    googleId?: string; // Google user identify karne ke liye
    image?: string;    // Profile picture ke liye (optional)
}

const userSchema: Schema<UserInfo> = new Schema({
    name: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String,
        unique: true // Taaki ek hi email se do account na bane
    },
    role: {
        type: String,
        enum: ["User", "Owner"],
        default: "User",
        required: true
    },
    password: {
        type: String,
        required: false // GOOGLE LOGIN KE LIYE ISE FALSE RAKHNA ZAROORI HAI
    },
    googleId: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    }
}, { timestamps: true }); // Timestamps se 'createdAt' automatically mil jayega

const userModel: Model<UserInfo> = mongoose.model<UserInfo>("user", userSchema);

export default userModel;