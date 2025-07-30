# Gemini Project Overview

This document provides a summary of the AI Cover Letter Ethiopia project for the Gemini agent.

## Project Description

This is a full-stack application designed to help users in the Ethiopian job market generate professional cover letters and LinkedIn bios. It uses a FastAPI backend and a Next.js frontend.

## Project Structure

The project is organized into a monorepo with two main directories:

- `backend/`: A Python-based backend using the FastAPI framework.
- `frontend/`: A JavaScript-based frontend using the Next.js framework.

### Backend Details

- **Framework:** FastAPI
- **Database:** SQLModel with a PostgreSQL database.
- **Authentication:** JWT-based authentication for user signup and login.
- **Dependencies:** `fpdf2` for PDF generation.
- **Core Functionality:**
    - Generates cover letters and LinkedIn bios using the Groq API.
    - Provides CRUD endpoints for managing user-generated content.
    - Provides an endpoint to download generated content as a PDF.
- **Key Files:**
    - `main.py`: The main FastAPI application file containing API endpoints.
    - `models.py`: Defines the database models (`User`, `GeneratedContent`) and Pydantic models for API requests/responses.
    - `database.py`: Handles database connection and session management.
    - `security.py`: Manages password hashing and JWT creation/verification.
    - `requirements.txt`: Lists the Python dependencies.

### Frontend Details

- **Framework:** Next.js (React)
- **Styling:** TailwindCSS
- **Authentication:** `AuthContext` is used to manage user authentication state across the application.
- **Core Functionality:**
    - A landing page for new users.
    - User signup and login pages.
    - A main application page with two modes: "Cover Letter Generator" and "LinkedIn Bio Generator".
    - A dashboard for users to view, search, sort, edit, and delete their saved content.
    - Allows users to download their generated content as a PDF.
- **Key Files:**
    - `app/page.js`: The main page of the application.
    - `app/dashboard/page.js`: The user dashboard.
    - `app/login/page.js`: The login page.
    - `app/signup/page.js`: The signup page.
    - `context/AuthContext.js`: The authentication context provider.
    - `components/`: Contains reusable React components like the `Navbar` and `LandingPage`.
    - `package.json`: Lists the Node.js dependencies and scripts.

## How to Run the Project

### Backend

1.  Navigate to the `backend` directory.
2.  Create a virtual environment: `python -m venv venv`
3.  Activate the virtual environment: `source venv/bin/activate` (on Linux/macOS) or `venv\Scripts\activate` (on Windows).
4.  Install dependencies: `pip install -r requirements.txt`
5.  Create a `.env` file and add the following environment variables:
    ```
    DATABASE_URL="postgresql://user:password@host:port/database"
    SECRET_KEY="your_secret_key"
    ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    GROQ_API_KEY="your_groq_api_key"
    ```
6.  Run the development server: `uvicorn main:app --reload`

### Frontend

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Create a `.env.local` file and add the following environment variable:
    ```
    NEXT_PUBLIC_API_URL="https://ai-cover-letter-backend.onrender.com"
    ```
4.  Run the development server: `npm run dev`