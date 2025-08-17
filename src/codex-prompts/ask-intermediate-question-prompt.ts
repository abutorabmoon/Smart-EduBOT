// Define our own ChatCompletionRequestMessage interface
interface ChatCompletionRequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}


export const mainIntermediateAskQuestion = (code: string, question?: string) => {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: "system",
      content:
        "Provide a concise yet thorough [explanation] of the given code's purpose and functionality, then display the [annotated-code] with line-by-line comments. Assume the user has intermediate knowledge of C/C++, so focus on clarifying design choices, efficiency, memory handling, system calls, and best practices rather than basic syntax. Highlight potential pitfalls and optimizations where relevant.",
    },
    {
      role: "user",
      content: `[code]:
nice code in another language except c/c++
[question]: Explain the code`,

    },
    {
      role: "assistant",
      content: `[answer]: Sorry, I can only provide code examples in C or C++ programming languages.`,
    },
    {
      role: "user",
      content: `[code]:
#include <unistd.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <sys/socket.h>

#include "socket.h"

void write_random_pieces(int soc, const char *message, int times) {
    char piece[MAXCHARS];
    int message_len = strlen(message);
    int total_bytes = times * message_len;
    int current_byte = 0;

    while (current_byte < total_bytes) {
        int piece_size = rand() % (MAXCHARS - MINCHARS + 1) + MINCHARS;
        int bytes_left = total_bytes - current_byte;
        if (piece_size > bytes_left) {
            piece_size = bytes_left;
        }

        for (int i = 0; i < piece_size; i++) {
            piece[i] = message[(current_byte + i) % message_len];
        }
        write(soc, piece, piece_size);
        current_byte += piece_size;
    }
}`,
    },
    {
      role: "assistant",
      content: `[answer]: This function transmits a given message multiple times over a socket, splitting it into randomly sized chunks. Instead of sending the message in one go, it deliberately fragments the data into pieces between \`MINCHARS\` and \`MAXCHARS\`, which can be useful for testing network robustness or simulating non-deterministic data transfer. Modulo arithmetic ensures the message repeats seamlessly if a chunk boundary doesn’t align with the message length.
[code]:
[code-title]: Annotated C Code for Writing Random-Sized Chunks to a Socket
#include <unistd.h>     // for write()
#include <arpa/inet.h>  // for inet functions (though unused here)
#include <netdb.h>      // for host name resolution
#include <sys/socket.h> // for socket-related functions

#include "socket.h" // likely defines MAXCHARS, MINCHARS, and function prototypes

void write_random_pieces(int soc, const char *message, int times) {
    char piece[MAXCHARS];                   // temporary buffer for each chunk
    int message_len = strlen(message);      // precompute message length to avoid repeated calls
    int total_bytes = times * message_len;  // total bytes to transmit
    int current_byte = 0;                   // how many bytes have been sent so far

    while (current_byte < total_bytes) { 
        int piece_size = rand() % (MAXCHARS - MINCHARS + 1) + MINCHARS; // random size in range [MINCHARS, MAXCHARS]
        int bytes_left = total_bytes - current_byte; // ensure we don’t overshoot

        if (piece_size > bytes_left) {
            piece_size = bytes_left; // adjust to fit remaining data
        }

        // Copy appropriate substring into buffer; wrap around with modulo if needed
        for (int i = 0; i < piece_size; i++) {
            piece[i] = message[(current_byte + i) % message_len];
        }

        // Write the current chunk to the socket
        // Note: no error checking here; write() may send fewer bytes, which should ideally be handled
        write(soc, piece, piece_size);

        current_byte += piece_size; // advance sent counter
    }
}
[end-code]
[STOP-end-explain-code-STOP]`,
    },
  ];

  if (question) {
    messages.push({
      role: "user",
      content: `[code]:
${code}
[question]: ${question}`,
    });
  } else {
    messages.push({
      role: "user",
      content: `[code]:
${code}`,
    });
  }

  return {
    messages,
    stop: ["[STOP-end-explain-code-STOP]"],
    temperature: 0.1,
    max_tokens: 1536,
  };
};

export const replyIntermediateAskQuestion = (
  code: string,
  prevResponses: string[] | undefined,
  newQuestion: string
) => {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: "system",
      content:
        "Answer follow-up questions about the previously explained and annotated code. Assume the user has intermediate C/C++ knowledge. Provide clear, educational explanations that deepen understanding of C/C++ concepts, syntax, memory, and best practices. When appropriate, illustrate your answer with concise code snippets or examples.",
    },
    {
      role: "user",
      content: `[code]:
#include <unistd.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <sys/socket.h>

#include "socket.h"

void write_random_pieces(int soc, const char *message, int times) {
    char piece[MAXCHARS];
    int message_len = strlen(message);
    int total_bytes = times * message_len;
    int current_byte = 0;

    while (current_byte < total_bytes) {
        int piece_size = rand() % (MAXCHARS - MINCHARS + 1) + MINCHARS;
        int bytes_left = total_bytes - current_byte;
        if (piece_size > bytes_left) {
            piece_size = bytes_left;
        }

        for (int i = 0; i < piece_size; i++) {
            piece[i] = message[(current_byte + i) % message_len];
        }
        write(soc, piece, piece_size);
        current_byte += piece_size;
    }
}
[question]: what happens if write() doesn’t send all bytes?`,
    },
    {
      role: "assistant",
      content: `[answer]: The \`write()\` system call may not always send the entire buffer in one call, especially with sockets. It returns the number of bytes actually written, which can be less than the requested \`piece_size\`. This is common in non-blocking sockets or under heavy network load. If fewer bytes are written, the remaining data must be resent manually. Robust code typically uses a loop around \`write()\` until all bytes are successfully transmitted.
[code]:
[code-title]: robust write loop for sending all bytes
ssize_t robust_write(int fd, const char *buf, size_t len) {
    size_t total_sent = 0;
    while (total_sent < len) {
        ssize_t sent = write(fd, buf + total_sent, len - total_sent);
        if (sent <= 0) {
            perror("write");
            return -1; // error
        }
        total_sent += sent;
    }
    return total_sent;
}
[end-code]`,
    },
    {
      role: "user",
      content: `[follow-up-question]: why does write() sometimes send fewer bytes?`,
    },
    {
      role: "assistant",
      content: `[answer]: \`write()\` may send fewer bytes than requested because the underlying kernel buffers or network stack can only accept part of the data at that moment. For example:
- On a socket, the TCP buffer might be full, so only a portion of the data is accepted.
- In non-blocking mode, \`write()\` returns immediately with however many bytes it could write.
- On pipes or terminals, system-imposed buffer limits may also reduce the number of bytes written.

That’s why production-quality socket code always checks the return value of \`write()\` and loops until all bytes are sent.
[STOP-end-question-answer-STOP]`,
    },
  ];

// Store the original code that should be used consistently
  let originalCode = code;
  let lastAnnotatedCode = code;

  if (prevResponses !== undefined && prevResponses.length !== 0) {
    // Process the first message
    const firstResponse = prevResponses[0];
    
    // Extract question and complete response properly
    let firstQuestion = "";
    let firstCompleteResponse = "";
    
    // Look for [question]: pattern in the response
    const questionMatch = firstResponse.match(/\[question\]:\s*([\s\S]+?)(?=\n\[|\n$|$)/);
    if (questionMatch) {
      firstQuestion = questionMatch[1].trim();
    }
    
    // Extract the original code from the first response if it exists
    const codeStartIndex = firstResponse.indexOf('[code]:');
    if (codeStartIndex !== -1) {
      const afterCodeTag = firstResponse.substring(codeStartIndex + 7); // 7 = length of '[code]:'
      const questionStartIndex = afterCodeTag.indexOf('[question]:');
      if (questionStartIndex !== -1) {
        originalCode = afterCodeTag.substring(0, questionStartIndex).trim();
      }
    }
    
    // Get everything after the question as the complete response
    const questionIndex = firstResponse.indexOf(`[question]: ${firstQuestion}`);
    if (questionIndex !== -1) {
      const afterQuestion = firstResponse.substring(questionIndex + `[question]: ${firstQuestion}`.length);
      firstCompleteResponse = afterQuestion.trim();
    } else {
      // Fallback: look for patterns like [explanation]: or [answer]:
      const explanationMatch = firstResponse.match(/\[(?:explanation|answer)\]:([\s\S]*)/);
      if (explanationMatch) {
        firstCompleteResponse = explanationMatch[0]; // Include the tag
      }
    }

    // Extract annotated code from the first response if it exists
    const annotatedCodeMatch = firstCompleteResponse.match(/\[annotated-code|code\]:\s*[\s\S]*?\n([\s\S]*?)\[end-code\]/);
    if (annotatedCodeMatch) {
      lastAnnotatedCode = annotatedCodeMatch[1].trim();
    }

    // Add the first question-response pair
    if (firstQuestion && firstCompleteResponse) {
      messages.push(
        {
          role: "user",
          content: `[code]:\n${originalCode}\n[question]: ${firstQuestion}`,
        },
        {
          role: "assistant",
          content: firstCompleteResponse,
        }
      );
    }

    // Process subsequent follow-up messages
    for (let i = 1; i < prevResponses.length; i++) {
      if (prevResponses[i]) {
        const response = prevResponses[i];
        
        // Look for follow-up question pattern
        const followUpMatch = response.match(/\[follow-up-question\]:\s*([\s\S]+?)(?=\n\[|\n$|$)/);
        
        if (followUpMatch) {
          const question = followUpMatch[1].trim();
          
          // Get everything after the follow-up question as the complete response
          const questionIndex = response.indexOf(`[follow-up-question]: ${question}`);
          if (questionIndex !== -1) {
            const afterQuestion = response.substring(questionIndex + `[follow-up-question]: ${question}`.length);
            const completeResponse = afterQuestion.trim();

            // Use the most recent annotated code for follow-up questions
            messages.push(
              {
                role: "user",
                content: `[follow-up-code]:\n${lastAnnotatedCode}\n[follow-up-question]: ${question}`,
              },
              {
                role: "assistant",
                content: completeResponse,
              }
            );
          }
        }
      }
    }
  }

  // Use the most recent annotated code for the new follow-up question
  messages.push({
    role: "user",
    content: `[follow-up-question]: ${newQuestion}`,
  });

  return {
    messages,
    stop: ["[STOP-end-question-answer-STOP]"],
    temperature: 0.15,
    max_tokens: 1536,
  };
};