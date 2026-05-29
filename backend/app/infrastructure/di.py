from pymongo import MongoClient
from app.infrastructure.config.settings import settings
from app.adapters.database.mongo_repository import (
    MongoTenantRepository,
    MongoUserRepository,
    MongoDocumentRepository,
    MongoConversationRepository
)
from app.adapters.vector_store.qdrant_adapter import QdrantVectorStore
from app.adapters.llm.gemini_adapter import GeminiLLMService
from app.use_cases.auth.auth_use_cases import AuthUseCases
from app.use_cases.document.ingest_use_case import IngestUseCase
from app.use_cases.chat.chat_use_case import ChatUseCase

# Initialize standard pymongo client
mongo_client = MongoClient(settings.MONGODB_URI)

# Initialize interfaces/repositories
tenant_repo = MongoTenantRepository(mongo_client, settings.MONGODB_DB_NAME)
user_repo = MongoUserRepository(mongo_client, settings.MONGODB_DB_NAME)
doc_repo = MongoDocumentRepository(mongo_client, settings.MONGODB_DB_NAME)
convo_repo = MongoConversationRepository(mongo_client, settings.MONGODB_DB_NAME)

# Initialize external adapters
vector_store = QdrantVectorStore(
    url=settings.QDRANT_URL, 
    api_key=settings.QDRANT_API_KEY
)

# LLM Service (Gemini API wrapper)
llm_service = GeminiLLMService(
    api_key=settings.GEMINI_API_KEY, 
    model_name="gemini-2.5-flash"
)

# Initialize application use cases
auth_use_cases = AuthUseCases(
    user_repo=user_repo,
    tenant_repo=tenant_repo,
    jwt_secret=settings.JWT_SECRET_KEY,
    jwt_algorithm=settings.JWT_ALGORITHM,
    access_token_expire_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
)

ingest_use_case = IngestUseCase(
    doc_repo=doc_repo,
    vector_store=vector_store,
    llm_service=llm_service
)

chat_use_case = ChatUseCase(
    convo_repo=convo_repo,
    vector_store=vector_store,
    llm_service=llm_service
)

# Helper functions to fetch dependencies in FastAPI
def get_auth_use_cases() -> AuthUseCases:
    return auth_use_cases

def get_ingest_use_case() -> IngestUseCase:
    return ingest_use_case

def get_chat_use_case() -> ChatUseCase:
    return chat_use_case

def get_document_repo() -> MongoDocumentRepository:
    return doc_repo
