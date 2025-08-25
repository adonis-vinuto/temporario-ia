from pydantic import BaseModel

class AgentContext(BaseModel):
    """Contexto do agente para identificar a organização e o módulo."""
    id_organization: str
    module: str
    id_agent: str