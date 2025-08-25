from typing import Optional
from pydantic import BaseModel, Field, validator
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
import psutil
import asyncio
from datetime import datetime, timedelta

class ResourceLimitsConfig(BaseModel):
    """Configuração de limites de recursos."""
    
    # Limites de arquivo
    max_file_size: int = Field(default=50 * 1024 * 1024, description="Tamanho máximo de arquivo em bytes (50MB)")
    max_pdf_pages: int = Field(default=100, description="Número máximo de páginas em PDF")
    allowed_file_extensions: list = Field(default=['.pdf'], description="Extensões permitidas")
    
    # Limites de chat
    max_chat_history: int = Field(default=100, description="Máximo de mensagens no histórico")
    max_message_length: int = Field(default=10000, description="Tamanho máximo de mensagem")
    max_tokens_per_request: int = Field(default=4000, description="Máximo de tokens por requisição")
    
    # Limites de requisição
    max_request_size: int = Field(default=10 * 1024 * 1024, description="Tamanho máximo da requisição (10MB)")
    request_timeout: int = Field(default=30, description="Timeout em segundos")
    max_concurrent_ocr: int = Field(default=5, description="OCR simultâneos")
    
    # Limites de sistema
    max_memory_usage_percent: float = Field(default=80.0, description="Uso máximo de memória (%)")
    max_cpu_usage_percent: float = Field(default=90.0, description="Uso máximo de CPU (%)")
    
    @validator('max_file_size')
    def validate_file_size(cls, v):
        if v < 1024:  # Mínimo 1KB
            raise ValueError("max_file_size deve ser pelo menos 1KB")
        if v > 500 * 1024 * 1024:  # Máximo 500MB
            raise ValueError("max_file_size não pode exceder 500MB")
        return v

class ResourceMonitor:
    """Monitor de recursos do sistema."""
    
    def __init__(self, config: ResourceLimitsConfig):
        self.config = config
        self._ocr_semaphore = asyncio.Semaphore(config.max_concurrent_ocr)
        self._request_counts = {}
        
    async def check_system_resources(self) -> bool:
        """Verifica se o sistema tem recursos disponíveis."""
        memory_percent = psutil.virtual_memory().percent
        cpu_percent = psutil.cpu_percent(interval=0.1)
        
        if memory_percent > self.config.max_memory_usage_percent:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Sistema com memória alta: {memory_percent:.1f}%"
            )
        
        if cpu_percent > self.config.max_cpu_usage_percent:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Sistema com CPU alta: {cpu_percent:.1f}%"
            )
        
        return True
    
    def validate_file_size(self, file_size: int, filename: str = "file"):
        """Valida tamanho do arquivo."""
        if file_size > self.config.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Arquivo '{filename}' muito grande. Máximo: {self.config.max_file_size / 1024 / 1024:.1f}MB"
            )
    
    def validate_chat_history(self, chat_history: list):
        """Valida histórico de chat."""
        if len(chat_history) > self.config.max_chat_history:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Histórico muito longo. Máximo: {self.config.max_chat_history} mensagens"
            )
    
    def validate_message_length(self, message: str):
        """Valida tamanho da mensagem."""
        if len(message) > self.config.max_message_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Mensagem muito longa. Máximo: {self.config.max_message_length} caracteres"
            )
    
    def validate_file_extension(self, filename: str):
        """Valida extensão do arquivo."""
        import os
        ext = os.path.splitext(filename)[1].lower()
        if ext not in self.config.allowed_file_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de arquivo não permitido. Permitidos: {', '.join(self.config.allowed_file_extensions)}"
            )
    
    async def acquire_ocr_slot(self):
        """Adquire slot para processamento OCR."""
        return self._ocr_semaphore
    
    def get_resource_status(self) -> dict:
        """Retorna status atual dos recursos."""
        return {
            "memory_usage_percent": psutil.virtual_memory().percent,
            "cpu_usage_percent": psutil.cpu_percent(interval=0.1),
            "available_ocr_slots": self._ocr_semaphore._value,
            "max_ocr_slots": self.config.max_concurrent_ocr,
            "limits": {
                "max_file_size_mb": self.config.max_file_size / 1024 / 1024,
                "max_chat_history": self.config.max_chat_history,
                "max_message_length": self.config.max_message_length,
            }
        }

# Instância global
_resource_monitor: Optional[ResourceMonitor] = None

def get_resource_monitor() -> ResourceMonitor:
    """Retorna instância do monitor de recursos."""
    global _resource_monitor
    if _resource_monitor is None:
        config = ResourceLimitsConfig()
        _resource_monitor = ResourceMonitor(config)
    return _resource_monitor

# Middleware para limitar tamanho de requisições
async def limit_request_size_middleware(request: Request, call_next):
    """Middleware para limitar tamanho das requisições."""
    monitor = get_resource_monitor()
    
    # Verifica tamanho da requisição
    if request.headers.get("content-length"):
        content_length = int(request.headers["content-length"])
        if content_length > monitor.config.max_request_size:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "detail": f"Requisição muito grande. Máximo: {monitor.config.max_request_size / 1024 / 1024:.1f}MB"
                }
            )
    
    # Adiciona timeout
    try:
        response = await asyncio.wait_for(
            call_next(request),
            timeout=monitor.config.request_timeout
        )
        return response
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={"detail": f"Requisição excedeu o timeout de {monitor.config.request_timeout}s"}
        )