import logging

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from httpx import HTTPStatusError
from dotenv import load_dotenv

load_dotenv()

from src.api.debug import agent_cache_router
from src.api.chat import agent_chat_router
from src.api.enhance import text_enhancer_router
from src.api.file import pdf_to_text_router
from src.api.komsales import agent_komsales_router
from src.api.file import docsort_router
from src.api.middleware.error_handler import (
    application_exception_handler,
    validation_exception_handler,
    http_exception_handler, 
    general_exception_handler
)
from src.domain.exception.application_exceptions import ApplicationException

from src.infrastructure.config.logging_config import LoggingConfigurator

# -------- Logging Setup --------
logging_config = LoggingConfigurator()
logging_config.configure()

logger = logging.getLogger(__name__)

# -------- FastAPI App --------
app = FastAPI(
    title="AI Agent Backend API",
    description="API para orquestração de agentes de IA com LangChain e FastAPI.",
    version="0.0.1",
)

# -------- CORS Middleware --------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- API Versioning --------
API_PREFIX = "/api/v1"

# -------- Routers --------
app.include_router(agent_cache_router.router, prefix=API_PREFIX)
app.include_router(agent_chat_router.router, prefix=API_PREFIX)
app.include_router(text_enhancer_router.router, prefix=API_PREFIX)
app.include_router(pdf_to_text_router.router, prefix=API_PREFIX)
app.include_router(agent_komsales_router.router, prefix=API_PREFIX)
app.include_router(docsort_router.router, prefix=API_PREFIX)

# -------- Global Exception Handlers --------
@app.exception_handler(HTTPStatusError)
async def http_status_error_handler(request: Request, exc: HTTPStatusError):
    logger.error(
        f"HTTPStatusError: {exc.request.method} {exc.request.url} - "
        f"{exc.response.status_code} {exc.response.text}"
    )
    return JSONResponse(
        status_code=exc.response.status_code if exc.response else status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "title": "Application.ServicosExternos.ErroConexao",
            "status": exc.response.status_code if exc.response else 500,
            "detail": f"Erro na comunicação com serviço externo: {exc.response.text if exc.response else str(exc)}"
        },
    )

# Registrar handlers de erro (ordem importante!)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(ApplicationException, application_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# -------- Healthcheck --------
@app.get("/health", tags=["Status"])
async def health():
    return {"status": "ok"}

# -------- Lifecycle Events --------
@app.on_event("startup")
async def startup_event():
    logger.info("🔵 Aplicação iniciando...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🔴 Aplicação encerrando...")