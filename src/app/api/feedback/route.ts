import dbConnect from "@/lib/dbConnect";
import { Feedback } from "@/model/feedback-model";
import Session from "@/model/session-model";
import { User } from "@/model/user-model";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Get the session token
    const token = await getToken({
      req: req as any,
      secret: process.env.AUTH_SECRET,
    });

    if (!token || !token.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Parse request body
    const {
      questionType,
      studentPrompt,
      chatbotResponse,
      studentSatisfaction,
      codeContent,
      codeLanguage,
      answerStyle,
      sessionId,
      last2Messages,
      messageId,
    } = await req.json();

    // Create new feedback entry
    const feedback = new Feedback({
      userId: user._id,
      sessionId,
      questionType,
      studentPrompt,
      chatbotResponse,
      studentSatisfaction,
      codeContent,
      codeLanguage,
      answerStyle,
      last2Messages,
    });

    // Save to database
    await feedback.save();

    if (sessionId && messageId) {
      const session = await Session.findOne({ sessionId });

      if (session) {
        const targetMessage = session.messages.find(
          (msg) => msg.id.toString() === messageId
        );

        if (targetMessage) {
          targetMessage.feedbackGiven = true;
          await session.save();
        }
      }
    }
    // console.log("Feedback saved successfully:", feedback);
    return NextResponse.json(
      { message: "Feedback saved successfully", feedbackId: feedback._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { message: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Get the session token
    const token = await getToken({
      req: req as any,
      secret: process.env.AUTH_SECRET,
    });

    if (!token || !token.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get URL parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Get feedback entries for the user
    const feedbackEntries = await Feedback.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ userId: user._id });

    return NextResponse.json({
      feedbackEntries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { message: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
