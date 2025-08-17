"use client";
import Chat from "@/app/components/Chat";
import CodeEditor from "@/app/components/CodeEditor";
import { parseResponse } from "@/app/utils/responseParser";
import Loader from "@/components/Loader";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IMessage } from "@/model/session-model";
import { useParams, useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useRef, useState } from "react";

const Page: React.FC = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [splittingMethod, setSplittingMethod] = useState("Beginner");
  const [answerStyle, setAnswerStyle] = useState("Neutral");
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [allMessages, setAllMessages] = useState<IMessage[]>([]);
  const [showCodeEditorForResponse, setShowCodeEditorForResponse] =
    useState(false);
  const params = useParams();
  const splittingMethodRef = useRef(splittingMethod);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedQuestionType = sessionStorage.getItem("selectedQuestionType");
    if (storedQuestionType) {
      setSplittingMethod(storedQuestionType);
    }

    const storedAnswerStyle = sessionStorage.getItem("selectedAnswerStyle");
    if (storedAnswerStyle) {
      setAnswerStyle(storedAnswerStyle);
    }
  }, []);

  useEffect(() => {
    splittingMethodRef.current = splittingMethod;
  }, [splittingMethod]);

  useEffect(() => {
    const firstMessage = searchParams.get("firstMessage");
    if (firstMessage && currentSessionId && allMessages.length === 0) {
      const fakeEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>;

      setInput(firstMessage);

      // Trigger submit manually after short delay (to allow session load)
      setTimeout(() => {
        handleMessageSubmit(fakeEvent);
      }, 300);
    }
  }, [currentSessionId, allMessages]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const savedSessionId = params.sessionId as string;
        if (!savedSessionId) return;

        const response = await fetch(`/api/session/${savedSessionId}`);
        if (response.ok) {
          const sessionData = await response.json();
          setCurrentSessionId(savedSessionId);
          setAllMessages(sessionData.messages || []);

          if (sessionData.codeContent) {
            setCodeContent(sessionData.codeContent);
            setCodeLanguage(sessionData.codeLanguage || "cpp");
            //setShowCodeEditorForResponse(true);
          }

          // 👉 Check if assistant response is missing and auto-generate
          const hasUserMessage = sessionData.messages?.some(
            (m: IMessage) => m.role === "user"
          );
          const hasAssistantMessage = sessionData.messages?.some(
            (m: IMessage) => m.role === "assistant"
          );
        } else {
          console.error("Session not found");
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };

    initializeSession();
  }, [params.sessionId]);

  useEffect(() => {
    const filtered = allMessages.filter(
      (msg) => msg.questionType === splittingMethod
    );
    setMessages(filtered);
  }, [splittingMethod, allMessages]);

  // Extract code from assistant messages
  // Automatically populate the code editor
  useEffect(() => {
    if (messages.length > 0) {
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((msg) => msg.role === "assistant");
      if (lastAssistantMessage) {
        const parsedResponse = parseResponse(lastAssistantMessage.content);
        if (parsedResponse.rawCode?.trim()) {
          setCodeContent(parsedResponse.rawCode);
          setCodeLanguage(codeLanguage || "cpp");
        }
      }
    }
  }, [messages]);

  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !currentSessionId) return;

    const userMessage: IMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role: "user",
      content: input,
      questionType: splittingMethod,
      answerStyle: answerStyle,
      createdAt: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setInput("");
    setAllMessages((prev) => [...prev, userMessage]);

    try {
      setIsLoadingResponse(true);
      // Sends the full history to /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: currentSessionId,
          data: {
            questionType: splittingMethod,
            answerStyle: answerStyle,
            ...(codeContent && { codeContent }),
            ...(codeLanguage && { codeLanguage }),
          },
        }),
      });

      const result = await response.json();
      const assistantMessage: IMessage = {
        id: result.assistantMessageId,
        role: "assistant",
        content: result.assistantContent,
        questionType: splittingMethod,
        answerStyle: answerStyle,
        createdAt: new Date(),
      };

      setAllMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Message send error:", error);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleSplittingMethodChange = async (method: string) => {
    if (currentSessionId) {
      await fetch("/api/session/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          questionType: method,
          answerStyle,
          codeContent,
          codeLanguage,
        }),
      });
    }
    sessionStorage.setItem("selectedQuestionType", method);
    setSplittingMethod(method);
  };

  const handleAnswerStyleChange = async (style: string) => {
    if (currentSessionId) {
      await fetch("/api/session/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          questionType: splittingMethod,
          answerStyle: style,
          codeContent,
          codeLanguage,
        }),
      });
    }
    sessionStorage.setItem("selectedAnswerStyle", style);
    setAnswerStyle(style);
  };

  const handleCodeChange = (code: string, language: string) => {
    setCodeContent(code);
    setCodeLanguage(language);
  };

  // Determines whether to show the code editor
  const shouldShowCodeEditor =
    ["Beginner", "Intermediate", "Expert"].includes(splittingMethod) ||
    showCodeEditorForResponse;

  //console.log("[sessionId]/page.tsx messages:", messages);
  //console.log("[sessionId]/page.tsx allMessages:", allMessages);

  return (
    <div className="flex flex-col justify-between h-screen bg-primary p-2 mx-auto max-w-full overflow-hidden ">
      {isLoadingSession ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="flex w-full flex-grow overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 transition-all duration-300">
          <Chat
            input={input}
            handleInputChange={(e) => setInput(e.target.value)}
            handleMessageSubmit={handleMessageSubmit}
            messages={messages}
            questionType={splittingMethod}
            answerStyle={answerStyle}
            codeContent={codeContent}
            codeLanguage={codeLanguage}
            isLoading={isLoadingSession || isLoadingResponse}
            onQuestionTypeChange={handleSplittingMethodChange}
            onAnswerStyleChange={handleAnswerStyleChange}
            onOpenCodeEditor={() => setShowCodeEditorForResponse(true)}
            sessionId={currentSessionId}
          />

          <Dialog
            open={showCodeEditorForResponse}
            onOpenChange={setShowCodeEditorForResponse}
          >
            <DialogContent className="max-w-4xl">
              <CodeEditor
                className="w-full"
                onCodeChange={handleCodeChange}
                initialCode={codeContent}
                initialLanguage={codeLanguage}
                questionType={splittingMethod}
                key={`${currentSessionId}-${codeLanguage}`}
              />
            </DialogContent>
          </Dialog>

          <button
            type="button"
            className="absolute left-20 transform -translate-x-12 bg-gray-800 text-white rounded-l py-2 px-4 lg:hidden"
            onClick={(e) => {
              e.currentTarget.parentElement
                ?.querySelector(".transform")
                ?.classList.toggle("translate-x-full");
            }}
          >
            ☰
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
