import OpenAI from "openai";

import {
  mainBeginnerAskQuestion,
  replyBeginnerAskQuestion,
} from "../codex-prompts/ask-beginner_question-prompt";
import {
  mainExpertAskQuestion,
  replyExpertAskQuestion,
} from "../codex-prompts/ask-expert-question-prompt";
import {
  mainIntermediateAskQuestion,
  replyIntermediateAskQuestion,
} from "../codex-prompts/ask-intermediate-question-prompt";

export interface LLMRequestParams {
  questionType: string;
  studentPrompt: string;
  codeContent?: string;
  codeLanguage?: string;
  temperature?: number;
  previousMessages?: string[];
  answerStyle?: string;
}

export interface LLMResponse {
  rawResponse: string;
}

export async function callLLM(params: LLMRequestParams): Promise<LLMResponse> {
  const {
    questionType,
    studentPrompt,
    codeContent,
    codeLanguage,
    previousMessages,
    temperature,
    answerStyle,  // = "Neutral",
  } = params;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let promptConfig;

  const hasPreviousMessages = previousMessages && previousMessages.length > 0;
  // console.log("==llm.ts==== PROMPT SELECTION ===");
  // console.log("==llm.ts=Question type:", questionType);
  // console.log("==llm.ts=Has previous messages:", hasPreviousMessages);
  // console.log("==llm.ts=Previous messages count:", previousMessages?.length || 0);
  // console.log("==llm.ts=Code content available:", !!(codeContent && codeContent.trim()));

  switch (questionType) {
    case "Beginner":
      if (hasPreviousMessages) {
        promptConfig = replyBeginnerAskQuestion(
          previousMessages,
          studentPrompt
        );
      } else {
        promptConfig = mainBeginnerAskQuestion(studentPrompt);
      }
      break;
    case "Intermediate":
      if (hasPreviousMessages) {
        promptConfig = replyIntermediateAskQuestion(
          codeContent || "",
          previousMessages,
          studentPrompt
        );
      } else {
        promptConfig = mainIntermediateAskQuestion(
          codeContent || "",
          studentPrompt
        );
      }
      break;
    case "Expert":
      if (hasPreviousMessages) {
        promptConfig = replyExpertAskQuestion(previousMessages, studentPrompt);
      } else {
        promptConfig = mainExpertAskQuestion(studentPrompt);
      }
      break;
    default:
      if (hasPreviousMessages) {
        promptConfig = replyBeginnerAskQuestion(
          previousMessages,
          studentPrompt
        );
      } else {
        promptConfig = mainBeginnerAskQuestion(studentPrompt);
      }
  }

  const enhancedSystemPrompt = getSystemPromptForQuestionType(
    questionType,
    hasPreviousMessages,
    answerStyle
  );

  let userMessage = `[follow-up-question]: ${studentPrompt}`;

  // Add code content to follow-up questions if available
  if (hasPreviousMessages && codeContent && codeContent.trim()) {
    //\n\`\`\`${ codeLanguage || ""
    userMessage += `\n\nCode provided (${codeLanguage}):
    \n${codeContent}\n\`\`\``;
  } else if (!hasPreviousMessages) {
    userMessage = `[question]: ${studentPrompt}`;
    if (codeContent && codeContent.trim()) {
      userMessage += `\n\nCode provided (${codeLanguage}):
      \n${codeContent}\n\`\`\``;
    }
  }

  let messages;

  if (hasPreviousMessages) {
    messages = [
      {
        role: "system" as const,
        content: enhancedSystemPrompt,
      },
      ...promptConfig.messages.slice(0, -1), // All messages except the last one
    ];

    messages.push({
      role: "user" as const,
      content: userMessage,
    });
  } else {
    messages = [
      {
        role: "system" as const,
        content: enhancedSystemPrompt,
      },
      ...promptConfig.messages,
      // Add current question if it's not already included in promptConfig
      ...(promptConfig.messages.some((msg) =>
        msg.content.includes(studentPrompt)
      )
        ? []
        : [
            {
              role: "user" as const,
              content: userMessage,
            },
          ]),
    ];
  }

  // console.log("==llm.ts=Final messages sent to OpenAI:");
  // messages.forEach((msg, idx) => {
  //   console.log(
  //     `Message ${idx} (${msg.role}):`,
  //     msg.content || "No content provided"
  //   );
  // });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages as any,
    temperature: temperature || promptConfig.temperature,
    max_tokens: promptConfig.max_tokens || 2500,
    stop: promptConfig.stop,
  });

  // console.log("==llm.ts==== OPENAI RESPONSE ===");
  // console.log("==llm.ts=Full response:", JSON.stringify(response, null, 2));

  const rawResponse =
    response.choices[0].message.content || "No response found";

  // console.log("==llm.ts==== FINAL RESULTS ===");
  // console.log("==llm.ts=Raw response:", rawResponse);
  // console.log("==llm.ts==== LLM CALL END ===");

  return {
    rawResponse: rawResponse,
  };
}

function getSystemPromptForQuestionType(
  questionType: string,
  hasPreviousMessages: boolean = false,
  answerStyle: string = "Neutral"
): string {
  let systemPrompt = `You are a helpful AI assistant for programming education. Provide clear, comprehensive explanations with practical examples.

IMPORTANT FORMATTING REQUIREMENTS:
1. There are three type of questions:
    i. Beginner - General programming concepts, syntax, and basic algorithms.
   ii. Intermediate - Code explanation, debugging, and algorithm design.
  iii. Expert - Writing code, implementing algorithms, and advanced programming concepts.
4. For code blocks, use the existing [code] format but make sure to include complete, working code.
5. Always provide explanations that help students understand the underlying concepts.
6. If someone asks you an irrelevant question not related to programming then respond this "Sorry, this is an irrelevant question. Please ask questions related to programming."
7. If someone requests code in a programming language other than C or C++, respond this "Sorry, I can only provide code examples in C or C++ programming languages."

Example format:
[answer]: Your detailed explanation here...
[code]:
[code-title]: Your code title
// Complete working code here
[end-code]
`;

  if (hasPreviousMessages) {
    systemPrompt += `\n\nCONTEXT AWARENESS: You are continuing a conversation. Reference previous topics when relevant and build upon the established context. Maintain consistency with previous explanations while expanding the discussion.`;
  }

  // Apply answer style preference
  if (answerStyle === "Theory") {
    systemPrompt += `\n\nIMPORTANT: Focus on theoretical explanations and concepts. Prioritize explaining the underlying principles, theories, and academic knowledge. Include definitions, historical context, and conceptual frameworks. While you may include minimal code examples where necessary, your primary focus should be on theoretical understanding rather than implementation details.`;
  } else if (answerStyle === "Code") {
    systemPrompt += `\n\nIMPORTANT: Focus on practical code examples and implementation. Prioritize showing working code, implementation patterns, and practical solutions. Include detailed code examples with thorough comments explaining each part. While you should explain concepts briefly, your primary focus should be on how to implement solutions in code rather than theoretical discussions.`;
  }

  // Apply question type adjustments
  switch (questionType) {
    case "Intermediate":
      systemPrompt += `\n\nFor intermediate questions: Provide detailed explanations of code, algorithms, and debugging techniques. Use clear examples and ensure the code is well-commented. Focus on helping students understand the logic and flow of the code.`;
      break;
    case "Expert":
      systemPrompt += `\n\nFor expert questions: Provide in-depth explanations of complex algorithms, data structures, and advanced programming concepts. Include complete, working code examples that demonstrate best practices. Ensure the code is well-structured and includes comments to explain key parts. Focus on helping students implement solutions effectively.`;
      break;
    case "Beginner":
    default:
      systemPrompt += `\n\nFor beginner questions: Use simple language, short sentences, and define any jargon in parentheses. Prefer C examples first and add C++ when helpful. Keep code small and add tiny inline comments. Avoid advanced topics unless the user asks.`;
  }

  return systemPrompt;
}
