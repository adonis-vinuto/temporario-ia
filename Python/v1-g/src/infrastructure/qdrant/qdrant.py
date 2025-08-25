import qdrant_client
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.models import VectorParams, Distance
import logging
from src.infrastructure.config.settings_config import settings
import uuid
from src.domain.enum.index_type_enum import IndexTypeEnum

logger = logging.getLogger(__name__)

class Qdrant:
    """Cliente para interações com o Qdrant"""
    def __init__(self):
        try:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY
            )
            logger.info("Qdrant client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Qdrant client: {e}")
            raise

    def list_collections(self):
        """Lista todas as coleções existentes no Qdrant"""
        try:
            collections = self.client.get_collections()
            return collections.collections
        except Exception as e:
            logger.error(f"Erro ao listar coleções: {e}")
            raise
        
    def create_collection(self, collection_name: str, vector_size: int = 384):
        """
        Cria uma nova coleção no Qdrant.
        
        Args:
            collection_name: Nome da coleção a ser criada.
            vector_size: Tamanho dos vetores que serão armazenados.
        """
        try:
            vectors_config = VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
            
            self.client.recreate_collection(
                collection_name=collection_name,
                vectors_config=vectors_config
            )
            logger.info(f"Collection '{collection_name}' created successfully")
        except Exception as e:
            logger.error(f"Error creating collection {collection_name}: {e}")
            raise

    def add_documents(self, collection_name: str, documents: list):
        """
        Adds a list of documents to the specified Qdrant collection.
        Each document should be a dictionary containing:
            - 'id': Unique identifier for the document.
            - 'vector': The vector representation of the document.
            - 'metadata' (optional): Additional metadata as a dictionary.
        Args:
            collection_name (str): The name of the Qdrant collection to add documents to.
            documents (list): A list of document dictionaries to be added.
        Raises:
            Exception: If an error occurs while adding documents to the collection.
        Logs:
            - A warning if the documents list is empty.
            - An info message upon successful addition.
            - An error message if an exception occurs.
        """
        try:
            if not documents:
                logger.warning("No documents to add")
                return
            
            # Convert documents to Qdrant PointStruct format
            points = [
                models.PointStruct(
                    id=doc['id'],
                    vector=doc['vector'],
                    payload=doc.get('metadata', {})
                ) for doc in documents
            ]
            self.client.upsert(
                collection_name=collection_name,
                points=points
            )
            logger.info(f"Added {len(documents)} documents to collection {collection_name}")
        except Exception as e:
            logger.error(f"Error adding documents to collection {collection_name}: {e}")
            raise
            
    def search(self, collection_name: str, query_vector: list, limit: int = 3):
        """
        Realiza uma busca na coleção especificada usando o vetor de consulta fornecido.

        Args:
            collection_name (str): Nome da coleção no Qdrant.
            query_vector (list): Vetor de consulta para busca de similaridade.
            limit (int, opcional): Número máximo de resultados a serem retornados. Padrão é 10.

        Returns:
            list: Resultados da busca retornados pelo Qdrant.

        Raises:
            Exception: Se ocorrer um erro durante a busca, a exceção é registrada e relançada.
        """
        try:
            search_result = self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit
            )
            return search_result
        except Exception as e:
            logger.error(f"Error searching in collection {collection_name}: {e}")
            raise
        
    def scroll_by_metadata(self, collection_name: str, filters: dict, limit: int = 50):
        """
        Realiza uma busca por metadados usando o método scroll.
        
        Args:
            collection_name (str): Nome da coleção.
            filters (dict): Dicionário com chave e valor dos metadados a serem filtrados.
            limit (int): Número máximo de resultados.
        
        Returns:
            list: Lista de pontos encontrados que correspondem aos metadados.
        """
        try:
            conditions = [
                models.FieldCondition(
                    key=key,
                    match=models.MatchValue(value=value)
                ) for key, value in filters.items()
            ]

            filtro = models.Filter(must=conditions)

            result = self.client.scroll(
                collection_name=collection_name,
                scroll_filter=filtro,
                limit=limit
            )

            logger.info(f"{len(result[0])} documentos encontrados por metadados em '{collection_name}'")
            return result[0]  # Retorna apenas os pontos
        except Exception as e:
            logger.error(f"Erro ao realizar scroll por metadados em {collection_name}: {e}")
            raise
    def retrieve_point_by_id(self, collection_name: str, point_id: str):
        """
        Busca um ponto no Qdrant pela sua ID diretamente, sem filtro de metadados.

        Args:
            client (Qdrant): Instância do seu cliente Qdrant.
            collection_name (str): Nome da coleção.
            point_id (str): ID do ponto (UUID ou inteiro).

        Returns:
            dict ou None: Dados do ponto encontrado, ou None se não existir.
        """
        try:
            point_id_str = str(uuid.UUID(point_id))
            point = self.client.retrieve(
                collection_name=collection_name,
                ids=[point_id_str]
            )
            if point:
                logger.info(f"Ponto encontrado: {point_id}")
                return point
            else:
                logger.info(f"Ponto não encontrado: {point_id}")
                return None
        except Exception as e:
            logger.error(f"Erro ao buscar ponto {point_id} na coleção {collection_name}: {e}")
            return None
        
    def search_with_filter(self, collection_name, filter, limit: int = 5):
        return self.client.search(
            collection_name=collection_name,
            query_vector=[0.0]*384,
            query_filter=filter,  # Já é um Filter, não precisa do models.Filter()
            limit=limit
        )

    def create_index(self, collection_name: str, index_name: str, index_type: IndexTypeEnum):
        """
        Cria um índice do tipo especificado na coleção.
        Necessário para permitir busca por filtro nesse campo.
        """
        try:
            existing_indexes = self.client.get_collection(collection_name).payload_schema
            if index_name in existing_indexes:
                logger.warning(f"O índice '{index_name}' já existe na coleção '{collection_name}'")
                return

            self.client.create_payload_index(
                collection_name=collection_name,
                field_name=index_name,
                field_schema=index_type.to_qdrant_type()
            )
            logger.info(f"Índice criado com sucesso para o campo '{index_name}' na coleção '{collection_name}'")
        except Exception as e:
            logger.error(f"Erro ao criar índice para '{index_name}' na coleção {collection_name}: {e}")
            raise
    
    def recreate_index(self, collection_name: str, index_name: str, index_type: IndexTypeEnum):
        try:
            self.client.delete_payload_index(collection_name=collection_name, field_name=index_name)
            logger.info(f"Índice '{index_name}' removido com sucesso da coleção '{collection_name}'")
        except Exception as e:
            logger.warning(f"Não foi possível deletar índice '{index_name}' (talvez não exista): {e}")

        self.create_index(collection_name, index_name, index_type)


def initialize_qdrant_client(collection_name: str) -> Qdrant:
    """
    Initializes the Qdrant client with the necessary configuration.
    """
    try:
        logger.info("Initializing Qdrant client")
        client = Qdrant()   
        if collection_name:
            collections = [col.name for col in client.list_collections()]
            if collection_name not in collections:
                logger.info(f"Creating collection: {collection_name}")
                client.create_collection(collection_name, vector_size=384)
        return client
    
    except Exception as e:
        logger.error(f"Error initializing Qdrant client: {e}")
        raise