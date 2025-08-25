from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
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
from src.infrastructure.limits.resource_limits import get_resource_monitor
from src.infrastructure.config.logging_config import get_logger
from src.infrastructure.logging.secure_logger import DataSanitizer

logger = get_logger(__name__)
router = APIRouter()

@router.post(
    "/docsort", 
    response_model=PathExtractorResponse,
    responses={
        400: {"model": ValidationErrorResponse, "description": "Formato de arquivo inválido ou dados inválidos"},
        413: {"model": ErrorResponse, "description": "Arquivo muito grande"},
        422: {"model": ErrorResponse, "description": "Erro no processamento do documento"},
        500: {"model": ErrorResponse, "description": "Erro interno do servidor"},
        503: {"model": ErrorResponse, "description": "Sistema com recursos insuficientes"}
    }
)
async def extract_path(
    file: UploadFile = File(...),
    path_service: PathExtractorService = Depends(get_path_extractor_service),
    monitor = Depends(get_resource_monitor)
):
    """
    Extrai o path estruturado de documentos fiscais em PDF.
    
    - **file**: Arquivo PDF contendo documento fiscal (NF-e, NFS-e, NFC-e ou Cupom Fiscal)
    
    Retorna o path no formato: /[TIPO_DOCUMENTO]/[RAZAO_SOCIAL_RECEPTOR]/[MM-AAAA]/[NUMERO_DOCUMENTO]
    
    Limites:
    - Tamanho máximo do arquivo: 50MB
    - Máximo de páginas: 100
    - Processamento OCR limitado por semáforo de concorrência
    """

    # Log seguro - não expõe o filename completo, apenas hash
    file_hash = DataSanitizer.hash_identifier(file.filename)
    logger.info(f"Solicitação de extração de path recebida - file_hash: {file_hash}")

    # Validação da extensão do arquivo
    if not file.filename:
        raise ValidationException({
            "file": ["Nome do arquivo não fornecido."]
        })
    
    # Validação usando resource monitor
    try:
        monitor.validate_file_extension(file.filename)
    except HTTPException as e:
        logger.warning(f"Arquivo rejeitado por extensão inválida - hash: {file_hash}")
        raise FileFormatException("Apenas arquivos PDF são aceitos.")

    try:
        # Verificar recursos do sistema antes de processar
        await monitor.check_system_resources()
        logger.debug("Recursos do sistema verificados - OK")

        # Ler arquivo em chunks para verificar tamanho progressivamente
        chunks = []
        total_size = 0
        CHUNK_SIZE = 1024 * 1024  # 1MB chunks
        
        logger.debug(f"Iniciando leitura em chunks do arquivo - hash: {file_hash}")
        
        while True:
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            chunks.append(chunk)
            total_size += len(chunk)
            
            # Validar tamanho conforme lê
            try:
                monitor.validate_file_size(total_size, file.filename)
            except HTTPException as e:
                logger.warning(f"Arquivo muito grande: {total_size / 1024 / 1024:.2f}MB - hash: {file_hash}")
                raise FileFormatException(
                    f"Arquivo excede o tamanho máximo permitido de {monitor.config.max_file_size / 1024 / 1024:.1f}MB"
                )
        
        file_content = b''.join(chunks)
        
        logger.info(f"Arquivo lido com sucesso: {total_size / 1024:.1f}KB - hash: {file_hash}")
        
        if not file_content:
            raise ValidationException({
                "file": ["O arquivo está vazio ou não pôde ser lido."]
            })

        # Usar semáforo para limitar OCR simultâneos
        logger.debug(f"Aguardando slot de OCR - hash: {file_hash}")
        
        async with await monitor.acquire_ocr_slot():
            logger.debug(f"Slot de OCR adquirido, iniciando processamento - hash: {file_hash}")
            
            # Extrair texto do PDF
            pdf_extractor = create_simple_pdf_extractor()

            try:
                pages: PDFPageResult = pdf_extractor.extract_text_from_pdf_bytes(file_content)
                
                # Verificar limite de páginas
                if len(pages) > monitor.config.max_pdf_pages:
                    logger.warning(
                        f"PDF com {len(pages)} páginas excede limite de {monitor.config.max_pdf_pages} - hash: {file_hash}"
                    )
                    raise TextExtractionException(
                        f"PDF com muitas páginas ({len(pages)}). Máximo permitido: {monitor.config.max_pdf_pages}"
                    )
                
                logger.info(f"PDF processado: {len(pages)} páginas - hash: {file_hash}")
                
                # Construir texto extraído
                extracted_text = " ".join(
                    f"{page.text} {page.meta}" if hasattr(page, "meta") and page.meta else page.text
                    for page in pages
                )
                
                # Log sanitizado do conteúdo (primeiros caracteres apenas)
                preview = DataSanitizer._sanitize_string(extracted_text[:100] if extracted_text else "")
                logger.debug(f"Preview do texto extraído: {preview}... - hash: {file_hash}")

            except Exception as e:
                logger.error(
                    f"Erro na extração de texto do PDF - hash: {file_hash}",
                    extra={"error_type": type(e).__name__}
                )
                raise TextExtractionException(f"Erro ao extrair texto do PDF: {str(e)}")

            # Validar texto extraído
            if not extracted_text or len(extracted_text.strip()) < 10:
                logger.warning(f"Texto extraído insuficiente - hash: {file_hash}")
                raise TextExtractionException("Não foi possível extrair texto suficiente do PDF.")

            # Verificar recursos novamente antes do processamento LLM
            await monitor.check_system_resources()

            # Extrair path estruturado
            try:
                logger.debug(f"Iniciando extração de path via LLM - hash: {file_hash}")
                
                path_response = await path_service.execute(
                    PathExtractorRequest(extracted_text=extracted_text)
                )
                
                # Log do resultado (sem dados sensíveis)
                logger.info(
                    f"Path extraído com sucesso - hash: {file_hash}",
                    extra={
                        "document_type": path_response.type,
                        "tokens_used": path_response.usage.get("total_tokens", 0) if path_response.usage else 0
                    }
                )
                
            except ValidationException as e:
                logger.warning(f"Validação falhou na extração de path - hash: {file_hash}")
                raise
            except Exception as e:
                logger.error(
                    f"Erro na extração de path - hash: {file_hash}",
                    extra={"error_type": type(e).__name__}
                )
                raise PathExtractionException(f"Erro ao extrair informações do documento: {str(e)}")

            # Retornar resposta
            return PathExtractorResponse(
                filename=file.filename,  # Aqui mantemos o filename original na resposta
                type=path_response.type,
                path=path_response.path,
                usage=path_response.usage
            )

    except (FileFormatException, TextExtractionException, PathExtractionException, ValidationException):
        # Re-raise application exceptions para serem tratadas pelo handler
        raise
    except HTTPException as e:
        # Re-raise HTTP exceptions do resource monitor
        if e.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
            logger.error(f"Sistema com recursos insuficientes - hash: {file_hash}")
        raise
    except Exception as e:
        # Log de erro inesperado sem stack trace completo
        logger.error(
            f"Erro inesperado na análise de PDF - hash: {file_hash}",
            extra={
                "error_type": type(e).__name__,
                "error_message": str(e)
            }
        )
        raise PathExtractionException(f"Erro inesperado no processamento: {str(e)}")
    finally:
        # Log de finalização
        logger.debug(f"Processamento finalizado - hash: {file_hash}")