import re
import structlog
from typing import List, Dict, Any
from app.domain.interfaces import IDocumentRepository
from app.domain.vector_interface import IVectorStore
from app.domain.llm_interface import ILLMService
from app.domain.models import Document, DocumentStatus
from app.adapters.parser.document_parser import DocumentParser

logger = structlog.get_logger()

class IngestUseCase:
    def __init__(
        self,
        doc_repo: IDocumentRepository,
        vector_store: IVectorStore,
        llm_service: ILLMService,
        collection_name: str = "enterprise_knowledge_base"
    ):
        self.doc_repo = doc_repo
        self.vector_store = vector_store
        self.llm_service = llm_service
        self.collection_name = collection_name

    def recursive_character_chunking(
        self, 
        text: str, 
        chunk_size: int = 1000, 
        chunk_overlap: int = 200
    ) -> List[str]:
        """Splits a single text block into overlapping chunks recursively."""
        if len(text) <= chunk_size:
            return [text]

        separators = ["\n\n", "\n", ". ", " ", ""]
        final_chunks = []
        
        # Simple character-based recursive splitter implementation
        def split_text(txt: str) -> List[str]:
            if len(txt) <= chunk_size:
                return [txt]
            
            # Find the best separator
            best_sep = ""
            for sep in separators:
                if sep in txt:
                    best_sep = sep
                    break
            
            if not best_sep:
                # Force chunking by character if no separator is found
                return [txt[i:i+chunk_size] for i in range(0, len(txt), chunk_size)]
            
            splits = txt.split(best_sep)
            chunks = []
            current_chunk = []
            current_len = 0
            
            for part in splits:
                part_len = len(part)
                # If a single part exceeds chunk size, split it recursively
                if part_len > chunk_size:
                    if current_chunk:
                        chunks.append(best_sep.join(current_chunk))
                        current_chunk = []
                        current_len = 0
                    chunks.extend(split_text(part))
                    continue
                
                # Check if adding this part exceeds size
                if current_len + part_len + len(best_sep) > chunk_size:
                    if current_chunk:
                        chunks.append(best_sep.join(current_chunk))
                    current_chunk = [part]
                    current_len = part_len
                else:
                    current_chunk.append(part)
                    current_len += part_len + len(best_sep)
            
            if current_chunk:
                chunks.append(best_sep.join(current_chunk))
                
            return chunks

        raw_chunks = split_text(text)
        
        # Merge chunks with overlap
        merged_chunks = []
        for i, chunk in enumerate(raw_chunks):
            if not chunk.strip():
                continue
            
            # If it's not the first chunk, try to prepend overlap from previous chunk
            if i > 0 and chunk_overlap > 0:
                prev_chunk = raw_chunks[i-1]
                overlap_text = prev_chunk[-chunk_overlap:] if len(prev_chunk) > chunk_overlap else prev_chunk
                merged_chunks.append(overlap_text + " " + chunk)
            else:
                merged_chunks.append(chunk)
                
        return merged_chunks

    async def ingest_document(
        self,
        document_id: str,
        file_content: bytes,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ) -> Document:
        doc = await self.doc_repo.get_by_id(document_id)
        if not doc:
            raise ValueError("Document metadata not found in database.")

        logger.info("starting_document_ingestion", document_id=document_id, filename=doc.filename)
        
        # 1. Update status to processing
        doc.status = DocumentStatus.PROCESSING
        await self.doc_repo.save(doc)

        try:
            # 2. Parse file content
            pages = DocumentParser.parse(doc.filename, file_content)
            if not pages:
                raise ValueError("Parsed text content is empty.")

            # 3. Create Chunks
            processed_chunks = []
            chunk_index = 0
            
            for page in pages:
                page_text = page["text"]
                page_num = page["page_number"]
                
                # Split page text recursively
                chunks_text = self.recursive_character_chunking(
                    page_text, 
                    chunk_size=chunk_size, 
                    chunk_overlap=chunk_overlap
                )
                
                for text_chunk in chunks_text:
                    if not text_chunk.strip():
                        continue
                    
                    # 4. Generate Embeddings (using text-embedding-004)
                    logger.info("generating_vector_embedding", chunk_index=chunk_index)
                    vector = await self.llm_service.generate_embedding(text_chunk)
                    
                    processed_chunks.append({
                        "vector": vector,
                        "text": text_chunk,
                        "page_number": page_num,
                        "filename": doc.filename,
                        "chunk_index": chunk_index
                    })
                    chunk_index += 1

            # 5. Initialize collection in Qdrant (using vector size, e.g. 768 for text-embedding-004)
            if processed_chunks:
                vector_size = len(processed_chunks[0]["vector"])
                await self.vector_store.initialize_collection(self.collection_name, vector_size)
                
                # 6. Upsert points into Qdrant
                await self.vector_store.upsert_chunks(
                    collection_name=self.collection_name,
                    tenant_id=doc.tenant_id,
                    document_id=doc.id,
                    chunks=processed_chunks
                )
            
            # 7. Update metadata in MongoDB
            doc.status = DocumentStatus.PROCESSED
            doc.chunk_count = len(processed_chunks)
            await self.doc_repo.save(doc)
            logger.info("completed_document_ingestion", document_id=document_id, chunks=len(processed_chunks))
            return doc

        except Exception as e:
            logger.error("document_ingestion_failed", document_id=document_id, error=str(e))
            doc.status = DocumentStatus.FAILED
            await self.doc_repo.save(doc)
            raise ValueError(f"Ingestion process failed: {str(e)}")
