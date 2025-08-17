import mongoose, { Schema} from "mongoose";
import { IUser } from "@/lib/types/mongo";

const userSchema = new Schema<IUser>(
  {
    name: {
      required: true,
      type: String,
    },
    password: {
      required: false,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: String,
    verifyTokenExpiry: Date,
    forgotToken: String,
    forgotTokenExpiry: Date,
    otp: String,
    otpExpiry: Date,
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    age: {
      type: Number,
      min: 0,
    },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    educationLevel: {
      type: String,
      enum: ["First Year", "Second Year", "Third Year", "Fourth Year", "Graduate"],
    },
  },
  { timestamps: true }
);

  export const User =
    (mongoose.models?.User as mongoose.Model<IUser>) ||
    mongoose.model<IUser>("User", userSchema);

