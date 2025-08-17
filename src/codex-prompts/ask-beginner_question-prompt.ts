// Define our own ChatCompletionRequestMessage interface
interface ChatCompletionRequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}


export const mainBeginnerAskQuestion = (question: string) => {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: "system",
      content:
        `for each asked [question], provide a beginner-friendly [answer] (single-paragraph). Use simple words, short sentences, and define any jargon in parentheses. Prefer C examples first and add C++ when helpful. Keep code small and add tiny inline comments. Avoid advanced topics unless the user asks. If the question is off-topic (not beginner C/C++), politely ask for a basic programming question. To display multi-line code, start it with the [code] tag, followed by a [code-title] and end it with [end-code]. each response should end with [STOP-end-question-answer-STOP].`,
    },
    {
      role: "user",
      content: `[question]: what is the meaning of life?`,
    },
    {
      role: "assistant",
      content: `[answer]: Sorry, this is an irrelevant question. Please ask questions related to programming.
[STOP-end-question-answer-STOP]`,
    },
    {
      role: "user",
      content: `[question]: how can I read from a file?`,
    },
    {
      role: "assistant",
      content: `[answer]: In C, open a file with \`fopen()\`, read each line with \`fgets()\` inside a loop, then close it with \`fclose()\`; in C++, create \`std::ifstream\`, check \`is_open()\`, read lines with \`std::getline()\`, and the file closes automatically when the object is destroyed.
[code]:
[code-title]: C — read a text file line by line
#include <stdio.h>

int main(void) {
    FILE *file = fopen("file.txt", "r");   // open for reading
    if (!file) { perror("file"); return 1; }
    char line[256];                         // buffer to hold each line
    while (fgets(line, sizeof line, file)) {
        printf("%s", line);                 // print the line
    }
    fclose(file);                           // always close the file
    return 0;
}
[end-code]
[code]:
[code-title]: C++ — read a text file line by line
#include <fstream>
#include <iostream>
#include <string>

int main() {
    std::ifstream in("file.txt");                 // open file
    if (!in.is_open()) { std::cerr << "Can't open file\\n"; return 1; }
    std::string line;
    while (std::getline(in, line)) {              // read one line at a time
        std::cout << line << '\\n';               // print the line
    }                                             // file closes automatically here
    return 0;
}
[end-code]
[STOP-end-question-answer-STOP]`,
    },
    {
      role: "user",
      content: `[question]: is it possible to initialize a boolean and reassign its value for use later in a program?`,
    },
    {
      role: "assistant",
      content: `[answer]: Yes, it is possible to initialize a boolean and reassign its value in C programming. However, there is no built-in boolean type in C, so a boolean-like behavior can be achieved using the \`_Bool\` or \`bool\` type from \`<stdbool.h>\` in C99 and later versions of the language, or by using integer constants such as 0 (representing false) and 1 (representing true). Here is an example of how to initialize a boolean and reassign its value:
[code]:
[code-title]: initialize a boolean and reassign its value
#include <stdbool.h>
#include <stdio.h>

int main() {
    bool flag = false;
    flag = true;
    printf("%d", flag);
    return 0;
}
[end-code]
[STOP-end-question-answer-STOP]`,
    },
    {
      role: "user",
      content: `[question]: ${question}`,
    },
  ];

  return {
    messages,
    stop: ["[STOP-end-question-answer-STOP]"],
    temperature: 0.05,
    max_tokens: 2048,
  };
};

export const replyBeginnerAskQuestion = (
  prevResponses: string[] | undefined,
  newQuestion: string
) => {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: "system",
      content:
        `for each asked [question], provide a beginner-friendly [answer] (single-paragraph). [answer] should use simple words and avoid technical jargon unless explained in parentheses. [answer] should not include multi-line codes. instead, to display multi-line code, start it with the [code] tag, followed by a [code-title] and end it with [end-code]. finally, each response should end with [STOP-end-question-answer-STOP].`,
    },
    {
      role: "user",
      content: `[question]: how can I read from a file?`,
    },
    {
      role: "assistant",
      content: `[answer]: To read from a file in C, you first open it with the \`fopen()\` function, which needs the file name and a mode (like \`"r"\` for reading). Then you can use \`fgets()\` to read one line at a time into a character array (a string). You keep reading until there are no more lines left. Finally, you must close the file with \`fclose()\` to free resources.
[code]:
[code-title]: C — read a file line by line
#include <stdio.h>

int main() {
    FILE *file = fopen("file.txt", "r");  // open file for reading
    if (!file) {                          // check if file opened
        printf("Could not open file\\n");
        return 1;
    }
    char line[100];
    while (fgets(line, sizeof(line), file)) {
        printf("%s", line);               // print each line
    }
    fclose(file);                         // close the file
    return 0;
}
[end-code]
[STOP-end-question-answer-STOP]`,
    },
    {
      role: "user",
      content: `[follow-up-question]: I don't want to use fgets, is there another way to read a file?`,
    },
    {
      role: "assistant",
      content: `[answer]: Yes, there are other easy ways. You can use \`getc()\` to read one character at a time, which is useful for very simple text files. Another option is \`fscanf()\`, which works like \`scanf()\` but reads from a file instead of the keyboard, and is good for formatted data (like numbers and words). There is also \`fread()\`, which reads a block of raw data at once, usually for binary files. Here is a simple example with \`fscanf()\`:
[code]:
[code-title]: C — read formatted data using fscanf
#include <stdio.h>

int main() {
    FILE *file = fopen("file.txt", "r");
    if (!file) {
        printf("Could not open file\\n");
        return 1;
    }
    int number;
    char word[50];
    float value;
    fscanf(file, "%d %s %f", &number, word, &value); // read int, string, float
    printf("%d %s %.2f\\n", number, word, value);
    fclose(file);
    return 0;
}
[end-code]
[STOP-end-question-answer-STOP]`,
    },
  ];

  if (prevResponses && prevResponses.length !== 0) {
    // Process the first message
    const firstResponse = prevResponses[0];

    // Extract question from first line
    const lines = firstResponse.split('\n');
    const firstQuestion = lines[0].replace('[question]: ', '');

    // Get the complete response content (everything after the first line)
    const firstCompleteResponse = lines.slice(1).join('\n');

    messages.push(
      {
        role: "user",
        content: `[question]: ${firstQuestion}`,
      },
      {
        role: "assistant",
        content: firstCompleteResponse,
      }
    );

    // Process subsequent follow-up messages
    for (let i = 1; i < prevResponses.length; i++) {
      if (prevResponses[i]) {
        const responseLines = prevResponses[i].split('\n');

        // Find the follow-up question line
        const questionLine = responseLines.find(line =>
          line.startsWith('[follow-up-question]:')
        );

        if (questionLine) {
          const question = questionLine.replace('[follow-up-question]: ', '');

          // Get everything after the question line as the complete response
          const questionIndex = responseLines.indexOf(questionLine);
          const completeResponse = responseLines.slice(questionIndex + 1).join('\n');

          messages.push(
            {
              role: "user",
              content: `[follow-up-question]: ${question}`,
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

  messages.push({
    role: "user",
    content: `[follow-up-question]: ${newQuestion}`,
  });

  return {
    messages,
    stop: ["[STOP-end-question-answer-STOP]"],
    temperature: 0.15,
    max_tokens: 2048,
  };
};
