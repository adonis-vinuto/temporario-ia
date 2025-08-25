from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import httpx
import logging

router = APIRouter(prefix="/proxy", tags=["PDF Proxy"])

PDF_TRIGGER_URL = "http://localhost:7071/api/pdf_extractor_trigger"
logger = logging.getLogger(__name__)

@router.post("/send-pdf")
async def send_pdf_to_trigger(file: UploadFile = File(...)):
    """
    Envia o PDF recebido para o endpoint externo como application/pdf.
    """
    try:
        # Validação simples
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Envie um arquivo PDF.")

        # Lê o conteúdo binário do PDF
        file_content = await file.read()

        # Faz o POST com o conteúdo binário como application/pdf
        async with httpx.AsyncClient() as client:
            response = await client.post(
                PDF_TRIGGER_URL,
                content=file_content,
                headers={"Content-Type": "application/pdf"}
            )

        logger.info(f"PDF enviado para trigger. Status: {response.status_code}")
        
        return JSONResponse(
            status_code=response.status_code,
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"message": response.text}
        )
        
    except httpx.RequestError as e:
        logger.error(f"Erro de conexão com o serviço externo: {str(e)}")
        raise HTTPException(status_code=503, detail="Erro ao se conectar com o serviço externo")
    
    except Exception as e:
        logger.error(f"Erro inesperado ao enviar PDF: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao enviar PDF")
