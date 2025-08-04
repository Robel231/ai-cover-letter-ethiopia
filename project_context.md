# Project Context for AI Cover Letter Ethiopia

This document provides a technical handover for the next developer agent. It outlines the project architecture, key files, and the rationale behind recent implementations.

## 1. Core Architecture & Patterns

The project is a full-stack monorepo application with a clear separation of concerns:

*   **Backend (`/backend`):** A Python FastAPI application responsible for all business logic, database interactions, and secure communication with the Groq AI service.
*   **Frontend (`/frontend`):** A JavaScript Next.js (React) application that serves as the user interface. It is a client-side rendered application that relies on the backend for all data and AI-powered features.

**Key Architectural Principles:**
*   **Stateless Backend:** The API is stateless, relying on JWT for authenticating user requests.
*   **Service-Oriented Endpoints:** Each backend endpoint is designed to perform a single, specific task (e.g., parse a resume, generate a cover letter, valuate a CV).
*   **Frontend Orchestration:** The frontend is responsible for orchestrating calls to multiple backend endpoints to create complex user features. The "CV Valuator" is a prime example of this pattern.
*   **Centralized State Management:** The frontend uses React Context (`AuthContext`) for global state like authentication and component-level state (`useState`) for UI and data management within the main `app/page.js` component.

## 2. Key Files & Purpose

### Backend:
*   `main.py`: The core of the backend. It contains all API endpoints, organized by function (Authentication, AI Generation, Content CRUD). All new backend features with an API endpoint should be added here.
*   `models.py`: Defines all data structures. It uses `SQLModel` for database table schemas (e.g., `User`, `GeneratedContent`) and Pydantic `BaseModel` for API request/response validation (e.g., `CvValuationRequest`).
*   `security.py`: Handles all authentication logic, including password hashing and JWT creation/verification.

### Frontend:
*   `app/page.js`: This is the main entry point for the user-facing application. It manages the application's `mode` (`coverLetter`, `bio`, `cvValuator`) and holds the state for all user inputs and API results. It's the primary file for integrating new high-level features.
*   `components/`: This directory contains reusable React components.
    *   `ValuationResult.js`: A presentational component created specifically to display the structured JSON report from the CV Valuator.
*   `context/AuthContext.js`: A global state provider that manages the user's authentication token, making it available to all components that need to make authenticated API calls.

## 3. CV Valuator: Implementation Rationale

The "CV Valuator" feature was implemented with a specific frontend orchestration pattern in mind to maintain backend simplicity and reusability.

1.  **Reusing the `/api/parse-resume` Endpoint:** Instead of creating a new backend endpoint that accepts a PDF for valuation, the decision was made to reuse the existing `/api/parse-resume` endpoint.
2.  **Frontend Logic:** The `handleCvUpload` function in `app/page.js` is triggered on file selection. It sends the PDF to `/api/parse-resume` and stores the returned text in the `extractedCvText` state variable.
3.  **Final Valuation:** The `handleValuateCvSubmit` function then takes the `extractedCvText` and the job description text and sends them to the `/api/valuate-cv` endpoint.

This approach keeps the backend APIs modular and single-purpose, while empowering the frontend to build more complex features by combining them.

---

## **Directive for the Next Agent**

**You MUST strictly adhere to the existing architectural patterns, file structures, and coding styles of this project. Before implementing any new feature, you are required to analyze the existing code in `main.py`, `app/page.js`, and `models.py` to ensure your changes are consistent and idiomatic. Do not introduce new libraries or architectural patterns without explicit user instruction. Reuse existing components and services where possible.**
