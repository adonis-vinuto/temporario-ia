class OCRConfig:
    """Configurações predefinidas para diferentes tipos de documento"""
    
    # Configuração para documentos de alta qualidade
    HIGH_QUALITY = {
        'dpi': 300,
        'tesseract_config': '--oem 3 --psm 6'
    }
    
    # Configuração para documentos escaneados/baixa qualidade
    LOW_QUALITY = {
        'dpi': 400,
        'tesseract_config': '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz àáâãéêíóôõúç'
    }
    
    # Configuração para documentos com tabelas
    TABLES = {
        'dpi': 350,
        'tesseract_config': '--oem 3 --psm 6'
    }
    
    # Configuração rápida (menor qualidade, mais velocidade)
    FAST = {
        'dpi': 200,
        'tesseract_config': '--oem 3 --psm 6'
    }
