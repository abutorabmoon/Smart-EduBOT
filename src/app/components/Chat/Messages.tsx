import { parseResponse } from "@/app/utils/responseParser";
import BorderAnimationWrapper from "@/components/BorderAnimationWrapper";
import FeedbackDialog from "@/components/FeedbackDialog";
import LoadingMessages from "@/components/LoadingMessage";
import RichCodeBlock from "@/components/RichCodeBlock"; // Import the new component
import TypingAssistantMessage from "@/components/TypingAssistantMessage";
import { IMessage } from "@/model/session-model";
import { Copy, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Helper function to detect if content is C/C++ code
const detectLanguage = (code: string): string => {
  // Simple heuristics to detect C/C++ code
  const cppIndicators = [
    "#include",
    "std::",
    "cout",
    "cin",
    "endl",
    "namespace",
    "class",
    "public:",
    "private:",
    "protected:",
    "virtual",
    "override",
    "template",
    "typename",
    "nullptr",
    "auto",
    "constexpr",
    "decltype",
    "noexcept",
  ];

  const cIndicators = [
    "printf",
    "scanf",
    "malloc",
    "free",
    "sizeof",
    "struct",
    "typedef",
    "FILE*",
    "NULL",
  ];

  const lowerCode = code.toLowerCase();

  // Check for C++ indicators first
  const cppMatches = cppIndicators.filter((indicator) =>
    lowerCode.includes(indicator.toLowerCase())
  ).length;

  const cMatches = cIndicators.filter((indicator) =>
    lowerCode.includes(indicator.toLowerCase())
  ).length;

  if (cppMatches > cMatches) return "cpp";
  if (cMatches > 0) return "c";

  // Default fallback - check for common patterns
  if (lowerCode.includes("int main") || lowerCode.includes("void main")) {
    return cppMatches > 0 ? "cpp" : "c";
  }

  return "cpp"; // Default to C++ if uncertain
};

// Helper function to parse and render code blocks
const parseAndRenderCodeBlocks = (content: string, keyPrefix: string = "") => {
  if (!content.includes("[code")) {
    return <span>{renderFormattedText(content)}</span>;
  }

  const parts = [];
  let lastIndex = 0;

  // Updated regex to handle your code block format
  const codeBlockRegex =
    /\[(?:code|fixed-code)(?:\/[^\]]+)?\]:\s*\[code-title\]:\s*([^\n]*)\n?([\s\S]*?)\[end-code\]/g;

  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      parts.push(
        <span key={`${keyPrefix}text-${lastIndex}`}>
          {renderFormattedText(textBefore)}
        </span>
      );
    }

    const codeTitle = match[1] || "Code";
    const code = match[2].trim();
    const language = detectLanguage(code);

    // Add rich code block
    parts.push(
      <RichCodeBlock
        key={`${keyPrefix}code-${match.index}`}
        code={code}
        title={codeTitle}
        language={language}
        showCopyButton={true}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block
  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    parts.push(
      <span key={`${keyPrefix}text-${lastIndex}`}>
        {renderFormattedText(textAfter)}
      </span>
    );
  }

  return <>{parts}</>;
};

export const formatMessageContent = (
  content: string,
  isTyping: boolean,
  typingContent: string
): React.ReactNode => {
  if (!content) return <span></span>;

  const fullParsedResponse = parseResponse(content);
  const totalLength = content.length;
  const currentPosition = isTyping ? typingContent.length : totalLength;
  const contentEnd = fullParsedResponse.content.length;
  const codeStart = content.indexOf(fullParsedResponse.rawCode || "");
  const codeEnd = codeStart + (fullParsedResponse.rawCode?.length || 0);
  const postCodeStart = codeEnd;

  const parts = [];

  // 1. Main Content (always show first)
  if (fullParsedResponse.content && fullParsedResponse.content.trim()) {
    const contentToShow =
      currentPosition >= contentEnd
        ? fullParsedResponse.content
        : fullParsedResponse.content.substring(0, currentPosition);

    parts.push(
      <span key="text-content">{renderFormattedText(contentToShow)}</span>
    );
  }

  // 2. Raw Code (only show if we've typed past content)
  if (fullParsedResponse.rawCode && currentPosition > codeStart) {
    const codeProgress = Math.min(
      currentPosition - codeStart,
      fullParsedResponse.rawCode.length
    );
    const codeToShow = fullParsedResponse.rawCode.substring(0, codeProgress);
    const language = detectLanguage(codeToShow);

    parts.push(
      <RichCodeBlock
        key="parsed-code"
        code={codeToShow}
        title={fullParsedResponse.codeTitle || "Code"}
        language={language}
        showCopyButton={!isTyping}
      />
    );
  }

  // 3. Post-Code Content (only show if we've typed past code) - UPDATED
  if (fullParsedResponse.postCodeContent && currentPosition > postCodeStart) {
    const postCodeProgress = currentPosition - postCodeStart;
    const postCodeToShow = fullParsedResponse.postCodeContent.substring(
      0,
      postCodeProgress
    );

    parts.push(
      <div key="post-code-content" className="block mt-2">
        {parseAndRenderCodeBlocks(postCodeToShow, "post-")}
      </div>
    );
  }

  return <>{parts}</>;
};

function renderFormattedText(text: string): React.ReactNode[] {
  const regex = /(\*\*(.*?)\*\*|`([^`]+)`)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`} className="break-words">
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    if (match[1].startsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-text">
          {match[2]}
        </strong>
      );
    } else if (match[1].startsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="bg-stone-200 text-text px-1 py-0.5 rounded text-sm font-mono"
        >
          {match[3]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

interface MessagesProps {
  messages: IMessage[];
  questionType: string;
  answerStyle?: string;
  codeContent?: string;
  codeLanguage?: string;
  isLoading?: boolean;
  error?: Error;
  sessionId: string;
}

export default function Messages({
  messages,
  questionType,
  answerStyle,
  codeContent,
  codeLanguage,
  isLoading,
  error,
  sessionId,
}: MessagesProps) {
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [typingContent, setTypingContent] = useState<string>("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const typedMessageIdsRef = useRef<Set<string>>(new Set());
  const [completedTypingMessages, setCompletedTypingMessages] = useState<
    Set<string>
  >(new Set());
  const lastTwoMessages: string[] = messages.slice(-6, -2).map((msg) => {
    return `[${msg.role}]: ${msg.content}`;
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<{
    [id: string]: boolean;
  }>({});

  useEffect(() => {
    const initialState: { [id: string]: boolean } = {};
    messages.forEach((msg) => {
      if (msg.role === "assistant" && msg.feedbackGiven) {
        initialState[msg.id] = true;
      }
    });
    setFeedbackSubmitted(initialState);
  }, [messages]);

  useEffect(() => {
    typedMessageIdsRef.current.clear();
    setCompletedTypingMessages(new Set());
  }, [sessionId]);

  // Auto-scroll to bottom when messages change or typing progresses
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: isTypingComplete ? "auto" : "smooth",
    });
  }, [messages, typingContent, isTypingComplete]);

  useEffect(() => {
    if (error) {
      toast.error(
        error.message || "Failed to generate response. Please try again.",
        {
          duration: 5000,
        }
      );
    }
  }, [error]);

  const handleFeedbackSubmitted = (index: number) => {
    setFeedbackSubmitted((prev) => ({ ...prev, [index]: true }));
    console.log(`[Messages] Feedback submitted for message at index ${index}`);
    toast.success("Feedback submitted successfully", {
      duration: 2000,
    });
  };

  const handleTypingComplete = (messageId: string) => {
    typedMessageIdsRef.current.add(messageId);
    setCompletedTypingMessages((prev) => new Set(prev).add(messageId));
    setIsTypingComplete(true);
  };

  // console.log("[Messages] messages:", messages);

  const handleCopyFullResponse = (content: string) => {
    const parsedResponse = parseResponse(content);
    let fullText = parsedResponse.content;

    if (parsedResponse.rawCode) {
      fullText += `\n\n${parsedResponse.codeTitle || "Code"}:\n${
        parsedResponse.rawCode
      }`;
    }

    if (parsedResponse.postCodeContent) {
      fullText += `\n\n${parsedResponse.postCodeContent}`;
    }

    navigator.clipboard.writeText(fullText);
    toast.success("Full response copied to clipboard", { duration: 2000 });
  };

  return (
    <div className=" flex flex-col h-full">
      <div className="overflow-y-auto flex-grow flex flex-col space-y-6 pr-2 pl-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/40 hover:scrollbar-thumb-gray-500 transition-all duration-300">
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          const isLastUserMessage = msg.role === "user" && isLastMessage;
          const waitingForLlmResponse = isLoading && isLastUserMessage;
          const isAssistant = msg.role === "assistant";
          const isLastAssistant = isAssistant && isLastMessage;
          const isTyping =
            isLastAssistant && !completedTypingMessages.has(msg.id);
          const showFullContent =
            isAssistant &&
            (!isLastAssistant || completedTypingMessages.has(msg.id));

          const fullParsedResponse = parseResponse(msg.content);
          // console.log(
          //   "Full parsed response:",
          //   fullParsedResponse.probableQuestionType
          // );
          return (
            <div
              key={index}
              className="animate-fadeIn mt-2 animate-[wiggle_1s_ease-in-out_infinite]"
            >
              {/* 1. Assistant Message */}
              {isAssistant ? (
                <div className={`max-w-4xl p-1 rounded break-words`}>
                  <div className="ml-2 text-text whitespace-pre-wrap break-words">
                    {isLastAssistant &&
                    !typedMessageIdsRef.current.has(msg.id) ? (
                      <TypingAssistantMessage
                        message={msg.content}
                        messageId={msg.id}
                        onTypingComplete={() => handleTypingComplete(msg.id)}
                        scrollAnchorRef={scrollAnchorRef}
                      />
                    ) : (
                      <div className="ml-2 text-text whitespace-pre-wrap break-words">
                        {formatMessageContent(msg.content, false, "")}
                      </div>
                    )}
                  </div>
                </div>
              ) : /* 2. User Message (with BorderAnimationWrapper if waiting) */
              isLastUserMessage && isLoading ? (
                <BorderAnimationWrapper className="w-fit">
                  <div className="text-black max-w-4xl p-1 rounded  break-words">
                    <div className="ml-2 text-text whitespace-pre-wrap break-words">
                      {formatMessageContent(msg.content, false, "")}
                    </div>
                  </div>
                </BorderAnimationWrapper>
              ) : (
                <div
                  className={`max-w-4xl bg-stone-200 w-fit px-4 py-2 rounded-lg  break-words`}
                >
                  <div className=" text-text whitespace-pre-wrap break-words">
                    {formatMessageContent(msg.content, false, "")}
                  </div>
                </div>
              )}

              {waitingForLlmResponse && (
                <LoadingMessages
                  waitingForLlmResponse={waitingForLlmResponse}
                />
              )}

              {showFullContent && (
                <div className="mt-2">
                  {/* Show feedback form and action buttons for assistant messages with topics */}
                  {msg.content && msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-4 opacity-80 hover:opacity-100 transition-opacity duration-200">
                      {/* Give Feedback Button */}
                      {!feedbackSubmitted[index] && !msg.feedbackGiven && (
                        <div className="relative group">
                          <button
                            onClick={() => setOpenDialogIndex(index)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 hover:bg-black border border-gray-600/50 hover:border-gray-500/80 text-text hover:text-white transition-all duration-200 backdrop-blur-sm"
                            aria-label="Give feedback"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Give feedback
                            </span>
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-gray-900/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20 shadow-lg backdrop-blur-sm">
                            Give feedback on this response
                            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900/95"></div>
                          </div>
                        </div>
                      )}

                      {/* Copy Full Response Button */}
                      <div className="relative group">
                        <button
                          onClick={() => handleCopyFullResponse(msg.content)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 hover:bg-black border border-gray-600/50 hover:border-gray-500/80 text-text hover:text-white transition-all duration-200 backdrop-blur-sm"
                          aria-label="Copy response"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Copy response
                          </span>
                        </button>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-gray-900/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20 shadow-lg backdrop-blur-sm">
                          Copy complete response to clipboard
                          <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900/95"></div>
                        </div>
                      </div>

                      <FeedbackDialog
                        open={openDialogIndex === index}
                        onOpenChange={(open) =>
                          !open &&
                          openDialogIndex === index &&
                          setOpenDialogIndex(null)
                        }
                        questionType={questionType}
                        studentPrompt={messages[index - 1]?.content || ""}
                        chatbotResponse={fullParsedResponse.content}
                        codeContent={codeContent}
                        codeLanguage={codeLanguage}
                        onFeedbackSubmitted={() => {
                          handleFeedbackSubmitted(index);
                          setOpenDialogIndex(null);
                        }}
                        sessionId={sessionId}
                        last2Messages={lastTwoMessages}
                        messageId={msg.id}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={scrollAnchorRef} />
      </div>
    </div>
  );
}
