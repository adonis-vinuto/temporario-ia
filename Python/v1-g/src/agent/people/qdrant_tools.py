from langchain.agents import tool
from src.application.service.qdrant.qdrant_service import get_qdrant_service
from src.application.service.embedding.embedding_service import get_embedding_service
import uuid
import logging
from src.domain.enum.index_type_enum import IndexTypeEnum
from qdrant_client.http import models
from src.agent.people.sql_tools import get_temp_document, set_temp_document

logger = logging.getLogger(__name__)

@tool
def search_qdrant_tool(query: str, collection: str) -> str:
    """Procura no banco vetorial se já existe uma resposta sobre a pergunta."""
    try:
        logger.info(f"Buscando informações para query: {query} na coleção: {collection}")
        client = get_qdrant_service(collection)
        embedding_model = get_embedding_service()
        vector = embedding_model.generate_embedding(query)
        
        results = client.search_service(query_vector=vector, limit=5)
        
        if not results or len(results) == 0:
            logger.info("Nenhum resultado encontrado")
            return "Nenhum resultado encontrado para a consulta."
        
        logger.info(f"Encontrados {len(results)} resultados")
        
        # Formatar os resultados para retorno
        formatted_results = []
        for i, result in enumerate(results[:3]):  # Limitar a 3 resultados principais
            content = result.payload.get("content", "Conteúdo não disponível")
            score = getattr(result, 'score', 0.0)
            formatted_results.append(f"Resultado {i+1} (score: {score:.3f}):\n{content}")
        
        return "\n\n".join(formatted_results)
    
    except Exception as e:
        logger.error(f"Erro na busca: {e}")
        return f"Erro na busca: {str(e)}"

@tool
def insert_to_qdrant_tool(collection: str, document_id: str = "current", agent_id: str = "") -> str:
    """Insere o documento atual no banco vetorial para futuras buscas."""
    try:
        logger.info(f"Tentando inserir documento na coleção: {collection}")
        
        # Get document from temporary storage
        document = get_temp_document(document_id)
        
        if not document:
            logger.error(f"Nenhum documento encontrado para ID: {document_id}")
            return "Erro: Nenhum documento disponível para inserir. Verifique se o documento foi carregado corretamente."
        
        logger.info(f"Documento encontrado: {document.get('name-file', 'sem nome')}")
        
        client = get_qdrant_service(collection)
        embedding_model = get_embedding_service()
        
        base_metadata = {
            "id-file": document.get("id-file"),
            "name-file": document.get("name-file", ""),
            "url-file": document.get("url-file", ""),
            "resume-pdf": document.get("resume-pdf", "")
        }
        pages = document.get("pages", [])
        documents_to_add = []
        
        logger.info(f"Processando {len(pages)} páginas do documento")
        
        for page in pages:
            content = page.get("content", "")
            if not content or not content.strip():
                continue
                
            vector = embedding_model.generate_embedding(content)

            metadata = {
                "agent-id": agent_id,
                **base_metadata,
                "content": content,
                "page-id": str(page.get("page", 0)),
                "page-title": page.get("title", ""),
                "resume-page": page.get("resume-page", "")
            }
            base_str = f"{document.get('id-file')}_{page.get('page', 0)}"
            doc_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, base_str))
            doc = {
                "id": doc_id,  # Usar o ID gerado a partir do UUID
                "vector": vector,
                "metadata": metadata
            }
            documents_to_add.append(doc)
        
        if documents_to_add:
            logger.info(f"Inserindo {len(documents_to_add)} documentos")
            client.add_documents_service(documents_to_add)
            return f"✓ Sucesso: {len(documents_to_add)} páginas do documento '{document.get('name-file', 'sem nome')}' inseridas na coleção '{collection}'."
        else:
            logger.warning("Nenhum conteúdo válido encontrado")
            return "Aviso: Nenhum conteúdo válido encontrado no documento para inserir."
    except Exception as e:
        logger.error(f"Erro ao inserir documento: {e}")
        return f"Erro ao inserir documento: {str(e)}"

@tool()
def search_doc_qdrant_tool(doc_id: str, collection: str) -> str:
    """Procura no banco vetorial se já existe um documento com o nome fornecido."""
    try:
        logger.info(f"Buscando documento: {doc_id} na coleção: {collection}")
        client = get_qdrant_service(collection)
        base_str = f"{doc_id}_35"
        id = str(uuid.uuid5(uuid.NAMESPACE_DNS, base_str))

        filter_condition = {
            "id": id
        }

        results = client.retrieve_point_by_id_service(point_id=id)

        if results != None:
            logger.info(f"Documento encontrado: {id}")
            return "ENCONTRADO"
        else:
            logger.info(f"Documento não encontrado: {id}")
            return "NÃO ENCONTRADO"

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Erro ao buscar documento {id}: {error_msg}")
        if "Index required but not found" in error_msg or "Bad request" in error_msg:
            return "NÃO ENCONTRADO"
        return f"Erro inesperado: {error_msg}"

@tool
def search_doc_qdrant_by_name_tool(agent_id: str, doc_name: str, collection: str, index_type: int) -> str:
    """
    Verifica se o documento com o nome fornecido e o agent_id já está inserido no Qdrant.

    Args:
        agent_id (str): ID do agente (campo "agent-id" no payload).
        doc_name (str): Nome do documento (campo "name-file" no payload).
        collection (str): Nome da coleção Qdrant.
        index_type (int): Tipo do índice (1=keyword, 2=text, etc).

    Returns:
        str: "ENCONTRADO" se o documento existir, senão "NÃO ENCONTRADO".
    """
    try:
        index_enum = IndexTypeEnum(index_type)
        client = get_qdrant_service(collection)
        
        # Criar índices para ambos os campos (pode ignorar se já existirem)
        client.create_index_service("agent-id", index_enum)
        client.create_index_service("name-file", index_enum)

        filter_condition = models.Filter(
            must=[
                models.FieldCondition(
                    key="agent-id",
                    match=models.MatchValue(value=agent_id)
                ),
                models.FieldCondition(
                    key="name-file",
                    match=models.MatchValue(value=doc_name)
                )
            ]
        )

        results = client.search_with_filter_service(
            filter=filter_condition,
            limit=1
        )

        if results and len(results) > 0:
            return "ENCONTRADO"
        else:
            return "NÃO ENCONTRADO"
    except Exception as e:
        logger.error(f"Erro ao buscar documento por agent_id e name-file: {e}")
        return "NÃO ENCONTRADO"