"""
Inicializador para limpeza automática de arquivos ChromaDB órfãos
"""
from src.infrastructure.chromadb.smart_cleanup import cleanup_old_chromadb_folders
import logging

logger = logging.getLogger(__name__)

def initialize_chromadb_cleanup():
    """
    Função para ser chamada na inicialização da aplicação
    """
    try:
        logger.info("Iniciando limpeza de pastas ChromaDB antigas...")
        removed_count = cleanup_old_chromadb_folders(max_age_hours=1)  # Remove pastas com mais de 1 hora
        
        if removed_count > 0:
            logger.info(f"Limpeza inicial: {removed_count} pastas antigas removidas")
        else:
            logger.info("Limpeza inicial: nenhuma pasta antiga encontrada")
            
    except Exception as e:
        logger.warning(f"Erro na limpeza inicial: {e}")

# Auto-executar quando o módulo for importado
try:
    initialize_chromadb_cleanup()
except:
    pass  # Falha silenciosa para não quebrar a inicialização
