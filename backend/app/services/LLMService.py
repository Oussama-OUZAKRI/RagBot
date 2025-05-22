import openai
from typing import  Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS

    def generate_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None
    ) -> str:
        """
        Generate a response from OpenAI's API
        
        Args:
            prompt: User input/question
            context: Additional context for the model
            system_message: System instructions
            
        Returns:
            Generated text response
        """
        messages = []
        
        if system_message:
            messages.append({"role": "system", "content": system_message})
        
        if context:
            messages.append({"role": "user", "content": f"Context: {context}\n\nQuestion: {prompt}"})
        else:
            messages.append({"role": "user", "content": prompt})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise

    async def generate_response_async(self, prompt: str, context: Optional[str] = None) -> str:
        """Async version of generate_response"""
        # Implementation similar to generate_response but using await
        # Requires openai>=1.0.0 with async support
        pass

# Singleton instance
llm_service = LLMService()

def get_llm_service() -> LLMService:
    return llm_service