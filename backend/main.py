import os
from dotenv import load_dotenv
from groq import Groq
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Pydantic Model for Request Body ---
# It's better to have this in the same file if it's simple
class CoverLetterRequest(BaseModel):
    job_description: str
    user_info: str

# --- Load Environment Variables ---
load_dotenv()

# --- Initialize Clients and App ---
app = FastAPI(
    title="AI Cover Letter Generator API",
    description="An API to generate cover letters using Groq.",
    version="1.0.0"
)

try:
    groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    groq_client = None

# ==============================================================================
# --- THE FIX: Advanced CORS Middleware with Regular Expression ---
# This is the most important section for fixing the deployment issue.
# This regex will match any Vercel deployment URL for your project.
# ==============================================================================
# This pattern matches URLs like:
# - https://ai-cover-letter-ethiopia.vercel.app
# - https://ai-cover-letter-ethiopia-git-main-....vercel.app
# - https://ai-cover-letter-ethiopia-7chj60zwo-....vercel.app
origins_regex = r"https://ai-cover-letter-ethiopia.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # For local development
    allow_origin_regex=origins_regex,         # For all Vercel deployments
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --- Helper Function for AI Prompt ---
def create_prompt(job_description: str, user_info: str) -> str:
    """Creates a detailed, high-quality prompt for the AI."""
    return f"""
    **Objective:** Write a professional and compelling cover letter tailored for a specific job in Ethiopia.

    **Instructions:**
    1.  Analyze the Job Description: Identify the key requirements, skills, and responsibilities mentioned.
    2.  Analyze the User's Information: Understand the user's skills, experience, and qualifications.
    3.  Create a Strong Connection: Write a cover letter that directly links the user's qualifications to the job's requirements. Use specific examples where possible.
    4.  Maintain a Professional Tone: The language should be formal, confident, and suitable for the Ethiopian job market. Avoid casual language or overly complex jargon.
    5.  Structure: The letter should have a clear introduction (stating the position being applied for), a body (highlighting the match), and a conclusion (expressing enthusiasm and a call to action).
    6.  Do NOT make up skills or experiences. Only use the information provided in the "User's Information" section.

    ---
    **Job Description:**
    {job_description}
    ---
    **User's Information (Resume/Skills):**
    {user_info}
    ---

    **Generated Cover Letter:**
    """

# --- API Endpoints ---
@app.get("/", tags=["Health Check"])
def read_root():
    """A simple root endpoint to confirm the server is running."""
    return {"status": "ok", "message": "Backend is running!"}


@app.post("/api/generate", tags=["AI Generation"])
def generate_cover_letter(request: CoverLetterRequest):
    """Receives job/user data and returns an AI-generated cover letter."""
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq client not initialized. Check API key.")

    try:
        prompt = create_prompt(request.job_description, request.user_info)

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=1024,
        )

        generated_letter = chat_completion.choices[0].message.content
        return {"cover_letter": generated_letter}

    except Exception as e:
        print(f"An error occurred during generation: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate cover letter.")