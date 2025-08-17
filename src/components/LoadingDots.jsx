import React from "react";

const LoadingDots = ({ color, size = "w-2.5 h-2.5" }) => {
  return (
    <div className="flex space-x-1 ml-2">
      <div
        className={`${size} ${color} rounded-full animate-bounce`}
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className={`${size} ${color} rounded-full animate-bounce`}
        style={{ animationDelay: "0.3s" }}
      ></div>
      <div
        className={`${size} ${color} rounded-full animate-bounce`}
        style={{ animationDelay: "0.6s" }}
      ></div>
    </div>
  );
};

export default LoadingDots;
