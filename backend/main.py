import os
from dotenv import load_dotenv
from groq import Groq
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import CoverLetterRequest # Import our new model

# Load environment variables from .env file
load_dotenv()

# --- Initialize Clients ---
app = FastAPI()
try:
    groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    groq_client = None

# --- CORS Middleware ---
origins = ["http://localhost:3000",
           "https://ai-cover-letter-ethiopia-b88o0sirb-robels-projects-8aff9d51.vercel.app",
           ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Function for Prompt ---
def create_prompt(job_description: str, user_info: str) -> str:
    """Creates a detailed, high-quality prompt for the AI."""
    return f"""
    **Objective:** Write a professional and compelling cover letter tailored for a specific job in Ethiopia.

    **Instructions:**
    1.  **Analyze the Job Description:** Identify the key requirements, skills, and responsibilities mentioned.
    2.  **Analyze the User's Information:** Understand the user's skills, experience, and qualifications.
    3.  **Create a Strong Connection:** Write a cover letter that directly links the user's qualifications to the job's requirements. Use specific examples where possible.
    4.  **Maintain a Professional Tone:** The language should be formal, confident, and suitable for the Ethiopian job market. Avoid casual language or overly complex jargon.
    5.  **Structure:** The letter should have a clear introduction (stating the position being applied for), a body (highlighting the match), and a conclusion (expressing enthusiasm and a call to action).
    6.  **Do NOT make up skills or experiences.** Only use the information provided in the "User's Information" section.

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
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running!"}


@app.post("/api/generate")
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
            model="llama3-8b-8192", # Fast and capable model
            temperature=0.7, # A bit of creativity
            max_tokens=1024,
        )

        generated_letter = chat_completion.choices[0].message.content
        return {"cover_letter": generated_letter}

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate cover letter.")