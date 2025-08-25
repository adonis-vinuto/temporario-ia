from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
import json


class ChromaDBInsertRequest(BaseModel):
    documents: List[str] = Field(..., description="Lista de documentos a serem inseridos")
    metadatas: Optional[List[Dict[str, Union[str, int, float, bool, None]]]] = Field(None, description="Lista de metadados para cada documento (valores simples apenas)")
    ids: Optional[List[str]] = Field(None, description="Lista de IDs únicos para cada documento")
    
    @validator('metadatas', pre=True)
    def serialize_metadatas(cls, v):
        """Serializa metadados complexos para valores simples aceitos pelo ChromaDB"""
        if v is None:
            return v
        
        serialized = []
        for metadata in v:
            serialized_metadata = {}
            for key, value in metadata.items():
                # ChromaDB aceita apenas str, int, float, bool, None
                if isinstance(value, (str, int, float, bool, type(None))):
                    serialized_metadata[key] = value
                elif isinstance(value, (dict, list)):
                    # Converte objetos complexos para JSON string
                    serialized_metadata[key] = json.dumps(value, ensure_ascii=False)
                else:
                    # Converte outros tipos para string
                    serialized_metadata[key] = str(value)
            serialized.append(serialized_metadata)
        
        return serialized


class ChromaDBInsertResponse(BaseModel):
    success: bool
    message: str
    inserted_count: Optional[int] = None
    ids: Optional[List[str]] = None


class ChromaDBQueryRequest(BaseModel):
    query_text: str = Field(..., description="Texto da consulta para busca semântica")
    n_results: int = Field(3, ge=1, le=20, description="Número de resultados a retornar")
    ids: Optional[List[str]] = Field(None, description="IDs específicos para filtrar a busca")


class ChromaDBQueryResult(BaseModel):
    document: str
    metadata: Optional[Dict[str, Any]] = None
    id: str
    distance: Optional[float] = None


class ChromaDBQueryResponse(BaseModel):
    success: bool
    query_text: str
    results: List[ChromaDBQueryResult]
    total_found: int


class ChromaDBDeleteRequest(BaseModel):
    ids: List[str] = Field(..., description="Lista de IDs dos documentos a serem deletados")


class ChromaDBDeleteResponse(BaseModel):
    success: bool
    message: str
    deleted_count: Optional[int] = None
    deleted_ids: Optional[List[str]] = None
    not_found_ids: Optional[List[str]] = None


class ChromaDBCollectionInfo(BaseModel):
    name: str
    total_documents: int
    sample_ids: List[str]


class ChromaDBStatusResponse(BaseModel):
    success: bool
    message: str
    collection_info: Optional[ChromaDBCollectionInfo] = None


class ChromaDBBulkData(BaseModel):
    documents: List[str]
    metadatas: List[Dict[str, Any]]
    ids: List[str]


class ChromaDBError(BaseModel):
    error: str
    details: Optional[str] = None
