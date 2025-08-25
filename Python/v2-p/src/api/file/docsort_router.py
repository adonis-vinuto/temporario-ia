import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from src.domain.schema.file.pdf_schemas import PathExtractorResponse, PDFPageResult
from src.application.service.pdf.pdf_extract_service import create_pdf_extractor
from src.application.service.pdf.path_extractor_service import PathExtractorService, get_path_extractor_service, PathExtractorRequest, PathExtractorResponse


logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/docsort", response_model=PathExtractorResponse)
async def extract_path(
    file: UploadFile = File(...),
    path_service: PathExtractorService = Depends(get_path_extractor_service)
):

    logger.info(f"Solicitação de extração de path: {file.filename}")

    # Cria o extrator de PDF com configurações otimizadas
    # Aqui você pode ajustar as configurações conforme necessário
    pdf_extractor = create_pdf_extractor("high_quality")
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas arquivos PDF são aceitos"
        )
    
    try:
        pages: PDFPageResult = pdf_extractor.extract_text_from_pdf_bytes(await file.read())
        extracted_text = " ".join(page.text for page in pages)

        path_response = await path_service.execute(
            PathExtractorRequest(
                extracted_text=extracted_text,
            )
        )

        return PathExtractorResponse(
            filename=file.filename,
            path=path_response.path,
            usage=path_response.usage
        )
        
    except Exception as e:
        logger.error(f"Erro na análise de PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar PDF: {str(e)}"
        )

