import asyncio
from telethon.sync import TelegramClient
from sqlalchemy import create_engine, Table, MetaData, select, insert
from config import API_ID, API_HASH, DATABASE_URL, TARGET_CHANNEL
import datetime

async def main():
    print("Starting scraper...")
    
    # Initialize SQLAlchemy Engine
    engine = create_engine(DATABASE_URL)
    metadata = MetaData()
    
    # Reflect the existing 'jobs' table
    try:
        jobs_table = Table('jobs', metadata, autoload_with=engine)
        print("Successfully connected to database and found 'jobs' table.")
    except Exception as e:
        print(f"Error connecting to DB or finding 'jobs' table: {e}")
        return

    # Connect to Telegram
    session_name = "my_test_session" # Use the same session name to stay logged in
    async with TelegramClient(session_name, API_ID, API_HASH) as client:
        print("Telegram client connected successfully.")
        
        # Get the target channel entity
        channel = await client.get_entity(TARGET_CHANNEL)
        
        new_jobs_count = 0
        with engine.connect() as connection:
            # Fetch the last 50 messages
            async for message in client.iter_messages(channel, limit=50):
                if message.text: # Only process messages with text
                    
                    # Check if message_id already exists in our DB
                    select_stmt = select(jobs_table).where(jobs_table.c.message_id == message.id)
                    result = connection.execute(select_stmt).first()

                    if result is None:
                        # If it doesn't exist, insert it
                        insert_stmt = insert(jobs_table).values(
                            message_id=message.id,
                            channel_name=TARGET_CHANNEL,
                            message_text=message.text,
                            posted_at=message.date,
                            created_at=datetime.datetime.now(datetime.timezone.utc)
                        )
                        connection.execute(insert_stmt)
                        connection.commit() # Commit after each insert
                        new_jobs_count += 1
            
            print(f"Scraping complete. Found and saved {new_jobs_count} new job(s).")

if __name__ == "__main__":
    asyncio.run(main())