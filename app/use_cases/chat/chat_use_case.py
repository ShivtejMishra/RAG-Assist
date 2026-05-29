import json
import structlog
from datetime import datetime
from typing import List, Dict, Any, AsyncGenerator, Tuple
from app.domain.interfaces import IConversationRepository
from app.domain.vector_interface import IVectorStore
from app.domain.llm_interface import ILLMService
from app.domain.models import Conversation, Message, Citation

logger = structlog.get_logger()

SYSTEM_INSTRUCTION_TEMPLATE = """You are a highly capable Enterprise Knowledge Assistant. 
You answer questions accurately using ONLY the provided metadata context.

Guidelines:
1. Base your answers strictly on the retrieved source document segments.
2. If the context does not contain the answer, state clearly that the information is not available in the company knowledge base. Do not make up facts.
3. When referencing information, cite the document name and page number if available.
4. Provide structured, readable answers using clear markdown paragraphs and bullet points.

Retrieved Context Chunks:
{context}
"""

class ChatUseCase:
    def __init__(
        self,
        convo_repo: IConversationRepository,
        vector_store: IVectorStore,
        llm_service: ILLMService,
        collection_name: str = "enterprise_knowledge_base"
    ):
        self.convo_repo = convo_repo
        self.vector_store = vector_store
        self.llm_service = llm_service
        self.collection_name = collection_name

    async def create_conversation(self, tenant_id: str, user_id: str, title: str) -> Conversation:
        convo = Conversation(
            tenant_id=tenant_id,
            user_id=user_id,
            title=title,
            messages=[]
        )
        return await self.convo_repo.save(convo)

    async def get_conversation(self, conversation_id: str) -> Conversation:
        convo = await self.convo_repo.get_by_id(conversation_id)
        return convo

    async def list_conversations(self, tenant_id: str, user_id: str) -> List[Conversation]:
        return await self.convo_repo.list_by_user(tenant_id, user_id)

    async def delete_conversation(self, conversation_id: str) -> bool:
        return await self.convo_repo.delete(conversation_id)

    async def _retrieve_context(
        self, 
        tenant_id: str, 
        query: str, 
        limit: int = 5
    ) -> Tuple[str, List[Citation]]:
        """Generates embedding for the query and retrieves isolated context chunks."""
        try:
            # 1. Generate query embedding vector (text-embedding-004)
            query_vector = await self.llm_service.generate_embedding(query)
            
            # 2. Search similarity in Qdrant (enforces tenant filtering)
            hits = await self.vector_store.search_similarity(
                collection_name=self.collection_name,
                tenant_id=tenant_id,
                query_vector=query_vector,
                limit=limit
            )
            
            context_blocks = []
            citations = []
            
            for idx, hit in enumerate(hits):
                payload = hit["payload"]
                doc_id = payload["document_id"]
                filename = payload["filename"]
                text = payload["text"]
                page_num = payload.get("page_number")
                
                context_blocks.append(
                    f"--- Source [{idx + 1}]: {filename} (Page {page_num}) ---\n{text}"
                )
                
                citations.append(
                    Citation(
                        document_id=doc_id,
                        filename=filename,
                        page_number=page_num,
                        chunk_id=hit["id"],
                        snippet=text[:300] + "..." if len(text) > 300 else text
                    )
                )
            
            context_str = "\n\n".join(context_blocks)
            return context_str, citations
        except Exception as e:
            logger.error("context_retrieval_failed", error=str(e), tenant_id=tenant_id)
            return "", []

    def _format_conversation_history(self, messages: List[Message], current_query: str) -> str:
        """Formats the discussion history for the chat model."""
        history = []
        # Keep last 8 messages for token efficiency
        recent_messages = messages[-8:]
        
        for msg in recent_messages:
            role_name = "User" if msg.role == "user" else "Assistant"
            history.append(f"{role_name}: {msg.content}")
            
        history.append(f"User: {current_query}")
        return "\n".join(history)

    async def execute_chat(
        self,
        tenant_id: str,
        user_id: str,
        conversation_id: str,
        user_query: str
    ) -> Conversation:
        convo = await self.convo_repo.get_by_id(conversation_id)
        if not convo or convo.tenant_id != tenant_id or convo.user_id != user_id:
            raise ValueError("Conversation session not found.")

        # 1. Retrieve matching chunks from Qdrant
        context, citations = await self._retrieve_context(tenant_id, user_query)
        
        # 2. Setup System Instruction
        system_instruction = SYSTEM_INSTRUCTION_TEMPLATE.format(context=context)
        
        # 3. Format Conversation Prompt
        prompt = self._format_conversation_history(convo.messages, user_query)
        
        # 4. Generate Completion using Gemini API
        response_text = await self.llm_service.generate_completion(
            prompt=prompt,
            system_instruction=system_instruction
        )
        
        # 5. Append messages to DB
        user_msg = Message(role="user", content=user_query)
        assistant_msg = Message(role="assistant", content=response_text, citations=citations)
        
        convo.messages.append(user_msg)
        convo.messages.append(assistant_msg)
        convo.updated_at = datetime.utcnow()
        
        # If conversation title is default or first message, name it
        if len(convo.messages) <= 2:
            convo.title = user_query[:40] + "..." if len(user_query) > 40 else user_query

        await self.convo_repo.save(convo)
        return convo

    async def execute_chat_stream(
        self,
        tenant_id: str,
        user_id: str,
        conversation_id: str,
        user_query: str
    ) -> AsyncGenerator[str, None]:
        convo = await self.convo_repo.get_by_id(conversation_id)
        if not convo or convo.tenant_id != tenant_id or convo.user_id != user_id:
            yield json.dumps({"type": "error", "message": "Conversation session not found."}) + "\n"
            return

        # 1. Retrieve matching chunks from Qdrant
        context, citations = await self._retrieve_context(tenant_id, user_query)
        
        # 2. Setup System Instruction
        system_instruction = SYSTEM_INSTRUCTION_TEMPLATE.format(context=context)
        
        # 3. Format Conversation Prompt
        prompt = self._format_conversation_history(convo.messages, user_query)
        
        # Stream output token-by-token
        full_response = []
        async for token in self.llm_service.generate_completion_stream(
            prompt=prompt,
            system_instruction=system_instruction
        ):
            full_response.append(token)
            yield json.dumps({"type": "content", "delta": token}) + "\n"

        response_text = "".join(full_response)
        
        # Format citation objects as dict
        citation_dicts = [c.dict() for c in citations]
        yield json.dumps({"type": "citations", "citations": citation_dicts}) + "\n"
        
        # Save messages to database
        user_msg = Message(role="user", content=user_query)
        assistant_msg = Message(role="assistant", content=response_text, citations=citations)
        
        convo.messages.append(user_msg)
        convo.messages.append(assistant_msg)
        convo.updated_at = datetime.utcnow()
        
        if len(convo.messages) <= 2:
            convo.title = user_query[:40] + "..." if len(user_query) > 40 else user_query

        await self.convo_repo.save(convo)
        
        yield "[DONE]\n"
