from typing import List, Optional
from pymongo import MongoClient
from pymongo.database import Database
from app.domain.interfaces import (
    ITenantRepository,
    IUserRepository,
    IDocumentRepository,
    IConversationRepository
)
from app.domain.models import Tenant, User, Document, Conversation

class MongoRepositoryBase:
    def __init__(self, client: MongoClient, db_name: str):
        self.client = client
        self.db: Database = client[db_name]

class MongoTenantRepository(MongoRepositoryBase, ITenantRepository):
    def __init__(self, client: MongoClient, db_name: str):
        super().__init__(client, db_name)
        self.collection = self.db["tenants"]

    async def get_by_id(self, tenant_id: str) -> Optional[Tenant]:
        doc = self.collection.find_one({"_id": tenant_id})
        if not doc:
            return None
        # Convert _id to id
        doc["id"] = doc.pop("_id")
        return Tenant(**doc)

    async def get_by_domain(self, domain: str) -> Optional[Tenant]:
        doc = self.collection.find_one({"domain": domain.lower()})
        if not doc:
            return None
        doc["id"] = doc.pop("_id")
        return Tenant(**doc)

    async def save(self, tenant: Tenant) -> Tenant:
        data = tenant.dict()
        data["_id"] = data.pop("id")
        self.collection.replace_one({"_id": data["_id"]}, data, upsert=True)
        return tenant


class MongoUserRepository(MongoRepositoryBase, IUserRepository):
    def __init__(self, client: MongoClient, db_name: str):
        super().__init__(client, db_name)
        self.collection = self.db["users"]

    async def get_by_id(self, user_id: str) -> Optional[User]:
        doc = self.collection.find_one({"_id": user_id})
        if not doc:
            return None
        doc["id"] = doc.pop("_id")
        return User(**doc)

    async def get_by_email(self, email: str) -> Optional[User]:
        doc = self.collection.find_one({"email": email.lower()})
        if not doc:
            return None
        doc["id"] = doc.pop("_id")
        return User(**doc)

    async def save(self, user: User) -> User:
        data = user.dict()
        data["_id"] = data.pop("id")
        self.collection.replace_one({"_id": data["_id"]}, data, upsert=True)
        return user


class MongoDocumentRepository(MongoRepositoryBase, IDocumentRepository):
    def __init__(self, client: MongoClient, db_name: str):
        super().__init__(client, db_name)
        self.collection = self.db["documents"]

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        doc = self.collection.find_one({"_id": document_id})
        if not doc:
            return None
        doc["id"] = doc.pop("_id")
        return Document(**doc)

    async def list_by_tenant(self, tenant_id: str) -> List[Document]:
        cursor = self.collection.find({"tenant_id": tenant_id})
        docs = []
        for doc in cursor:
            doc["id"] = doc.pop("_id")
            docs.append(Document(**doc))
        return docs

    async def save(self, document: Document) -> Document:
        data = document.dict()
        data["_id"] = data.pop("id")
        self.collection.replace_one({"_id": data["_id"]}, data, upsert=True)
        return document

    async def delete(self, document_id: str) -> bool:
        result = self.collection.delete_one({"_id": document_id})
        return result.deleted_count > 0


class MongoConversationRepository(MongoRepositoryBase, IConversationRepository):
    def __init__(self, client: MongoClient, db_name: str):
        super().__init__(client, db_name)
        self.collection = self.db["conversations"]

    async def get_by_id(self, conversation_id: str) -> Optional[Conversation]:
        doc = self.collection.find_one({"_id": conversation_id})
        if not doc:
            return None
        doc["id"] = doc.pop("_id")
        return Conversation(**doc)

    async def list_by_user(self, tenant_id: str, user_id: str) -> List[Conversation]:
        cursor = self.collection.find({"tenant_id": tenant_id, "user_id": user_id}).sort("updated_at", -1)
        conversations = []
        for doc in cursor:
            doc["id"] = doc.pop("_id")
            conversations.append(Conversation(**doc))
        return conversations

    async def save(self, conversation: Conversation) -> Conversation:
        data = conversation.dict()
        data["_id"] = data.pop("id")
        self.collection.replace_one({"_id": data["_id"]}, data, upsert=True)
        return conversation

    async def delete(self, conversation_id: str) -> bool:
        result = self.collection.delete_one({"_id": conversation_id})
        return result.deleted_count > 0
