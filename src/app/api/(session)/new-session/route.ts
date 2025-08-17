import { createNewSession } from "@/lib/sessionService";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sessionId = await createNewSession();
    // console.log("New session created with ID:", sessionId);
    return NextResponse.json({ sessionId });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create new session" },
      { status: 500 }
    );
  }
}









// import { createNewSession, updateSessionMetadata } from "@/lib/sessionService";
// import { addMessageToSession } from "@/lib/sessionService";

// export async function POST(req: Request) {
//   const body = await req.json();
//   const { initialMessage, questionType, codeContent, codeLanguage } = body;

//   const sessionId = await createNewSession();

//   // Save initial user message
//   if (initialMessage) {
//     await addMessageToSession(sessionId, "user", initialMessage, questionType);
//   }

//   // Save metadata
//   await updateSessionMetadata(sessionId, {
//     codeContent,
//     codeLanguage,
//     questionType,
//   });

//   return new Response(JSON.stringify({ sessionId }), {
//     headers: { "Content-Type": "application/json" },
//   });
// }
