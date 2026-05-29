from abc import ABC, abstractmethod
from typing import List, Dict, Any

class IVectorStore(ABC):
    @abstractmethod
    async def initialize_collection(self, collection_name: str, vector_size: int) -> None:
        """Initialize vector collection if it does not exist."""
        pass

    @abstractmethod
    async def upsert_chunks(
        self, 
        collection_name: str,
        tenant_id: str, 
        document_id: str, 
        chunks: List[Dict[str, Any]]
    ) -> None:
        """Upsert a list of document chunks (with their vectors and payload metadata)."""
        pass

    @abstractmethod
    async def search_similarity(
        self,
        collection_name: str,
        tenant_id: str,
        query_vector: List[float],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search similarity within a tenant context."""
        pass

    @abstractmethod
    async def delete_document_vectors(
        self,
        collection_name: str,
        tenant_id: str,
        document_id: str
    ) -> None:
        """Delete all vectors matching a specific document id for a tenant."""
        pass
