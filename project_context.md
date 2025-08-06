# Project Context: AI Job Tools

## 1. Project Goal
To create a comprehensive, AI-powered web application for Ethiopian job seekers. The platform automates and enhances the job application process through a suite of intelligent tools.

## 2. Core Features (Implemented)
- **Authentication:** Full user signup, login, and session management.
- **AI Cover Letter Generator:** Creates tailored cover letters from a job description and user info.
- **AI LinkedIn Bio Generator:** Crafts professional profile summaries.
- **AI Resume Parser:** Extracts and summarizes key information from uploaded PDF resumes to autofill forms.
- **AI CV Valuator:** Analyzes a user's CV against a job description, providing a match score, keyword analysis, and actionable feedback.
- **Personal Dashboard:** A secure area for users to view, edit, and delete their saved content.
- **Polished UI/UX:** Features include a bilingual interface, voice-to-text input, and professional loading animations.

## 3. Technology Stack
- **Frontend:** Next.js (React), TailwindCSS, Framer Motion
- **Backend:** FastAPI (Python), SQLModel
- **Database:** PostgreSQL (managed by Supabase)
- **AI Service:** Groq
- **Deployment:** Vercel (Frontend), Render (Backend)

## 4. Current Development Status
- The main web application is feature-complete and deployed.
- Currently implementing a new backend worker to scrape job listings from a public Telegram channel (`freelance_ethio`).
- **Next Step:** Resolve the initial connection and login issue with the Telethon library in the `worker/scraper.py` script.