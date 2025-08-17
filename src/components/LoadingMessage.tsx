import React, { useState, useEffect } from 'react';

const LoadingMessages = ({ waitingForLlmResponse = false }) => {
  const messages = [
    "Just a sec...",
    "Generating your response...",
    "Thinking hard...",
    "Almost there...",
    "Processing your request...",
    "Crafting the perfect answer...",
    "Working on it...",
    "Hang tight...",
    "Computing magic...",
    "Brewing your response..."
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!waitingForLlmResponse) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % messages.length
      );
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [waitingForLlmResponse, messages.length]);

  // Reset to first message when loading starts
  useEffect(() => {
    if (waitingForLlmResponse) {
      setCurrentMessageIndex(0);
    }
  }, [waitingForLlmResponse]);

  if (!waitingForLlmResponse) return null;

  return (
    <div className="animate-pulse mt-2 flex items-center text-text rounded w-fit">
      <span className="font-bold">{messages[currentMessageIndex]}</span>
    </div>
  );
};

// Usage in your Messages component:
// Replace the existing loading message with:
// {waitingForLlmResponse && <LoadingMessages waitingForLlmResponse={waitingForLlmResponse} />}

export default LoadingMessages;