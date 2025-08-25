from pydantic import BaseModel, Field
from typing import Optional, Dict

class ChatRequest(BaseModel):
    input_text: str
    thread_id: Optional[str] = None

class ChatResponse(BaseModel):
    thread_id: str
    status: str
    message_to_user: str
    data: Optional[Dict] = None