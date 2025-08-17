import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

interface ContextProps {
  
  onSplittingMethodChange?: (method: string) => void;
}

export const Context: React.FC<ContextProps> = ({
  onSplittingMethodChange,
}) => {
  const [splittingMethod, setSplittingMethod] = useState("Beginner");

  const handleSplittingMethodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMethod = e.target.value;
    setSplittingMethod(newMethod);
    onSplittingMethodChange?.(newMethod);
  };

  const DropdownLabel: React.FC<
    React.PropsWithChildren<{ htmlFor: string }>
  > = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-white p-2 font-bold">
      {children}
    </label>
  );
  // console.log("Context/index.tsx - splittingMethod:", splittingMethod);

  return (
    <div
      className={`flex flex-col border-2 overflow-y-auto rounded-lg border-gray-500 w-full `}
    >
      <div className="flex flex-col items-start sticky top-0 w-full">
        <div className="text-left w-full flex flex-col rounded-b-lg bg-gray-600 p-3 subpixel-antialiased">
          <DropdownLabel htmlFor="splittingMethod">
            Select Question Type:
          </DropdownLabel>
          <div className="relative w-full">
            <select
              id="splittingMethod"
              value={splittingMethod}
              className="p-2 bg-gray-700 rounded text-white w-full appearance-none hover:cursor-pointer"
              onChange={handleSplittingMethodChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
