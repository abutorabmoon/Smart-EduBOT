import { NextResponse } from "next/server";
import { updateSessionTitle } from "@/lib/sessionService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // console.log("Received body:", body);

    const { sessionId, title } = body;

    if (!sessionId || !title) {
      // console.log("❌ Missing sessionId or title");
      return NextResponse.json(
        { error: "Missing sessionId or title" },
        { status: 400 }
      );
    }

    const updatedSession = await updateSessionTitle(sessionId, title);
    // console.log("Updated session:", updatedSession);

    if (!updatedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Session title updated", success: true, updatedSession });
  } catch (error) {
    console.error("❌ API error in update-title:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
