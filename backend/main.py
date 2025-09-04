import os
import logging
import asyncio
import json
from fastapi import FastAPI, HTTPException, Depends, Response, File, UploadFile, BackgroundTasks
import fitz  # PyMuPDF
from fpdf import FPDF
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from database import get_session
from models import (
    User, UserCreate, UserLogin, UserResponse,
    CoverLetterRequest, BioRequest, ContentUpdate, CvValuationRequest, InterviewQuestionRequest, InterviewAnswerRequest,
    GeneratedContent, GeneratedContentCreate, GeneratedContentResponse,
    Job, JobResponse, JobMatchRequest, JobMatchResponse
)
from security import (
    get_password_hash, verify_password, create_access_token, get_current_user_email
)
from groq import AsyncGroq
from email_service import send_welcome_email

# Configure logging
logging.basicConfig(level=logging.INFO)

# --- App Initialization ---
app = FastAPI(
    title="AI Job Tools API",
    description="API for AI Cover Letter and Bio Generation with User Authentication."
)

@app.get("/", tags=["Health Check"])
def read_root():
    return {"status": "ok", "message": "Welcome to the AI Job Tools API!"}

# Initialize Groq Client
groq_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

def get_active_model():
    """
    Fetches the list of available models from Groq and returns the best available one
    based on a predefined priority list.
    """
    try:
        # This is a priority list, from most desired to least desired.
        PREFERRED_MODELS = [
            "llama-3.1-70b-versatile", # The newest, if available
            "llama3-70b-8192",         # The standard large Llama3
            "mixtral-8x7b-32768",      # The stable Mixtral
            "gemma-7b-it"              # A smaller, reliable fallback
        ]

        available_models = groq_client.models.list().data
        available_model_ids = {model.id for model in available_models} # Use a set for fast lookups

        for model in PREFERRED_MODELS:
            if model in available_model_ids:
                print(f"Found active model: {model}")
                return model
        
        # If no preferred models are found, raise an error.
        raise RuntimeError("No suitable active models found on Groq.")
    except Exception as e:
        print(f"Could not fetch or determine active model: {e}")
        # Fallback to a historically stable model as a last resort
        return "gemma-7b-it"

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

# --- Credit Management Helper ---
def check_and_deduct_credit(user_email: str, session: Session):
    """
    Checks if a user has enough credits and deducts one if they do.
    Raises HTTPException if the user has no credits or is not found.
    """
    user = session.exec(select(User).where(User.email == user_email)).first()
    if not user:
        # This case should ideally not be hit if the user is authenticated
        raise HTTPException(status_code=404, detail="User not found")

    if user.credits <= 0:
        raise HTTPException(status_code=403, detail="You have run out of credits. Please upgrade to continue.")

    user.credits -= 1
    session.add(user)
    session.commit()
    session.refresh(user)

# --- AI Prompt Helpers ---
def create_prompt(job_description: str, user_info: str, template: str) -> str:
    """Creates a detailed, high-quality prompt for the AI."""
    # --- DEBUGGING PRINTS ---
    print("--- Creating Prompt ---")
    print(f"Received Job Description (first 50 chars): {job_description[:50]}")
    print(f"Received User Info (first 50 chars): {user_info[:50]}")
    print("-----------------------")
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
def signup(user_create: UserCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user_create.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_create.password)
    new_user = User(email=user_create.email, hashed_password=hashed_password, credits=20)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Send welcome email in the background
    # background_tasks.add_task(send_welcome_email, to_email=new_user.email)

    return {"message": "User created successfully", "user_id": new_user.id}

@app.post("/api/login", tags=["Authentication"])
def login(form_data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form_data.email)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================================
# --- User Profile Endpoint ---
# ==========================================================
@app.get("/api/users/me", response_model=UserResponse, tags=["Users"])
def get_user_me(current_user_email: str = Depends(get_current_user_email), session: Session = Depends(get_session)):
    """
    Fetches the profile of the currently authenticated user, including credit balance.
    """
    user = session.exec(select(User).where(User.email == current_user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ==========================================================
# --- Protected AI Generation Endpoints ---
# ==========================================================
@app.post("/api/generate", tags=["AI Generation"])
async def generate_cover_letter(request: CoverLetterRequest, session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    check_and_deduct_credit(current_user_email, session)
    prompt = create_prompt(request.job_description, request.user_info, request.template)
    active_model = get_active_model()
    chat_completion = await groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=active_model,
        temperature=0.7,
        max_tokens=1024,
    )
    return {"cover_letter": chat_completion.choices[0].message.content}

@app.post("/api/generate-bio", tags=["AI Generation"])
async def generate_bio(request: BioRequest, session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    check_and_deduct_credit(current_user_email, session)
    prompt = create_bio_prompt(request.user_info, request.template)
    active_model = get_active_model()
    chat_completion = await groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=active_model,
        temperature=0.8,
        max_tokens=512,
    )
    return {"bio": chat_completion.choices[0].message.content}

@app.post("/api/parse-resume", tags=["AI Generation"])
async def parse_resume(
    resume: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user_email: str = Depends(get_current_user_email)
):
    check_and_deduct_credit(current_user_email, session)
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

        active_model = get_active_model()
        chat_completion = await groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": raw_text}
            ],
            model=active_model,
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


@app.post("/api/valuate-cv", tags=["AI Generation"])
async def valuate_cv(request: CvValuationRequest, session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    check_and_deduct_credit(current_user_email, session)
    def create_cv_valuation_prompt(cv_text: str, job_description: str) -> str:
        return f"""
        Act as an expert technical recruiter and career coach. Analyze the following CV and Job Description.
        Your task is to provide a structured analysis in a specific JSON format.
        The final output MUST be a single, valid JSON object and nothing else.

        1.  Calculate a "match score" percentage based on how well the CV aligns with the job requirements.
        2.  Extract a list of key skills and keywords from the job description that are also present in the CV.
        3.  Extract a list of important keywords from the job description that are MISSING from the CV.
        4.  Provide a list of 2-3 actionable, high-level suggestions for improving the CV.

        The JSON object must have the following keys: "matchScore" (integer), "matchedKeywords" (array of strings), "missingKeywords" (array of strings), and "suggestions" (array of strings).

        ---
        CV TEXT:
        {cv_text}
        ---
        JOB DESCRIPTION TEXT:
        {job_description}
        ---

        JSON OUTPUT:
        """
    prompt = create_cv_valuation_prompt(request.cv_text, request.job_description)
    active_model = get_active_model()
    chat_completion = await groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=active_model,
        temperature=0.2,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )
    return chat_completion.choices[0].message.content

@app.post("/api/generate-interview-questions", tags=["AI Generation"])
async def generate_interview_questions(request: InterviewQuestionRequest, session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    check_and_deduct_credit(current_user_email, session)
    def create_question_generation_prompt(cv_text: str, job_description: str) -> str:
        return f"""
        Act as an expert hiring manager and technical interviewer for a major tech company.
        Your task is to analyze the provided CV and Job Description and generate a list of 5 to 7 highly probable and insightful interview questions.
        The final output MUST be a single, valid JSON object and nothing else.

        - Generate a mix of behavioral questions, technical questions, and project-specific questions.
        - The questions must be tailored to the specific skills mentioned in both the CV and the job description.
        - For example, if the CV mentions "API optimization" and the job requires "scalable systems", a good question would be "Describe a time you had to diagnose and improve a slow API endpoint."

        The JSON object must have a single key, "questions", which holds an array of the generated question strings.

        ---
        CV TEXT:
        {cv_text}
        ---
        JOB DESCRIPTION:
        {job_description}
        ---

        JSON OUTPUT:
        """
    prompt = create_question_generation_prompt(request.cv_text, request.job_description)
    active_model = get_active_model()
    chat_completion = await groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=active_model,
        temperature=0.4,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )
    return json.loads(chat_completion.choices[0].message.content)

@app.post("/api/analyze-interview-answer", tags=["AI Generation"])
async def analyze_interview_answer(request: InterviewAnswerRequest, session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    check_and_deduct_credit(current_user_email, session)
    def create_answer_feedback_prompt(question: str, answer: str) -> str:
        return f"""
        Act as a world-class interview coach providing feedback on a user's answer to an interview question.
        Your task is to provide a structured analysis in a specific JSON format.
        The final output MUST be a single, valid JSON object and nothing else.

        1.  Provide a "positive_feedback" point: Start with something encouraging.
        2.  Provide a "constructive_feedback" point: Offer a clear, actionable suggestion for improvement.
        3.  Provide an "example_improvement" string: Give a short example of how they could rephrase part of their answer.

        The JSON object must have these exact keys: "positive_feedback" (string), "constructive_feedback" (string), and "example_improvement" (string).

        ---
        INTERVIEW QUESTION:
        {question}
        ---
        USER'S ANSWER:
        {answer}
        ---

        JSON FEEDBACK OUTPUT:
        """
    prompt = create_answer_feedback_prompt(request.question, request.answer)
    active_model = get_active_model()
    chat_completion = await groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=active_model,
        temperature=0.3,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )
    return json.loads(chat_completion.choices[0].message.content)

# ==========================================================
# --- Job Feed Endpoint ---
# ==========================================================
@app.get("/api/jobs", response_model=List[JobResponse], tags=["Jobs"])
def get_jobs(session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    statement = select(Job).order_by(Job.posted_at.desc()).limit(50)
    jobs = session.exec(statement).all()
    return jobs


def create_job_match_prompt(cv_text: str, job_description: str) -> str:
    return f"""
    Act as an expert technical recruiter. Your task is to analyze the following CV against the Job Description and return a JSON object with your analysis.
    The final output MUST be a single, valid JSON object and nothing else.

    1.  Calculate a "match_score" from 0 to 100 based on how well the CV aligns with the job.
    2.  Write a brief, one-sentence "match_summary" explaining the reason for your score (e.g., "Strong match in Python and data analysis, but lacks cloud experience.").

    The JSON object must have these exact keys: "match_score" (integer) and "match_summary" (string).

    ---
    CV TEXT:
    {cv_text}
    ---
    JOB DESCRIPTION:
    {job_description}
    ---

    JSON OUTPUT:
    """

async def get_job_match_analysis(job: Job, cv_text: str) -> JobMatchResponse:
    prompt = create_job_match_prompt(cv_text, job.message_text)
    try:
        active_model = get_active_model()
        chat_completion = await groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=active_model,
            temperature=0.2,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )
        analysis = json.loads(chat_completion.choices[0].message.content)
        await asyncio.sleep(1.5) # Add delay to respect rate limit
        return JobMatchResponse(
            id=job.id,
            message_text=job.message_text,
            posted_at=job.posted_at,
            match_score=analysis.get("match_score", 0),
            match_summary=analysis.get("match_summary", "Could not analyze.")
        )
    except Exception as e:
        logging.error(f"Error analyzing job {job.id}: {e}")
        return JobMatchResponse(
            id=job.id,
            message_text=job.message_text,
            posted_at=job.posted_at,
            match_score=0,
            match_summary="Error during analysis."
        )

@app.post("/api/match-jobs", response_model=List[JobMatchResponse], tags=["Jobs"])
async def match_jobs(request: JobMatchRequest, session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    check_and_deduct_credit(current_user_email, session)
    statement = select(Job).order_by(Job.posted_at.desc()).limit(50)
    jobs = session.exec(statement).all()

    tasks = [get_job_match_analysis(job, request.cv_text) for job in jobs]
    matched_jobs = await asyncio.gather(*tasks)

    # Sort by match score
    sorted_jobs = sorted(matched_jobs, key=lambda j: j.match_score, reverse=True)
    
    return sorted_jobs

# ==========================================================
# --- Protected Content CRUD Endpoints ---
# ==========================================================
@app.post("/api/content", response_model=GeneratedContentResponse, tags=["Content"])
def save_content(content_data: GeneratedContentCreate, session: Session = Depends(get_session), current_user_email: str = Depends(get_current_user_email)):
    user = session.exec(select(User).where(User.email == current_user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_content = GeneratedContent.model_validate(content_data, update={
        "user_id": user.id,
        "original_cv_text": content_data.original_cv_text,
        "original_job_description": content_data.original_job_description
    })
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

@app.get("/api/content/{content_id}", response_model=GeneratedContentResponse, tags=["Content"])
def get_single_content_item(
    content_id: UUID,
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
        raise HTTPException(status_code=403, detail="Not authorized to view this content")

    return content_item

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