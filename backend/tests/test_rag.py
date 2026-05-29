import pytest
from app.use_cases.document.ingest_use_case import IngestUseCase
from app.use_cases.chat.chat_use_case import ChatUseCase
from app.domain.models import Document, DocumentStatus, Conversation

@pytest.mark.asyncio
async def test_document_ingestion_and_isolated_chat(doc_repo, convo_repo, vector_store, llm_service):
    # 1. Setup Use Cases
    ingest_service = IngestUseCase(
        doc_repo=doc_repo,
        vector_store=vector_store,
        llm_service=llm_service
    )
    
    chat_service = ChatUseCase(
        convo_repo=convo_repo,
        vector_store=vector_store,
        llm_service=llm_service
    )

    tenant_a_id = "tenant-a"
    tenant_b_id = "tenant-b"

    # 2. Add metadata document for Tenant A
    doc_a = Document(
        tenant_id=tenant_a_id,
        filename="company_policy.txt",
        file_size=500,
        storage_path="local/path/policy.txt",
        uploaded_by="user-a"
    )
    await doc_repo.save(doc_a)

    # 3. Perform ingestion (chunk, embed, index to Qdrant)
    sample_pdf_text = b"This is the corporate policy. Casual Fridays are allowed. Work hours are 9 to 5."
    ingested_doc = await ingest_service.ingest_document(
        document_id=doc_a.id,
        file_content=sample_pdf_text,
        chunk_size=100,
        chunk_overlap=10
    )

    assert ingested_doc.status == DocumentStatus.PROCESSED
    assert ingested_doc.chunk_count > 0

    # 4. Initiate Chat session for Tenant A
    convo_a = await chat_service.create_conversation(
        tenant_id=tenant_a_id,
        user_id="user-a",
        title="Policy Chat"
    )

    # Ask Tenant A query
    updated_convo_a = await chat_service.execute_chat(
        tenant_id=tenant_a_id,
        user_id="user-a",
        conversation_id=convo_a.id,
        user_query="What is the Friday dress code?"
    )

    assert len(updated_convo_a.messages) == 2
    assert updated_convo_a.messages[1].role == "assistant"
    # Citations are populated
    assert len(updated_convo_a.messages[1].citations) > 0
    assert updated_convo_a.messages[1].citations[0].filename == "company_policy.txt"

    # 5. Initiate Chat session for Tenant B (enforces multi-tenant isolation)
    # Since Tenant B has no uploaded documents, vector search should yield empty results
    convo_b = await chat_service.create_conversation(
        tenant_id=tenant_b_id,
        user_id="user-b",
        title="Isolation Check Chat"
    )

    # Query context from Tenant B
    # The mock vector store filters vectors by tenant_id, so Tenant B will get 0 context hits
    updated_convo_b = await chat_service.execute_chat(
        tenant_id=tenant_b_id,
        user_id="user-b",
        conversation_id=convo_b.id,
        user_query="Show me the policies"
    )

    # Tenant B assistant answer is still generated but should have NO citations (empty context)
    assert len(updated_convo_b.messages[1].citations) == 0
