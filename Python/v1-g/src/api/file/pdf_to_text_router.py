from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import logging

from src.domain.schema.file.pdf_schema import PdfUploadResponse, PdfProcessingResult
from src.application.service.file.pdf_to_text_service import PdfToTextService, get_pdf_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pdf", tags=["PDF Processing"])


@router.post("/upload", response_model=PdfUploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    pdf_service: PdfToTextService = Depends(get_pdf_service)
):
    """
    Endpoint para upload de PDF e início do processamento assíncrono.
    Retorna imediatamente com task_id para acompanhamento.
    """
    try:
        # Validação do arquivo
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail="Apenas arquivos PDF são aceitos"
            )
        
        if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=400,
                detail="Arquivo muito grande. Limite de 10MB"
            )
        
        # Lê o conteúdo do arquivo
        file_content = await file.read()
        
        # Inicia processamento assíncrono
        task_id = await pdf_service.start_pdf_processing(file_content, file.filename)
        
        logger.info(f"PDF upload iniciado - task_id: {task_id}, arquivo: {file.filename}")
        
        return PdfUploadResponse(
            message="Documento sendo processado",
            task_id=task_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no upload do PDF: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao processar o arquivo"
        )


@router.get("/status/{task_id}")
async def get_pdf_status(
    task_id: str,
    pdf_service: PdfToTextService = Depends(get_pdf_service)
):
    """
    Endpoint para consultar o status do processamento do PDF.
    Retorna o resultado completo se o processamento estiver finalizado.
    """
    try:
        status = pdf_service.get_processing_status(task_id)
        
        if not status:
            raise HTTPException(
                status_code=404,
                detail="Task ID não encontrado"
            )
        
        if status.status == "processing":
            return JSONResponse(
                status_code=202,  # Accepted - ainda processando
                content={
                    "status": "processing",
                    "message": "Documento ainda sendo processado"
                }
            )
        
        elif status.status == "failed":
            return JSONResponse(
                status_code=500,
                content={
                    "status": "failed",
                    "message": "Erro no processamento do documento",
                    "error": status.error
                }
            )
        
        elif status.status == "completed":
            result = await pdf_service.get_processing_result(task_id)
            if result:
                return JSONResponse(
                    status_code=200,
                    content=result.model_dump()
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Resultado não encontrado"
                )
        
        else:
            raise HTTPException(
                status_code=500,
                detail="Status desconhecido"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao consultar status do task_id {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )


@router.get("/result/{task_id}", response_model=PdfProcessingResult)
async def get_pdf_result(
    task_id: str,
    pdf_service: PdfToTextService = Depends(get_pdf_service)
):
    """
    Endpoint específico para obter apenas o resultado final do processamento.
    Retorna 404 se não estiver pronto.
    """
    try:
        result = await pdf_service.get_processing_result(task_id)
        
        if not result:
            status = pdf_service.get_processing_status(task_id)
            if not status:
                raise HTTPException(
                    status_code=404,
                    detail="Task ID não encontrado"
                )
            elif status.status == "processing":
                raise HTTPException(
                    status_code=202,
                    detail="Processamento ainda em andamento"
                )
            elif status.status == "failed":
                raise HTTPException(
                    status_code=500,
                    detail=f"Processamento falhou: {status.error}"
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Resultado não disponível"
                )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter resultado do task_id {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )
