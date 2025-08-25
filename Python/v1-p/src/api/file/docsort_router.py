import logging
from fastapi import APIRouter, Depends, UploadFile, File

from src.domain.schema.file.pdf_schemas import PathExtractorResponse, PDFPageResult
from src.domain.schema.error_schemas import ErrorResponse, ValidationErrorResponse
from src.domain.exception.application_exceptions import (
    FileFormatException, 
    TextExtractionException, 
    PathExtractionException,
    ValidationException
)
from src.application.service.pdf.pdf_extract_service import create_pdf_extractor
from src.application.service.pdf.advanced_pdf_extract_service import create_advanced_pdf_extractor
from src.application.service.pdf.simple_pdf_extract_service import create_simple_pdf_extractor
from src.application.service.pdf.path_extractor_service import (
    PathExtractorService, 
    get_path_extractor_service, 
    PathExtractorRequest
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post(
    "/docsort", 
    response_model=PathExtractorResponse,
    responses={
        400: {"model": ValidationErrorResponse, "description": "Formato de arquivo inválido ou dados inválidos"},
        422: {"model": ErrorResponse, "description": "Erro no processamento do documento"},
        500: {"model": ErrorResponse, "description": "Erro interno do servidor"}
    }
)
async def extract_path(
    file: UploadFile = File(...),
    path_service: PathExtractorService = Depends(get_path_extractor_service)
):
    """
    Extrai o path estruturado de documentos fiscais em PDF.
    
    - **file**: Arquivo PDF contendo documento fiscal (NF-e, NFS-e, NFC-e ou Cupom Fiscal)
    
    Retorna o path no formato: /[TIPO_DOCUMENTO]/[RAZAO_SOCIAL_RECEPTOR]/[MM-AAAA]/[NUMERO_DOCUMENTO]
    """

    logger.info(f"Solicitação de extração de path: {file.filename}")

    # Validação do formato do arquivo
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise FileFormatException("Apenas arquivos PDF são aceitos.")

    try:
        # Ler conteúdo do arquivo
        file_content = await file.read()
        
        if not file_content:
            raise ValidationException({
                "file": ["O arquivo está vazio ou não pôde ser lido."]
            })

        # Extrair texto do PDF
        # pdf_extractor = create_advanced_pdf_extractor("signature_resistant")
        # pdf_extractor = create_pdf_extractor("low_quality")
        pdf_extractor = create_simple_pdf_extractor()

        try:
            pages: PDFPageResult = pdf_extractor.extract_text_from_pdf_bytes(file_content)
            extracted_text = " ".join(
                f"{page.text} {page.meta}" if hasattr(page, "meta") and page.meta else page.text
                for page in pages
            )
    
            print("\n--- Extracted Text Start ---\n")
            print(extracted_text)
            print("\n--- Extracted Text End ---\n")

        except Exception as e:
            logger.error(f"Erro na extração de texto do PDF: {str(e)}")
            raise TextExtractionException(f"Erro ao extrair texto do PDF: {str(e)}")

        # Validar texto extraído
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise TextExtractionException("Não foi possível extrair texto suficiente do PDF.")

        # Extrair path estruturado
        try:
            path_response = await path_service.execute(
                PathExtractorRequest(extracted_text=extracted_text)
            )
        except Exception as e:
            logger.error(f"Erro na extração de path: {str(e)}")
            raise PathExtractionException(f"Erro ao extrair informações do documento: {str(e)}")

        return PathExtractorResponse(
            filename=file.filename,
            type=path_response.type,
            path=path_response.path,
            usage=path_response.usage
        )

    except (FileFormatException, TextExtractionException, PathExtractionException, ValidationException):
        # Re-raise application exceptions para serem tratadas pelo handler
        raise
    except Exception as e:
        logger.error(f"Erro inesperado na análise de PDF: {str(e)}")
        raise PathExtractionException(f"Erro inesperado no processamento: {str(e)}")

