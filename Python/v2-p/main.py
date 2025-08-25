import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from httpx import HTTPStatusError

from src.api.debug import agent_cache_router
from src.api.chat import agent_chat_router
from src.api.enhance import text_enhancer_router
from src.api.file import pdf_to_text_router
from src.api.komsales import agent_komsales_router
from src.api.file import docsort_router
from src.api.graph import graph_router

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
app.include_router(graph_router.router, prefix=API_PREFIX)

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
            "message": f"Erro na comunicação com serviço externo: "
                       f"{exc.response.text if exc.response else str(exc)}"
        },
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": f"Ocorreu um erro inesperado: {str(exc)}",
            "detail": "Por favor, tente novamente mais tarde ou contate o suporte."
        },
    )

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