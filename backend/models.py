from pydantic import BaseModel

class CoverLetterRequest(BaseModel):
    """Defines the structure of the request from the frontend."""
    job_description: str
    user_info: str # This will be the user's skills/resume