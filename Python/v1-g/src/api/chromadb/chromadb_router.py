from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
import logging

from src.domain.schema.chromadb.chromadb_schema import (
    ChromaDBInsertRequest,
    ChromaDBInsertResponse,
    ChromaDBQueryRequest,
    ChromaDBQueryResponse,
    ChromaDBDeleteRequest,
    ChromaDBDeleteResponse,
    ChromaDBStatusResponse,
    ChromaDBBulkData
)
from src.application.service.chromadb.chromadb_service import ChromaDBService, get_chromadb_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chromadb", tags=["ChromaDB Vector Database"])


@router.post("/documents", response_model=ChromaDBInsertResponse)
async def insert_documents(
    request: ChromaDBInsertRequest,
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Insere documentos no banco vetorial ChromaDB
    """
    try:
        result = await chromadb_service.insert_documents(
            documents=request.documents,
            metadatas=request.metadatas,
            ids=request.ids
        )
        
        if result.success:
            return result
        else:
            raise HTTPException(
                status_code=400,
                detail=result.message
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de inserção: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.post("/query", response_model=ChromaDBQueryResponse)
async def query_documents(
    request: ChromaDBQueryRequest,
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Busca documentos no banco vetorial ChromaDB usando busca semântica
    """
    try:
        result = await chromadb_service.query_documents(
            query_text=request.query_text,
            n_results=request.n_results,
            ids=request.ids
        )
        
        return result
            
    except Exception as e:
        logger.error(f"Erro no endpoint de query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/search", response_model=ChromaDBQueryResponse)
async def search_documents(
    question: str = Query(..., description="Pergunta para buscar no banco vetorial"),
    n_results: int = Query(3, ge=1, le=20, description="Número de resultados a retornar"),
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Busca documentos similares baseado em uma pergunta (GET endpoint para facilidade de uso)
    """
    try:
        result = await chromadb_service.query_documents(
            query_text=question,
            n_results=n_results
        )
        
        return result
            
    except Exception as e:
        logger.error(f"Erro no endpoint de busca: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/documents", response_model=ChromaDBDeleteResponse)
async def delete_documents(
    request: ChromaDBDeleteRequest,
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Deleta documentos específicos do banco vetorial ChromaDB por IDs
    """
    try:
        result = await chromadb_service.delete_documents(request.ids)
        
        if result.success:
            return result
        else:
            raise HTTPException(
                status_code=404,
                detail=result.message
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de deleção: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/documents/by-ids")
async def delete_documents_by_ids(
    ids: list[str] = Query(..., description="Lista de IDs dos documentos a serem deletados"),
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Deleta documentos específicos por IDs (endpoint GET para facilidade)
    """
    try:
        result = await chromadb_service.delete_documents(ids)
        
        if result.success:
            return result
        else:
            raise HTTPException(
                status_code=404,
                detail=result.message
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de deleção por IDs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/clear", response_model=ChromaDBStatusResponse)
async def clear_all_documents(
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Limpa todos os documentos da coleção sem deletar o banco
    """
    try:
        result = await chromadb_service.clear_all_documents()
        
        if result.success:
            return result
        else:
            raise HTTPException(
                status_code=500,
                detail=result.message
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de limpeza: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/recreate", response_model=ChromaDBStatusResponse)
async def force_recreate_collection(
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Força a recriação da coleção quando o delete normal não funciona
    """
    try:
        result = await chromadb_service.force_recreate_collection()
        
        if result.success:
            return result
        else:
            raise HTTPException(
                status_code=500,
                detail=result.message
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de recriação: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/database", response_model=ChromaDBStatusResponse)
async def delete_entire_database(
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Deleta completamente o banco de dados ChromaDB
    """
    try:
        result = await chromadb_service.delete_database()
        
        if result.success:
            return result
        else:
            raise HTTPException(
                status_code=500,
                detail=result.message
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de delete do banco: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/status", response_model=ChromaDBStatusResponse)
async def get_database_status(
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Obtém informações sobre o status atual do banco vetorial
    """
    try:
        result = await chromadb_service.get_collection_status()
        return result
            
    except Exception as e:
        logger.error(f"Erro no endpoint de status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/documents/all", response_model=ChromaDBBulkData)
async def get_all_documents(
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """
    Retorna todos os documentos armazenados no banco vetorial
    """
    try:
        result = await chromadb_service.get_all_documents()
        return result
            
    except Exception as e:
        logger.error(f"Erro no endpoint de obter todos os documentos: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


# Endpoints de compatibilidade (mantendo os originais para não quebrar integração existente)
@router.get("/chromadb/all")
async def get_all_vetorial_data_legacy(
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """Endpoint legacy - Retorna todos os dados armazenados no banco vetorial ChromaDB."""
    try:
        result = await chromadb_service.get_all_documents()
        return JSONResponse(content={
            "documents": result.documents,
            "metadatas": result.metadatas,
            "ids": result.ids
        })
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Erro ao buscar documentos: {str(e)}"}
        )


@router.get("/chromadb/search")
async def search_by_question_legacy(
    question: str = Query(..., description="Pergunta para buscar no banco vetorial"),
    n_results: int = Query(3, description="Número de resultados a retornar", ge=1, le=10),
    chromadb_service: ChromaDBService = Depends(get_chromadb_service)
):
    """Endpoint legacy - Busca documentos similares baseado em uma pergunta."""
    try:
        result = await chromadb_service.query_documents(question, n_results)
        
        # Formato legacy
        legacy_results = []
        for item in result.results:
            legacy_results.append({
                "document": item.document,
                "metadata": item.metadata,
                "id": item.id,
                "distance": item.distance
            })
        
        return JSONResponse(content={
            "question": question,
            "results": legacy_results,
            "total_found": len(legacy_results)
        })
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Erro ao buscar documentos: {str(e)}"}
        )