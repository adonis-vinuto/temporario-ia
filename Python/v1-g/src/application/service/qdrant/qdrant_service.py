from src.infrastructure.qdrant.qdrant import Qdrant, initialize_qdrant_client
import logging
from typing import List, Dict, Any
from qdrant_client.http import models

logger = logging.getLogger(__name__)

class QdrantService:
    def __init__(self, collection_name: str = None):
        try:
            self.collection_name = collection_name
            self.client = initialize_qdrant_client(self.collection_name)
        except Exception as e:
            logger.error(f"Error initializing QdrantService: {e}")
            raise
        
    def create_collection_service(self, vector_size: int):
        """
        Cria uma coleção no Qdrant com o nome especificado.
        
        Args:
            vector_size: Tamanho dos vetores a serem armazenados na coleção.
        
        Raises:
            Exception: Se ocorrer um erro ao criar a coleção.
        """
        try:
            self.client.create_collection(self.collection_name, vector_size)
            logger.info(f"Coleção '{self.collection_name}' criada com sucesso")
        except Exception as e:
            logger.error(f"Erro ao criar coleção {self.collection_name}: {e}")
            raise

    def add_documents_service(self, documents: List[Dict[str, Any]]):
        """
        Adiciona documentos à coleção especificada.
        
        Args:
            documents: Lista de documentos a serem adicionados, cada um deve conter 'id', 'vector' e 'metadata'.
        
        Raises:
            Exception: Se ocorrer um erro ao adicionar os documentos.
        """
        try:
            self.client.add_documents(self.collection_name, documents)
            logger.info(f"{len(documents)} documentos adicionados à coleção '{self.collection_name}'")
        except Exception as e:
            logger.error(f"Erro ao adicionar documentos à coleção {self.collection_name}: {e}")
            raise
        
    def search_service(self, query_vector: List[float], limit: int = 10):
        """
        Realiza uma busca na coleção especificada usando o vetor de consulta fornecido.
        
        Args:
            query_vector: Vetor de consulta para busca de similaridade.
            limit: Número máximo de resultados a serem retornados. Padrão é 10.
        
        Returns:
            List[Dict[str, Any]]: Resultados da busca.
        
        Raises:
            Exception: Se ocorrer um erro durante a busca.
        """
        try:
            results = self.client.search(self.collection_name, query_vector, limit)
            return results
        except Exception as e:
            logger.error(f"Erro ao buscar na coleção {self.collection_name}: {e}")
            raise
      
    def search_by_metadata_service(self, filters: Dict[str, Any], limit: int = 50):
        """
        Serviço que busca documentos com base em metadados.
        
        Args:
            filters: Dicionário com os metadados desejados (ex: {"empresa": "EmpresaX"})
            limit: Quantidade de resultados desejada.
        
        Returns:
            Lista de documentos que batem com os metadados.
        """
        try:
            results = self.client.scroll_by_metadata(self.collection_name, filters, limit)
            return results
        except Exception as e:
            logger.error(f"Erro ao buscar por metadados em '{self.collection_name}': {e}")
            raise
    
    def retrieve_point_by_id_service(self, point_id: str):
        """
        Recupera um ponto específico da coleção pelo ID.
        
        Args:
            point_id: ID do ponto a ser recuperado.
        
        Returns:
            Dict[str, Any]: Ponto encontrado ou None se não encontrado.
        
        Raises:
            Exception: Se ocorrer um erro ao recuperar o ponto.
        """
        try:
            point = self.client.retrieve_point_by_id(self.collection_name, point_id)
            return point
        except Exception as e:
            logger.error(f"Erro ao recuperar ponto {point_id} na coleção {self.collection_name}: {e}")
            raise
        
    def search_with_filter_service(self, filter: dict, limit: int = 5):
        return self.client.search_with_filter(self.collection_name, filter, limit)
    
    def create_index_service(self, index_name: str, index_type: int):
        """
        Cria um índice na coleção para permitir busca por filtro.
        
        Args:
            index_name: Nome do índice a ser criado.
            index_type: Tipo do índice (ex: "keyword").
        
        Raises:
            Exception: Se ocorrer um erro ao criar o índice.
        """
        try:
            self.client.create_index(self.collection_name, index_name, index_type)
            logger.info(f"Índice '{index_name}' criado com sucesso na coleção '{self.collection_name}'")
        except Exception as e:
            logger.error(f"Erro ao criar índice {index_name} na coleção {self.collection_name}: {e}")
            raise  
        
    def recreate_index_service(self, index_name: str, index_type: int):
        """
        Recria um índice na coleção, removendo o existente e criando um novo.
        
        Args:
            index_name: Nome do índice a ser recriado.
            index_type: Tipo do índice (ex: "keyword").
        
        Raises:
            Exception: Se ocorrer um erro ao recriar o índice.
        """
        try:
            self.client.recreate_index(self.collection_name, index_name, index_type)
            logger.info(f"Índice '{index_name}' recriado com sucesso na coleção '{self.collection_name}'")
        except Exception as e:
            logger.error(f"Erro ao recriar índice {index_name} na coleção {self.collection_name}: {e}")
            raise

def get_qdrant_service(collection_name: str = None) -> QdrantService:
    """
    Dependency para obter instância do QdrantService.
    
    Args:
        collection_name: Nome da coleção a ser usada. Se não especificado, usa a coleção padrão.
    
    Returns:
        QdrantService: Instância do serviço Qdrant.
    """
    return QdrantService(collection_name)