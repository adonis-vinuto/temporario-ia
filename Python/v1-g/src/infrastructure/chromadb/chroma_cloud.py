import chromadb
from chromadb.config import Settings
import os
from typing import List, Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)

class ChromaCloudClient:
    """Cliente para interagir com ChromaDB Cloud"""
    
    def __init__(self, api_key: str = None, tenant: str = "default_tenant", database: str = "default_database"):
        """
        Inicializa o cliente ChromaDB Cloud
        
        Args:
            api_key: Chave da API do Chroma Cloud
            tenant: Nome do tenant
            database: Nome do database
        """
        self.api_key = api_key or os.getenv("CHROMA_CLOUD_API_KEY")
        self.tenant = tenant
        self.database = database
        
        if not self.api_key:
            raise ValueError("API key é obrigatória. Configure CHROMA_CLOUD_API_KEY ou passe como parâmetro.")
        
        # Para ChromaDB Cloud, use este formato:
        try:
            self.client = chromadb.CloudClient(
                tenant=self.tenant,
                database=self.database,
                api_key=self.api_key
            )
            logger.info(f"Cliente ChromaDB Cloud inicializado para tenant '{self.tenant}' e database '{self.database}'")
        except Exception as e:
            logger.error(f"Erro ao inicializar cliente ChromaDB Cloud: {e}")
            # Fallback para HttpClient se CloudClient não estiver disponível
            try:
                self.client = chromadb.HttpClient(
                    host="api.trychroma.com",
                    port=443,
                    ssl=True,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    settings=Settings(anonymized_telemetry=False)
                )
                logger.info("Usando HttpClient como fallback")
            except Exception as e2:
                logger.error(f"Erro também no fallback HttpClient: {e2}")
                raise
    
    def create_collection(self, name: str, metadata: Dict[str, Any] = None) -> Any:
        """
        Cria uma nova coleção
        
        Args:
            name: Nome da coleção
            metadata: Metadados opcionais para a coleção
        
        Returns:
            Objeto da coleção criada
        """
        try:
            collection = self.client.create_collection(
                name=name,
                metadata=metadata or {}
            )
            logger.info(f"Coleção '{name}' criada com sucesso")
            return collection
        except Exception as e:
            logger.error(f"Erro ao criar coleção '{name}': {e}")
            raise
    
    def get_collection(self, name: str) -> Any:
        """
        Obtém uma coleção existente
        
        Args:
            name: Nome da coleção
        
        Returns:
            Objeto da coleção
        """
        try:
            collection = self.client.get_collection(name=name)
            logger.info(f"Coleção '{name}' obtida com sucesso")
            return collection
        except Exception as e:
            logger.error(f"Erro ao obter coleção '{name}': {e}")
            raise
    
    def get_or_create_collection(self, name: str, metadata: Dict[str, Any] = None) -> Any:
        """
        Obtém uma coleção existente ou cria uma nova
        
        Args:
            name: Nome da coleção
            metadata: Metadados opcionais para a coleção
        
        Returns:
            Objeto da coleção
        """
        try:
            collection = self.client.get_or_create_collection(
                name=name,
                metadata=metadata or {}
            )
            logger.info(f"Coleção '{name}' obtida/criada com sucesso")
            return collection
        except Exception as e:
            logger.error(f"Erro ao obter/criar coleção '{name}': {e}")
            raise
    
    def delete_collection(self, name: str) -> bool:
        """
        Deleta uma coleção
        
        Args:
            name: Nome da coleção
        
        Returns:
            True se deletada com sucesso
        """
        try:
            self.client.delete_collection(name=name)
            logger.info(f"Coleção '{name}' deletada com sucesso")
            return True
        except Exception as e:
            logger.error(f"Erro ao deletar coleção '{name}': {e}")
            return False
    
    def list_collections(self) -> List[Any]:
        """
        Lista todas as coleções
        
        Returns:
            Lista de coleções
        """
        try:
            collections = self.client.list_collections()
            logger.info(f"Listadas {len(collections)} coleções")
            
            # Garantir que retornamos uma lista de objetos válidos
            validated_collections = []
            for collection in collections:
                try:
                    # Verifica se é um objeto válido
                    if hasattr(collection, 'name') or isinstance(collection, dict) or isinstance(collection, str):
                        validated_collections.append(collection)
                    else:
                        logger.warning(f"Coleção com formato inesperado: {type(collection)} - {collection}")
                except Exception as col_error:
                    logger.warning(f"Erro ao processar coleção: {col_error}")
                    continue
            
            return validated_collections
            
        except Exception as e:
            logger.error(f"Erro ao listar coleções: {e}")
            return []
    
    def add_documents(self, collection_name: str, documents: List[str], 
                     metadatas: List[Dict] = None, ids: List[str] = None) -> bool:
        """
        Adiciona documentos a uma coleção
        
        Args:
            collection_name: Nome da coleção
            documents: Lista de documentos de texto
            metadatas: Lista de metadados para cada documento
            ids: Lista de IDs únicos para cada documento
        
        Returns:
            True se adicionados com sucesso
        """
        try:
            collection = self.get_collection(collection_name)
            
            # Gera IDs automáticos se não fornecidos
            if not ids:
                ids = [f"doc_{i}" for i in range(len(documents))]
            
            collection.add(
                documents=documents,
                metadatas=metadatas or [{}] * len(documents),
                ids=ids
            )
            logger.info(f"Adicionados {len(documents)} documentos à coleção '{collection_name}'")
            return True
        except Exception as e:
            logger.error(f"Erro ao adicionar documentos à coleção '{collection_name}': {e}")
            return False
    
    def query_documents(self, collection_name: str, query_texts: List[str], 
                       n_results: int = 5, where: Dict = None) -> Dict:
        """
        Faz consulta por similaridade em uma coleção
        
        Args:
            collection_name: Nome da coleção
            query_texts: Lista de textos para busca
            n_results: Número de resultados a retornar
            where: Filtros de metadados
        
        Returns:
            Resultados da busca
        """
        try:
            collection = self.get_collection(collection_name)
            
            results = collection.query(
                query_texts=query_texts,
                n_results=n_results,
                where=where
            )
            logger.info(f"Consulta realizada na coleção '{collection_name}' com {len(query_texts)} queries")
            return results
        except Exception as e:
            logger.error(f"Erro ao consultar coleção '{collection_name}': {e}")
            return {}
    
    def update_documents(self, collection_name: str, ids: List[str], 
                        documents: List[str] = None, metadatas: List[Dict] = None) -> bool:
        """
        Atualiza documentos em uma coleção
        
        Args:
            collection_name: Nome da coleção
            ids: Lista de IDs dos documentos a atualizar
            documents: Novos textos dos documentos
            metadatas: Novos metadados dos documentos
        
        Returns:
            True se atualizados com sucesso
        """
        try:
            collection = self.get_collection(collection_name)
            
            collection.update(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            logger.info(f"Atualizados {len(ids)} documentos na coleção '{collection_name}'")
            return True
        except Exception as e:
            logger.error(f"Erro ao atualizar documentos na coleção '{collection_name}': {e}")
            return False
    
    def delete_documents(self, collection_name: str, ids: List[str]) -> bool:
        """
        Deleta documentos de uma coleção
        
        Args:
            collection_name: Nome da coleção
            ids: Lista de IDs dos documentos a deletar
        
        Returns:
            True se deletados com sucesso
        """
        try:
            collection = self.get_collection(collection_name)
            
            collection.delete(ids=ids)
            logger.info(f"Deletados {len(ids)} documentos da coleção '{collection_name}'")
            return True
        except Exception as e:
            logger.error(f"Erro ao deletar documentos da coleção '{collection_name}': {e}")
            return False
    
    def get_collection_count(self, collection_name: str) -> int:
        """
        Obtém o número de documentos em uma coleção
        
        Args:
            collection_name: Nome da coleção
        
        Returns:
            Número de documentos
        """
        try:
            collection = self.get_collection(collection_name)
            count = collection.count()
            logger.info(f"Coleção '{collection_name}' tem {count} documentos")
            return count
        except Exception as e:
            logger.error(f"Erro ao contar documentos na coleção '{collection_name}': {e}")
            return 0
    
    def get_heartbeat(self) -> Dict[str, Any]:
        """
        Verifica a conectividade com ChromaDB Cloud
        
        Returns:
            Informações sobre o status da conexão
        """
        try:
            # Tenta fazer uma operação simples para verificar conectividade
            collections = self.client.list_collections()
            
            # Conta coleções de forma segura
            collections_count = 0
            if collections:
                collections_count = len(collections)
            
            return {
                "status": "connected",
                "collections_count": collections_count,
                "tenant": self.tenant,
                "database": self.database
            }
        except Exception as e:
            logger.error(f"Erro no heartbeat: {e}")
            return {
                "status": "disconnected",
                "error": str(e),
                "tenant": self.tenant,
                "database": self.database
            }

    def peek_collection(self, collection_name: str, limit: int = 10) -> Dict:
        """
        Visualiza alguns documentos de uma coleção
        
        Args:
            collection_name: Nome da coleção
            limit: Número de documentos a visualizar
        
        Returns:
            Amostra de documentos da coleção
        """
        try:
            collection = self.get_collection(collection_name)
            result = collection.peek(limit=limit)
            logger.info(f"Visualizados {limit} documentos da coleção '{collection_name}'")
            return result
        except Exception as e:
            logger.error(f"Erro ao visualizar coleção '{collection_name}': {e}")
            return {}