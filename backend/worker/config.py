import os
from dotenv import load_dotenv
from pathlib import Path

# Build an absolute path to the .env file in the parent directory
# This is more reliable than a relative path
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

API_ID = os.environ.get("TELEGRAM_API_ID")
API_HASH = os.environ.get("TELEGRAM_API_HASH")
DATABASE_URL = os.environ.get("DATABASE_URL")
TARGET_CHANNEL = 'freelance_ethio'
