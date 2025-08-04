# Gemini Project Overview

This document provides a summary of the AI Cover Letter Ethiopia project for the Gemini agent.

## Project Description

This is a full-stack application designed to help users in the Ethiopian job market generate professional cover letters and LinkedIn bios. It uses a FastAPI backend and a Next.js frontend. The latest feature is a "CV Valuator" that analyzes a user's CV against a job description.

## Project Structure

The project is organized into a monorepo with two main directories:

- `backend/`: A Python-based backend using the FastAPI framework.
- `frontend/`: A JavaScript-based frontend using the Next.js framework.

For a detailed technical handover, including architectural patterns and implementation rationale, please see [project_context.md](project_context.md).

**Directive for the Next Agent:**

**You MUST strictly adhere to the existing architectural patterns, file structures, and coding styles of this project. Before implementing any new feature, you are required to analyze the existing code in `main.py`, `app/page.js`, and `models.py` to ensure your changes are consistent and idiomatic. Do not introduce new libraries or architectural patterns without explicit user instruction. Reuse existing components and services where possible.**

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
