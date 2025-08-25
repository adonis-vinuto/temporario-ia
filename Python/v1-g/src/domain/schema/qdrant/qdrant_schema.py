from pydantic import BaseModel

class QdrantSchema(BaseModel):
    id: str
    vector: list[float]
    metadata: dict[str, str]
    
class QdrantStoreRequest(BaseModel):
    """Request para armazenar texto no Qdrant"""
    text: str
    metadata: dict[str, str] = {}
    doc_id: str
    
class QdrantStoreResponse(BaseModel):
    """Response para armazenamento no Qdrant"""
    success: bool
    doc_id: str
    message: str
    
class QdrantSearchRequest(BaseModel):
    """Request para busca no Qdrant"""
    query_text: str
    top_k: int = 5  # Número de resultados a retornar
    min_score: float = 0.0  # Score mínimo para filtrar resultados
    
class QdrantSearchResponse(BaseModel):
    """Response para busca no Qdrant"""
    success: bool
    results: list[QdrantSchema]
    
class QdrantDeleteRequest(BaseModel):
    """Request para deletar documento do Qdrant"""
    doc_id: str  # ID do documento a ser deletado
    
class QdrantDeleteResponse(BaseModel):
    """Response para deleção no Qdrant"""
    success: bool
    doc_id: str
    message: str