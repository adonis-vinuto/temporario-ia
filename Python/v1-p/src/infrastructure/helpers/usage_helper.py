"""
Helper functions para criação de objetos Usage padronizados.
"""

def create_empty_usage(finish_reason: str = "error") -> dict:
    """
    Cria um objeto usage vazio com valores padrão.
    
    Args:
        finish_reason: Motivo do término (padrão: "error")
        
    Returns:
        Dicionário com usage vazio
    """
    return {
        "model-name": "",
        "finish-reason": finish_reason,
        "input-tokens": 0,
        "output-tokens": 0,
        "total-tokens": 0
    }