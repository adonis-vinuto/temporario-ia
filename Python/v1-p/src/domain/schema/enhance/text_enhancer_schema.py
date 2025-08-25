from pydantic import BaseModel
from typing import Optional

class TextEnhancerRequest(BaseModel):
    """Modelo de entrada para a rota de melhoria de texto."""
    text: str

class TextEnhancerResponse(BaseModel):
    """Modelo de saída com o texto melhorado e estatísticas de uso."""
    text_response: str
    usage: Optional[dict]