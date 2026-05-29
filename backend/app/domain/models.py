from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from uuid import uuid4

class TenantSettings(BaseModel):
    llm_model: str = "gemini-2.5-flash"
    chunk_size: int = 1000
    chunk_overlap: int = 200

class Tenant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    domain: str
    status: str = "active"  # active, suspended
    plan: str = "enterprise"  # standard, enterprise
    settings: TenantSettings = Field(default_factory=TenantSettings)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    tenant_id: str
    email: EmailStr
    hashed_password: str
    full_name: str
    role: str = "viewer"  # admin, editor, viewer
    status: str = "active"  # active, suspended
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DocumentStatus:
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    tenant_id: str
    filename: str
    file_size: int
    status: str = DocumentStatus.UPLOADED
    chunk_count: int = 0
    storage_path: str
    uploaded_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Citation(BaseModel):
    document_id: str
    filename: str
    page_number: Optional[int] = None
    chunk_id: Optional[str] = None
    snippet: str

class Message(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid4()))
    role: str  # user, assistant, system
    content: str
    citations: Optional[List[Citation]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    tenant_id: str
    user_id: str
    title: str
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
