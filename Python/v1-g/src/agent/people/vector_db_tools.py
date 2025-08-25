from langchain_core.tools import tool
from src.application.service.chromadb.chromadb_service import ChromaDBService, get_chromadb_service
import logging

logger = logging.getLogger(__name__)
chromadb_service: ChromaDBService = get_chromadb_service()

@tool()
async def search_documents(query: str, n_results: int = 5) -> dict:
    """
    Busca documentos no ChromaDB baseado em uma query.
    
    Args:
        query: Texto de busca
        n_results: Número máximo de resultados
        
    Returns:
        dict: Resultados da busca
    """
    try:
        print(f"[DEBUG] Iniciando busca com query: {query}")
        print(f"[DEBUG] n_results: {n_results}")
        
        result = await chromadb_service.query_documents(
            query_text=query,
            n_results=n_results
        )
        
        print(f"[DEBUG] Resultado da busca: {result}")
        print(f"[DEBUG] Success: {result.success}")
        
        if result.success:
            # Corrigir: usar 'results' ao invés de 'data'
            results_data = result.results if hasattr(result, 'results') else []
            print(f"[DEBUG] Dados encontrados: {len(results_data)} resultados")
            
            # Formatar os resultados para melhor visualização
            formatted_results = []
            for item in results_data:
                formatted_results.append({
                    "content": item.document,
                    "metadata": item.metadata,
                    "page_number": item.metadata.get("page_number"),
                    "page_title": item.metadata.get("page_title"),
                    "distance": item.distance
                })
            
            return {
                "success": True,
                "results": formatted_results,
                "query": query,
                "count": len(results_data)
            }
        else:
            print(f"[DEBUG] Erro na busca: {result.message if hasattr(result, 'message') else 'Erro desconhecido'}")
            return {
                "success": False,
                "message": f"Erro na busca: {result.message if hasattr(result, 'message') else 'Erro desconhecido'}",
                "query": query
            }
            
    except Exception as e:
        print(f"[ERROR] Exceção na busca: {str(e)}")
        logger.error(f"Erro na busca de documentos: {str(e)}")
        return {
            "success": False,
            "message": f"Erro interno na busca: {str(e)}",
            "query": query
        }