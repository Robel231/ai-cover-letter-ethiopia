from sqlmodel import Field, SQLModel
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel

# --- Database Models (interact with the DB) ---

class User(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GeneratedContent(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    content_type: str # 'cover_letter' or 'bio'
    title: str = Field(default="Untitled")
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# --- Pydantic Models (for API requests/responses) ---
# These are what the user sends to our API

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class CoverLetterRequest(BaseModel):
    job_description: str
    user_info: str

class BioRequest(BaseModel):
    user_info: str
    tone: str