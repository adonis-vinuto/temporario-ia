from enum import IntEnum

class AgentTypeEnum(IntEnum):
    """
    Enumeração dos tipos de agentes disponíveis na aplicação.
    
    - STANDARD: Agente padrão baseado em LLM genérica.
    - PEOPLE_TWILIO: Agente voltado para o módulo People integrado ao Twilio (em desenvolvimento).
    - KOMSALES: Agente especializado no módulo de vendas KomSales (em desenvolvimento).
    """
    STANDARD = 0
    PEOPLE_TWILIO = 1
    KOMSALES = 2

    def description(self) -> str:
        """Retorna uma descrição legível para cada tipo de agente."""
        descriptions = {
            self.STANDARD: "Agente padrão (LLM genérica)",
            self.PEOPLE_TWILIO: "Agente People integrado com Twilio",
            self.KOMSALES: "Agente KomSales (módulo de vendas)"
        }
        return descriptions.get(self, "Tipo de agente desconhecido")
