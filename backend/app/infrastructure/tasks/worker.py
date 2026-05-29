import os
import asyncio
import structlog
from celery import Celery
from app.infrastructure.config.settings import settings
from app.infrastructure.di import get_ingest_use_case

logger = structlog.get_logger()

# Initialize Celery Application
celery_app = Celery(
    "rag_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Optional config overrides
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="tasks.ingest_file")
def ingest_file_task(document_id: str, file_path: str):
    """Celery worker task to parse, chunk, embed, and store document data."""
    logger.info("celery_task_started", document_id=document_id, file_path=file_path)
    
    # We must run the async ingest use case in a sync event loop since Celery is sync
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    async def run_ingestion():
        try:
            # Read file content from disk
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Uploaded file not found at: {file_path}")
                
            with open(file_path, "rb") as f:
                content = f.read()

            ingest_service = get_ingest_use_case()
            await ingest_service.ingest_document(
                document_id=document_id,
                file_content=content
            )
            
            # Clean up the temp file after processing is complete
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info("cleaned_up_temp_file", file_path=file_path)
                
        except Exception as err:
            logger.error("celery_task_failed", document_id=document_id, error=str(err))
            raise

    loop.run_until_complete(run_ingestion())
