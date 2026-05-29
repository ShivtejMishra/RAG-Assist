import uuid
import structlog
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from qdrant_client.http.exceptions import UnexpectedResponse
from app.domain.vector_interface import IVectorStore

logger = structlog.get_logger()

class QdrantVectorStore(IVectorStore):
    def __init__(self, url: str, api_key: str = None):
        self.client = QdrantClient(url=url, api_key=api_key)

    async def initialize_collection(self, collection_name: str, vector_size: int) -> None:
        try:
            # Check if collection exists
            collections = self.client.get_collections().collections
            exists = any(c.name == collection_name for c in collections)
            
            if not exists:
                logger.info("creating_qdrant_collection", collection=collection_name, vector_size=vector_size)
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=vector_size,
                        distance=qmodels.Distance.COSINE
                    )
                )
                
                # Add payload index for tenant_id to make filtering extremely fast
                self.client.create_payload_index(
                    collection_name=collection_name,
                    field_name="tenant_id",
                    field_schema=qmodels.PayloadSchemaType.KEYWORD
                )
                logger.info("created_qdrant_payload_indexes", collection=collection_name)
        except Exception as e:
            logger.error("qdrant_initialization_failed", error=str(e))
            raise

    async def upsert_chunks(
        self, 
        collection_name: str,
        tenant_id: str, 
        document_id: str, 
        chunks: List[Dict[str, Any]]
    ) -> None:
        points = []
        for chunk in chunks:
            chunk_id = chunk.get("id") or str(uuid.uuid4())
            vector = chunk["vector"]
            
            # Formulate the payload
            payload = {
                "tenant_id": tenant_id,
                "document_id": document_id,
                "filename": chunk.get("filename"),
                "text": chunk.get("text"),
                "chunk_index": chunk.get("chunk_index", 0),
                "page_number": chunk.get("page_number", 0)
            }
            
            points.append(
                qmodels.PointStruct(
                    id=chunk_id,
                    vector=vector,
                    payload=payload
                )
            )

        try:
            logger.info("upserting_vectors_to_qdrant", count=len(points), document_id=document_id, tenant_id=tenant_id)
            self.client.upsert(
                collection_name=collection_name,
                points=points
            )
        except UnexpectedResponse as e:
            logger.error("qdrant_upsert_failed", error=e.content, tenant_id=tenant_id)
            raise RuntimeError(f"Qdrant client error: {e.content}")
        except Exception as e:
            logger.error("qdrant_upsert_error", error=str(e), tenant_id=tenant_id)
            raise

    async def search_similarity(
        self,
        collection_name: str,
        tenant_id: str,
        query_vector: List[float],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        # Enforce strict multi-tenant tenant_id isolation filter
        tenant_filter = qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="tenant_id",
                    match=qmodels.MatchValue(value=tenant_id)
                )
            ]
        )

        try:
            res = self.client.query_points(
                collection_name=collection_name,
                query=query_vector,
                query_filter=tenant_filter,
                limit=limit
            )
            
            hits = []
            for hit in res.points:
                hits.append({
                    "id": hit.id,
                    "score": hit.score,
                    "payload": hit.payload
                })
            return hits
        except Exception as e:
            logger.error("qdrant_search_failed", error=str(e), tenant_id=tenant_id)
            return []

    async def delete_document_vectors(
        self,
        collection_name: str,
        tenant_id: str,
        document_id: str
    ) -> None:
        # Filter matching BOTH tenant_id AND document_id
        delete_filter = qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="tenant_id",
                    match=qmodels.MatchValue(value=tenant_id)
                ),
                qmodels.FieldCondition(
                    key="document_id",
                    match=qmodels.MatchValue(value=document_id)
                )
            ]
        )

        try:
            logger.info("deleting_document_vectors", document_id=document_id, tenant_id=tenant_id)
            self.client.delete(
                collection_name=collection_name,
                points_selector=qmodels.FilterSelector(
                    filter=delete_filter
                )
            )
        except Exception as e:
            logger.error("qdrant_delete_failed", error=str(e), tenant_id=tenant_id)
            raise
