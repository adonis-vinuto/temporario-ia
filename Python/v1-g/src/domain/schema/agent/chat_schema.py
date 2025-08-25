from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field

class RoleEnum(int, Enum):
    """Define os papéis no chat: usuário ou agente."""
    USER = 0
    AGENT = 1

class User(BaseModel):
    """Representa o usuário que está interagindo com o agente."""
    id_user: str = Field(..., alias="id-user")
    name: str

class ChatHistoryItem(BaseModel):
    """Representa uma mensagem de chat entre o usuário e o agente."""
    role: RoleEnum
    content: str

class Usage(BaseModel):
    """
    Representa estatísticas de uso da LLM para cada resposta do agente.
    """
    model_name: Optional[str] = Field(None, alias="model-name")
    finish_reason: Optional[str] = Field(None, alias="finish-reason")
    input_tokens: Optional[int] = Field(None, alias="input-tokens")
    output_tokens: Optional[int] = Field(None, alias="output-tokens")
    total_tokens: Optional[int] = Field(None, alias="total-tokens")

class ChatRequest(BaseModel):
    """
    Estrutura esperada no corpo da requisição ao endpoint de chat.
    """
    user: User
    message: str
    chat_history: List[ChatHistoryItem] = Field(..., alias="chat-history")

class ChatResponse(BaseModel):
    """
    Estrutura da resposta retornada pelo endpoint de chat.
    """
    message_response: str = Field(..., alias="message-response")
    usage: Usage = Field(..., alias="usage")


class ChatRequestQdrant(BaseModel):
    """
    Estrutura esperada no corpo da requisição ao endpoint de chat.
    """
    user: User
    message: str
    collection: str
    chat_history: List[ChatHistoryItem] = Field(..., alias="chat-history")