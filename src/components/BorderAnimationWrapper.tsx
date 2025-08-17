"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface BorderAnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const BorderAnimationWrapper: React.FC<BorderAnimationWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "relative w-fit rounded-xl p-[2px] overflow-hidden",
        className
      )}
    >
      {/* Spinning gradient border */}
      <div className="absolute inset-0 before:absolute before:inset-[-50%] before:bg-[conic-gradient(from_0deg,_transparent,_#000000,_transparent)] before:animate-spin-slow before:z-0 before:rounded-xl"></div>

      {/* Inner content with shimmer */}
      <div className="relative z-10 bg-white backdrop-blur-md rounded-xl px-4 py-1 break-words max-w-full overflow-hidden">
        {/* Shimmer Layer */}
        <div className="absolute inset-0 z-10 animate-shimmer bg-[linear-gradient(110deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0)_100%)] bg-[length:200%_100%] pointer-events-none rounded-xl"></div>

        {/* Actual content */}
        <div className="relative z-20">{children}</div>
      </div>
    </div>
  );
};

export default BorderAnimationWrapper;
