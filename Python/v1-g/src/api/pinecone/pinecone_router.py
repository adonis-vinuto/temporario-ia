from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
import logging
from typing import List

from src.domain.schema.pinecone.pinecone_schema import (
    PineconeStoreRequest,
    PineconeStoreResponse,
    PineconeSearchRequest,
    PineconeSearchResponse,
    PineconeDeleteRequest,
    PineconeDeleteResponse,
    PineconeStatsResponse,
    PineconeBulkStoreRequest,
    PineconeBulkStoreResponse,
    PineconeStatusResponse,
    PineconeSearchResult
)
from src.application.service.pinecone.pinecone_service import PineconeService, get_pinecone_service
from src.application.service.embedding.embedding_service import EmbeddingService, get_embedding_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pinecone", tags=["Pinecone Vector Database"])


@router.post("/store", response_model=PineconeStoreResponse)
async def store_text(
    request: PineconeStoreRequest,
    index_name: str = Query("gemelli-ai", description="Nome do índice Pinecone"),
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    """
    Armazena um texto no banco vetorial Pinecone
    """
    try:
        # Criar serviço com índice específico
        pinecone_service = PineconeService(index_name=index_name)
        
        # Gerar embedding do texto
        embedding = embedding_service.generate_embedding(request.text)
        
        # Armazenar no Pinecone
        doc_id = pinecone_service.store_text_service(
            text=request.text,
            embedding=embedding,
            metadata=request.metadata,
            doc_id=request.doc_id
        )
        
        return PineconeStoreResponse(
            success=True,
            doc_id=doc_id,
            message=f"Texto armazenado com sucesso no índice '{index_name}'. ID: {doc_id}"
        )
        
    except Exception as e:
        logger.error(f"Erro no endpoint de armazenamento: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.post("/search", response_model=PineconeSearchResponse)
async def search_texts(
    request: PineconeSearchRequest,
    pinecone_service: PineconeService = Depends(get_pinecone_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    """
    Busca textos similares no banco vetorial Pinecone usando busca semântica
    """
    try:
        # Gerar embedding da consulta
        query_embedding = embedding_service.generate_embedding(request.query_text)
        
        # Buscar no Pinecone
        search_results = pinecone_service.search_service(
            query_embedding=query_embedding,
            top_k=request.top_k,
            min_score=request.min_score
        )
        
        # Converter para o formato de resposta
        results = [
            PineconeSearchResult(
                id=result["id"],
                score=result["score"],
                text=result["text"],
                metadata=result["metadata"]
            )
            for result in search_results
        ]
        
        return PineconeSearchResponse(
            success=True,
            query=request.query_text,
            results=results,
            total_found=len(results),
            message=f"Encontrados {len(results)} resultados"
        )
        
    except Exception as e:
        logger.error(f"Erro no endpoint de busca: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/search", response_model=PineconeSearchResponse)
async def search_texts_get(
    query: str = Query(..., description="Texto para buscar no banco vetorial"),
    top_k: int = Query(5, ge=1, le=50, description="Número de resultados a retornar"),
    min_score: float = Query(0.0, ge=0.0, le=1.0, description="Score mínimo"),
    pinecone_service: PineconeService = Depends(get_pinecone_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    """
    Busca textos similares (GET endpoint para facilidade de uso)
    """
    try:
        # Gerar embedding da consulta
        query_embedding = embedding_service.generate_embedding(query)
        
        # Buscar no Pinecone
        search_results = pinecone_service.search_service(
            query_embedding=query_embedding,
            top_k=top_k,
            min_score=min_score
        )
        
        # Converter para o formato de resposta
        results = [
            PineconeSearchResult(
                id=result["id"],
                score=result["score"],
                text=result["text"],
                metadata=result["metadata"]
            )
            for result in search_results
        ]
        
        return PineconeSearchResponse(
            success=True,
            query=query,
            results=results,
            total_found=len(results),
            message=f"Encontrados {len(results)} resultados"
        )
        
    except Exception as e:
        logger.error(f"Erro no endpoint de busca GET: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.post("/store/bulk", response_model=PineconeBulkStoreResponse)
async def store_texts_bulk(
    request: PineconeBulkStoreRequest,
    pinecone_service: PineconeService = Depends(get_pinecone_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    """
    Armazena múltiplos textos no banco vetorial Pinecone
    """
    try:
        if not request.texts:
            raise HTTPException(status_code=400, detail="Lista de textos não pode estar vazia")
        
        # Gerar embeddings para todos os textos
        embeddings = embedding_service.generate_embeddings_batch(request.texts)
        
        doc_ids = []
        for i, (text, embedding) in enumerate(zip(request.texts, embeddings)):
            # Usar ID fornecido ou gerar um novo
            doc_id = None
            if request.doc_ids and i < len(request.doc_ids):
                doc_id = request.doc_ids[i]
            
            # Usar metadata fornecida ou criar vazia
            metadata = {}
            if request.metadatas and i < len(request.metadatas):
                metadata = request.metadatas[i]
            
            # Armazenar no Pinecone
            stored_id = pinecone_service.store_text_service(
                text=text,
                embedding=embedding,
                metadata=metadata,
                doc_id=doc_id
            )
            doc_ids.append(stored_id)
        
        return PineconeBulkStoreResponse(
            success=True,
            doc_ids=doc_ids,
            total_stored=len(doc_ids),
            message=f"{len(doc_ids)} textos armazenados com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro no endpoint de armazenamento em lote: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/documents/{doc_id}", response_model=PineconeDeleteResponse)
async def delete_document(
    doc_id: str,
    pinecone_service: PineconeService = Depends(get_pinecone_service)
):
    """
    Deleta um documento específico do banco vetorial Pinecone
    """
    try:
        success = pinecone_service.delete_service(doc_id)
        
        if success:
            return PineconeDeleteResponse(
                success=True,
                doc_id=doc_id,
                message=f"Documento {doc_id} deletado com sucesso"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Documento {doc_id} não encontrado ou erro na deleção"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de deleção: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/documents", response_model=PineconeDeleteResponse)
async def delete_document_post(
    request: PineconeDeleteRequest,
    pinecone_service: PineconeService = Depends(get_pinecone_service)
):
    """
    Deleta um documento específico (POST endpoint)
    """
    try:
        success = pinecone_service.delete_service(request.doc_id)
        
        if success:
            return PineconeDeleteResponse(
                success=True,
                doc_id=request.doc_id,
                message=f"Documento {request.doc_id} deletado com sucesso"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Documento {request.doc_id} não encontrado ou erro na deleção"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de deleção POST: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/clear", response_model=PineconeStatusResponse)
async def clear_all_documents(
    pinecone_service: PineconeService = Depends(get_pinecone_service)
):
    """
    Limpa todos os documentos do índice Pinecone
    """
    try:
        success = pinecone_service.clear_all_service()
        
        if success:
            return PineconeStatusResponse(
                success=True,
                message="Todos os documentos foram removidos do índice"
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Erro ao limpar o índice"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de limpeza: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/stats", response_model=PineconeStatsResponse)
async def get_index_stats(
    pinecone_service: PineconeService = Depends(get_pinecone_service)
):
    """
    Obtém estatísticas do índice Pinecone
    """
    try:
        stats = pinecone_service.get_stats_service()
        
        return PineconeStatsResponse(
            success=True,
            total_vectors=stats.get("total_vectors", 0),
            dimension=stats.get("dimension", 0),
            index_name=pinecone_service.index_name,
            message="Estatísticas obtidas com sucesso"
        )
        
    except Exception as e:
        logger.error(f"Erro no endpoint de estatísticas: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/health")
async def health_check(
    pinecone_service: PineconeService = Depends(get_pinecone_service)
):
    """
    Verifica se o serviço Pinecone está funcionando
    """
    try:
        # Tentar obter estatísticas como teste de saúde
        stats = pinecone_service.get_stats_service()
        
        return JSONResponse(content={
            "status": "healthy",
            "service": "pinecone",
            "index_name": pinecone_service.index_name,
            "total_vectors": stats.get("total_vectors", 0),
            "message": "Serviço Pinecone funcionando corretamente"
        })
        
    except Exception as e:
        logger.error(f"Erro no health check: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "pinecone",
                "error": str(e),
                "message": "Serviço Pinecone indisponível"
            }
        )
