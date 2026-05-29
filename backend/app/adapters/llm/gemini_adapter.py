import asyncio
import structlog
from typing import List, AsyncGenerator
import google.generativeai as genai
from app.domain.llm_interface import ILLMService

logger = structlog.get_logger()

class GeminiLLMService(ILLMService):
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        # Configure the Google Generative AI SDK
        genai.configure(api_key=api_key)

    async def generate_embedding(self, text: str) -> List[float]:
        try:
            # We run the blocking embed content inside an executor to keep it async friendly
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: genai.embed_content(
                    model="models/gemini-embedding-2",
                    content=text,
                    task_type="retrieval_document"
                )
            )
            return result["embedding"]
        except Exception as e:
            logger.error("gemini_embedding_failed", error=str(e))
            raise RuntimeError(f"Gemini API Embedding failed: {str(e)}")

    async def generate_completion(
        self, 
        prompt: str, 
        system_instruction: str = None,
        temperature: float = 0.2
    ) -> str:
        try:
            loop = asyncio.get_event_loop()
            
            def call_gemini():
                model = genai.GenerativeModel(
                    model_name=self.model_name,
                    system_instruction=system_instruction,
                    generation_config={"temperature": temperature}
                )
                return model.generate_content(prompt)
                
            response = await loop.run_in_executor(None, call_gemini)
            return response.text
        except Exception as e:
            logger.error("gemini_generation_failed", error=str(e))
            raise RuntimeError(f"Gemini API Generation failed: {str(e)}")

    async def generate_completion_stream(
        self, 
        prompt: str, 
        system_instruction: str = None,
        temperature: float = 0.2
    ) -> AsyncGenerator[str, None]:
        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction,
                generation_config={"temperature": temperature}
            )
            
            # Using the native async generator for streaming
            response = await model.generate_content_async(prompt, stream=True)
            async for chunk in response:
                yield chunk.text
        except Exception as e:
            logger.error("gemini_stream_failed", error=str(e))
            yield f"\n[STREAM ERROR: {str(e)}]"
