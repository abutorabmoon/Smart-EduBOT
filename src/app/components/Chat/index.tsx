import { ChatInput } from "@/components/chat-input";
import { IMessage } from "@/model/session-model";
import React, { ChangeEvent, FormEvent, useEffect, useRef } from "react";
import Messages from "./Messages";

interface Chat {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  messages: IMessage[];
  questionType: string;
  answerStyle?: string;
  codeContent?: string;
  codeLanguage?: string;
  isLoading?: boolean;
  error?: Error;
  onNewSession?: () => void;
  onQuestionTypeChange: (value: string) => void;
  onAnswerStyleChange?: (value: string) => void;
  onOpenCodeEditor: () => void;
  sessionId: string;
}

const Chat: React.FC<Chat> = ({
  input,
  handleInputChange,
  handleMessageSubmit,
  messages,
  questionType,
  answerStyle,
  codeContent,
  codeLanguage,
  isLoading,
  error,
  onNewSession,
  onQuestionTypeChange,
  onAnswerStyleChange,
  onOpenCodeEditor,
  sessionId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";

      // Calculate the new height based on content
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200;
      const minHeight = 44;

      // Set the height, constrained by min and max values
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;

      // Enable/disable scrolling based on whether we've hit the max height
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  };

  // Adjust height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Adjust height on component mount
  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Only submit if there's actual content (not just whitespace) and not currently loading
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.closest("form");
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  const wrappedHandleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      await handleMessageSubmit(e);
    } catch (error) {
      console.error("CHAT COMPONENT - Error in form submission:", error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full px-1 space-y-1">
      {/* Messages container with scroll */}
      <div className="flex-1 px-1 pb-4">
        <Messages
          messages={messages}
          questionType={questionType}
          answerStyle={answerStyle}
          codeContent={codeContent}
          codeLanguage={codeLanguage}
          isLoading={isLoading}
          error={error}
          sessionId={sessionId}
        />
      </div>

      {/* Fixed input at bottom */}
      <div className="sticky bottom-0 left-0 right-0 ">
        <ChatInput
          input={input}
          onInputChange={(value) => {
            const event = {
              target: { value },
            } as ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(event);
          }}
          onSubmit={wrappedHandleSubmit}
          isLoading={isLoading}
          questionType={questionType}
          answerStyle={answerStyle}
          onQuestionTypeChange={onQuestionTypeChange}
          onAnswerStyleChange={onAnswerStyleChange}
          onOpenCodeEditor={onOpenCodeEditor}
        />
      </div>
    </div>
  );
};

export default Chat;
