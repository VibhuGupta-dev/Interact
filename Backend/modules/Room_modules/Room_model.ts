import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRoom extends Document {
  roomcode: string;
  host: Types.ObjectId;

  participants: {
    user: Types.ObjectId;
    isMuted: boolean;
    isVideoOn: boolean;
  }[];
  chat: {
    senderId: Types.ObjectId;
    message: String;
    time: Date;
  }[];
  isActive: boolean;
  createdAt: Date;
}

const roomSchema = new Schema<IRoom>({
  roomcode: {
    type: String,
    required: true,
    unique: true,
    trim : true
  },

  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

 

  chat: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      
      },
      message: {
        type: String,
        maxlength: 1000,
       
        trim: true,
      },
      time: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Room = mongoose.model<IRoom>("Room", roomSchema);
