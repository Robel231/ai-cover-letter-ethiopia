from sqlmodel import Field, SQLModel
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel

# --- Database Models (tables in the database) ---

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class GeneratedContent(SQLModel, table=True):
    __tablename__ = "generated_content"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    content_type: str  # 'cover_letter' or 'bio'
    title: str = Field(default="Untitled")
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    original_cv_text: Optional[str] = None
    original_job_description: Optional[str] = None


# --- Pydantic Models (for API requests/responses) ---
# These define the shape of data for API communication.

# --- User Auth ---
class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# --- AI Generation ---
class CoverLetterRequest(BaseModel):
    job_description: str
    user_info: str
    template: str = "Professional"

class BioRequest(BaseModel):
    user_info: str
    template: str

# --- Content CRUD ---
class GeneratedContentCreate(BaseModel):
    content_type: str
    title: str
    content: str
    original_cv_text: Optional[str] = None
    original_job_description: Optional[str] = None

class GeneratedContentResponse(BaseModel):
    id: UUID
    content_type: str
    title: str
    content: str
    created_at: datetime
    original_cv_text: Optional[str] = None
    original_job_description: Optional[str] = None

# THIS IS THE MISSING PIECE
class ContentUpdate(BaseModel):
    title: str

class CvValuationRequest(BaseModel):
    cv_text: str
    job_description: str

class Job(SQLModel, table=True):
    __tablename__ = "jobs"

    id: Optional[UUID] = Field(default=None, primary_key=True)
    message_id: int = Field(unique=True, index=True)
    channel_name: str
    message_text: str
    posted_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JobResponse(BaseModel):
    id: UUID
    message_text: str
    posted_at: datetime

class JobMatchRequest(BaseModel):
    cv_text: str

class JobMatchResponse(BaseModel):
    id: UUID
    message_text: str
    posted_at: datetime
    match_score: int
    match_summary: str

class InterviewQuestionRequest(BaseModel):
    cv_text: str
    job_description: str

class InterviewAnswerRequest(BaseModel):
    question: str
    answer: str
