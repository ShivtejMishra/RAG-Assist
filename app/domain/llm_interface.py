from abc import ABC, abstractmethod
from typing import List, Generator, AsyncGenerator

class ILLMService(ABC):
    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate a vector representation of the text using an embedding model."""
        pass

    @abstractmethod
    async def generate_completion(
        self, 
        prompt: str, 
        system_instruction: str = None,
        temperature: float = 0.2
    ) -> str:
        """Generate a complete text response based on a prompt."""
        pass

    @abstractmethod
    async def generate_completion_stream(
        self, 
        prompt: str, 
        system_instruction: str = None,
        temperature: float = 0.2
    ) -> AsyncGenerator[str, None]:
        """Stream back text completion tokens chunk-by-chunk."""
        pass
