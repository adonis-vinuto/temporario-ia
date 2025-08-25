from typing import Dict, List, Optional

class ApplicationException(Exception):
    """Exceção base para erros da aplicação"""
    
    def __init__(
        self, 
        title: str, 
        status: int, 
        detail: str,
        errors: Optional[Dict[str, List[str]]] = None
    ):
        self.title = title
        self.status = status
        self.detail = detail
        self.errors = errors
        super().__init__(detail)

class ValidationException(ApplicationException):
    """Exceção para erros de validação"""
    
    def __init__(self, errors: Dict[str, List[str]]):
        super().__init__(
            title="Um ou mais erros de validação ocorreram.",
            status=400,
            detail="Dados de entrada inválidos.",
            errors=errors
        )

class DocumentProcessingException(ApplicationException):
    """Exceção específica para erros de processamento de documentos"""
    
    def __init__(self, detail: str):
        super().__init__(
            title="Application.Documento.ErroProcessamento",
            status=422,
            detail=detail
        )

class FileFormatException(ApplicationException):
    """Exceção para formatos de arquivo inválidos"""
    
    def __init__(self, detail: str):
        super().__init__(
            title="Application.Arquivo.FormatoInvalido",
            status=400,
            detail=detail
        )

class TextExtractionException(ApplicationException):
    """Exceção para erros na extração de texto"""
    
    def __init__(self, detail: str):
        super().__init__(
            title="Application.Documento.ExtracaoTexto",
            status=422,
            detail=detail
        )

class PathExtractionException(ApplicationException):
    """Exceção para erros na extração de path"""
    
    def __init__(self, detail: str):
        super().__init__(
            title="Application.Documento.ExtracaoPath",
            status=422,
            detail=detail
        )