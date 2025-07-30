# Project Context: AI Cover Letter Ethiopia

This document provides essential context for any developer agent picking up work on the "AI Cover Letter Ethiopia" project. It outlines the project's structure, the purpose of key files, and a detailed rationale behind recent modifications.

## 1. Project Overview

The "AI Cover Letter Ethiopia" is a full-stack web application designed to assist users in the Ethiopian job market. It leverages AI to generate tailored cover letters and LinkedIn bios. The application features user authentication, content generation, and a dashboard for managing saved content, including PDF download functionality.

**Technology Stack:**
- **Backend:** FastAPI (Python)
- **Database:** SQLModel (ORM) with PostgreSQL
- **AI Integration:** Groq API
- **Frontend:** Next.js (React)
- **Styling:** TailwindCSS

## 2. Project Structure and Key Files

The project follows a monorepo structure with two main directories: `backend/` and `frontend/`.

### 2.1. Backend (`backend/`)

-   `main.py`:
    -   **Purpose:** The core FastAPI application. It defines all API endpoints for user authentication (signup, login), AI content generation (cover letters, bios), CRUD operations for generated content, and the PDF download feature.
    -   **Context:** This file orchestrates the interaction between the database, AI service, and the frontend.
-   `models.py`:
    -   **Purpose:** Defines the database schema using SQLModel (`User`, `GeneratedContent`) and Pydantic models for API request and response validation (e.g., `UserCreate`, `CoverLetterRequest`, `GeneratedContentResponse`).
    -   **Context:** Ensures data consistency and proper serialization/deserialization for API communication and database interactions.
-   `database.py`:
    -   **Purpose:** Handles the database engine creation and provides a `get_session` dependency for managing database sessions.
    -   **Context:** Centralizes database connection logic, making it reusable across endpoints.
-   `security.py`:
    -   **Purpose:** Implements user authentication logic, including password hashing (bcrypt), JWT token creation, and token verification for protected routes.
    -   **Context:** Secures API endpoints, ensuring only authenticated and authorized users can access sensitive functionalities.
-   `requirements.txt`:
    -   **Purpose:** Lists all Python dependencies required for the backend.
    -   **Context:** Essential for setting up the development and production environments. `fpdf2` was recently added for PDF generation.

### 2.2. Frontend (`frontend/`)

-   `app/page.js`:
    -   **Purpose:** The main landing page for the application. It serves as the primary interface for AI content generation (cover letters and bios) when a user is logged in. If not logged in, it displays the `LandingPage` component.
    -   **Context:** Manages the state for content generation forms and displays generated results.
-   `app/dashboard/page.js`:
    -   **Purpose:** The user's personal dashboard. It allows authenticated users to view, search, sort, edit, and delete their previously generated content. It also includes the "Download PDF" functionality for saved items.
    -   **Context:** Provides content management capabilities and interacts with the backend's CRUD and PDF download endpoints.
-   `app/login/page.js` & `app/signup/page.js`:
    -   **Purpose:** User authentication interfaces for logging in and creating new accounts.
    -   **Context:** Handles form submissions and interacts with the backend's authentication endpoints.
-   `components/Navbar.js`:
    -   **Purpose:** The navigation bar component, providing links to different parts of the application and handling logout functionality.
    -   **Context:** Provides consistent navigation and user session management across the application.
-   `components/LandingPage.js`:
    -   **Purpose:** The public-facing landing page displayed to unauthenticated users.
    -   **Context:** Introduces the application's features and prompts users to sign up or log in.
-   `context/AuthContext.js`:
    -   **Purpose:** A React Context provider for managing user authentication state (token, login status) across the frontend application.
    -   **Context:** Centralizes authentication logic, making user session data easily accessible to any component.
-   `package.json`:
    -   **Purpose:** Lists all Node.js/JavaScript dependencies and defines scripts for the frontend.
    -   **Context:** Essential for managing frontend development and build processes.

## 3. Recent Modifications and Rationale

The following significant changes have been implemented:

### 3.1. Server-Side PDF Download Feature

-   **Backend (`backend/main.py`):**
    -   **Addition of `fpdf2`:** The `fpdf2` library was added to `requirements.txt` to enable server-side PDF generation.
    -   **New Endpoint (`GET /api/content/{content_id}/download-pdf`):** This endpoint was created to allow users to download their saved content as a PDF.
        -   **Why:** To provide users with a portable and printable version of their generated cover letters and bios.
        -   **Authentication:** The endpoint is protected, ensuring only the content owner can download their specific content.
    -   **PDF Generation Logic:**
        -   Initial attempts to use a custom Unicode font (`DejaVuSans.ttf`) led to `TTLibError` due to issues with the font file itself.
        -   **Current State:** The PDF generation currently uses `fpdf2`'s built-in "Arial" font. Content is encoded using `latin-1` with a `replace` strategy (`.encode('latin-1', 'replace').decode('latin-1')`) to prevent `UnicodeEncodeError` for non-ASCII characters. This means some special Unicode characters might appear as `?` in the PDF.
        -   **Why:** This approach was chosen as a temporary measure to ensure the PDF generation is functional and does not crash, given the issues with external font files. A future enhancement could involve bundling a reliable Unicode font and configuring `fpdf2` to use it properly.
    -   **Error Handling:** A `try-except` block was added around the PDF generation logic to catch exceptions and return a `500 Internal Server Error` with a more informative detail message. Logging was also enhanced (`logging.info`, `logging.exception`) to provide better visibility into backend issues.
    -   **Response Handling:** The `pdf.output(dest='S')` returns a `bytearray`. The `Response` object was updated to explicitly cast this to `bytes` (`content=bytes(pdf_output)`) to resolve an `AttributeError: 'bytearray' object has no attribute 'encode'` that occurred when Starlette attempted to encode an already binary object.
-   **Frontend (`frontend/app/dashboard/page.js`):**
    -   **"Download PDF" Button:** A new button was added to the `ContentModal` component, allowing users to trigger the PDF download.
    -   **`handleDownloadPdf` Function:** This asynchronous function was implemented to make the `GET` request to the backend's PDF endpoint.
    -   **Blob Handling:** The function correctly handles the binary `application/pdf` response by creating a `Blob` object, generating a temporary URL (`URL.createObjectURL`), and programmatically triggering a file download in the browser.
    -   **Error State:** Basic loading and error states (`isDownloading`, `downloadError`) were added to provide user feedback during the download process. Frontend error handling was improved to parse JSON error responses from the backend for more specific messages.

### 3.2. Frontend Build Fix

-   **`frontend/app/login/page.js`:**
    -   **Issue:** An ESLint error (`react/no-unescaped-entities`) was preventing the frontend build due to an unescaped apostrophe in the JSX (`Don't have an account?`).
    -   **Fix:** The apostrophe was replaced with its HTML entity `&apos;` to resolve the ESLint warning and allow the build to succeed.

## 4. Instructions for the Next Agent

**Strict Adherence to Existing Patterns:**

The next developer agent **MUST** strictly adhere to the existing architecture, coding patterns, and project structure established in this repository. This includes, but is not limited to:

-   **Backend:**
    -   Continue using FastAPI for new endpoints.
    -   Maintain SQLModel for database interactions.
    -   Follow existing authentication and security patterns.
    -   Utilize the `get_session` dependency for database access.
    -   Adhere to the existing logging conventions.
-   **Frontend:**
    -   Continue using Next.js and React for component development.
    -   Maintain TailwindCSS for styling.
    -   Utilize the `AuthContext` for managing user authentication state.
    -   Follow the existing component structure and data flow.
    -   Ensure all new UI elements are responsive and consistent with the current design.
-   **General:**
    -   Maintain the monorepo structure.
    -   Write clear, concise, and idiomatic code for both Python and JavaScript.
    -   Add new dependencies only if absolutely necessary and justify their inclusion.
    -   Prioritize security best practices in all new implementations.
    -   Ensure all changes are covered by appropriate testing (if testing framework is established) and pass linting/type-checking.

Any significant deviation from these established patterns requires explicit discussion and approval. The goal is to maintain a cohesive, maintainable, and scalable codebase.
