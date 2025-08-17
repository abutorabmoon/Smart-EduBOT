"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionType: string;
  studentPrompt: string;
  chatbotResponse: string;
  codeContent?: string;
  codeLanguage?: string;
  sessionId: string;
  last2Messages: string[];
  onFeedbackSubmitted?: () => void;
  messageId: string;
}

export default function FeedbackDialog({
  open,
  onOpenChange,
  questionType,
  studentPrompt,
  chatbotResponse,
  codeContent,
  codeLanguage,
  onFeedbackSubmitted,
  sessionId,
  last2Messages,
  messageId,
}: FeedbackDialogProps) {
  const { data: session } = useSession();
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [informationGap, setInformationGap] = useState("");
  const [understoodTopics, setUnderstoodTopics] = useState<string[]>([]);
  const [notUnderstoodTopics, setNotUnderstoodTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (chatbotResponse) {
      setSatisfaction(null);
      setInformationGap("");
      setUnderstoodTopics([]);
      setNotUnderstoodTopics([]);
      setFeedbackSubmitted(false);
      setError("");
    }
  }, [chatbotResponse]);


  const handleSubmit = async () => {
    if (!session) {
      setError("You must be logged in to submit feedback");
      return;
    }

    if (satisfaction === null) {
      setError("Please rate your satisfaction with the response");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionType,
          studentPrompt,
          chatbotResponse,
          studentSatisfaction: satisfaction,
          informationGap: informationGap.trim(),
          understoodTopics,
          notUnderstoodTopics,
          codeContent,
          codeLanguage,
          sessionId,
          last2Messages,
          // probableQuestionType,
          messageId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit feedback");
      }

      setFeedbackSubmitted(true);
      onFeedbackSubmitted?.();
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-primary">
        <DialogHeader className=" items-center">
          <DialogTitle className="text-text">
            How helpful was this response?
          </DialogTitle>
          <DialogDescription className="text-text">
            Your feedback helps improve future responses.
          </DialogDescription>
        </DialogHeader>

        {feedbackSubmitted ? (
          <div className="text-green-400 text-center font-medium py-4">
            Thank you for your feedback!
          </div>
        ) : (
          <>
            {/* Satisfaction */}
            <div className="my-4">
              <div className="flex justify-between mb-1 text-xs text-text">
                <span>Not Helpful</span>
                <span>Very Helpful</span>
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isFilled =
                    satisfaction !== null && rating <= satisfaction;

                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setSatisfaction(rating)}
                      aria-label={`Rate ${rating} out of 5`}
                      className="text-blue-400 hover:scale-110 transform transition duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={isFilled ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-8 h-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

            <DialogFooter>
              <div className="relative inline-flex group mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="relative inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
