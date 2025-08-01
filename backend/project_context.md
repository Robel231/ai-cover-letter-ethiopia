# AI Cover Letter Ethiopia - Project Context for Developer Agents

## 1. Project Overview

This is a full-stack application designed to help users in the Ethiopian job market generate professional cover letters and LinkedIn bios. It consists of a FastAPI backend that handles business logic and AI integration, and a Next.js frontend that provides the user interface.

## 2. Project Structure

The project is a monorepo with two primary directories:

-   `backend/`: Contains the Python FastAPI application.
-   `frontend/`: Contains the JavaScript Next.js application.

This context document is located in the `backend` directory.

### Backend (`backend/`)

-   **Framework:** FastAPI
-   **Database:** SQLModel with PostgreSQL.
-   **Authentication:** JWT-based authentication.
-   **Key Files & Purpose:**
    -   `main.py`: This is the main application file. It defines all API endpoints, handles request validation, and orchestrates calls to other modules. It is the central entry point for all API logic.
    -   `models.py`: Contains all data models for the application, including SQLModel tables for the database (e.g., `User`, `GeneratedContent`) and Pydantic models for API request and response validation.
    -   `database.py`: Manages the database connection pool and session creation. It provides the `get_session` dependency used across the application to interact with the database.
    -   `security.py`: Handles all security-related functions, including password hashing and verification, and the creation and validation of JWT access tokens.

### Frontend (`frontend/`)

-   **Framework:** Next.js (React)
-   **Styling:** TailwindCSS
-   **Key Files & Purpose:**
    -   `app/`: Contains the main pages of the application (e.g., `page.js` for the landing page, `dashboard/page.js` for the user dashboard).
    -   `context/AuthContext.js`: A React Context that manages and provides global access to the user's authentication state (e.g., JWT token, user information).
    -   `package.json`: Defines all Node.js dependencies and project scripts (`npm run dev`, `npm run build`).

## 3. Recent Development Activity

The last action taken was to debug a critical issue in the AI prompt generation logic.

-   **File Modified:** `backend/main.py`
-   **Function:** `create_prompt`
-   **Problem:** The AI was receiving an empty or incomplete prompt because the prompt string was not a properly formatted f-string in Python. The `{job_description}` and `{user_info}` placeholders were not being replaced with the actual data sent from the frontend.
-   **Solution:** The string was converted to an f-string by adding the `f` prefix. Additionally, temporary debugging `print` statements were added to the function to log the incoming data and verify that the function receives the correct inputs.

## 4. MANDATE FOR THE NEXT AGENT

**Your primary directive is to strictly adhere to the existing architecture, patterns, and conventions of this project.**

Before implementing any new features or fixes, you **MUST** first analyze the relevant files and the overall project structure to understand the established patterns.

-   **Backend:** Follow the FastAPI dependency injection system, use SQLModel for database interactions, and maintain the separation of concerns seen in `main.py`, `models.py`, `database.py`, and `security.py`.
-   **Frontend:** Use the existing `AuthContext` for authentication, follow the component structure, and use TailwindCSS for styling.
-   **General:** Do not introduce new libraries or frameworks without first verifying if a similar functionality already exists or if the new dependency is consistent with the project's established technology stack.

Your goal is to make seamless, idiomatic changes that align with the current codebase.
