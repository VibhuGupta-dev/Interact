import mongoose, { Schema, Document, Types } from "mongoose";


export interface IRoom extends Document {
  roomcode: string;
  host: Types.ObjectId;

  participants: {
    user: Types.ObjectId;
    isMuted: boolean;
    isVideoOn: boolean;
  }[];

  isActive: boolean;
  createdAt: Date;
}


const roomSchema = new Schema<IRoom>({
  roomcode: {
    type: String,
    required: true,
    unique: true
  },

  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  participants: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      isMuted: {
        type: Boolean,
        default: false
      },
      isVideoOn: {
        type: Boolean,
        default: true
      },
    }
  ],

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


export const Room = mongoose.model<IRoom>("Room", roomSchema);