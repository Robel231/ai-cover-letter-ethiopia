# Project Context for the Next Gemini Agent

**ATTENTION, NEXT AGENT:** Your primary directive is to strictly adhere to the existing architecture, patterns, and coding style of this project. Before making any modifications, thoroughly analyze the existing code in both the `frontend` and `backend` to ensure your changes are consistent and idiomatic. Do not introduce new frameworks or major architectural changes without explicit user instruction.

---

## 1. Project Overview

This is a full-stack application designed to help users in the Ethiopian job market generate professional cover letters and LinkedIn bios. It features a FastAPI backend that communicates with the Groq AI service and a Next.js frontend for the user interface.

Key user-facing features you should be aware of:
- AI-powered content generation (Cover Letters & LinkedIn Bios).
- User authentication (Signup/Login) and content saving.
- A "Template Engine" to select the writing style (e.g., Professional, Formal, Creative).
- "Voice-to-Text" input for dictating content into text fields.
- PDF download of generated content.

## 2. File Architecture and Purpose

The project is a monorepo with two distinct parts:

### Backend (`/backend`)

- **`main.py`**: This is the heart of the backend. It contains all the FastAPI API endpoints. The most recent changes involved updating the `/api/generate` and `/api/generate-bio` endpoints to accept a `template` parameter, which dynamically alters the prompt sent to the Groq AI.

- **`models.py`**: Defines all data structures. The Pydantic models (`CoverLetterRequest`, `BioRequest`) are critical as they define the expected shape of API request bodies. I recently modified these to use a consistent `template` field instead of `tone` to standardize the API.

- **`security.py` & `database.py`**: These files handle authentication logic (JWT) and database session management, respectively. They are stable and should not require frequent changes.

### Frontend (`/frontend`)

- **`app/page.js`**: This is the most important file on the frontend. It's a single, comprehensive client component that manages the state for the entire main application page. 
    - **Why it was structured this way:** It controls the two main modes ("Cover Letter" and "Bio"), handles all user input fields, manages the generated output, and contains the API submission logic. While large, it centralizes the core application logic.
    - **Your Task:** When modifying this file, pay close attention to the existing state variables and how they are passed down to the form components (`CoverLetterForm`, `BioForm`). The `makeAuthenticatedRequest` function is the standardized way to call the backend.

- **`hooks/useSpeechRecognition.js`**: This is a new custom hook I created to implement the "Voice-to-Text" feature.
    - **Why it was created:** To encapsulate the complex logic of using the browser's Speech Recognition API and keep the main `page.js` component cleaner. It manages listening state, transcripts, and browser support checks.
    - **Your Task:** If you need to modify voice input behavior, start here. This hook is designed to be reusable.

- **`context/AuthContext.js`**: A standard React context for managing the user's authentication status and JWT token globally.

## 3. Rationale for Recent Changes

- **Template Engine**: I implemented this to give users more control over the generated content's tone. The key was to standardize the API by using a single `template` field across all models and endpoints for consistency.

- **Voice-to-Text Input**: This feature was added to improve accessibility and user experience. I chose to create a custom `useSpeechRecognition` hook to follow React best practices, promoting reusability and separation of concerns. The microphone buttons were added directly into the form components in `page.js`, and a new state `activeTextArea` was introduced to direct the transcribed text to the correct input field.

## 4. STRICT COMMAND FOR THE NEXT AGENT

**Adhere to the established patterns.** Before writing any code, you must first read and understand the relevant files (`main.py`, `app/page.js`, etc.).

- **For Backend Changes:** Use Pydantic models for data validation and keep endpoint logic within `main.py`.
- **For Frontend Changes:** Utilize the existing React hooks (`useState`, `useEffect`) and custom hooks (`useSpeechRecognition`). Maintain the centralized state management within `app/page.js`. Do not introduce new state management libraries (like Redux) or CSS frameworks (like Material-UI). Style changes should use the existing TailwindCSS utility classes.
- **Consistency is Key:** Ensure any new code you add matches the style, structure, and conventions of the surrounding code.