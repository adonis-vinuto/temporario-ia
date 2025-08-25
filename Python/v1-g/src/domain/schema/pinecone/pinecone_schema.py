from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class PineconeStoreRequest(BaseModel):
    """Request para armazenar texto no Pinecone"""
    text: str = Field(..., description="Texto a ser armazenado")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata adicional")
    doc_id: Optional[str] = Field(None, description="ID do documento (auto-gerado se não fornecido)")


class PineconeStoreResponse(BaseModel):
    """Response para armazenamento no Pinecone"""
    success: bool = Field(..., description="Se a operação foi bem sucedida")
    doc_id: str = Field(..., description="ID do documento armazenado")
    message: str = Field(..., description="Mensagem de status")


class PineconeSearchRequest(BaseModel):
    """Request para busca no Pinecone"""
    query_text: str = Field(..., description="Texto da consulta")
    top_k: int = Field(5, ge=1, le=50, description="Número de resultados a retornar")
    min_score: float = Field(0.0, ge=0.0, le=1.0, description="Score mínimo para filtrar resultados")


class PineconeSearchResult(BaseModel):
    """Resultado individual da busca"""
    id: str = Field(..., description="ID do documento")
    score: float = Field(..., description="Score de similaridade")
    text: str = Field(..., description="Texto do documento")
    metadata: Dict[str, Any] = Field({}, description="Metadata do documento")


class PineconeSearchResponse(BaseModel):
    """Response para busca no Pinecone"""
    success: bool = Field(..., description="Se a operação foi bem sucedida")
    query: str = Field(..., description="Texto da consulta original")
    results: List[PineconeSearchResult] = Field([], description="Lista de resultados encontrados")
    total_found: int = Field(0, description="Total de resultados encontrados")
    message: str = Field("", description="Mensagem de status")


class PineconeDeleteRequest(BaseModel):
    """Request para deletar documento do Pinecone"""
    doc_id: str = Field(..., description="ID do documento a ser deletado")


class PineconeDeleteResponse(BaseModel):
    """Response para deleção no Pinecone"""
    success: bool = Field(..., description="Se a operação foi bem sucedida")
    doc_id: str = Field(..., description="ID do documento deletado")
    message: str = Field(..., description="Mensagem de status")


class PineconeStatsResponse(BaseModel):
    """Response com estatísticas do índice Pinecone"""
    success: bool = Field(..., description="Se a operação foi bem sucedida")
    total_vectors: int = Field(0, description="Total de vetores no índice")
    dimension: int = Field(0, description="Dimensão dos vetores")
    index_name: str = Field("", description="Nome do índice")
    message: str = Field("", description="Mensagem de status")


class PineconeBulkStoreRequest(BaseModel):
    """Request para armazenar múltiplos textos no Pinecone"""
    texts: List[str] = Field(..., description="Lista de textos a serem armazenados")
    metadatas: Optional[List[Dict[str, Any]]] = Field(None, description="Lista de metadatas (opcional)")
    doc_ids: Optional[List[str]] = Field(None, description="Lista de IDs dos documentos (auto-gerados se não fornecidos)")


class PineconeBulkStoreResponse(BaseModel):
    """Response para armazenamento em lote no Pinecone"""
    success: bool = Field(..., description="Se a operação foi bem sucedida")
    doc_ids: List[str] = Field(..., description="Lista de IDs dos documentos armazenados")
    total_stored: int = Field(0, description="Total de documentos armazenados")
    message: str = Field(..., description="Mensagem de status")


class PineconeStatusResponse(BaseModel):
    """Response genérica de status"""
    success: bool = Field(..., description="Se a operação foi bem sucedida")
    message: str = Field(..., description="Mensagem de status")
