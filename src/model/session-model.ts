import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage {
  id: string;
  role: "user" | "assistant";
  questionType: string;
  content: string;
  codeContent?: string;
  codeLanguage?: string;
  answerStyle?: string;
  createdAt: Date;
  feedbackGiven?: boolean;
}

interface ISession extends Document {
  sessionId: string;
  title?: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ["user", "assistant"], required: true },
  questionType: { type: String, required: true },
  content: { type: String, required: true },
  codeContent: { type: String },
  codeLanguage: { type: String },
  answerStyle: { type: String, enum: ["Theory", "Code", "Neutral"] },
  createdAt: { type: Date, default: Date.now },
  feedbackGiven: { type: Boolean, default: false },
});

const sessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true },
    messages: [messageSchema],
    title: { type: String },
  },
  {
    timestamps: true,
  }
);

// Check if model already exists
let Session: Model<ISession>;
try {
  Session = mongoose.model<ISession>("Session");
} catch {
  Session = mongoose.model<ISession>("Session", sessionSchema);
}

export default Session;
