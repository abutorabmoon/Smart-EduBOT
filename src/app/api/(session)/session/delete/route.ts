import { deleteSession } from "@/lib/sessionService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  await deleteSession(sessionId);
  return NextResponse.json({ success: true });
}
