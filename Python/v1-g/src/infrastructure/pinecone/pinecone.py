import os
from typing import List, Dict, Any, Optional
from pinecone import Pinecone, ServerlessSpec
import logging
from src.infrastructure.config.settings_config import settings

logger = logging.getLogger(__name__)

class PineconeClient:
    """Cliente para gerenciar operações com Pinecone Vector Database"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializa o cliente Pinecone
        
        Args:
            api_key: Chave da API do Pinecone (se não fornecida, busca no settings)
        """
        self.api_key = api_key or settings.PINECONE_API_KEY
        
        if not self.api_key or self.api_key == "your_pinecone_api_key":
            raise ValueError("API key do Pinecone é obrigatória. Configure PINECONE_API_KEY no arquivo .env")
        
        try:
            self.pc = Pinecone(api_key=self.api_key)
            self.index = None
            logger.info("Cliente Pinecone inicializado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao inicializar cliente Pinecone: {e}")
            raise ValueError(f"Erro ao inicializar Pinecone: {e}")
        
    def create_index(self, index_name: str, dimension: int, metric: str = "cosine") -> bool:
        """
        Cria um novo índice no Pinecone
        
        Args:
            index_name: Nome do índice
            dimension: Dimensão dos vetores
            metric: Métrica de similaridade (cosine, euclidean, dotproduct)
            
        Returns:
            bool: True se criado com sucesso
        """
        try:
            if index_name not in self.pc.list_indexes().names():
                self.pc.create_index(
                    name=index_name,
                    dimension=dimension,
                    metric=metric,
                    spec=ServerlessSpec(
                        cloud='aws',
                        region='us-east-1'
                    )
                )
                logger.info(f"Índice '{index_name}' criado com sucesso")
                return True
            else:
                logger.info(f"Índice '{index_name}' já existe")
                return True
        except Exception as e:
            logger.error(f"Erro ao criar índice: {e}")
            return False
    
    def connect_to_index(self, index_name: str) -> bool:
        """
        Conecta a um índice existente
        
        Args:
            index_name: Nome do índice
            
        Returns:
            bool: True se conectado com sucesso
        """
        try:
            self.index = self.pc.Index(index_name)
            logger.info(f"Conectado ao índice '{index_name}'")
            return True
        except Exception as e:
            logger.error(f"Erro ao conectar ao índice: {e}")
            return False
    
    def upsert_vectors(self, vectors: List[Dict[str, Any]], namespace: str = "") -> bool:
        """
        Insere ou atualiza vetores no índice
        
        Args:
            vectors: Lista de vetores no formato {"id": str, "values": List[float], "metadata": Dict}
            namespace: Namespace para organizar os vetores
            
        Returns:
            bool: True se inserido com sucesso
        """
        if not self.index:
            logger.error("Nenhum índice conectado")
            return False
        
        try:
            response = self.index.upsert(vectors=vectors, namespace=namespace)
            logger.info(f"Vetores inseridos: {response['upserted_count']}")
            return True
        except Exception as e:
            logger.error(f"Erro ao inserir vetores: {e}")
            return False
    
    def query_vectors(self, 
                     query_vector: List[float], 
                     top_k: int = 10, 
                     namespace: str = "",
                     filter_dict: Optional[Dict] = None,
                     include_metadata: bool = True) -> Optional[Dict]:
        """
        Busca vetores similares
        
        Args:
            query_vector: Vetor de consulta
            top_k: Número de resultados mais similares
            namespace: Namespace para buscar
            filter_dict: Filtros de metadata
            include_metadata: Se deve incluir metadata nos resultados
            
        Returns:
            Dict com os resultados da busca
        """
        if not self.index:
            logger.error("Nenhum índice conectado")
            return None
        
        try:
            response = self.index.query(
                vector=query_vector,
                top_k=top_k,
                namespace=namespace,
                filter=filter_dict,
                include_metadata=include_metadata,
                include_values=True
            )
            return response
        except Exception as e:
            logger.error(f"Erro na consulta: {e}")
            return None
    
    def delete_vectors(self, ids: List[str], namespace: str = "") -> bool:
        """
        Deleta vetores por ID
        
        Args:
            ids: Lista de IDs para deletar
            namespace: Namespace dos vetores
            
        Returns:
            bool: True se deletado com sucesso
        """
        if not self.index:
            logger.error("Nenhum índice conectado")
            return False
        
        try:
            self.index.delete(ids=ids, namespace=namespace)
            logger.info(f"Vetores deletados: {len(ids)}")
            return True
        except Exception as e:
            logger.error(f"Erro ao deletar vetores: {e}")
            return False
    
    def delete_all_vectors(self, namespace: str = "") -> bool:
        """
        Deleta todos os vetores de um namespace
        
        Args:
            namespace: Namespace para limpar
            
        Returns:
            bool: True se deletado com sucesso
        """
        if not self.index:
            logger.error("Nenhum índice conectado")
            return False
        
        try:
            self.index.delete(delete_all=True, namespace=namespace)
            logger.info(f"Todos os vetores do namespace '{namespace}' foram deletados")
            return True
        except Exception as e:
            logger.error(f"Erro ao deletar todos os vetores: {e}")
            return False
    
    def get_index_stats(self, namespace: str = "") -> Optional[Dict]:
        """
        Obtém estatísticas do índice
        
        Args:
            namespace: Namespace específico (opcional)
            
        Returns:
            Dict com estatísticas do índice
        """
        if not self.index:
            logger.error("Nenhum índice conectado")
            return None
        
        try:
            stats = self.index.describe_index_stats()
            return stats
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas: {e}")
            return None
    
    def list_indexes(self) -> List[str]:
        """
        Lista todos os índices disponíveis
        
        Returns:
            Lista de nomes dos índices
        """
        try:
            return self.pc.list_indexes().names()
        except Exception as e:
            logger.error(f"Erro ao listar índices: {e}")
            return []
    
    def delete_index(self, index_name: str) -> bool:
        """
        Deleta um índice
        
        Args:
            index_name: Nome do índice para deletar
            
        Returns:
            bool: True se deletado com sucesso
        """
        try:
            self.pc.delete_index(index_name)
            logger.info(f"Índice '{index_name}' deletado com sucesso")
            return True
        except Exception as e:
            logger.error(f"Erro ao deletar índice: {e}")
            return False

# Função utilitária para inicializar cliente
def initialize_pinecone_client(index_name: str = "gemelli-ai") -> Optional[PineconeClient]:
    """
    Inicializa e conecta o cliente Pinecone
    
    Args:
        index_name: Nome do índice para conectar
        
    Returns:
        PineconeClient conectado ou None se falhar
    """
    try:
        logger.info(f"Inicializando cliente Pinecone para índice: {index_name}")
        
        # Criar cliente
        client = PineconeClient()
        
        # Verificar se índice existe, se não, criar
        if index_name not in client.pc.list_indexes().names():
            logger.info(f"Índice {index_name} não existe, criando...")
            success = client.create_index(index_name, dimension=384)  # 384 para sentence-transformers
            if not success:
                logger.error(f"Falha ao criar índice {index_name}")
                return None
        
        # Conectar ao índice
        if client.connect_to_index(index_name):
            logger.info(f"Cliente Pinecone conectado ao índice {index_name}")
            return client
        else:
            logger.error(f"Falha ao conectar ao índice {index_name}")
            return None
            
    except Exception as e:
        logger.error(f"Erro ao inicializar cliente Pinecone: {e}")
        return None