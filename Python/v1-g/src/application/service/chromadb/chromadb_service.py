import logging
import uuid
import json
from typing import List, Optional, Dict, Any, Union

from src.infrastructure.chromadb.chroma_vector_db import (
    collection,
    insert_pdf_chroma,
    query_pdf_chroma,
    query_pdf_chroma_id,
    delete_chroma_db,
    clear_collection,
    force_recreate_collection,
    fechar_chromadb,
    reinicializar_chromadb
)
from src.domain.schema.chromadb.chromadb_schema import (
    ChromaDBInsertResponse,
    ChromaDBQueryResponse,
    ChromaDBQueryResult,
    ChromaDBDeleteResponse,
    ChromaDBStatusResponse,
    ChromaDBCollectionInfo,
    ChromaDBBulkData
)

logger = logging.getLogger(__name__)


def _validate_and_serialize_metadata(metadata: Dict[str, Any]) -> Dict[str, Union[str, int, float, bool, None]]:
    """
    Valida e serializa metadados para o formato aceito pelo ChromaDB
    ChromaDB aceita apenas: str, int, float, bool, None
    """
    serialized = {}
    for key, value in metadata.items():
        if isinstance(value, (str, int, float, bool, type(None))):
            serialized[key] = value
        elif isinstance(value, (dict, list)):
            # Converte objetos complexos para JSON string
            serialized[key] = json.dumps(value, ensure_ascii=False)
        else:
            # Converte outros tipos para string
            serialized[key] = str(value)
    
    return serialized


class ChromaDBService:
    def __init__(self):
        # Não mantemos uma referência fixa à collection
        # Em vez disso, sempre acessamos a variável global atual
        pass
    
    @property
    def collection(self):
        """Propriedade que sempre retorna a collection global atual"""
        from src.infrastructure.chromadb.chroma_vector_db import collection
        return collection

    async def insert_documents(
        self, 
        documents: List[str], 
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None
    ) -> ChromaDBInsertResponse:
        """
        Insere documentos no ChromaDB
        """
        try:
            # Validações
            if not documents:
                return ChromaDBInsertResponse(
                    success=False,
                    message="Lista de documentos não pode estar vazia"
                )

            # Gera IDs únicos se não fornecidos
            if ids is None:
                ids = [str(uuid.uuid4()) for _ in documents]
            elif len(ids) != len(documents):
                return ChromaDBInsertResponse(
                    success=False,
                    message="Número de IDs deve corresponder ao número de documentos"
                )

            # Gera metadados vazios se não fornecidos
            if metadatas is None:
                metadatas = [{"source": "api"} for _ in documents]
            elif len(metadatas) != len(documents):
                return ChromaDBInsertResponse(
                    success=False,
                    message="Número de metadados deve corresponder ao número de documentos"
                )

            # Valida e serializa metadados
            try:
                validated_metadatas = []
                for metadata in metadatas:
                    validated_metadata = _validate_and_serialize_metadata(metadata)
                    validated_metadatas.append(validated_metadata)
                metadatas = validated_metadatas
            except Exception as e:
                return ChromaDBInsertResponse(
                    success=False,
                    message=f"Erro ao validar metadados: {str(e)}"
                )

            # Verifica se IDs já existem
            existing_data = self.collection.get()
            existing_ids = set(existing_data["ids"])
            duplicate_ids = set(ids) & existing_ids
            
            if duplicate_ids:
                return ChromaDBInsertResponse(
                    success=False,
                    message=f"IDs duplicados encontrados: {list(duplicate_ids)}"
                )

            # Insere no ChromaDB
            result = insert_pdf_chroma(documents, metadatas, ids)
            
            if "sucesso" in result.lower():
                logger.info(f"Documentos inseridos com sucesso: {len(documents)} itens")
                return ChromaDBInsertResponse(
                    success=True,
                    message=result,
                    inserted_count=len(documents),
                    ids=ids
                )
            else:
                logger.error(f"Erro ao inserir documentos: {result}")
                return ChromaDBInsertResponse(
                    success=False,
                    message=result
                )

        except Exception as e:
            logger.error(f"Erro no serviço de inserção: {str(e)}")
            return ChromaDBInsertResponse(
                success=False,
                message=f"Erro interno: {str(e)}"
            )

    async def query_documents(
        self, 
        query_text: str, 
        n_results: int = 3,
        ids: Optional[List[str]] = None
    ) -> ChromaDBQueryResponse:
        """
        Busca documentos no ChromaDB
        """
        try:
            # Valida parâmetros
            if not query_text.strip():
                return ChromaDBQueryResponse(
                    success=False,
                    query_text=query_text,
                    results=[],
                    total_found=0
                )

            # Executa a query
            if ids:
                results = query_pdf_chroma_id(query_text, n_results, ids)
            else:
                results = query_pdf_chroma(query_text, n_results)

            # Processa resultados
            if not results["documents"] or not results["documents"][0]:
                return ChromaDBQueryResponse(
                    success=True,
                    query_text=query_text,
                    results=[],
                    total_found=0
                )

            # Formata os resultados
            formatted_results = []
            for i in range(len(results["documents"][0])):
                result = ChromaDBQueryResult(
                    document=results["documents"][0][i],
                    metadata=results["metadatas"][0][i] if results["metadatas"] and results["metadatas"][0] else {},
                    id=results["ids"][0][i] if results["ids"] and results["ids"][0] else "",
                    distance=results["distances"][0][i] if results["distances"] and results["distances"][0] else None
                )
                formatted_results.append(result)

            logger.info(f"Query executada: '{query_text}' - {len(formatted_results)} resultados")
            return ChromaDBQueryResponse(
                success=True,
                query_text=query_text,
                results=formatted_results,
                total_found=len(formatted_results)
            )

        except Exception as e:
            logger.error(f"Erro na query: {str(e)}")
            return ChromaDBQueryResponse(
                success=False,
                query_text=query_text,
                results=[],
                total_found=0
            )

    async def delete_documents(self, ids: List[str]) -> ChromaDBDeleteResponse:
        """
        Deleta documentos específicos por IDs
        """
        try:
            if not ids:
                return ChromaDBDeleteResponse(
                    success=False,
                    message="Lista de IDs não pode estar vazia"
                )

            # Verifica quais IDs existem
            existing_data = self.collection.get()
            existing_ids = set(existing_data["ids"])
            ids_to_delete = [id for id in ids if id in existing_ids]
            not_found_ids = [id for id in ids if id not in existing_ids]

            if not ids_to_delete:
                return ChromaDBDeleteResponse(
                    success=False,
                    message="Nenhum dos IDs fornecidos foi encontrado",
                    not_found_ids=not_found_ids
                )

            # Deleta os documentos
            self.collection.delete(ids=ids_to_delete)

            message = f"Documentos deletados com sucesso: {len(ids_to_delete)}"
            if not_found_ids:
                message += f". {len(not_found_ids)} IDs não encontrados."

            logger.info(f"Documentos deletados: {len(ids_to_delete)}")
            return ChromaDBDeleteResponse(
                success=True,
                message=message,
                deleted_count=len(ids_to_delete),
                deleted_ids=ids_to_delete,
                not_found_ids=not_found_ids if not_found_ids else None
            )

        except Exception as e:
            logger.error(f"Erro ao deletar documentos: {str(e)}")
            return ChromaDBDeleteResponse(
                success=False,
                message=f"Erro interno: {str(e)}"
            )

    async def clear_all_documents(self) -> ChromaDBStatusResponse:
        """
        Limpa todos os documentos da coleção
        """
        try:
            result = clear_collection()
            
            success = "sucesso" in result.lower() or "vazia" in result.lower()
            
            logger.info(f"Limpeza da coleção: {result}")
            return ChromaDBStatusResponse(
                success=success,
                message=result
            )

        except Exception as e:
            logger.error(f"Erro ao limpar coleção: {str(e)}")
            return ChromaDBStatusResponse(
                success=False,
                message=f"Erro interno: {str(e)}"
            )

    async def force_recreate_collection(self) -> ChromaDBStatusResponse:
        """
        Força a recriação da coleção
        """
        try:
            result = force_recreate_collection()
            
            success = "sucesso" in result.lower()
            
            logger.info(f"Recriação da coleção: {result}")
            return ChromaDBStatusResponse(
                success=success,
                message=result
            )

        except Exception as e:
            logger.error(f"Erro ao recriar coleção: {str(e)}")
            return ChromaDBStatusResponse(
                success=False,
                message=f"Erro interno: {str(e)}"
            )

    async def delete_database(self) -> ChromaDBStatusResponse:
        """
        Deleta completamente o banco de dados
        """
        try:
            result = delete_chroma_db()
            
            success = "sucesso" in result.lower()
            
            logger.info(f"Delete do banco: {result}")
            return ChromaDBStatusResponse(
                success=success,
                message=result
            )

        except Exception as e:
            logger.error(f"Erro ao deletar banco: {str(e)}")
            return ChromaDBStatusResponse(
                success=False,
                message=f"Erro interno: {str(e)}"
            )

    async def get_collection_status(self) -> ChromaDBStatusResponse:
        """
        Obtém status da coleção
        """
        try:
            data = self.collection.get()
            total_docs = len(data["ids"])
            sample_ids = data["ids"][:5] if data["ids"] else []

            collection_info = ChromaDBCollectionInfo(
                name="pdf_data",
                total_documents=total_docs,
                sample_ids=sample_ids
            )

            return ChromaDBStatusResponse(
                success=True,
                message=f"Coleção ativa com {total_docs} documentos",
                collection_info=collection_info
            )

        except Exception as e:
            logger.error(f"Erro ao obter status: {str(e)}")
            return ChromaDBStatusResponse(
                success=False,
                message=f"Erro interno: {str(e)}"
            )

    async def get_all_documents(self) -> ChromaDBBulkData:
        """
        Retorna todos os documentos da coleção
        """
        try:
            data = self.collection.get()
            
            return ChromaDBBulkData(
                documents=data.get("documents", []),
                metadatas=data.get("metadatas", []),
                ids=data.get("ids", [])
            )

        except Exception as e:
            logger.error(f"Erro ao obter todos os documentos: {str(e)}")
            return ChromaDBBulkData(
                documents=[],
                metadatas=[],
                ids=[]
            )
    def close(self):
        """
        Fecha a conexão com o ChromaDB
        """
        fechar_chromadb()
        logger.info("ChromaDB client fechado com sucesso")
    
    def reinitialize(self):
        """
        Reinicializa a conexão com o ChromaDB
        """
        success = reinicializar_chromadb()
        if success:
            logger.info("ChromaDB reinicializado com sucesso")
        else:
            logger.error("Falha ao reinicializar ChromaDB")
        return success

def get_chromadb_service() -> ChromaDBService:
    """Dependency injection para o serviço do ChromaDB"""
    return ChromaDBService()
