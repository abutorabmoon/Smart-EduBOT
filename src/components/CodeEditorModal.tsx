"use client";

import React, { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CodeEditor from "@/app/components/CodeEditor";

interface CodeEditorModalProps {
  open: boolean;
  onClose: () => void;
  initialCode: string;
  initialLanguage: string;
  onCodeChange: (code: string, language: string) => void;
  questionType: string;
  sessionId: string;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  open,
  onClose,
  initialCode,
  initialLanguage,
  onCodeChange,
  questionType,
  sessionId,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full text-white ">
        <DialogHeader>
          <DialogTitle>
            {questionType === "QuestionFromCode" && "Paste Your Code"}
            {questionType === "CodeExplanation" && "Code to Explain"}
            {questionType === "HelpFixCode" && "Code to Fix"}
            {!["QuestionFromCode", "CodeExplanation", "HelpFixCode"].includes(
              questionType
            ) && "Code Editor"}
          </DialogTitle>
        </DialogHeader>

        <CodeEditor
          className="w-full"
          onCodeChange={onCodeChange}
          initialCode={initialCode}
          initialLanguage={initialLanguage}
          questionType={questionType}
          key={`${sessionId}-${initialLanguage}`}
        />

        {initialCode && (
          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-sm">
              ✓ Code will be included with your message (
              {initialCode.split("\n").length} lines)
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CodeEditorModal;
