# 🎯 AI Cover Letter Generator for Ethiopian Jobs

Tired of writing cover letters? This tool uses AI to write professional, tailored cover letters instantly, specifically for jobs in the Ethiopian market.

![Demo GIF Placeholder](https://placehold.co/800x400/2d3748/ffffff?text=Add+a+GIF+Demo+Here)

This project solves a real pain point for job seekers browsing sites like EthioJobs, Dereja, and The Reporter. It takes the tedious, time-consuming task of writing a cover letter and automates it, producing high-quality results in seconds.

## ✨ Core Features (MVP)

*   **Job Description Input:** Paste any job description from an Ethiopian job board.
*   **Resume/Skills Input:** Paste your CV content or fill in key details like skills and experience.
*   **AI-Powered Generation:** Uses the blazingly fast Groq API to craft a unique cover letter that matches your profile to the job's requirements.
*   **Clean & Simple UI:** A beautiful, responsive interface that's easy to use.
*   **Copy & Download:** Instantly copy the generated letter to your clipboard.
*   **Bilingual Support:** Switch between English and Amharic for the user interface and generated output.

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Groq](https://img.shields.io/badge/Groq-00C65E?style=for-the-badge&logo=c&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)

## 🏛️ Architecture

This project uses a secure client-server architecture. The React frontend communicates with a FastAPI backend, which handles the logic and secure calls to the Groq API.

For a detailed breakdown, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

*   Node.js (v18 or later)
*   Python (v3.9 or later)
*   A Groq API Key

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/ai-cover-letter-ethiopia.git
    cd ai-cover-letter-ethiopia
    ```

2.  **Setup the Backend:**
    ```sh
    cd backend
    pip install -r requirements.txt
    cp .env.example .env
    ```
    Now, add your `GROQ_API_KEY` to the `.env` file.

3.  **Setup the Frontend:**
    ```sh
    cd ../frontend
    npm install
    cp .env.local.example .env.local
    ```
    Update `.env.local` with the URL of your backend server (e.g., `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`).

### Running the Application

1.  **Start the Backend Server:**
    ```sh
    # From the /backend directory
    uvicorn main:app --reload
    ```
    The backend will be running at `http://127.0.0.1:8000`.

2.  **Start the Frontend Development Server:**
    ```sh
    # From the /frontend directory
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📈 Project Progress

You can follow the development progress and see the task backlog in [PROGRESS.md](PROGRESS.md).

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.