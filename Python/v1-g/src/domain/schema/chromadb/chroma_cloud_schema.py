from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import json


class DocumentInputRequest(BaseModel):
    """Schema para entrada de documentos"""
    content: str = Field(..., description="Conteúdo do documento")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadados do documento")
    document_id: Optional[str] = Field(None, description="ID único do documento (será gerado se não fornecido)")


class DocumentsAddRequest(BaseModel):
    """Schema para adicionar múltiplos documentos"""
    documents: List[DocumentInputRequest] = Field(..., description="Lista de documentos para adicionar")
    collection_name: Optional[str] = Field(None, description="Nome da coleção (usa padrão se não especificado)")

    @validator('documents', pre=True)
    def serialize_metadatas(cls, v):
        """Serializa metadados complexos para valores aceitos pelo ChromaDB"""
        if v is None:
            return v
        
        for doc in v:
            if doc.metadata:
                serialized_metadata = {}
                for key, value in doc.metadata.items():
                    if isinstance(value, (str, int, float, bool, type(None))):
                        serialized_metadata[key] = value
                    elif isinstance(value, (dict, list)):
                        serialized_metadata[key] = json.dumps(value, ensure_ascii=False)
                    else:
                        serialized_metadata[key] = str(value)
                doc.metadata = serialized_metadata
        
        return v


class DocumentsAddResponse(BaseModel):
    """Schema para resposta de adição de documentos"""
    success: bool
    message: str
    added_count: Optional[int] = None
    collection_name: str


class KnowledgeSearchRequest(BaseModel):
    """Schema para busca de conhecimento"""
    query: str = Field(..., description="Texto da consulta")
    max_results: int = Field(5, ge=1, le=50, description="Número máximo de resultados")
    filters: Optional[Dict[str, Any]] = Field(None, description="Filtros de metadados")
    collection_name: Optional[str] = Field(None, description="Nome da coleção (usa padrão se não especificado)")


class SearchResultResponse(BaseModel):
    """Schema para resultado de busca individual"""
    document_id: str
    content: str
    metadata: Dict[str, Any]
    score: float


class KnowledgeSearchResponse(BaseModel):
    """Schema para resposta de busca de conhecimento"""
    success: bool
    query: str
    results: List[SearchResultResponse]
    total_found: int
    collection_name: str


class DocumentUpdateRequest(BaseModel):
    """Schema para atualização de documento"""
    document_id: str = Field(..., description="ID do documento a atualizar")
    new_content: Optional[str] = Field(None, description="Novo conteúdo do documento")
    new_metadata: Optional[Dict[str, Any]] = Field(None, description="Novos metadados do documento")
    collection_name: Optional[str] = Field(None, description="Nome da coleção (usa padrão se não especificado)")


class DocumentUpdateResponse(BaseModel):
    """Schema para resposta de atualização"""
    success: bool
    message: str
    document_id: str
    collection_name: str


class DocumentsDeleteRequest(BaseModel):
    """Schema para exclusão de documentos"""
    document_ids: List[str] = Field(..., description="Lista de IDs dos documentos a remover")
    collection_name: Optional[str] = Field(None, description="Nome da coleção (usa padrão se não especificado)")


class DocumentsDeleteResponse(BaseModel):
    """Schema para resposta de exclusão"""
    success: bool
    message: str
    deleted_count: int
    collection_name: str


class CollectionStatsResponse(BaseModel):
    """Schema para estatísticas da coleção"""
    collection_name: str
    total_documents: int
    sample_documents: int
    last_checked: str
    sources: Optional[Dict[str, int]] = None


class CollectionCreateRequest(BaseModel):
    """Schema para criação de coleção especializada"""
    name: str = Field(..., description="Nome da coleção")
    description: str = Field(..., description="Descrição do propósito da coleção")


class CollectionCreateResponse(BaseModel):
    """Schema para resposta de criação de coleção"""
    success: bool
    message: str
    collection_name: str


class CollectionInfo(BaseModel):
    """Schema para informações de coleção"""
    name: str
    metadata: Dict[str, Any]
    document_count: int


class CollectionsListResponse(BaseModel):
    """Schema para listagem de coleções"""
    success: bool
    collections: List[CollectionInfo]
    total_collections: int


class CollectionBackupResponse(BaseModel):
    """Schema para backup de coleção"""
    success: bool
    message: str
    collection_name: str
    backup_timestamp: str
    total_documents: int
    backup_data: Optional[Dict[str, Any]] = None


class InitializeKnowledgeBaseRequest(BaseModel):
    """Schema para inicialização da base de conhecimento"""
    collection_name: Optional[str] = Field(None, description="Nome da coleção (usa padrão se não especificado)")


class InitializeKnowledgeBaseResponse(BaseModel):
    """Schema para resposta de inicialização"""
    success: bool
    message: str
    collection_name: str


class ChromaCloudError(BaseModel):
    """Schema para erros do ChromaCloud"""
    error: str
    details: Optional[str] = None
    collection_name: Optional[str] = None
