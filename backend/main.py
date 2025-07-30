import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

# --- Local Imports ---
from database import get_session
from models import (
    User, UserCreate, UserLogin,
    CoverLetterRequest, BioRequest
)
from security import get_password_hash, verify_password, create_access_token
from groq import Groq # Assuming Groq is still needed

# --- App Initialization ---
app = FastAPI(title="AI Job Tools API")
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY")) # Or however you initialize it

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

# ==========================================================
# --- Authentication Endpoints ---
# ==========================================================

@app.post("/api/signup", tags=["Authentication"])
def signup(user_create: UserCreate, session: Session = Depends(get_session)):
    # Check if user already exists
    statement = select(User).where(User.email == user_create.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password and create the user
    hashed_password = get_password_hash(user_create.password)
    new_user = User(email=user_create.email, hashed_password=hashed_password)

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message": "User created successfully", "user_id": new_user.id}

@app.post("/api/login", tags=["Authentication"])
def login(form_data: UserLogin, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == form_data.email)
    user = session.exec(statement).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create and return access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# ==========================================================
# --- AI Generation Endpoints (Unprotected for now) ---
# ==========================================================
# NOTE: We will add protection to these in the next step.

# ... (Your existing create_prompt and create_bio_prompt helper functions go here) ...
def create_prompt(job_description: str, user_info: str) -> str:
    # (Same code as before)
    return f"Prompt for cover letter..."

def create_bio_prompt(user_info: str, tone: str) -> str:
    # (Same code as before)
    return f"Prompt for bio..."


@app.post("/api/generate", tags=["AI Generation"])
def generate_cover_letter(request: CoverLetterRequest):
    # ... (Same code as before)
    return {"cover_letter": "..."}

@app.post("/api/generate-bio", tags=["AI Generation"])
def generate_bio(request: BioRequest):
    # ... (Same code as before)
    return {"bio": "..."}