from pydantic import BaseModel
from typing import List, Optional
import uuid


class PdfUploadResponse(BaseModel):
    message: str
    task_id: str


class PdfPage(BaseModel):
    page: int
    title: str
    content: str
    resume_page: str


class PdfUsage(BaseModel):
    total_tokens: int
    total_time: int
    total_oracle_interactions: int


class PdfProcessingResult(BaseModel):
    resume_pdf: str
    pages: List[PdfPage]
    usage: PdfUsage
    status: int


class PdfProcessingStatus(BaseModel):
    task_id: str
    status: str  # "processing", "completed", "failed"
    result: Optional[PdfProcessingResult] = None
    error: Optional[str] = None
