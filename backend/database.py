import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in environment variables")

engine = create_engine(DATABASE_URL, echo=False) # Set echo to False for cleaner logs

# This is the new part that will be used in our routes
def get_session():
    with Session(engine) as session:
        yield session