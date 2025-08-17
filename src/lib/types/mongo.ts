import { Document, Types, FlattenMaps } from "mongoose";
import { Message } from "ai";

export interface IUser extends Document {
  name: string;
  password?: string;
  email: string;
  isVerified: boolean;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  forgotToken?: string;
  forgotTokenExpiry?: Date;
  otp?: string;
  otpExpiry?: Date;
  sessions: Types.ObjectId[];
  gender?: "male" | "female" | "other";
  age?: number;
  skillLevel?: "beginner" | "intermediate" | "advanced";
  educationLevel?: "school" | "college" | "university" | "graduate";
}

export interface ISession extends Document {
  sessionId: string;
  title?: string;
  messages: Message[];
  questionType?: string;
  codeContent?: string;
  codeLanguage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedUser extends Omit<FlattenMaps<IUser>, "sessions"> {
  sessions: FlattenMaps<ISession>[];
}
