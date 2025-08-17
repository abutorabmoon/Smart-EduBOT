import { useEffect, useRef, useState } from "react";
import { formatMessageContent } from "@/app/components/Chat/Messages";

interface TypingAssistantMessageProps {
  message: string;
  messageId: string;
  onTypingComplete: () => void;
  scrollAnchorRef?: React.RefObject<HTMLDivElement>;
}

export default function TypingAssistantMessage({
  message,
  messageId,
  onTypingComplete,
  scrollAnchorRef,
}: TypingAssistantMessageProps) {
  const [typedContent, setTypedContent] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const hasTypedBefore =
      localStorage.getItem(`typed-${messageId}`) === "true";

    if (hasTypedBefore) {
      // Skip typing
      setTypedContent(message);
      setIsTyping(false);
      onTypingComplete();
      return;
    }

    // Start typing effect
    let currentLength = 0;
    intervalRef.current = setInterval(() => {
      currentLength += 1;
      setTypedContent(message.substring(0, currentLength));

      if (scrollAnchorRef?.current) {
        scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" });
      }

      if (currentLength >= message.length) {
        clearInterval(intervalRef.current!);
        setIsTyping(false);
        localStorage.setItem(`typed-${messageId}`, "true");
        onTypingComplete();
      }
    }, 0.5); //increase for slower typing

    return () => clearInterval(intervalRef.current!);
  }, [message, messageId, onTypingComplete, scrollAnchorRef]);

  return (
    <div className="ml-2 text-text whitespace-pre-wrap break-words">
      {formatMessageContent(message, isTyping, typedContent)}
    </div>
  );
}
