"use client";

import CodeEditor from "@/app/components/CodeEditor";
import { ChatInput } from "@/components/chat-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState("Beginner");
  const [answerStyle, setAnswerStyle] = useState("Neutral");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isCodeQuestion = [""].includes(questionType);

    if (!input.trim() && (!codeContent || !isCodeQuestion)) return;

    setIsLoading(true);

    const fullMessage = input;

    try {
      // 1️⃣ Create session and save initial user message
      const res = await fetch("/api/new-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialMessage: fullMessage,
          questionType,
          answerStyle,
          codeContent,
          codeLanguage,
        }),
      });

      if (!res.ok) throw new Error("Failed to create session");
      const { sessionId } = await res.json();

      // 2️⃣ Immediately trigger assistant response generation
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: [
            {
              role: "user",
              content: fullMessage,
              questionType,
              answerStyle,
            },
          ],
          data: {
            questionType,
            answerStyle,
            codeContent,
            codeLanguage,
          },
        }),
      });

      if (!chatRes.ok) {
        console.error("Failed to get assistant response");
      }

      // BEFORE redirect
      sessionStorage.setItem("selectedQuestionType", questionType);
      sessionStorage.setItem("selectedAnswerStyle", answerStyle);

      // 3️⃣ Redirect to session page
      router.push(`/chat/${sessionId}`);
    } catch (err) {
      console.error("Error creating session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCodeEditor = () => {
    setShowCodeEditor(true);
  };

  const handleCodeChange = (code: string, language: string) => {
    setCodeContent(code);
    setCodeLanguage(language);
  };

  const handleQuestionTypeChange = (type: string) => {
    setQuestionType(type);
  };

  const handleAnswerStyleChange = (style: string) => {
    setAnswerStyle(style);
  };

  // console.log("landing page, ", codeContent);

  // console.log("input : ", input);

  const fullName = session?.user?.name;
  const name = session?.user?.name || "";
  const nameParts = name.split(" ");
  const displayName =
    nameParts.length >= 2
      ? nameParts.slice(0, 2).join(" ")
      : nameParts[0] || "there";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl min-h-screen bg-primary px-4">
      <h1 className="text-3xl font-semibold text-text mb-10 text-center">
        Hi <span className="font-bold">{displayName || "there"}</span>
        , <br /> let&apos;s dive into programming world today..
      </h1>

      <div className="w-full max-w-2xl shadow-2xl">
        <ChatInput
          input={input}
          onInputChange={(value) => setInput(value)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          questionType={questionType}
          onQuestionTypeChange={handleQuestionTypeChange}
          answerStyle={answerStyle}
          onAnswerStyleChange={handleAnswerStyleChange}
          onOpenCodeEditor={handleOpenCodeEditor}
          placeholder="Type your message to start..."
        />
      </div>

      <Dialog open={showCodeEditor} onOpenChange={setShowCodeEditor}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add your code</DialogTitle>
          </DialogHeader>
          <CodeEditor
            className="w-full"
            onCodeChange={handleCodeChange}
            initialCode={codeContent}
            initialLanguage={codeLanguage}
            questionType={questionType}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
