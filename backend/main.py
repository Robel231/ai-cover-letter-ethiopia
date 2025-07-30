import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

# --- Local Imports ---
from database import get_session
from models import (
    User, UserCreate, UserLogin,
    CoverLetterRequest, BioRequest,
    GeneratedContent, GeneratedContentCreate, GeneratedContentResponse
)
from security import (
    get_password_hash, verify_password, create_access_token, get_current_user_email
)
from groq import Groq

# --- App Initialization ---
app = FastAPI(
    title="AI Job Tools API",
    description="API for AI Cover Letter and Bio Generation with User Authentication."
)

# Initialize Groq Client
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# --- CORS Middleware ---
origins_regex = r"https://ai-cover-letter-ethiopia.*\.vercel\.app"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=origins_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI Prompt Helpers ---
def create_prompt(job_description: str, user_info: str) -> str:
    # (Your existing prompt logic here)
    return f"**Objective:** Write a cover letter...\n\n**Job Description:**\n{job_description}\n\n**User's Info:**\n{user_info}"

def create_bio_prompt(user_info: str, tone: str) -> str:
    # (Your existing bio prompt logic here)
    return f"**Objective:** Write a LinkedIn bio...\n\n**Tone:** {tone}\n\n**User's Info:**\n{user_info}"

# ==========================================================
# --- Authentication Endpoints ---
# ==========================================================
@app.post("/api/signup", tags=["Authentication"])
def signup(user_create: UserCreate, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user_create.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_create.password)
    new_user = User(email=user_create.email, hashed_password=hashed_password)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}

@app.post("/api/login", tags=["Authentication"])
def login(form_data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form_data.email)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================================
# --- Protected AI Generation Endpoints ---
# ==========================================================
@app.post("/api/generate", tags=["AI Generation"])
def generate_cover_letter(request: CoverLetterRequest, current_user_email: str = Depends(get_current_user_email)):
    prompt = create_prompt(request.job_description, request.user_info)
    chat_completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-8b-8192",
        temperature=0.7,
        max_tokens=1024,
    )
    return {"cover_letter": chat_completion.choices[0].message.content}

@app.post("/api/generate-bio", tags=["AI Generation"])
def generate_bio(request: BioRequest, current_user_email: str = Depends(get_current_user_email)):
    prompt = create_bio_prompt(request.user_info, request.tone)
    chat_completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-8b-8192",
        temperature=0.8,
        max_tokens=512,
    )
    return {"bio": chat_completion.choices[0].message.content}

# ==========================================================
# --- Protected Content CRUD Endpoints ---
# ==========================================================
@app.post("/api/content", response_model=GeneratedContentResponse, tags=["Content"])
def save_content(content_data: GeneratedContentCreate, session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    user = session.exec(select(User).where(User.email == current_user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_content = GeneratedContent.model_validate(content_data, update={"user_id": user.id})
    session.add(new_content)
    session.commit()
    session.refresh(new_content)
    return new_content

@app.get("/api/content", response_model=List[GeneratedContentResponse], tags=["Content"])
def get_user_content(session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    user = session.exec(select(User).where(User.email == current_user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    statement = select(GeneratedContent).where(GeneratedContent.user_id == user.id).order_by(GeneratedContent.created_at.desc())
    content_list = session.exec(statement).all()
    return content_list