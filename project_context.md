# Project Context: AI Cover Letter Ethiopia

## Project Overview
This project is an application designed to assist users with various job-seeking tasks, leveraging AI for content generation and providing a job scraping utility. It aims to streamline the process of creating cover letters, professional bios, preparing for interviews, and matching jobs.

## Architectural Overview
The application follows a typical full-stack architecture:
- **Frontend:** A Next.js (React) application, responsible for the user interface and interaction.
- **Backend:** A FastAPI (Python) application, serving as the API layer for all business logic, AI integrations, and database interactions.
- **Database:** Supabase (PostgreSQL) is used for data persistence.
- **AI Integration:** The Groq API is utilized for large language model (LLM) interactions, specifically for generating text-based content.
- **Telegram Scraper:** A separate Python worker script handles the scraping of job listings from Telegram channels.

## Key Components and Their Purpose

### Backend (`backend/` directory)
- `main.py`: The core FastAPI application. It defines all API endpoints, handles request routing, integrates with AI services, manages user authentication, and interacts with the database.
- `models.py`: Contains SQLModel/SQLAlchemy ORM definitions for all database tables (e.g., `User`, `GeneratedContent`, `Job`). This file dictates the structure of data stored in Supabase.
- `database.py`: Manages the database connection and session lifecycle for SQLAlchemy/SQLModel.
- `security.py`: Provides utilities for user authentication, including password hashing, verification, and JSON Web Token (JWT) creation and validation.
- `email_service.py`: (Currently a placeholder) Intended for sending email notifications, such as welcome emails.
- `worker/scraper.py`: A Python script dedicated to scraping job listings from specified Telegram channels using the Telethon library and saving them into the Supabase database.
- `worker/config.py`: Stores configuration variables for the Telegram scraper, including Telegram API credentials, database connection string, and the target Telegram channel.

### Frontend (`frontend/` directory)
- `app/`: Contains the main Next.js application pages and layout structure.
- `components/`: Houses reusable React components used across the frontend.
- `context/AuthContext.js`: Manages the global authentication state for the React application, providing user context to various components.
- `hooks/useSpeechRecognition.js`: A custom React hook to integrate speech-to-text functionality for interactive features (e.g., mock interview analysis).

## Recent Changes and Rationale (by previous agent)

### Telegram Scraper (`backend/worker/scraper.py`)
- **Change:** Added standard Python `logging` and a `try...except...finally` block for robust error handling and proper Telegram client disconnection. Increased message limit to 100.
- **Rationale:** To prepare the scraper for scheduled production environments (e.g., Render Cron Jobs) by providing clearer operational feedback and ensuring resource cleanup.
- **Change:** Temporarily replaced `scraper.py` content with a minimal script to force Telegram client login and session file creation.
- **Rationale:** The "User is not authorized" error indicated a missing or invalid `.session` file. This temporary script facilitated a fresh login to generate a valid session, which is crucial for the scraper's operation.
- **Change:** Reverted `scraper.py` back to its full, robust version after the session file was created.
- **Rationale:** The temporary login script served its purpose; the full scraper functionality was restored.

### Backend API (`backend/main.py`)
- **Change:** Added a `GET /` endpoint that returns `{"status": "ok", "message": "Welcome to the AI Job Tools API!"}`.
- **Rationale:** To provide a simple health check endpoint for deployment environments (like Render) to verify that the service is running and accessible. This addresses `404 Not Found` errors for the root URL.
- **Change:** Modified the `CORSMiddleware` configuration. Initially, an attempt was made to use a regex for Vercel URLs, but it was found to be already correctly implemented. Subsequently, for debugging purposes, `allow_origins=["*"]` was temporarily set.
- **Rationale:** Persistent `400 Bad Request` (CORS) errors indicated an issue with the CORS configuration. Temporarily allowing all origins (`"*"`) helped confirm that the CORS setup was indeed the root cause.
- **Change:** Reverted the `CORSMiddleware` configuration back to the secure version using `allow_origins=["http://localhost:3000"]` and `allow_origin_regex=r"https://ai-cover-letter-ethiopia.*\.vercel\.app"`.
- **Rationale:** Once the CORS issue was diagnosed (i.e., the regex was correct, but the temporary full open was needed to confirm), the secure configuration was reinstated to maintain application security.

## Strict Adherence for Future Development

**The next developer agent *must* strictly adhere to the existing architectural patterns, coding style, and project structure.**

Before making any changes, thoroughly analyze surrounding code, existing tests, and configuration files to understand established conventions. Do not introduce new frameworks or libraries without explicit user instruction and verification of their established usage within the project. All modifications should be idiomatic to the existing codebase. Prioritize maintaining consistency and predictability within the project.
