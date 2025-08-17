import { NextResponse } from "next/server";
import { getRecentSessions } from "@/lib/sessionService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }

  try {
    const sessions = await getRecentSessions(session.user.email);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json([], { status: 500 });
  }
}
