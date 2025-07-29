# 🏛️ Project Architecture

This document provides a detailed overview of the technical architecture for the AI Cover Letter Generator.

## System Overview

The application follows a modern **client-server architecture**. This design separates the user interface (frontend) from the business logic and third-party API interactions (backend). This separation makes the application more secure, scalable, and maintainable.

### Architecture Diagram

```mermaid
graph TD
    User[👤 User] -->|Interacts with UI| Frontend[🌐 Frontend <br>Next.js / React<br>Hosted on Vercel]
    Frontend -->|Sends Job/Resume Data via HTTP POST| Backend[⚙️ Backend <br>FastAPI / Python<br>Hosted on Render]
    Backend -->|Securely calls with hidden API key| Groq[🧠 Groq API]
    Groq -->|Returns generated text| Backend
    Backend -->|Returns response to client| Frontend
    User -->|Views generated letter| Frontend

    subgraph "Future Features"
        Backend --> Database[💾 Database<br>PostgreSQL/Supabase<br>For users & saved letters]
    end
Use code with caution.
Markdown
Component Breakdown
1. Frontend (Client)
Technology: Next.js (React) with TailwindCSS.
Role:
Renders the user interface (forms, buttons, text areas).
Manages the application's visual state (e.g., loading spinners, displaying results).
Collects user input (job description, resume data).
Sends user data to our backend API for processing.
Reasoning:
Next.js: Provides excellent performance, a great developer experience, and server-side rendering capabilities which are beneficial for speed and future SEO.
TailwindCSS: A utility-first CSS framework that allows for rapid development of a clean, modern, and responsive UI without writing custom CSS.
2. Backend (Server)
Technology: FastAPI (Python).
Role:
Provides a simple REST API endpoint (e.g., /api/generate) for the frontend to call.
Receives data from the frontend.
Constructs the final prompt for the AI.
Securely manages and uses the GROQ_API_KEY to make requests to the Groq API. The key is never exposed to the client.
Relays the response from Groq back to the frontend.
Reasoning:
FastAPI: An extremely high-performance Python web framework that is easy to learn and use. Its automatic data validation (via Pydantic) and interactive API documentation (Swagger UI) are perfect for this project.
3. AI Service
Technology: Groq API.
Role: The core intelligence of the application. It receives a carefully constructed prompt and generates a human-like, tailored cover letter.
Reasoning:
Speed: Groq is known for its incredible inference speed, providing a near-instantaneous response which creates a magical user experience.
4. Hosting
Frontend Hosting: Vercel.
Reasoning: Vercel offers best-in-class integration with Next.js, providing automatic deployments, a global CDN, and a generous free tier.
Backend Hosting: Render.
Reasoning: Render is a simple, cost-effective platform for hosting web services like our FastAPI application. It has a free tier and is very developer-friendly.