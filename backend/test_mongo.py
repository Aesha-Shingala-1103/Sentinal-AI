import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

async def main():
    uri = os.getenv("MONGO_URI")
    print("URI found:", bool(uri))

    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    try:
        result = await client.admin.command("ping")
        print("SUCCESS:", result)
    except Exception as e:
        print("FAILED:", repr(e))

asyncio.run(main())