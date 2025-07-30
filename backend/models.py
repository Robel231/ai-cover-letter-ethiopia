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

class BioRequest(BaseModel):
    user_info: str
    tone: str

# --- Content CRUD ---
class GeneratedContentCreate(BaseModel):
    content_type: str
    title: str
    content: str

class GeneratedContentResponse(BaseModel):
    id: UUID
    content_type: str
    title: str
    content: str
    created_at: datetime

# THIS IS THE MISSING PIECE
class ContentUpdate(BaseModel):
    title: str