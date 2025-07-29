# In backend/models.py

from pydantic import BaseModel

# This one is existing
class CoverLetterRequest(BaseModel):
    job_description: str
    user_info: str

# Add this new one
class BioRequest(BaseModel):
    user_info: str
    tone: str # e.g., "Professional", "Casual", "Enthusiastic"