import os
import logging
from typing import List, Dict, Any, Optional
import uuid

from src.infrastructure.pinecone.pinecone import PineconeClient, initialize_pinecone_client

logger = logging.getLogger(__name__)

class PineconeService:
    """Serviço simplificado para gerenciar operações com Pinecone"""
    
    def __init__(self, index_name: str = None):
        """
        Inicializa o serviço Pinecone
        
        Args:
            index_name: Nome do índice (padrão: gemelli-ai)
        """
        self.index_name = index_name or "gemelli-ai"
        self.client = initialize_pinecone_client(self.index_name)
        
        if not self.client:
            raise Exception("Erro ao inicializar cliente Pinecone")
    
    def store_text_service(self, 
                   text: str, 
                   embedding: List[float], 
                   metadata: Dict[str, Any] = None,
                   doc_id: str = None) -> str:
        """
        Armazena um texto com seu embedding
        
        Args:
            text: Texto a ser armazenado
            embedding: Vetor embedding do texto
            metadata: Metadata adicional (opcional)
            doc_id: ID do documento (auto-gerado se não fornecido)
            
        Returns:
            str: ID do documento armazenado
        """
        doc_id = doc_id or str(uuid.uuid4())
        
        vector_data = {
            "id": doc_id,
            "values": embedding,
            "metadata": {
                "text": text,
                **(metadata or {})
            }
        }
        
        success = self.client.upsert_vectors([vector_data])
        if not success:
            raise Exception(f"Erro ao armazenar documento: {doc_id}")
            
        return doc_id
    
    def search_service(self, 
               query_embedding: List[float], 
               top_k: int = 5,
               min_score: float = 0.0) -> List[Dict[str, Any]]:
        """
        Busca textos similares
        
        Args:
            query_embedding: Vetor embedding da consulta
            top_k: Número de resultados
            min_score: Score mínimo
            
        Returns:
            Lista de resultados com id, score, text e metadata
        """
        response = self.client.query_vectors(
            query_vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        if not response or 'matches' not in response:
            return []
        
        results = []
        for match in response['matches']:
            if match['score'] >= min_score:
                results.append({
                    "id": match['id'],
                    "score": match['score'],
                    "text": match['metadata'].get('text', ''),
                    "metadata": match['metadata']
                })
        
        return results
    
    def delete_service(self, doc_id: str) -> bool:
        """
        Deleta um documento
        
        Args:
            doc_id: ID do documento
            
        Returns:
            bool: True se deletado com sucesso
        """
        return self.client.delete_vectors([doc_id])
    
    def clear_all_service(self) -> bool:
        """
        Limpa todos os documentos do índice
        
        Returns:
            bool: True se limpo com sucesso
        """
        return self.client.delete_all_vectors()
    
    def get_stats_service(self) -> Dict[str, Any]:
        """
        Obtém estatísticas do índice
        
        Returns:
            Dict com estatísticas básicas
        """
        stats = self.client.get_index_stats()
        if not stats:
            return {}
            
        return {
            "total_vectors": stats.get("total_vector_count", 0),
            "dimension": stats.get("dimension", 0)
        }


# Armazenar múltiplas instâncias por índice
_pinecone_services: Dict[str, PineconeService] = {}

def get_pinecone_service(index_name: str = "gemelli-ai") -> PineconeService:
    """
    Factory para PineconeService por índice
    
    Args:
        index_name: Nome do índice desejado
        
    Returns:
        PineconeService para o índice especificado
    """
    global _pinecone_services
    
    if index_name not in _pinecone_services:
        _pinecone_services[index_name] = PineconeService(index_name=index_name)
    
    return _pinecone_services[index_name]