"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import React, { ChangeEvent, FormEvent, useEffect, useRef } from "react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading?: boolean;
  questionType: string;
  onQuestionTypeChange: (value: string) => void;
  answerStyle?: string;
  onAnswerStyleChange?: (value: string) => void;
  onOpenCodeEditor: () => void;
  placeholder?: string;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading = false,
  questionType,
  onQuestionTypeChange,
  answerStyle = "Neutral",
  onAnswerStyleChange = () => {},
  onOpenCodeEditor,
  placeholder = "How can I help you today?",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200;
      const minHeight = 44;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.closest("form");
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  return (
    <div className="sticky bottom-0 bg-primary">
      <form onSubmit={onSubmit} className="relative bg-transparent">
        <div className="flex flex-col p-2 border-border rounded-xl relative border">
          <textarea
            ref={textareaRef}
            className="flex-grow py-3 px-4 text-text dark:text-text bg-transparent border-none outline-none resize-none placeholder-gray-500 dark:placeholder-gray-400 leading-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/40 hover:scrollbar-thumb-gray-500 transition-all duration-300"
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              minHeight: "80px",
              maxHeight: "300px",
              overflowY: "hidden",
            }}
            rows={1}
          />
          <div className="flex space-x-2 items-center justify-end">
            <button
              type="button"
              onClick={onOpenCodeEditor}
              className="p-1 rounded hover:opacity-80 transition"
              aria-label="Open code editor"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 122.88 121.51"
                className="w-6 h-6 text-text dark:text-gray-400 text-orange-00"
                fill="currentColor"
              >
                <title>edit</title>
                <path d="M28.66,1.64H58.88L44.46,16.71H28.66a13.52,13.52,0,0,0-9.59,4l0,0a13.52,13.52,0,0,0-4,9.59v76.14H91.21a13.5,13.5,0,0,0,9.59-4l0,0a13.5,13.5,0,0,0,4-9.59V77.3l15.07-15.74V92.85a28.6,28.6,0,0,1-8.41,20.22l0,.05a28.58,28.58,0,0,1-20.2,8.39H11.5a11.47,11.47,0,0,1-8.1-3.37l0,0A11.52,11.52,0,0,1,0,110V30.3A28.58,28.58,0,0,1,8.41,10.09L8.46,10a28.58,28.58,0,0,1,20.2-8.4ZM73,76.47l-29.42,6,4.25-31.31L73,76.47ZM57.13,41.68,96.3.91A2.74,2.74,0,0,1,99.69.38l22.48,21.76a2.39,2.39,0,0,1-.19,3.57L82.28,67,57.13,41.68Z" />
              </svg>
            </button>

            <div className="flex space-x-2">
              <Select
                value={questionType}
                onValueChange={onQuestionTypeChange}
                defaultValue="Beginner"
              >
                <SelectTrigger className="w-[120px] text-text border-border">
                  <SelectValue
                    placeholder="Select Level"
                    className="text-text font-semibold"
                  />
                </SelectTrigger>
                <SelectContent className="bg-primary text-text cursor-pointer">
                  <SelectItem
                    value="Beginner"
                    className="hover:bg-blue-200 focus:bg-blue-200"
                  >
                    Beginner
                  </SelectItem>
                  <SelectItem
                    value="Intermediate"
                    className="hover:bg-blue-200 focus:bg-blue-200"
                  >
                    Intermediate
                  </SelectItem>
                  <SelectItem
                    value="Expert"
                    className="hover:bg-blue-200 focus:bg-blue-200"
                  >
                    Expert
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={answerStyle}
                onValueChange={onAnswerStyleChange}
                defaultValue="Neutral"
              >
                <SelectTrigger className="w-[120px] text-text border-border">
                  <SelectValue
                    placeholder="Answer Style"
                    className="text-text font-semibold"
                  />
                </SelectTrigger>
                <SelectContent className="bg-primary text-text cursor-pointer">
                  <SelectItem
                    value="Theory"
                    className="hover:bg-blue-200 focus:bg-blue-200"
                  >
                    Theory base answer
                  </SelectItem>
                  <SelectItem
                    value="Code"
                    className="hover:bg-blue-200 focus:bg-blue-200"
                  >
                    Code base answer
                  </SelectItem>
                  <SelectItem
                    value="Neutral"
                    className="hover:bg-blue-200 focus:bg-blue-200"
                  >
                    Neutral answer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`p-2 rounded-lg transition-all duration-200 ${
                input.trim() && !isLoading
                  ? "text-text hover:text-blue-400 cursor-pointer"
                  : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin" />
                </div>
              ) : (
                <Send className="text-text" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
