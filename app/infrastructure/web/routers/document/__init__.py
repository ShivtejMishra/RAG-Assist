import os
import uuid
import structlog
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, BackgroundTasks
from app.domain.models import User, Document, DocumentStatus
from app.infrastructure.web.schemas import DocumentResponse
from app.infrastructure.web.auth_deps import require_editor, require_viewer
from app.infrastructure.config.settings import settings
from app.infrastructure.di import get_document_repo, get_ingest_use_case, vector_store
from app.adapters.database.mongo_repository import MongoDocumentRepository
from app.use_cases.document.ingest_use_case import IngestUseCase

logger = structlog.get_logger()
router = APIRouter(prefix="/documents", tags=["Documents"])

# Fallback background runner in case Celery is not active/available
def local_background_ingest(document_id: str, file_path: str):
    import asyncio
    try:
        if not os.path.exists(file_path):
            return
        with open(file_path, "rb") as f:
            content = f.read()
        
        ingest_service = get_ingest_use_case()
        # Since this runs in a separate thread/task context, we run it in a new loop if needed
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        loop.run_until_complete(
            ingest_service.ingest_document(document_id, content)
        )
        
        # Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        logger.error("local_background_ingest_failed", error=str(e), document_id=document_id)

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(require_editor),
    doc_repo: MongoDocumentRepository = Depends(get_document_repo)
):
    # 1. Validate extension
    filename = file.filename
    ext = filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "doc", "txt", "md", "csv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Supported: PDF, DOCX, TXT, CSV, MD."
        )

    # 2. Save file contents to local temp uploads folder
    file_id = str(uuid.uuid4())
    temp_filename = f"{file_id}_{filename}"
    temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
    
    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
    except Exception as e:
        logger.error("file_save_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file."
        )

    # 3. Create Document entry in MongoDB (as processing)
    doc_entity = Document(
        tenant_id=current_user.tenant_id,
        filename=filename,
        file_size=len(content),
        status=DocumentStatus.UPLOADED,
        storage_path=temp_path,
        uploaded_by=current_user.id
    )
    await doc_repo.save(doc_entity)

    # 4. Dispatch tasks. We use Celery if configured, otherwise fallback to local BackgroundTasks.
    dispatched_celery = False
    if settings.USE_CELERY:
        try:
            # Import task inside route to prevent circular import issues
            from app.infrastructure.tasks.worker import ingest_file_task
            ingest_file_task.delay(doc_entity.id, temp_path)
            dispatched_celery = True
            logger.info("dispatched_ingestion_to_celery", document_id=doc_entity.id)
        except Exception as cel_err:
            logger.warning("celery_dispatch_failed_falling_back_to_local", error=str(cel_err))
            
    if not dispatched_celery:
        # Fallback to FastAPI's built-in background tasks (runs locally on the same API container thread-pool)
        background_tasks.add_task(local_background_ingest, doc_entity.id, temp_path)

    # Return document details
    return {
        "id": doc_entity.id,
        "tenant_id": doc_entity.tenant_id,
        "filename": doc_entity.filename,
        "file_size": doc_entity.file_size,
        "status": DocumentStatus.PROCESSING,
        "chunk_count": 0,
        "created_at": doc_entity.created_at
    }

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(require_viewer),
    doc_repo: MongoDocumentRepository = Depends(get_document_repo)
):
    docs = await doc_repo.list_by_tenant(current_user.tenant_id)
    return [
        {
            "id": d.id,
            "tenant_id": d.tenant_id,
            "filename": d.filename,
            "file_size": d.file_size,
            "status": d.status,
            "chunk_count": d.chunk_count,
            "created_at": d.created_at
        } for d in docs
    ]

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_document(
    id: str,
    current_user: User = Depends(require_editor),
    doc_repo: MongoDocumentRepository = Depends(get_document_repo)
):
    doc = await doc_repo.get_by_id(id)
    if not doc or doc.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )

    # 1. Delete vectors from Qdrant Vector store
    try:
        await vector_store.delete_document_vectors(
            collection_name="enterprise_knowledge_base",
            tenant_id=current_user.tenant_id,
            document_id=doc.id
        )
    except Exception as e:
        logger.error("qdrant_vector_deletion_failed", error=str(e), document_id=doc.id)

    # 2. Delete file references from MongoDB metadata
    deleted = await doc_repo.delete(id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document from database."
        )

    return {"message": "Document and its corresponding vector chunks deleted successfully."}
