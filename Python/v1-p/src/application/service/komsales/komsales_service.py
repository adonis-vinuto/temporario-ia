from src.agent.base_agent import BaseAgent
from src.agent.komsales.komsales_agent import create_agent_executor as create_komsales_runnable
from src.infrastructure.config.logging_config import get_logger
from src.infrastructure.helpers.usage_helper import create_empty_usage

logger = get_logger(__name__)

class KomSalesService:
    """
    Serviço específico para o agente Komsales.
    Cria e usa o agente diretamente, sem factory, cache ou IDs.
    """
    
    def __init__(self):
        # Cria o agente Komsales diretamente
        agent_executor = create_komsales_runnable()
        self.agent = BaseAgent(agent_executor)
        
    async def chat(self, user_input: str, chat_history: list = None) -> dict:
        """
        Executa chat com o agente Komsales.
        
        Args:
            user_input: Mensagem do usuário
            chat_history: Histórico de conversa (opcional)
            
        Returns:
            Resposta do agente com dados de uso
        """
        if chat_history is None:
            chat_history = []
            
        logger.info(f"Iniciando chat Komsales: {user_input[:50]}...")
        
        try:
            # Executa o chat diretamente
            response = await self.agent.chat(user_input, chat_history)
            logger.info("Chat Komsales executado com sucesso")
            
            return response
            
        except Exception as e:
            logger.error(f"Erro no chat Komsales: {str(e)}")
            return {
                "output": f"Ocorreu um erro durante o processamento: {str(e)}",
                "usage": create_empty_usage()
            }


def get_komsales_service() -> KomSalesService:
    """
    Factory function para injeção de dependência do KomSalesService.
    
    Returns:
        Instância configurada do KomSalesService
    """
    return KomSalesService()
