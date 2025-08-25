import logging
import sys
from src.infrastructure.config.settings_config import settings
from src.infrastructure.logging.secure_logger import SecureLogger

class LoggingConfigurator:
    """Classe responsável por configurar o sistema de logging."""

    def __init__(self, log_level: str = None):
        self.log_level = getattr(logging, (log_level or settings.LOG_LEVEL).upper(), logging.INFO)
        self.log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    def configure(self):
        """Aplica a configuração de logging."""
        logging.basicConfig(
            level=self.log_level,
            format=self.log_format,
            handlers=[
                logging.StreamHandler(sys.stdout),
                # logging.FileHandler("app.log", encoding="utf-8")
            ]
        )

        # Ajusta o nível de bibliotecas externas
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("httpcore").setLevel(logging.WARNING)
        logging.getLogger("langchain").setLevel(logging.INFO)
        
        # NOVO: Desabilita logs sensíveis de bibliotecas
        logging.getLogger("groq").setLevel(logging.WARNING)
        logging.getLogger("sendgrid").setLevel(logging.WARNING)

        logger = logging.getLogger(__name__)
        logger.info("Sistema de logging configurado com sucesso")

# ATUALIZADO: Retorna logger seguro
def get_logger(name: str) -> SecureLogger:
    """Retorna instância de logger seguro com sanitização automática."""
    return SecureLogger(name)