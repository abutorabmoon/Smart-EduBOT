import { getSession, updateSessionMetadata } from "@/lib/sessionService";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getSession(params.sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, questionType, codeContent, codeLanguage, answerStyle } =
      body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const updatedSession = await updateSessionMetadata(sessionId, {
      questionType,
      codeContent,
      codeLanguage,
      answerStyle,
    });

    if (!updatedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Session metadata updated",
      success: true,
      updatedSession,
    });
  } catch (error) {
    console.error("❌ API error in update:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
