from typing import List, Dict, Optional, Any
import logging
from dataclasses import dataclass
from datetime import datetime
import uuid

from ....infrastructure.chromadb.chroma_cloud import ChromaCloudClient

logger = logging.getLogger(__name__)

@dataclass
class DocumentInput:
    """Estrutura para entrada de documentos"""
    content: str
    metadata: Dict[str, Any] = None
    document_id: str = None

@dataclass
class SearchResult:
    """Estrutura para resultados de busca"""
    document_id: str
    content: str
    metadata: Dict[str, Any]
    score: float

class ChromaCloudService:
    """Serviço de alto nível para operações com ChromaDB Cloud"""
    
    def __init__(self, api_key: str = None, tenant: str = "default_tenant", database: str = "default_database"):
        """
        Inicializa o serviço ChromaDB Cloud
        
        Args:
            api_key: Chave da API do Chroma Cloud
            tenant: Nome do tenant
            database: Nome do database
        """
        self.client = ChromaCloudClient(api_key, tenant, database)
        self.default_collection = "gemelli_knowledge_base"
    
    def initialize_knowledge_base(self, collection_name: str = None) -> bool:
        """
        Inicializa a base de conhecimento principal
        
        Args:
            collection_name: Nome da coleção (usa padrão se não especificado)
            
        Returns:
            True se inicializada com sucesso
        """
        try:
            collection_name = collection_name or self.default_collection
            metadata = {
                "description": "Base de conhecimento principal do GemelliAI",
                "created_at": datetime.now().isoformat(),
                "version": "1.0"
            }
            
            self.client.get_or_create_collection(collection_name, metadata)
            logger.info(f"Base de conhecimento '{collection_name}' inicializada")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao inicializar base de conhecimento: {e}")
            return False
    
    def add_knowledge(self, documents: List[DocumentInput], collection_name: str = None) -> bool:
        """
        Adiciona conhecimento à base
        
        Args:
            documents: Lista de documentos para adicionar
            collection_name: Nome da coleção (usa padrão se não especificado)
            
        Returns:
            True se adicionado com sucesso
        """
        try:
            collection_name = collection_name or self.default_collection
            
            # Prepara os dados
            texts = []
            metadatas = []
            ids = []
            
            for doc in documents:
                texts.append(doc.content)
                
                # Prepara metadados com informações de controle
                metadata = doc.metadata or {}
                metadata.update({
                    "added_at": datetime.now().isoformat(),
                    "content_length": len(doc.content),
                    "source": "gemelli_ai"
                })
                metadatas.append(metadata)
                
                # Gera ID único se não fornecido
                doc_id = doc.document_id or f"doc_{uuid.uuid4().hex}"
                ids.append(doc_id)
            
            # Adiciona ao ChromaDB
            success = self.client.add_documents(
                collection_name=collection_name,
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
            
            if success:
                logger.info(f"Adicionados {len(documents)} documentos à base de conhecimento")
            
            return success
            
        except Exception as e:
            logger.error(f"Erro ao adicionar conhecimento: {e}")
            return False
    
    def search_knowledge(self, query: str, max_results: int = 5, 
                        filters: Dict[str, Any] = None, collection_name: str = None) -> List[SearchResult]:
        """
        Busca conhecimento relevante na base
        
        Args:
            query: Texto da consulta
            max_results: Número máximo de resultados
            filters: Filtros de metadados
            collection_name: Nome da coleção (usa padrão se não especificado)
            
        Returns:
            Lista de resultados encontrados
        """
        try:
            collection_name = collection_name or self.default_collection
            
            results = self.client.query_documents(
                collection_name=collection_name,
                query_texts=[query],
                n_results=max_results,
                where=filters
            )
            
            # Converte para estrutura de resultado
            search_results = []
            
            if results and 'documents' in results and results['documents']:
                documents = results['documents'][0]  # Primeira query
                metadatas = results.get('metadatas', [[]])[0]
                ids = results.get('ids', [[]])[0]
                distances = results.get('distances', [[]])[0]
                
                for i, doc in enumerate(documents):
                    # Converte distância para score (menor distância = maior score)
                    score = 1.0 - (distances[i] if i < len(distances) else 1.0)
                    
                    search_results.append(SearchResult(
                        document_id=ids[i] if i < len(ids) else f"unknown_{i}",
                        content=doc,
                        metadata=metadatas[i] if i < len(metadatas) else {},
                        score=max(0.0, score)  # Garante score não negativo
                    ))
            
            logger.info(f"Busca retornou {len(search_results)} resultados para: '{query}'")
            return search_results
            
        except Exception as e:
            logger.error(f"Erro ao buscar conhecimento: {e}")
            return []
    
    def update_knowledge(self, document_id: str, new_content: str = None, 
                        new_metadata: Dict[str, Any] = None, collection_name: str = None) -> bool:
        """
        Atualiza um documento específico na base
        
        Args:
            document_id: ID do documento a atualizar
            new_content: Novo conteúdo do documento
            new_metadata: Novos metadados do documento
            collection_name: Nome da coleção (usa padrão se não especificado)
            
        Returns:
            True se atualizado com sucesso
        """
        try:
            collection_name = collection_name or self.default_collection
            
            # Prepara metadados com timestamp de atualização
            if new_metadata:
                new_metadata["updated_at"] = datetime.now().isoformat()
            
            success = self.client.update_documents(
                collection_name=collection_name,
                ids=[document_id],
                documents=[new_content] if new_content else None,
                metadatas=[new_metadata] if new_metadata else None
            )
            
            if success:
                logger.info(f"Documento '{document_id}' atualizado com sucesso")
            
            return success
            
        except Exception as e:
            logger.error(f"Erro ao atualizar documento '{document_id}': {e}")
            return False
    
    def delete_knowledge(self, document_ids: List[str], collection_name: str = None) -> bool:
        """
        Remove documentos da base de conhecimento
        
        Args:
            document_ids: Lista de IDs dos documentos a remover
            collection_name: Nome da coleção (usa padrão se não especificado)
            
        Returns:
            True se removidos com sucesso
        """
        try:
            collection_name = collection_name or self.default_collection
            
            success = self.client.delete_documents(
                collection_name=collection_name,
                ids=document_ids
            )
            
            if success:
                logger.info(f"Removidos {len(document_ids)} documentos da base de conhecimento")
            
            return success
            
        except Exception as e:
            logger.error(f"Erro ao remover documentos: {e}")
            return False
    
    def get_knowledge_stats(self, collection_name: str = None) -> Dict[str, Any]:
        """
        Obtém estatísticas da base de conhecimento
        
        Args:
            collection_name: Nome da coleção (usa padrão se não especificado)
            
        Returns:
            Dicionário com estatísticas
        """
        try:
            collection_name = collection_name or self.default_collection
            
            # Conta total de documentos
            total_docs = self.client.get_collection_count(collection_name)
            
            # Visualiza alguns documentos para análise
            sample = self.client.peek_collection(collection_name, limit=5)
            
            # Calcula estatísticas básicas
            stats = {
                "collection_name": collection_name,
                "total_documents": total_docs,
                "sample_documents": len(sample.get('documents', [])) if sample else 0,
                "last_checked": datetime.now().isoformat()
            }
            
            # Adiciona informações dos metadados se disponível
            if sample and 'metadatas' in sample:
                metadatas = sample['metadatas']
                if metadatas:
                    # Conta tipos de fonte
                    sources = {}
                    for meta in metadatas:
                        # Verifica se meta é um dict antes de acessar
                        if isinstance(meta, dict):
                            source = meta.get('source', 'unknown')
                        else:
                            # Se não for dict, tenta converter para string
                            source = str(meta) if meta else 'unknown'
                        sources[source] = sources.get(source, 0) + 1
                    stats["sources"] = sources
            
            logger.info(f"Estatísticas obtidas para '{collection_name}': {total_docs} documentos")
            return stats
            
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas: {e}")
            return {"error": str(e)}
    
    def create_specialized_collection(self, name: str, description: str) -> bool:
        """
        Cria uma coleção especializada para um domínio específico
        
        Args:
            name: Nome da coleção
            description: Descrição do propósito da coleção
            
        Returns:
            True se criada com sucesso
        """
        try:
            metadata = {
                "description": description,
                "created_at": datetime.now().isoformat(),
                "type": "specialized",
                "created_by": "gemelli_ai"
            }
            
            collection = self.client.create_collection(name, metadata)
            logger.info(f"Coleção especializada '{name}' criada")
            return collection is not None
            
        except Exception as e:
            logger.error(f"Erro ao criar coleção especializada '{name}': {e}")
            return False
    
    def list_all_collections(self) -> List[Dict[str, Any]]:
        """
        Lista todas as coleções disponíveis
        
        Returns:
            Lista com informações das coleções
        """
        try:
            collections = self.client.list_collections()
            
            collection_info = []
            for collection in collections:
                # Verifica se é um objeto com atributos ou um dict
                if hasattr(collection, 'name'):
                    # Objeto com atributos
                    name = collection.name
                    metadata = getattr(collection, 'metadata', {}) or {}
                elif isinstance(collection, dict):
                    # Dict
                    name = collection.get('name', 'unknown')
                    metadata = collection.get('metadata', {}) or {}
                else:
                    # String (nome da coleção apenas)
                    name = str(collection)
                    metadata = {}
                
                try:
                    document_count = self.client.get_collection_count(name)
                except Exception as count_error:
                    logger.warning(f"Erro ao contar documentos da coleção '{name}': {count_error}")
                    document_count = 0
                
                info = {
                    "name": name,
                    "metadata": metadata,
                    "document_count": document_count
                }
                collection_info.append(info)
            
            logger.info(f"Listadas {len(collection_info)} coleções")
            return collection_info
            
        except Exception as e:
            logger.error(f"Erro ao listar coleções: {e}")
            return []
    
    def backup_collection(self, collection_name: str, limit: int = None) -> Dict[str, Any]:
        """
        Faz backup dos dados de uma coleção
        
        Args:
            collection_name: Nome da coleção para backup
            limit: Limite de documentos (None para todos)
            
        Returns:
            Dados da coleção para backup
        """
        try:
            # Para backup completo, usa peek com limite alto
            peek_limit = limit or 10000  # Valor alto para pegar mais documentos
            
            backup_data = self.client.peek_collection(collection_name, peek_limit)
            backup_data["backup_timestamp"] = datetime.now().isoformat()
            backup_data["collection_name"] = collection_name
            backup_data["total_count"] = self.client.get_collection_count(collection_name)
            
            logger.info(f"Backup da coleção '{collection_name}' criado")
            return backup_data
            
        except Exception as e:
            logger.error(f"Erro ao fazer backup da coleção '{collection_name}': {e}")
            return {"error": str(e)}