from pydantic import BaseModel
from typing import List, Optional

class PDFPageResult(BaseModel):
    page: int
    text: str
    raw_text: str
    char_count: int
    error: Optional[str] = None

class PDFAnalysisResponse(BaseModel):
    """Schema para resposta de análise de PDF."""
    filename: str
    total_pages: int
    summary: str
    answer: Optional[str] = None
    pages: List[PDFPageResult]
    usage: Optional[dict] = None

class TextAnalyzerRequest(BaseModel):
    """Schema para requisição de análise de texto."""
    extracted_text: str
    query: Optional[str] = None

class TextAnalyzerResponse(BaseModel):
    """Schema para resposta de análise de texto."""
    summary: str                # Resumo do texto
    answer: Optional[str] = None  # Resposta à pergunta (se houver)
    usage: Optional[dict] = None

class PathExtractorRequest(BaseModel):
    """Schema para requisição de extração de path."""
    extracted_text: str

class PathExtractorResponse(BaseModel):
    """Schema para resposta de extração de path."""
    filename: str
    path: str
    usage: Optional[dict] = None