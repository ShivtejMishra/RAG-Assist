from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr

class TenantCreate(BaseModel):
    tenant_name: str = Field(..., min_length=2)
    domain: str = Field(..., min_length=3)
    admin_email: EmailStr
    admin_password: str = Field(..., min_length=6)
    admin_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    tenant_id: str

class TenantResponse(BaseModel):
    id: str
    name: str
    domain: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    tenant: TenantResponse

class CitationSchema(BaseModel):
    document_id: str
    filename: str
    page_number: Optional[int] = None
    chunk_id: Optional[str] = None
    snippet: str

class MessageResponse(BaseModel):
    message_id: str
    role: str
    content: str
    citations: Optional[List[CitationSchema]] = None
    timestamp: datetime

class ConversationCreate(BaseModel):
    title: str = Field(..., min_length=1)

class ConversationResponse(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    title: str
    messages: List[MessageResponse]
    created_at: datetime
    updated_at: datetime

class ChatQuery(BaseModel):
    content: str = Field(..., min_length=1)

class DocumentResponse(BaseModel):
    id: str
    tenant_id: str
    filename: str
    file_size: int
    status: str
    chunk_count: int
    created_at: datetime
