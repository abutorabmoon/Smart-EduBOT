import Editor from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";

interface CodeEditorProps {
  className?: string;
  onCodeChange?: (code: string, language: string) => void;
  initialCode?: string;
  initialLanguage?: string;
  questionType?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  className = "",
  onCodeChange,
  initialCode = "",
  initialLanguage = "cpp",
  questionType = "",
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  const editorRef = useRef<any>(null);

  // Update code when initialCode changes (e.g., from AI response)
  // useEffect(() => {
  //   if (initialCode) {
  //     // For "Help to fix code" question type, we want to update the existing code
  //     // For other question types or empty editor, we replace the code entirely
  //     if (
  //       questionType === "HelpFixCode" &&
  //       code &&
  //       code.trim() !== initialCode.trim()
  //     ) {
  //       // Smart update: we could implement more sophisticated merging here
  //       // For now, we just replace the code if it's different
  //       setCode(initialCode);
  //       onCodeChange?.(initialCode, language);
  //     } else if (!code || questionType !== "HelpFixCode") {
  //       // For empty editor or other question types, just set the code
  //       setCode(initialCode);
  //       onCodeChange?.(initialCode, language);
  //     }
  //   }
  // }, [initialCode, questionType]);

  // Update language when initialLanguage changes
  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  const languages = [
    {
      value: "c",
      label: "C",
      icon: "⚙️",
      defaultCode: ``,
    },
    {
      value: "cpp",
      label: "C++",
      icon: "⚡",
      defaultCode: ``,
    },
  ];

  const themes = [
    { value: "vs-dark", label: "Dark (VS Code)", icon: "🌙" },
    { value: "light", label: "Light", icon: "☀️" },
    { value: "hc-black", label: "High Contrast Dark", icon: "⚫" },
    { value: "hc-light", label: "High Contrast Light", icon: "⚪" },
  ];

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Add custom keybindings using monaco namespace
    if (monaco?.KeyMod && monaco?.KeyCode) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Custom save action
        // console.log("Save triggered");
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
        // Duplicate line
        editor.trigger("", "editor.action.duplicateSelection", "");
      });
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    onCodeChange?.(newCode, language);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    const selectedLang = languages.find((lang) => lang.value === newLanguage);

    setLanguage(newLanguage);

    // Set default code if current code is empty
    if (!code.trim() && selectedLang?.defaultCode) {
      setCode(selectedLang.defaultCode);
      onCodeChange?.(selectedLang.defaultCode, newLanguage);
    } else {
      onCodeChange?.(code, newLanguage);
    }
  };



  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const clearCode = () => {
    setCode("");
    onCodeChange?.("", language);
    editorRef.current?.focus();
  };



  const selectedLang = languages.find((l) => l.value === language);
  const selectedTheme = themes.find((t) => t.value === theme);

  return (
    <div
      className={`bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#3e3e3e] overflow-hidden ${className}`}
    >
      {/* Header - Professional VS Code style */}
      <div className="flex items-center justify-between px-4  bg-gray-50 dark:bg-[#2d2d30] border-b border-gray-200 dark:border-[#3e3e3e]">
        <div className="flex items-center gap-4">
          {/* Editor Title */}
          <div className="flex items-center gap-2">
         
            <div className="ml-2 flex items-center gap-2 bg-white dark:bg-[#1e1e1e] px-3 py-1.5 rounded ">
              <span className="text-lg">{selectedLang?.icon}</span>
              <span className="text-gray-700 dark:text-[#cccccc] text-sm font-medium">
                {selectedLang?.label}
              </span>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Language:
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-white dark:bg-[#3c3c3c] text-gray-700 dark:text-[#cccccc] text-sm px-2 py-1 rounded border border-gray-300 dark:border-[#5a5a5a] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-2">
            <button
              onClick={copyCode}
              disabled={!code}
              className={`p-2 rounded transition-colors ${
                copied
                  ? "bg-green-500 text-white"
                  : "text-gray-600 dark:text-[#cccccc] hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3c3c3c] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
              title={copied ? "Copied!" : "Copy code (Ctrl+C)"}
            >
              {copied ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={clearCode}
              disabled={!code}
              className="text-gray-600 dark:text-[#cccccc] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Clear code"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <Editor
          height="400px"
          language={language}
          value={code}
          theme={theme}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          //   options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-[#1e1e1e]">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Loading Monaco Editor...
                </span>
              </div>
            </div>
          }
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-blue-600 dark:bg-[#007acc] text-white text-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Lines: {code.split("\n").length}
            </span>
            <span>Characters: {code.length}</span>
            <span>Language: {selectedLang?.label}</span>
            <span>Theme: {selectedTheme?.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
