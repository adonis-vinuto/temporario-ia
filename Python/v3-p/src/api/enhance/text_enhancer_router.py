from fastapi import APIRouter, Depends
from src.domain.schema.enhance.text_enhancer_schema import TextEnhancerRequest, TextEnhancerResponse
from src.application.service.enhance.enhance_text_service import EnhanceTextService, get_enhance_text_service
from src.infrastructure.config.logging_config import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.post("/text-enhancer", response_model=TextEnhancerResponse, tags=["Enhance"])
async def enhance_text(
    request: TextEnhancerRequest,
    service: EnhanceTextService = Depends(get_enhance_text_service),
):
    """
    Melhora clareza e fluidez de um texto usando LLM via LangChain.

    :param request: texto original
    :return: texto reescrito e metadados de uso
    """
    logger.debug("Requisição recebida para aprimorar texto.")
    return await service.execute(request)