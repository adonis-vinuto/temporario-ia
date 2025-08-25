from src.agent.base_agent_file import BaseAgent, get_base_agent
from src.domain.schema.agent.chat_schema import ChatRequest, ChatResponse, Usage


class AgentChatFileService:
    """
    Service responsável por processar chat com agente de arquivos.
    """
    
    def __init__(self):
        self.base_agent: BaseAgent = None
    
    async def process_chat(self, chat_request: ChatRequest, id_agent: str) -> ChatResponse:
        """
        Processa uma mensagem de chat usando o base_agent_file.
        
        Args:
            chat_request: Dados da requisição de chat
            id_agent: ID do agente a ser utilizado
            
        Returns:
            ChatResponse: Resposta formatada do agente
        """
        # Obtém a instância do BaseAgent
        self.base_agent = get_base_agent(id_agent)
        
        # Processa a mensagem através do agente
        response = await self.base_agent.chat(chat_request.message)
        
        # Extrai a resposta e usage do retorno
        message_response = response.get("output", "")
        usage = response.get("usage", Usage())
        
        # Retorna a resposta formatada
        return ChatResponse(
            message_response=message_response,
            usage=usage
        )
    
    async def simple_chat(self, user_input: str, id_agent: str = "default") -> dict:
        """
        Método simplificado para chat direto com input de texto.
        
        Args:
            user_input: Mensagem do usuário
            id_agent: ID do agente (padrão: "default")
            
        Returns:
            dict: Resposta bruta do agente
        """
        # Obtém a instância do BaseAgent
        self.base_agent = get_base_agent(id_agent)
        
        # Processa a mensagem e retorna a resposta
        return await self.base_agent.chat(user_input)


def get_agent_chat_file_service() -> AgentChatFileService:
    """
    Factory function para criar instância do service.
    """
    return AgentChatFileService()