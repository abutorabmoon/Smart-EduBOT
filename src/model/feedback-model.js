import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
      enum: [
        "Beginner",
        "Intermediate",
        "Expert",
      ],
    },
    answerStyle: {
      type: String,
      required: false,
      enum: [
        "Theory",
        "Code",
        "Neutral",
      ],
      default: "Neutral",
    },
    studentPrompt: {
      type: String,
      required: true,
    },
    chatbotResponse: {
      type: String,
      required: true,
    },
    studentSatisfaction: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    codeContent: {
      type: String,
      required: false,
    },
    codeLanguage: {
      type: String,
      required: false,
    },
    last2Messages: {
      type: [String], 
      default: [],
    },
  },
  { timestamps: true }
);

export const Feedback =
  mongoose.models.Feedback ?? mongoose.model("Feedback", feedbackSchema);