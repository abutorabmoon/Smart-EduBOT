import React, { ChangeEvent, FormEvent, useEffect, useRef } from "react";
import Messages from "./Messages";
import { ChatInput } from "@/components/chat-input";
import { IMessage } from "@/model/session-model";

interface Chat {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  messages: IMessage[];
  questionType: string;
  codeContent?: string;
  codeLanguage?: string;
  isLoading?: boolean;
  error?: Error;
  onNewSession?: () => void;
  onQuestionTypeChange: (value: string) => void;
  onOpenCodeEditor: () => void;
  sessionId: string;
}

const Chat: React.FC<Chat> = ({
  input,
  handleInputChange,
  handleMessageSubmit,
  messages,
  questionType,
  codeContent,
  codeLanguage,
  isLoading,
  error,
  onNewSession,
  onQuestionTypeChange,
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
    <div
      id="chat"
      className=" flex flex-col w-full max-w-4xl mx-auto h-full px-1 space-y-1"
    >
      <div>
        <Messages
          messages={messages}
          questionType={questionType}
          codeContent={codeContent}
          codeLanguage={codeLanguage}
          isLoading={isLoading}
          error={error}
          sessionId={sessionId}
        />
      </div>
      <div>
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
          onQuestionTypeChange={onQuestionTypeChange}
          onOpenCodeEditor={onOpenCodeEditor}
        />
      </div>
    </div>
  );
};

export default Chat;
