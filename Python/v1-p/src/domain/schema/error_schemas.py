from typing import Dict, List, Optional
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    """Schema para respostas de erro simples"""
    title: str
    status: int
    detail: str

class ValidationErrorResponse(BaseModel):
    """Schema para respostas de erro de validação"""
    title: str
    status: int
    errors: Dict[str, List[str]]