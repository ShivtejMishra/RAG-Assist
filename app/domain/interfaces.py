from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.models import Tenant, User, Document, Conversation, Message

class ITenantRepository(ABC):
    @abstractmethod
    async def get_by_id(self, tenant_id: str) -> Optional[Tenant]:
        pass

    @abstractmethod
    async def get_by_domain(self, domain: str) -> Optional[Tenant]:
        pass

    @abstractmethod
    async def save(self, tenant: Tenant) -> Tenant:
        pass

class IUserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    async def save(self, user: User) -> User:
        pass

class IDocumentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, document_id: str) -> Optional[Document]:
        pass

    @abstractmethod
    async def list_by_tenant(self, tenant_id: str) -> List[Document]:
        pass

    @abstractmethod
    async def save(self, document: Document) -> Document:
        pass

    @abstractmethod
    async def delete(self, document_id: str) -> bool:
        pass

class IConversationRepository(ABC):
    @abstractmethod
    async def get_by_id(self, conversation_id: str) -> Optional[Conversation]:
        pass

    @abstractmethod
    async def list_by_user(self, tenant_id: str, user_id: str) -> List[Conversation]:
        pass

    @abstractmethod
    async def save(self, conversation: Conversation) -> Conversation:
        pass

    @abstractmethod
    async def delete(self, conversation_id: str) -> bool:
        pass
