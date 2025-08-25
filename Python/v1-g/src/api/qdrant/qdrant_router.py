from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
import logging
from src.domain.schema.qdrant.qdrant_schema import (
    QdrantSchema,
    QdrantStoreRequest,
    QdrantStoreResponse,
    QdrantSearchRequest,
    QdrantSearchResponse,
    QdrantDeleteRequest,
    QdrantDeleteResponse,
)
from src.application.service.qdrant.qdrant_service import QdrantService, get_qdrant_service

from src.application.service.embedding.embedding_service import EmbeddingService, get_embedding_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/qdrant", tags=["Qdrant"])


@router.post("/store", response_model=QdrantStoreResponse)
async def store_document(
    request: QdrantStoreRequest,
    qdrant_service: QdrantService = Depends(get_qdrant_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    """
    Armazena um documento no Qdrant com embedding gerado.
    """
    try:
        logger.info(f"Storing document in collection: {qdrant_service.collection_name}")
        
        qdrant_service = QdrantService(collection_name=qdrant_service.collection_name)
        
        # Gera o embedding do texto
        embedding = embedding_service.generate_embedding(request.text)
        
        # Armazena no Qdrant (removido await pois o método não é async)
        
        """oints = [
                models.PointStruct(
                    id=doc['id'],
                    vector=doc['vector'],
                    payload=doc.get('metadata', {})
                ) for doc in documents"""
                
        document = {
            "id": request.doc_id,
            "vector": embedding,
            "metadata": {**request.metadata, "text": request.text}
        }
        
        result = qdrant_service.add_documents_service(
            documents=[document],
        )
        
        return QdrantStoreResponse(
            success=True,
            doc_id=str(request.doc_id),
            message="Document stored successfully"
        )
        
    except Exception as e:
        logger.error(f"Error storing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error storing document: {str(e)}")


@router.post("/search", response_model=QdrantSearchResponse)
async def search_documents(
    request: QdrantSearchRequest,
    qdrant_service: QdrantService = Depends(get_qdrant_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    """
    Busca documentos similares no Qdrant.
    """
    try:
        logger.info(f"Searching in collection: {qdrant_service.collection_name}")
        
        # Cria o serviço com o nome da coleção específica
        qdrant_service = QdrantService(collection_name=qdrant_service.collection_name)

        # Gera o embedding da query
        query_embedding = await embedding_service.generate_embedding(request.query_text)
        
        # Busca no Qdrant (removido await pois o método não é async)
        results = qdrant_service.search_service(
            query_vector=query_embedding,
            limit=request.top_k
        )
        
        return QdrantSearchResponse(
            success=True,
            results=results
        )
        
    except Exception as e:
        logger.error(f"Error searching documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")

@router.post("/collections/{collection_name}")
async def create_collection(
    collection_name: str,
    vector_size: int = Query(default=1536, description="Size of the vector embeddings")
):
    """
    Cria uma nova coleção no Qdrant.
    """
    try:
        logger.info(f"Creating collection: {collection_name}")
        
        # Cria o serviço com o nome da coleção específica
        qdrant_service = QdrantService(collection_name=collection_name)
        
        # Cria a coleção
        qdrant_service.create_collection_service(vector_size=vector_size)
        
        return JSONResponse(content={
            "success": True,
            "message": f"Collection '{collection_name}' created successfully"
        })
            
    except Exception as e:
        logger.error(f"Error creating collection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating collection: {str(e)}")
