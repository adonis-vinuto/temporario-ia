import logging
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Serviço para geração de embeddings usando HuggingFace"""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Inicializa o serviço de embeddings
        
        Args:
            model_name: Nome do modelo HuggingFace (padrão: all-MiniLM-L6-v2)
        """
        try:
            self.model = SentenceTransformer(model_name)
            self.model_name = model_name
            logger.info(f"Modelo de embedding carregado: {model_name}")
        except Exception as e:
            logger.error(f"Erro ao carregar modelo de embedding: {e}")
            raise
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Gera embedding para um texto
        
        Args:
            text: Texto para gerar embedding
            
        Returns:
            Lista de floats representando o embedding
        """
        try:
            # Normalizar o texto
            text = text.strip()
            if not text:
                raise ValueError("Texto vazio não pode ser processado")
            
            # Gerar embedding
            embedding = self.model.encode(text)
            
            # Converter para lista de floats
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f"Erro ao gerar embedding: {e}")
            raise
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Gera embeddings para múltiplos textos
        
        Args:
            texts: Lista de textos
            
        Returns:
            Lista de embeddings
        """
        try:
            # Filtrar textos vazios
            valid_texts = [text.strip() for text in texts if text and text.strip()]
            
            if not valid_texts:
                raise ValueError("Nenhum texto válido para processar")
            
            # Gerar embeddings em lote
            embeddings = self.model.encode(valid_texts)
            
            # Converter para lista de listas de floats
            return [embedding.tolist() for embedding in embeddings]
            
        except Exception as e:
            logger.error(f"Erro ao gerar embeddings em lote: {e}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """
        Retorna a dimensão dos embeddings do modelo
        
        Returns:
            Dimensão dos embeddings
        """
        return self.model.get_sentence_embedding_dimension()


# Instância singleton do serviço
_embedding_service = None

def get_embedding_service() -> EmbeddingService:
    """Dependency injector para EmbeddingService"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
