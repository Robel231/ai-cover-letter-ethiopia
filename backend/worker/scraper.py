import asyncio
import logging
import datetime
from telethon.sync import TelegramClient
from sqlalchemy import create_engine, Table, MetaData, select, insert
from config import API_ID, API_HASH, DATABASE_URL, TARGET_CHANNEL

# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def fetch_and_save_jobs():
    logging.info("Starting scraper job...")
    
    engine = create_engine(DATABASE_URL)
    metadata = MetaData()
    client = None # Initialize client to None for the finally block

    try:
        # --- Database Connection ---
        jobs_table = Table('jobs', metadata, autoload_with=engine)
        logging.info("Successfully connected to database and found 'jobs' table.")

        # --- Telegram Connection ---
        # The session file will be created in the root of the 'backend' directory
        # when run by Render.
        session_name = "telegram_session"
        client = TelegramClient(session_name, API_ID, API_HASH)
        await client.connect()
        logging.info("Telegram client connected.")
        
        if not await client.is_user_authorized():
            logging.error("User is not authorized. Please log in manually first by running the script locally.")
            return

        channel = await client.get_entity(TARGET_CHANNEL)
        
        new_jobs_count = 0
        with engine.connect() as connection:
            async for message in client.iter_messages(channel, limit=100): # Increased limit
                if message.text:
                    # Check for duplicates
                    select_stmt = select(jobs_table).where(jobs_table.c.message_id == message.id)
                    result = connection.execute(select_stmt).first()

                    if result is None:
                        # Insert new job
                        insert_stmt = insert(jobs_table).values(
                            message_id=message.id,
                            channel_name=TARGET_CHANNEL,
                            message_text=message.text,
                            posted_at=message.date,
                            created_at=datetime.datetime.now(datetime.timezone.utc)
                        )
                        connection.execute(insert_stmt)
                        connection.commit()
                        new_jobs_count += 1
        
        logging.info(f"Scraping complete. Found and saved {new_jobs_count} new job(s).")

    except Exception as e:
        logging.error(f"An error occurred during the scraping process: {e}", exc_info=True)
    finally:
        if client and client.is_connected():
            await client.disconnect()
            logging.info("Telegram client disconnected.")
        logging.info("Scraper job finished.")

if __name__ == "__main__":
    asyncio.run(fetch_and_save_jobs())