import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/INTERACT";

export const mongoconnect = async () => {
  try {
    const connect = await mongoose.connect(MONGO_URI);
   
    if (connect) {
      console.log("mongoose connected");
    } else {
      console.log("mongoose not connected");
    }
  } catch (err) {
    console.log(err, "error in mongo connect");
    return err
  }
};
