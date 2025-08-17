import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import { ISession, PopulatedUser } from "@/lib/types/mongo";
import Session from "@/model/session-model";
import { User } from "@/model/user-model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

interface SessionListItem {
  id: string;
  sessionId: string;
  title: string;
  preview: string;
  createdAt: Date;
}

export async function createNewSession(): Promise<string> {
  await dbConnect();
  const userSession = await getServerSession(authOptions);

  if (!userSession?.user?.email) {
    throw new Error("User not authenticated");
  }

  const sessionId = crypto.randomUUID();
  const defaultTitle = new Date().toLocaleTimeString("en-BD", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Dhaka",
  });

  const session = new Session({
    sessionId,
    title: defaultTitle,
  });

  await User.findOneAndUpdate(
    { email: userSession.user.email },
    { $push: { sessions: session._id } }
  );

  await session.save();
  return sessionId;
}

export async function getRecentSessions(
  userEmail: string
): Promise<SessionListItem[]> {
  await dbConnect();

  const user = (await User.findOne({ email: userEmail })
    .populate<{ sessions: ISession[] }>("sessions")
    .sort({ "sessions.createdAt": -1 })
    .limit(10)
    .lean()
    .exec()) as unknown as PopulatedUser | null;

  if (!user?.sessions) return [];

  return user.sessions.map((session) => ({
    id: session._id.toString(),
    sessionId: session.sessionId,
    title: session.title || "New Session",
    preview:
      session.messages?.[0]?.content?.substring(0, 50) || "No messages yet",
    createdAt: session.createdAt,
  }));
}

// Rest of your functions remain the same
export async function getSession(sessionId: string) {
  await dbConnect();
  return await Session.findOne({ sessionId }).lean();
}

export async function addMessageToSession(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  questionType: string = "GeneralQuestion",
  codeContent?: string,
  codeLanguage?: string,
  answerStyle?: string
) {
  await dbConnect();

  const updatedSession = await Session.findOneAndUpdate(
    { sessionId },
    {
      $push: {
        messages: {
          role,
          content,
          questionType,
          ...(codeContent && { codeContent }),
          ...(codeLanguage && { codeLanguage }),
          ...(answerStyle && { answerStyle }),
        },
      },
    },
    { new: true }
  );

  const newMessage =
    updatedSession?.messages[updatedSession.messages.length - 1];

  return newMessage;
}
export async function markFeedbackGiven(sessionId: string, messageId: string) {
  await dbConnect();
  await Session.updateOne(
    { _id: sessionId, "messages._id": new mongoose.Types.ObjectId(messageId) },
    { $set: { "messages.$.feedbackGiven": true } }
  );
}

export async function updateSessionMetadata(
  sessionId: string,
  metadata: {
    questionType?: string;
    codeContent?: string;
    codeLanguage?: string;
    answerStyle?: string;
  }
) {
  await dbConnect();
  return await Session.findOneAndUpdate(
    { sessionId },
    { $set: metadata },
    { new: true }
  );
}

export async function updateSessionTitle(sessionId: string, newTitle: string) {
  await dbConnect();
  return await Session.findOneAndUpdate(
    { sessionId },
    { $set: { title: newTitle } },
    { new: true }
  );
}

export async function deleteSession(sessionId: string) {
  await dbConnect();

  // Remove session reference from user
  const session = await Session.findOne({ sessionId });
  if (!session) throw new Error("Session not found");

  await User.updateMany({}, { $pull: { sessions: session._id } });

  return await Session.deleteOne({ sessionId });
}
