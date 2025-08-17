import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: "Invalid messages provided" },
        { status: 400 }
      );
    }

    // Extract the most recent messages for context analysis
    // In a real implementation, this would analyze the messages and extract relevant context
    // For now, we'll create a simple implementation that returns the message IDs as context
    const context = messages.map((message, index) => ({
      id: `context-${index}`,
      content: message.content,
      role: message.role,
    }));

    return NextResponse.json({ context });
  } catch (error) {
    console.error("Error analyzing context:", error);
    return NextResponse.json(
      { message: "Failed to analyze context" },
      { status: 500 }
    );
  }
}
