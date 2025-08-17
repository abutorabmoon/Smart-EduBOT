# Smart EduBOT - AI-Powered Learning Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 About The Project

Smart EduBOT is an intelligent learning platform that leverages Large Language Models (LLMs) to provide personalized educational assistance to students. The platform creates an adaptive learning environment where students can interact with an AI assistant that tailors its responses based on skill level, learning preferences, and specific educational needs.

The system is designed to support the learning process by providing explanations, code examples, debugging assistance, and theoretical concepts in a conversational format that maintains context throughout the learning session. By collecting detailed feedback on student satisfaction and understanding, Smart EduBOT continuously improves its educational effectiveness.

### 🌟 Key Features

#### Core Functionality

- **Skill-Based Question Types**: Students can specify their proficiency level (Beginner, Intermediate, Expert) to receive appropriately tailored responses that match their current understanding and learning needs.

- **Customizable Answer Styles**: Users can choose between theory-focused explanations, code-focused examples, or a balanced approach based on their learning preferences and the specific concepts they're trying to master.

- **Integrated Code Editor**: Submit, edit, and receive feedback on code snippets directly within the platform. The Monaco Editor integration provides syntax highlighting, auto-completion, and other IDE-like features to enhance the coding experience.

- **Contextual Learning Conversations**: The AI maintains conversation history and context across multiple turns, allowing for progressive learning experiences where concepts build upon previous explanations.

- **Comprehensive Feedback Collection**: Students can rate responses, identify understood and misunderstood topics, and provide detailed feedback on information gaps, creating a rich dataset for educational research and platform improvement.

#### User Experience

- **Intuitive Chat Interface**: Clean, responsive design with real-time typing indicators, code highlighting, and markdown support for rich educational content delivery.

- **Session Management**: Save, name, and revisit previous learning sessions, allowing students to continue their learning journey across multiple study sessions without losing context.

- **Secure Authentication**: Multi-factor authentication with email verification ensures secure access to personalized learning experiences and historical data.

- **Personalized Learning Profiles**: Track learning progress, preferred topics, and customization settings to provide increasingly personalized educational experiences over time.

- **Responsive Design**: Fully responsive interface that works seamlessly across desktop, tablet, and mobile devices, enabling learning on any device.

## 🛠️ Technology Stack

### Frontend Architecture

- **Next.js (v13.5+)**: React framework with App Router for server-side rendering, optimized routing, and improved performance
- **TypeScript**: Strongly-typed JavaScript implementation for enhanced code quality and developer experience
- **TailwindCSS**: Utility-first CSS framework enabling rapid UI development with consistent design patterns
- **Radix UI**: Headless, accessible component primitives that ensure UI elements meet accessibility standards
- **Monaco Editor**: The code editor that powers VS Code, integrated for handling code snippets with syntax highlighting and intelligent features
- **React Markdown**: For rendering rich educational content with proper formatting

### Backend Infrastructure

- **Next.js API Routes**: Server-side API endpoints for handling authentication, chat sessions, and feedback collection
- **MongoDB**: NoSQL database for flexible schema design and efficient storage of user data, sessions, and feedback
- **Mongoose**: MongoDB object modeling for Node.js, providing schema validation and relationship management
- **NextAuth.js**: Complete authentication solution with support for email/password, OAuth, and multi-factor authentication
- **Nodemailer**: Module for sending verification emails and notifications

### AI Integration

- **Google Gemini API**: Powers the AI assistant's responses with state-of-the-art language understanding and generation capabilities
- **OpenAI Integration**: Alternative AI provider support (commented out in the codebase but available for implementation)
- **Custom Prompt Engineering**: Sophisticated prompt templates tailored for different question types, skill levels, and learning contexts
- **Response Parsing**: Intelligent parsing of AI responses to extract structured data for feedback analysis and topic identification

## 🏗️ Architecture

### Data Models

- **User Model**: Stores user authentication details, profile information, learning preferences, and references to learning sessions
  ```typescript
  interface IUser {
    email: string;
    password: string;
    name: string;
    isVerified: boolean;
    sessions: string[];
    preferences: {
      defaultQuestionType: string;
      defaultAnswerStyle: string;
    };
  }
  ```

- **Session Model**: Contains conversation history, metadata, and contextual information for each learning interaction
  ```typescript
  interface ISession {
    sessionId: string;
    title?: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
  }
  ```

- **Feedback Model**: Captures detailed student feedback including satisfaction ratings, understood/not understood topics, and information gaps
  ```typescript
  interface IFeedback {
    userId: ObjectId;
    sessionId: string;
    questionType: "Beginner" | "Intermediate" | "Expert";
    answerStyle: "Theory" | "Code" | "Neutral";
    studentPrompt: string;
    chatbotResponse: string;
    studentSatisfaction: number;
    codeContent?: string;
    codeLanguage?: string;
    last2Messages?: string[];
  }
  ```

### Key Components

- **LLM Service**: Manages communication with AI providers, dynamically selecting appropriate prompts based on question type, skill level, and conversation context

- **Session Service**: Handles the creation, retrieval, updating, and management of learning sessions, ensuring conversation continuity

- **Authentication System**: Provides secure user registration, login, email verification, and session management

- **Chat Interface**: Delivers an intuitive, responsive UI for interacting with the AI assistant, with support for text, code, and rich media content

- **Feedback Collection System**: Gathers structured feedback on learning experiences to improve AI responses and identify educational gaps

## 🚀 Setup and Installation

### Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB instance (local or cloud-based)
- Google Gemini API key (or OpenAI API key if using that integration)
- Email service for verification emails

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# AI Provider
GEMINI_API_KEY=your_gemini_api_key
# OPENAI_API_KEY=your_openai_api_key (if using OpenAI)

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Email Configuration
EMAIL_SERVER_USER=your_email_username
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_SERVER_HOST=your_email_host
EMAIL_SERVER_PORT=your_email_port
EMAIL_FROM=your_email_address
```

### Installation Steps

1. Clone the repository
   ```bash
   git clone https://github.com/abutorabmoon/Smart-EduBOT
   cd smart-edubot
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables as described above

4. Run the development server
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

6. For production deployment
   ```bash
   npm run build
   npm start
   ```

## 📋 Project Structure

```
smart-edubot/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   │   ├── (auth)/          # Authentication-related pages
│   │   ├── (chat)/          # Chat interface and session pages
│   │   ├── api/             # API endpoints
│   │   ├── components/      # App-specific components
│   │   └── utils/           # Utility functions
│   ├── codex-prompts/       # AI prompt templates for different question types
│   ├── components/          # Shared React components
│   │   ├── ui/              # UI primitives and design system
│   │   └── hooks/           # Custom React hooks
│   ├── hooks/               # Global hooks
│   ├── lib/                 # Core services and utilities
│   │   ├── llm.ts           # LLM integration service
│   │   ├── sessionService.ts # Session management
│   │   └── types/           # TypeScript type definitions
│   └── model/               # Database models and schemas
├── .env.local               # Environment variables (not in repo)
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # TailwindCSS configuration
└── tsconfig.json            # TypeScript configuration
```

## 🧠 Usage Guide

### Student Journey

1. **Registration and Authentication**:
   - Create an account with email and password
   - Verify email through the OTP sent to your inbox
   - Log in to access the learning platform

2. **Starting a Learning Session**:
   - Click "New Chat" to begin a fresh learning session
   - Select your skill level (Beginner, Intermediate, Expert)
   - Choose your preferred answer style (Theory, Code, Neutral)

3. **Asking Questions**:
   - Type your programming or concept question in the chat input
   - For code-related questions, use the code editor to submit code snippets
   - Receive tailored responses based on your selected preferences

4. **Providing Feedback**:
   - Rate the helpfulness of responses on a scale of 1-5
   - Identify specific topics you understood or didn't understand
   - Note any information gaps for future improvement

5. **Managing Sessions**:
   - Access previous learning sessions from the sidebar
   - Continue conversations where you left off
   - Name sessions for easy reference

### Advanced Features

- **Code Editor Integration**: Click the code icon to open the Monaco editor for submitting, editing, and receiving feedback on code snippets
- **Context Management**: The AI maintains conversation history to provide coherent, progressive learning experiences
- **Profile Customization**: Update your profile settings and learning preferences
- **Session Export**: Save or share your learning sessions for future reference

## 🔮 Roadmap

- **Enhanced Analytics Dashboard**: Visualize learning progress and identify knowledge gaps
- **Collaborative Learning**: Share sessions with peers or instructors for feedback
- **Custom Learning Paths**: AI-generated learning recommendations based on progress
- **Content Integration**: Connect with educational resources and documentation
- **Voice Interaction**: Support for voice input and text-to-speech output

## 🤝 Contributing

Contributions to Smart EduBOT are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

### Development Guidelines

- Follow the existing code style and architecture patterns
- Write tests for new features using the testing framework
- Document your code and update the README as needed
- Ensure accessibility standards are maintained

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Project Maintainer - [abutorabmoon@gmail.com](mailto:your-email@example.com)

Project Link: [https://github.com/abutorabmoon/Smart-EduBOT](https://github.com/abutorabmoon/Smart-EduBOT)

## 🙏 Acknowledgments

- Google Gemini for providing the AI capabilities
- Next.js team for the excellent framework
- MongoDB for the flexible database solution
- All contributors who have helped improve this platform
- Educational research community for insights on effective learning methodologies