# Smart EduBOT - AI-Powered Learning Platform

## Overview

Smart EduBOT is an intelligent learning platform that leverages Large Language Models (LLMs) to provide personalized educational assistance to students. The platform allows users to interact with an AI assistant that can answer programming questions, provide code examples, and explain complex concepts based on the user's skill level and preferences.

## Features

### Core Functionality

- **Question Type Selection**: Users can specify their skill level (Beginner, Intermediate, Expert) to receive appropriately tailored responses.
- **Answer Style Customization**: Choose between theory-focused or code-focused responses based on learning preferences.
- **Code Editor Integration**: Submit code snippets for explanation, debugging, or improvement.
- **Contextual Conversations**: The AI maintains context across conversation turns for coherent learning experiences.
- **Feedback Collection**: Students can rate responses and provide detailed feedback on their learning experience.

### User Experience

- **Intuitive Chat Interface**: Clean, responsive design for seamless interaction with the AI assistant.
- **Session Management**: Save and revisit previous learning sessions.
- **User Authentication**: Secure login and registration with email verification.
- **Personalized Profiles**: Track learning progress and preferences.

## Technology Stack

### Frontend

- **Next.js**: React framework with App Router for server-side rendering and routing
- **TypeScript**: Type-safe JavaScript for improved developer experience
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible UI components
- **Monaco Editor**: Code editor component for handling code snippets

### Backend

- **Next.js API Routes**: Server-side API endpoints
- **MongoDB**: NoSQL database for storing user data, sessions, and feedback
- **Mongoose**: MongoDB object modeling for Node.js
- **NextAuth.js**: Authentication solution for Next.js applications

### AI Integration

- **Google Gemini API**: Powers the AI assistant's responses
- **Custom Prompt Engineering**: Tailored prompts based on question type and user preferences

## Architecture

### Data Models

- **User**: Stores user information, authentication details, and session references
- **Session**: Contains conversation history and metadata for each learning session
- **Feedback**: Captures student satisfaction, understood/not understood topics, and information gaps

### Key Components

- **LLM Service**: Handles communication with the Gemini API, including prompt construction and response parsing
- **Session Service**: Manages creation, retrieval, and updating of learning sessions
- **Authentication System**: Handles user registration, login, and account verification
- **Chat Interface**: Provides the UI for interacting with the AI assistant

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (local or cloud-based)
- Google Gemini API key

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Email configuration (for verification)
EMAIL_SERVER_USER=your_email_username
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_SERVER_HOST=your_email_host
EMAIL_SERVER_PORT=your_email_port
EMAIL_FROM=your_email_address
```

### Installation Steps

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:3000`

## Usage Guide

### Getting Started

1. **Register an Account**: Create a new account with your email and verify it
2. **Start a New Session**: Click on "New Chat" to begin a learning session
3. **Select Question Type**: Choose your skill level (Beginner, Intermediate, Expert)
4. **Choose Answer Style**: Select whether you prefer theory-focused or code-focused responses
5. **Ask a Question**: Type your programming question in the chat input

### Advanced Features

- **Code Editor**: Click the code icon to open the code editor for submitting code snippets
- **Session History**: Access previous learning sessions from the sidebar
- **Feedback**: Rate responses and provide feedback to improve your learning experience

## Contributing

Contributions to Smart EduBOT are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini for providing the AI capabilities
- Next.js team for the excellent framework
- All contributors who have helped improve this platform