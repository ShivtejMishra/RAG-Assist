import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.domain.models import User
from app.infrastructure.web.schemas import (
    ConversationResponse, 
    ConversationCreate, 
    ChatQuery
)
from app.infrastructure.web.auth_deps import require_viewer
from app.infrastructure.di import get_chat_use_case
from app.use_cases.chat.chat_use_case import ChatUseCase

router = APIRouter(prefix="/chats", tags=["Conversational AI"])

@router.get("", response_model=List[ConversationResponse])
async def list_chats(
    current_user: User = Depends(require_viewer),
    chat_service: ChatUseCase = Depends(get_chat_use_case)
):
    convos = await chat_service.list_conversations(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id
    )
    # Map to schema response
    return convos

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    payload: ConversationCreate,
    current_user: User = Depends(require_viewer),
    chat_service: ChatUseCase = Depends(get_chat_use_case)
):
    convo = await chat_service.create_conversation(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        title=payload.title
    )
    return convo

@router.get("/{id}", response_model=ConversationResponse)
async def get_chat(
    id: str,
    current_user: User = Depends(require_viewer),
    chat_service: ChatUseCase = Depends(get_chat_use_case)
):
    convo = await chat_service.get_conversation(id)
    if not convo or convo.tenant_id != current_user.tenant_id or convo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found.")
    return convo

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_chat(
    id: str,
    current_user: User = Depends(require_viewer),
    chat_service: ChatUseCase = Depends(get_chat_use_case)
):
    convo = await chat_service.get_conversation(id)
    if not convo or convo.tenant_id != current_user.tenant_id or convo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found.")
    
    await chat_service.delete_conversation(id)
    return {"message": "Chat history deleted."}

@router.post("/{id}/messages")
async def send_message(
    id: str,
    payload: ChatQuery,
    stream: bool = True,
    current_user: User = Depends(require_viewer),
    chat_service: ChatUseCase = Depends(get_chat_use_case)
):
    # Check session ownership
    convo = await chat_service.get_conversation(id)
    if not convo or convo.tenant_id != current_user.tenant_id or convo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")

    if not stream:
        updated_convo = await chat_service.execute_chat(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            conversation_id=id,
            user_query=payload.content
        )
        return updated_convo

    # For streaming, we yield formatted Server-Sent Events (SSE)
    async def sse_generator():
        try:
            async for data_line in chat_service.execute_chat_stream(
                tenant_id=current_user.tenant_id,
                user_id=current_user.id,
                conversation_id=id,
                user_query=payload.content
            ):
                # Clean yielding of token lines
                yield f"data: {data_line}\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")
