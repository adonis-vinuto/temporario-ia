from langchain.tools import tool

@tool(return_direct=True)
def greet_user() -> str:
    """Greet the user"""
    return (
        "Oi, sou o agente Komsales. Posso ajudar com informações de vendas, clientes e oportunidades. "
        "Como posso ajudar você hoje?"
    )
