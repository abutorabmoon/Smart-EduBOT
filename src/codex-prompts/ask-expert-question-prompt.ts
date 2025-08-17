// Define our own ChatCompletionRequestMessage interface
interface ChatCompletionRequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}


export const mainExpertAskQuestion = (question: string) => {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: "system",
      content:
        `Focus on implementing expert-level C/C++ programming code. 
For each [question] below, provide:
1. A high-level [answer] with in-depth reasoning (cover algorithmic complexity, memory management, pitfalls, alternative approaches, and best practices in C/C++).
2. An expert-level [code] implementation that demonstrates robust, idiomatic, and efficient C/C++ style.`,
    },
    {
      role: "user",
      content: `[question]: what is the meaning of life?`,
    },
    {
      role: "assistant",
      content: `[answer]: Sorry, this is an irrelevant question. Please ask questions related to programming..
[STOP-end-question-answer-STOP]`,
    },
    {
      role: "user",
      content: `[question]: the fib function generates the first n values in the Fibonacci sequence, stores them in a dynamically-allocated array, and returns them through a pointer parameter passed as the first argument. call fib using argc and argv in the main function.`,
    },
    {
      role: "assistant",
      content: `[answer]: For an expert-level implementation of Fibonacci sequence generation, we consider several aspects:
- **Time Complexity**: The iterative approach runs in O(n), which is more efficient than the naive recursive O(2^n).
- **Memory Management**: We dynamically allocate an integer array using malloc (C) or new (C++). Always check allocation success and release memory at the end.
- **Edge Cases**: If n ≤ 0, return NULL or handle gracefully. For n = 1, allocate a single-element array.
- **Robustness**: Validate argc and argv before use. Avoid undefined behavior from accessing \`argv[1]\` when missing.
- **Alternatives**: For extremely large n, iterative storage is costly; matrix exponentiation or fast doubling methods (O(log n)) can be used if only the nth Fibonacci is required.
Below is a safe and idiomatic C implementation:

[code]:
[code-title]: define the function
void fib(int **arr, int n) {
    if (n <= 0) {
        *arr = NULL;
        return;
    }

    *arr = (int *)malloc(n * sizeof(int));
    if (!*arr) {
        perror("Memory allocation failed");
        exit(EXIT_FAILURE);
    }

    (*arr)[0] = 0;
    if (n > 1) {
        (*arr)[1] = 1;
        for (int i = 2; i < n; i++) {
            (*arr)[i] = (*arr)[i - 1] + (*arr)[i - 2];
        }
    }
}

[code-title]: call the function in main using argc and argv
int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <n>\\n", argv[0]);
        return EXIT_FAILURE;
    }

    int n = atoi(argv[1]);
    if (n <= 0) {
        fprintf(stderr, "Error: n must be a positive integer.\\n");
        return EXIT_FAILURE;
    }

    int *arr = NULL;
    fib(&arr, n);

    for (int i = 0; i < n; i++) {
        printf("%d%s", arr[i], (i == n - 1) ? "\\n" : " ");
    }

    free(arr);
    return EXIT_SUCCESS;
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
    temperature: 0.1,
    max_tokens: 2048,
  };
};


export const replyExpertAskQuestion = (
  prevResponses: string[] | undefined,
  newQuestion: string
) => {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: "system",
      content:
        "Focus on implementing expert-level C/C++ programming code. For each [question] below, provide: (1) a high-level [answer] with deeper insights on algorithmic complexity, memory management, edge cases, and best practices; (2) robust, idiomatic [code] implementation.",
    },
    {
      role: "user",
      content: `[question]: a linked list using structs:`,
    },
    {
      role: "assistant",
      content: `[answer]: A linked list is a dynamic data structure consisting of nodes, where each node contains a data element and a pointer to the next node. For an expert-level implementation:
- **Structure Definition**: Use a struct with \`data\` and \`next\` pointer.
- **Head Management**: Maintain a head pointer (possibly \`NULL\` when empty).
- **Insertion**: Dynamically allocate new nodes using \`malloc\`, checking for allocation failures.
- **Traversal**: Iterate via next pointers until the end node (\`NULL\`).
- **Complexity**: Appending naively is O(n), but can be optimized to O(1) with a tail pointer.
- **Memory Safety**: Always ensure \`free()\` is called on nodes when no longer needed.
This example demonstrates a simple insertion at the end of a singly linked list.

[code]:
[code-title]: define the structure
struct Node {
    int data;
    struct Node *next;
};

[code-title]: create head pointer
struct Node *head = NULL;

[code-title]: create and insert a new node at the end
void insert_end(int value) {
    struct Node *new_node = malloc(sizeof(struct Node));
    if (!new_node) {
        perror("Memory allocation failed");
        exit(EXIT_FAILURE);
    }
    new_node->data = value;
    new_node->next = NULL;

    if (head == NULL) {
        head = new_node;
        return;
    }

    struct Node *current = head;
    while (current->next != NULL) {
        current = current->next;
    }
    current->next = new_node;
}
[end-code]
[STOP-end-question-answer-STOP]`,
    },
    {
      role: "user",
      content: `[follow-up-question]: write a function that would get a list of integers (as a pointer) and returns a linked list of the same integers.`,
    },
    {
      role: "assistant",
      content: `[answer]: To construct a linked list from an array:
- Accept both a pointer to the array and its size.
- Initialize \`head\` and maintain a \`tail\` pointer for efficient O(1) insertion (avoiding repeated traversal).
- For each integer, allocate a node, validate memory allocation, assign data, and link it.
- Return the head of the constructed list.
- **Complexity**: O(n) time, O(n) space.
- **Safety**: Return NULL if size ≤ 0 or array is NULL. Always validate malloc.

[code]:
[code-title]: build linked list from array
struct Node* listify(const int *arr, int n) {
    if (!arr || n <= 0) return NULL;

    struct Node *head = NULL, *tail = NULL;

    for (int i = 0; i < n; i++) {
        struct Node *new_node = malloc(sizeof(struct Node));
        if (!new_node) {
            perror("Memory allocation failed");
            exit(EXIT_FAILURE);
        }
        new_node->data = arr[i];
        new_node->next = NULL;

        if (!head) {
            head = tail = new_node;
        } else {
            tail->next = new_node;
            tail = new_node;
        }
    }
    return head;
}

[code-title]: demonstrate usage in main
int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int n = sizeof(arr)/sizeof(arr[0]);

    struct Node *head = listify(arr, n);

    for (struct Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d ", cur->data);
    }
    printf("\\n");

    // free memory
    struct Node *cur = head;
    while (cur) {
        struct Node *tmp = cur;
        cur = cur->next;
        free(tmp);
    }

    return 0;
}
[end-code]
[STOP-end-question-answer-STOP]`,
    },
  ];

  if (prevResponses !== undefined && prevResponses.length !== 0) {
    // Process responses in reverse order to maintain the latest code logic
    const processedMessages = [];

    // Process responses backwards (like the original)
    for (let i = prevResponses.length - 1; i >= 0; i--) {
      if (prevResponses[i]) {
        const response = prevResponses[i];
        const lines = response.split('\n');

        // Check if this is the first question or a follow-up
        const startWithQuestion = lines.filter((line) =>
          line.startsWith("[question]:")
        );

        if (startWithQuestion.length > 0) {
          // This is the first question
          const question = startWithQuestion[0].replace("[question]: ", "");

          // Get the complete response content (everything after the first line)
          const completeResponse = lines.slice(1).join('\n');

          processedMessages.unshift(
            {
              role: "user" as const,
              content: `[question]: ${question}`,
            },
            {
              role: "assistant" as const,
              content: completeResponse, // Use complete response
            }
          );
        } else {
          // This is a follow-up question
          const questionLine = lines.find(line =>
            line.startsWith('[follow-up-question]:')
          );

          if (questionLine) {
            const question = questionLine.replace('[follow-up-question]: ', '');

            // Get everything after the question line as the complete response
            const questionIndex = lines.indexOf(questionLine);
            const completeResponse = lines.slice(questionIndex + 1).join('\n');

            processedMessages.unshift(
              {
                role: "user" as const,
                content: `[follow-up-question]: ${question}`,
              },
              {
                role: "assistant" as const,
                content: completeResponse, // Use complete response
              }
            );
          }
        }
      }
    }

    // Add processed messages to the main messages array
    messages.push(...processedMessages);
  }

  messages.push({
    role: "user",
    content: `[follow-up-question]: ${newQuestion}`,
  });

  return {
    messages,
    stop: ["[STOP-end-question-answer-STOP]"],
    temperature: 0.1,
    max_tokens: 2048,
  };
};