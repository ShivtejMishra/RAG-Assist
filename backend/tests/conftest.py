import pytest
from typing import List, Optional
from datetime import datetime
from app.domain.interfaces import ITenantRepository, IUserRepository, IDocumentRepository, IConversationRepository
from app.domain.vector_interface import IVectorStore
from app.domain.llm_interface import ILLMService
from app.domain.models import Tenant, User, Document, Conversation

class MockTenantRepository(ITenantRepository):
    def __init__(self):
        self.tenants = {}

    async def get_by_id(self, tenant_id: str) -> Optional[Tenant]:
        return self.tenants.get(tenant_id)

    async def get_by_domain(self, domain: str) -> Optional[Tenant]:
        for t in self.tenants.values():
            if t.domain == domain.lower():
                return t
        return None

    async def save(self, tenant: Tenant) -> Tenant:
        self.tenants[tenant.id] = tenant
        return tenant

class MockUserRepository(IUserRepository):
    def __init__(self):
        self.users = {}

    async def get_by_id(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)

    async def get_by_email(self, email: str) -> Optional[User]:
        for u in self.users.values():
            if u.email == email.lower():
                return u
        return None

    async def save(self, user: User) -> User:
        self.users[user.id] = user
        return user

class MockDocumentRepository(IDocumentRepository):
    def __init__(self):
        self.docs = {}

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        return self.docs.get(document_id)

    async def list_by_tenant(self, tenant_id: str) -> List[Document]:
        return [d for d in self.docs.values() if d.tenant_id == tenant_id]

    async def save(self, document: Document) -> Document:
        self.docs[document.id] = document
        return document

    async def delete(self, document_id: str) -> bool:
        if document_id in self.docs:
            del self.docs[document_id]
            return True
        return False

class MockConversationRepository(IConversationRepository):
    def __init__(self):
        self.convos = {}

    async def get_by_id(self, conversation_id: str) -> Optional[Conversation]:
        return self.convos.get(conversation_id)

    async def list_by_user(self, tenant_id: str, user_id: str) -> List[Conversation]:
        return [c for c in self.convos.values() if c.tenant_id == tenant_id and c.user_id == user_id]

    async def save(self, conversation: Conversation) -> Conversation:
        self.convos[conversation.id] = conversation
        return conversation

    async def delete(self, conversation_id: str) -> bool:
        if conversation_id in self.convos:
            del self.convos[conversation_id]
            return True
        return False

class MockVectorStore(IVectorStore):
    def __init__(self):
        self.vectors = {}

    async def initialize_collection(self, collection_name: str, vector_size: int) -> None:
        pass

    async def upsert_chunks(self, collection_name: str, tenant_id: str, document_id: str, chunks: List[dict]) -> None:
        for chunk in chunks:
            chunk_id = chunk.get("id") or "chunk-id"
            payload = {
                "tenant_id": tenant_id,
                "document_id": document_id,
                "filename": chunk.get("filename"),
                "text": chunk.get("text"),
                "chunk_index": chunk.get("chunk_index", 0),
                "page_number": chunk.get("page_number", 0)
            }
            self.vectors[chunk_id] = {
                "tenant_id": tenant_id,
                "document_id": document_id,
                "vector": chunk["vector"],
                "payload": payload
            }

    async def search_similarity(self, collection_name: str, tenant_id: str, query_vector: List[float], limit: int = 5) -> List[dict]:
        results = []
        for v in self.vectors.values():
            if v["tenant_id"] == tenant_id:
                results.append({
                    "id": v["payload"].get("id", "chunk-id"),
                    "score": 0.9,
                    "payload": v["payload"]
                })
        return results[:limit]

    async def delete_document_vectors(self, collection_name: str, tenant_id: str, document_id: str) -> None:
        self.vectors = {k: v for k, v in self.vectors.items() if not (v["tenant_id"] == tenant_id and v["document_id"] == document_id)}

class MockLLMService(ILLMService):
    async def generate_embedding(self, text: str) -> List[float]:
        return [0.1] * 768

    async def generate_completion(self, prompt: str, system_instruction: str = None, temperature: float = 0.2) -> str:
        return "This is a mock answer grounded in document context."

    async def generate_completion_stream(self, prompt: str, system_instruction: str = None, temperature: float = 0.2):
        yield "This "
        yield "is "
        yield "a "
        yield "mock "
        yield "streamed "
        yield "answer."

@pytest.fixture
def tenant_repo():
    return MockTenantRepository()

@pytest.fixture
def user_repo():
    return MockUserRepository()

@pytest.fixture
def doc_repo():
    return MockDocumentRepository()

@pytest.fixture
def convo_repo():
    return MockConversationRepository()

@pytest.fixture
def vector_store():
    return MockVectorStore()

@pytest.fixture
def llm_service():
    return MockLLMService()
