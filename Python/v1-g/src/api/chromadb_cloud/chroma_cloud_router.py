from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import logging

from src.domain.schema.chromadb.chroma_cloud_schema import (
    DocumentsAddRequest,
    DocumentsAddResponse,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    DocumentUpdateRequest,
    DocumentUpdateResponse,
    DocumentsDeleteRequest,
    DocumentsDeleteResponse,
    CollectionStatsResponse,
    CollectionCreateRequest,
    CollectionCreateResponse,
    CollectionsListResponse,
    CollectionBackupResponse,
    InitializeKnowledgeBaseRequest,
    InitializeKnowledgeBaseResponse,
    ChromaCloudError
)
from src.application.service.chromadb.chroma_cloud_service import ChromaCloudService
from src.infrastructure.config.settings_config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chroma-cloud", tags=["ChromaDB Cloud"])

def get_chroma_cloud_service() -> ChromaCloudService:
    """Dependency para obter instância do ChromaCloudService"""
    if not settings.CHROMA_CLOUD_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ChromaDB Cloud não está configurado. Configure CHROMA_CLOUD_API_KEY no arquivo .env"
        )
    
    return ChromaCloudService(
        api_key=settings.CHROMA_CLOUD_API_KEY,
        tenant=settings.CHROMA_CLOUD_TENANT,
        database=settings.CHROMA_CLOUD_DATABASE
    )

@router.post("/initialize", response_model=InitializeKnowledgeBaseResponse)
async def initialize_knowledge_base(
    request: InitializeKnowledgeBaseRequest,
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Inicializa a base de conhecimento principal
    """
    try:
        success = service.initialize_knowledge_base(request.collection_name)
        
        collection_name = request.collection_name or service.default_collection
        
        if success:
            return InitializeKnowledgeBaseResponse(
                success=True,
                message=f"Base de conhecimento '{collection_name}' inicializada com sucesso",
                collection_name=collection_name
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Falha ao inicializar base de conhecimento '{collection_name}'"
            )
            
    except Exception as e:
        logger.error(f"Erro ao inicializar base de conhecimento: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/documents", response_model=DocumentsAddResponse)
async def add_documents(
    request: DocumentsAddRequest,
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Adiciona documentos à base de conhecimento
    """
    try:
        # Converte para o formato esperado pelo service
        from src.application.service.chromadb.chroma_cloud_service import DocumentInput
        
        documents = [
            DocumentInput(
                content=doc.content,
                metadata=doc.metadata,
                document_id=doc.document_id
            )
            for doc in request.documents
        ]
        
        success = service.add_knowledge(documents, request.collection_name)
        
        collection_name = request.collection_name or service.default_collection
        
        if success:
            return DocumentsAddResponse(
                success=True,
                message=f"Documentos adicionados com sucesso à coleção '{collection_name}'",
                added_count=len(documents),
                collection_name=collection_name
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Falha ao adicionar documentos à coleção '{collection_name}'"
            )
            
    except Exception as e:
        logger.error(f"Erro ao adicionar documentos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=KnowledgeSearchResponse)
async def search_knowledge(
    request: KnowledgeSearchRequest,
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Busca conhecimento relevante na base
    """
    try:
        results = service.search_knowledge(
            query=request.query,
            max_results=request.max_results,
            filters=request.filters,
            collection_name=request.collection_name
        )
        
        collection_name = request.collection_name or service.default_collection
        
        # Converte para o formato de resposta
        from src.domain.schema.chromadb.chroma_cloud_schema import SearchResultResponse
        
        search_results = [
            SearchResultResponse(
                document_id=result.document_id,
                content=result.content,
                metadata=result.metadata,
                score=result.score
            )
            for result in results
        ]
        
        return KnowledgeSearchResponse(
            success=True,
            query=request.query,
            results=search_results,
            total_found=len(search_results),
            collection_name=collection_name
        )
        
    except Exception as e:
        logger.error(f"Erro ao buscar conhecimento: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/documents/{document_id}", response_model=DocumentUpdateResponse)
async def update_document(
    document_id: str,
    request: DocumentUpdateRequest,
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Atualiza um documento específico na base
    """
    try:
        success = service.update_knowledge(
            document_id=document_id,
            new_content=request.new_content,
            new_metadata=request.new_metadata,
            collection_name=request.collection_name
        )
        
        collection_name = request.collection_name or service.default_collection
        
        if success:
            return DocumentUpdateResponse(
                success=True,
                message=f"Documento '{document_id}' atualizado com sucesso",
                document_id=document_id,
                collection_name=collection_name
            )
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Documento '{document_id}' não encontrado ou não pôde ser atualizado"
            )
            
    except Exception as e:
        logger.error(f"Erro ao atualizar documento: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents", response_model=DocumentsDeleteResponse)
async def delete_documents(
    request: DocumentsDeleteRequest,
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Remove documentos da base de conhecimento
    """
    try:
        success = service.delete_knowledge(
            document_ids=request.document_ids,
            collection_name=request.collection_name
        )
        
        collection_name = request.collection_name or service.default_collection
        
        if success:
            return DocumentsDeleteResponse(
                success=True,
                message=f"Documentos removidos com sucesso da coleção '{collection_name}'",
                deleted_count=len(request.document_ids),
                collection_name=collection_name
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Falha ao remover documentos da coleção '{collection_name}'"
            )
            
    except Exception as e:
        logger.error(f"Erro ao remover documentos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/collections/{collection_name}/stats", response_model=CollectionStatsResponse)
async def get_collection_stats(
    collection_name: str,
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Obtém estatísticas de uma coleção específica
    """
    try:
        stats = service.get_knowledge_stats(collection_name)
        
        if "error" in stats:
            raise HTTPException(status_code=500, detail=stats["error"])
        
        return CollectionStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/collections/stats", response_model=CollectionStatsResponse)
async def get_default_collection_stats(
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Obtém estatísticas da coleção padrão
    """
    try:
        stats = service.get_knowledge_stats()
        
        if "error" in stats:
            raise HTTPException(status_code=500, detail=stats["error"])
        
        return CollectionStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/collections", response_model=CollectionCreateResponse)
async def create_specialized_collection(
    request: CollectionCreateRequest,
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Cria uma coleção especializada para um domínio específico
    """
    try:
        success = service.create_specialized_collection(
            name=request.name,
            description=request.description
        )
        
        if success:
            return CollectionCreateResponse(
                success=True,
                message=f"Coleção especializada '{request.name}' criada com sucesso",
                collection_name=request.name
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Falha ao criar coleção especializada '{request.name}'"
            )
            
    except Exception as e:
        logger.error(f"Erro ao criar coleção especializada: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/collections", response_model=CollectionsListResponse)
async def list_collections(
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Lista todas as coleções disponíveis
    """
    try:
        collections = service.list_all_collections()
        
        from src.domain.schema.chromadb.chroma_cloud_schema import CollectionInfo
        
        collection_info = [
            CollectionInfo(
                name=col["name"],
                metadata=col["metadata"],
                document_count=col["document_count"]
            )
            for col in collections
        ]
        
        return CollectionsListResponse(
            success=True,
            collections=collection_info,
            total_collections=len(collection_info)
        )
        
    except Exception as e:
        logger.error(f"Erro ao listar coleções: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/collections/{collection_name}/backup", response_model=CollectionBackupResponse)
async def backup_collection(
    collection_name: str,
    limit: int = None,
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Faz backup dos dados de uma coleção
    """
    try:
        backup_data = service.backup_collection(collection_name, limit)
        
        if "error" in backup_data:
            raise HTTPException(status_code=500, detail=backup_data["error"])
        
        return CollectionBackupResponse(
            success=True,
            message=f"Backup da coleção '{collection_name}' criado com sucesso",
            collection_name=collection_name,
            backup_timestamp=backup_data["backup_timestamp"],
            total_documents=backup_data["total_count"],
            backup_data=backup_data
        )
        
    except Exception as e:
        logger.error(f"Erro ao fazer backup: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_connection():
    """
    Teste simples de conectividade sem usar o serviço completo
    """
    try:
        from src.infrastructure.chromadb.chroma_cloud import ChromaCloudClient
        
        # Testa apenas a criação do cliente
        client = ChromaCloudClient(
            api_key=settings.CHROMA_CLOUD_API_KEY,
            tenant=settings.CHROMA_CLOUD_TENANT,
            database=settings.CHROMA_CLOUD_DATABASE
        )
        
        # Testa heartbeat
        heartbeat = client.get_heartbeat()
        
        return {
            "status": "success",
            "message": "Teste de conexão realizado",
            "heartbeat": heartbeat,
            "config": {
                "api_key_configured": bool(settings.CHROMA_CLOUD_API_KEY),
                "tenant": settings.CHROMA_CLOUD_TENANT,
                "database": settings.CHROMA_CLOUD_DATABASE
            }
        }
        
    except Exception as e:
        logger.error(f"Erro no teste de conexão: {e}")
        return {
            "status": "error",
            "message": f"Erro no teste: {str(e)}",
            "config": {
                "api_key_configured": bool(settings.CHROMA_CLOUD_API_KEY),
                "tenant": settings.CHROMA_CLOUD_TENANT,
                "database": settings.CHROMA_CLOUD_DATABASE
            }
        }


@router.get("/simple-test")
async def simple_test():
    """
    Teste simples sem usar o ChromaCloudService
    """
    return {
        "status": "ok",
        "message": "ChromaDB Cloud router está funcionando",
        "timestamp": "2025-07-28T22:58:42"
    }


@router.get("/config")
async def get_config():
    """
    Mostra as configurações atuais do ChromaDB Cloud (sem dados sensíveis)
    """
    return {
        "api_key_configured": bool(settings.CHROMA_CLOUD_API_KEY),
        "api_key_length": len(settings.CHROMA_CLOUD_API_KEY) if settings.CHROMA_CLOUD_API_KEY else 0,
        "tenant": settings.CHROMA_CLOUD_TENANT,
        "database": settings.CHROMA_CLOUD_DATABASE,
        "api_key_prefix": settings.CHROMA_CLOUD_API_KEY[:8] + "..." if settings.CHROMA_CLOUD_API_KEY else "Not configured"
    }


@router.get("/health")
async def health_check(
    service: ChromaCloudService = Depends(get_chroma_cloud_service)
):
    """
    Verifica o status de saúde da conexão com ChromaDB Cloud
    """
    try:
        # Usa o método heartbeat para verificar conectividade
        heartbeat = service.client.get_heartbeat()
        
        if heartbeat["status"] == "connected":
            return {
                "status": "healthy",
                "message": "ChromaDB Cloud está funcionando corretamente",
                "details": heartbeat
            }
        else:
            raise HTTPException(
                status_code=503,
                detail=f"ChromaDB Cloud indisponível: {heartbeat.get('error', 'Erro desconhecido')}"
            )
        
    except Exception as e:
        logger.error(f"Erro no health check: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"ChromaDB Cloud indisponível: {str(e)}"
        )
