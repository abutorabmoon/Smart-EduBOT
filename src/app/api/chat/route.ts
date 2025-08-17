import dbConnect from "@/lib/dbConnect";
import { callLLM } from "@/lib/llm";
import { addMessageToSession } from "@/lib/sessionService";
import Session from "@/model/session-model";

// route.ts - Updated message processing section
export async function POST(req: Request) {
  // console.log("=== API ROUTE POST START ===");
  await dbConnect();
  try {
    const body = await req.json();
    // console.log("Full request body:", JSON.stringify(body, null, 2));

    const { messages, sessionId, data } = body;
    // console.log("Extracted sessionId:", body);

    // Verify session exists
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
      });
    }

    // Extract parameters
    let questionType: string | undefined,
      codeContent: string | undefined,
      codeLanguage: string | undefined,
      answerStyle: string | undefined;

    questionType = body.data.questionType;
    codeContent = body.data.codeContent;
    codeLanguage = body.data.codeLanguage;
    answerStyle = body.data.answerStyle || "Neutral";
    //console.log("Extracted parameters:", codeLanguage);

    // Filter out error messages and get the last valid user message
    const validMessages = messages.filter(
      (msg: any) =>
        msg.content && !msg.content.includes("Error: Connection error")
    );

    const userMessages = validMessages.filter(
      (msg: any) => msg.role === "user"
    );
    const lastUserMessage = userMessages[userMessages.length - 1];

    // console.log("Last user message:", lastUserMessage);
    const studentPrompt = lastUserMessage?.content || "";

    let processedPreviousMessages: string[] = [];

    if (validMessages.length > 1) {
      // Find the original code content from the first user message's data
      let originalCodeContent = "";
      let originalCodeLanguage = "";

      // Look for the first message with code data - check the actual first user message
      const firstUserMessage = validMessages.find(
        (msg: any) => msg.role === "user"
      );
      if (firstUserMessage && firstUserMessage.data?.codeContent) {
        originalCodeContent = firstUserMessage.data.codeContent;
        originalCodeLanguage = firstUserMessage.data.codeLanguage || "cpp";
        // console.log("Found original code from first user message:", {
        //   codeLength: originalCodeContent.length,
        //   language: originalCodeLanguage,
        // });
      }

      // If we didn't find code in the first message data, fall back to current request data
      if (!originalCodeContent && codeContent) {
        originalCodeContent = codeContent;
        originalCodeLanguage = codeLanguage || "cpp";
        // console.log("Using current request code as fallback:", {
        //   codeLength: originalCodeContent.length,
        //   language: originalCodeLanguage,
        // });
      }

      // Process messages in pairs (user question + assistant answer)
      const historyMessages = validMessages.slice(0, -1);
      for (let i = 0; i < historyMessages.length - 1; i += 2) {
        const userMsg = historyMessages[i];
        const assistantMsg = historyMessages[i + 1];

        if (
          userMsg?.role === "user" &&
          userMsg.content &&
          assistantMsg?.role === "assistant" &&
          assistantMsg.content
        ) {
          const fullContent = assistantMsg.content;
          const topicsIndex = fullContent.indexOf("Topics covered:");
          const contentBeforeTopics =
            topicsIndex !== -1
              ? fullContent.substring(0, topicsIndex).trim()
              : fullContent;

          // For the first message pair, format based on question type
          if (i === 0) {
            if (questionType === "Intermediate") {
              // For code explanation, use the original code content
              processedPreviousMessages.push(
                `[code]:\n${originalCodeContent}\n[question]: ${userMsg.content}\n${contentBeforeTopics}`
              );
            } else {
              // Format for general questions
              const answerContent = contentBeforeTopics.startsWith("[answer]:")
                ? contentBeforeTopics
                : `[answer]: ${contentBeforeTopics}`;

              processedPreviousMessages.push(
                `[question]: ${userMsg.content}\n${answerContent}`
              );
            }
          } else {
            // For subsequent message pairs, format as follow-up
            if (questionType === "Intermediate") {
              // For follow-up code explanation questions, use the original code
              const answerContent = contentBeforeTopics.startsWith("[answer]:")
                ? contentBeforeTopics
                : `[answer]: ${contentBeforeTopics}`;

              processedPreviousMessages.push(
                `[follow-up-code]:\n${originalCodeContent}\n[follow-up-question]: ${userMsg.content}\n${answerContent}`
              );
            } else {
              const answerContent = contentBeforeTopics.startsWith("[answer]:")
                ? contentBeforeTopics
                : `[answer]: ${contentBeforeTopics}`;

              processedPreviousMessages.push(
                `[follow-up-question]: ${userMsg.content}\n${answerContent}`
              );
            }
          }
        }
      }

      // Update the LLM call parameters to use the original code content
      if (questionType === "Intermediate" && originalCodeContent) {
        codeContent = originalCodeContent;
        codeLanguage = originalCodeLanguage;
        // console.log("Updated codeContent for CodeExplanation:", {
        //   codeLength: codeContent.length,
        //   language: codeLanguage,
        // });
      }
    }

    // Validate required parameters
    if (!studentPrompt) {
      return new Response(
        JSON.stringify({ error: "No valid message content provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const last2Messages = processedPreviousMessages.slice(-2);
    //console.log("last2Messages:", last2Messages);

    // console.log(
    //   "Last 2 processed messages for LLM call:",
    //   JSON.stringify(last2Messages, null, 2)
    // );

    const llmResponse = await callLLM({
      questionType: data.questionType || "Beginner",
      studentPrompt,
      codeContent: codeContent || "",
      codeLanguage: codeLanguage || "cpp",
      previousMessages: last2Messages.length > 0 ? last2Messages : undefined,
      answerStyle: answerStyle,
    });

    let savedUserMessage = null;
    if (lastUserMessage && sessionId) {
      const alreadyExists = session.messages.some(
        (m) => m.content === lastUserMessage.content && m.role === "user"
      );
      if (!alreadyExists) {
        savedUserMessage = await addMessageToSession(
          sessionId,
          "user",
          lastUserMessage.content,
          questionType,
          codeContent,
          codeLanguage,
          answerStyle
        );
      }
    }

    // Add assistant response to session
    let savedAssistantMessage = null;
    if (sessionId) {
      savedAssistantMessage = await addMessageToSession(
        sessionId,
        "assistant",
        llmResponse.rawResponse,
        questionType,
        undefined,
        codeLanguage,
        answerStyle
      );
    }

    return new Response(
      JSON.stringify({
        assistantContent: llmResponse.rawResponse,
        userMessageId: savedUserMessage?.id,
        assistantMessageId: savedAssistantMessage?.id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  } catch (e) {
    console.error("❌ Error in POST chat API:", e);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
