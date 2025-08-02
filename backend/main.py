import os
import logging
from fastapi import FastAPI, HTTPException, Depends, Response, File, UploadFile
import fitz  # PyMuPDF
from fpdf import FPDF
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from uuid import UUID

# Configure logging
logging.basicConfig(level=logging.INFO)

# --- Local Imports ---
from database import get_session
from models import (
    User, UserCreate, UserLogin,
    CoverLetterRequest, BioRequest, ContentUpdate,
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
def create_prompt(job_description: str, user_info: str, template: str) -> str:
    """Creates a detailed, high-quality prompt for the AI."""
    # --- DEBUGGING PRINTS ---
    print(f"--- Creating Prompt ---")
    print(f"Received Job Description (first 50 chars): {job_description[:50]}")
    print(f"Received User Info (first 50 chars): {user_info[:50]}")
    print(f"-----------------------")
    # --- END DEBUGGING ---

    # Base prompt
    main_prompt = f"""**Objective:** Write a professional and compelling cover letter based on the provided job description and user information.

**Job Description:**
{job_description}

**User's Info:**
{user_info}
"""

    # Add template-specific instructions
    if template == "Creative":
        main_prompt += "\n\n**INSTRUCTION:** Write the letter in a creative, engaging, and slightly less formal tone. Use strong, active verbs and show personality."
    elif template == "Formal":
        main_prompt += "\n\n**INSTRUCTION:** Adopt a very formal and traditional tone suitable for corporate or academic positions."
    
    return main_prompt

def create_bio_prompt(user_info: str, template: str) -> str:
    # (Your existing bio prompt logic here)
    return f"**Objective:** Write a LinkedIn bio...\n\n**Tone:** {template}\n\n**User's Info:**\n{user_info}"

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
    prompt = create_prompt(request.job_description, request.user_info, request.template)
    chat_completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-8b-8192",
        temperature=0.7,
        max_tokens=1024,
    )
    return {"cover_letter": chat_completion.choices[0].message.content}

@app.post("/api/generate-bio", tags=["AI Generation"])
def generate_bio(request: BioRequest, current_user_email: str = Depends(get_current_user_email)):
    prompt = create_bio_prompt(request.user_info, request.template)
    chat_completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-8b-8192",
        temperature=0.8,
        max_tokens=512,
    )
    return {"bio": chat_completion.choices[0].message.content}

@app.post("/api/parse-resume", tags=["AI Generation"])
async def parse_resume(
    resume: UploadFile = File(...),
    current_user_email: str = Depends(get_current_user_email)
):
    if not resume.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    try:
        resume_bytes = await resume.read()
        pdf_document = fitz.open(stream=resume_bytes, filetype="pdf")
        
        raw_text = ""
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            raw_text += page.get_text()

        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF. The document might be empty or image-based.")

        prompt = (
            "You are an expert career assistant. The following text was extracted from a PDF resume. "
            "Please read it and create a concise, well-formatted summary of the user's key skills, work experience, and education. "
            "Use clear headings like 'Skills', 'Work Experience', and 'Education'. "
            "Extract only the information present in the text."
        )

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": raw_text}
            ],
            model="llama3-8b-8192",
            temperature=0.5,
            max_tokens=1024,
        )
        summary = chat_completion.choices[0].message.content
        return {"summary": summary}

    except Exception as e:
        logging.exception("Failed to parse resume")
        # Check for specific fitz error if it's a known issue
        if "cannot open" in str(e).lower():
             raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file.")
        raise HTTPException(status_code=500, detail=f"An error occurred while parsing the resume: {str(e)}")


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

@app.patch("/api/content/{content_id}", response_model=GeneratedContentResponse, tags=["Content"])
def update_content_title(
    content_id: UUID,
    content_update: ContentUpdate,
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user_email)
):
    user = session.exec(select(User).where(User.email == current_user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    content_item = session.get(GeneratedContent, content_id)
    if not content_item:
        raise HTTPException(status_code=404, detail="Content not found")
    if content_item.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this content")

    content_item.title = content_update.title
    session.add(content_item)
    session.commit()
    session.refresh(content_item)
    return content_item

@app.delete("/api/content/{content_id}", status_code=204, tags=["Content"])
def delete_content(
    content_id: UUID,
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user_email)
):
    user = session.exec(select(User).where(User.email == current_user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    content_item = session.get(GeneratedContent, content_id)
    if not content_item:
        return # Item already gone, so the goal is achieved.

    if content_item.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this content")

    session.delete(content_item)
    session.commit()
    return

@app.get("/api/content/{content_id}/download-pdf", tags=["Content"])
def download_pdf(
    content_id: UUID,
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user_email)
):
    logging.info(f"Attempting to download PDF for content ID: {content_id} by user: {current_user_email}")
    user = session.exec(select(User).where(User.email == current_user_email)).first()
    if not user:
        logging.warning(f"User {current_user_email} not found for content ID: {content_id}")
        raise HTTPException(status_code=404, detail="User not found")

    content_item = session.get(GeneratedContent, content_id)
    if not content_item:
        logging.warning(f"Content item {content_id} not found for user {current_user_email}")
        raise HTTPException(status_code=404, detail="Content not found")

    if content_item.user_id != user.id:
        logging.warning(f"User {current_user_email} not authorized to access content {content_id} (owner: {content_item.user_id})")
        raise HTTPException(status_code=403, detail="Not authorized to access this content")

    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        
        # Encode title to latin-1 to prevent errors on special characters, replacing unknown chars
        encoded_title = content_item.title.encode('latin-1', 'replace').decode('latin-1')
        pdf.cell(0, 10, encoded_title, ln=True, align='C')
        pdf.ln(10)

        pdf.set_font("Arial", "", 12)
        # Encode content to latin-1 to prevent errors on unicode characters
        encoded_content = content_item.content.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 5, encoded_content)

        pdf_output = pdf.output(dest='S')

        logging.info(f"Successfully generated PDF for content ID: {content_id}")
        return Response(
            content=bytes(pdf_output),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename='{content_item.title}.pdf'"}
        )
    except Exception as e:
        logging.exception(f"PDF generation failed for content ID: {content_id}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")