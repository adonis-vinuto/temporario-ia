import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from src.domain.exception.application_exceptions import ApplicationException, ValidationException

logger = logging.getLogger(__name__)

async def application_exception_handler(request: Request, exc: ApplicationException):
    """Handler para exceções da aplicação"""
    
    logger.error(f"Application error: {exc.title} - {exc.detail}")
    
    if exc.errors:
        # Erro de validação com múltiplos campos
        return JSONResponse(
            status_code=exc.status,
            content={
                "title": exc.title,
                "status": exc.status,
                "errors": exc.errors
            }
        )
    else:
        # Erro simples
        return JSONResponse(
            status_code=exc.status,
            content={
                "title": exc.title,
                "status": exc.status,
                "detail": exc.detail
            }
        )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler para erros de validação do FastAPI/Pydantic"""
    
    logger.error(f"Validation error: {exc.errors()}")
    
    # Converter erros do Pydantic para o formato padronizado
    errors = {}
    for error in exc.errors():
        field_path = ".".join(str(loc) for loc in error["loc"])
        
        # Mapear tipos de erro para mensagens mais amigáveis
        msg = error["msg"]
        error_type = error["type"]
        
        if error_type == "missing":
            msg = f"O campo '{field_path}' é obrigatório."
        elif error_type == "value_error":
            msg = f"Valor inválido para o campo '{field_path}'."
        elif error_type == "type_error":
            msg = f"Tipo de dado inválido para o campo '{field_path}'."
        
        # Agrupar erros por campo
        if field_path not in errors:
            errors[field_path] = []
        errors[field_path].append(msg)
    
    return JSONResponse(
        status_code=400,
        content={
            "title": "Um ou mais erros de validação ocorreram.",
            "status": 400,
            "errors": errors
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler para HTTPExceptions do FastAPI"""
    
    logger.error(f"HTTP error: {exc.status_code} - {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "title": f"Application.Http.Erro{exc.status_code}",
            "status": exc.status_code,
            "detail": exc.detail
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handler para exceções não tratadas"""
    
    logger.error(f"Unhandled error: {type(exc).__name__} - {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "title": "Application.Sistema.ErroInterno",
            "status": 500,
            "detail": "Ocorreu um erro interno no sistema."
        }
    )