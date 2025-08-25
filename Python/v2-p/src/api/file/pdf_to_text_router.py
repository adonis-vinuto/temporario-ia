import logging
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File

from src.application.service.pdf.pdf_extract_service import create_pdf_extractor
from src.domain.schema.file.pdf_schemas import PDFAnalysisResponse, PDFPageResult, TextAnalyzerRequest, TextAnalyzerResponse
from src.application.service.pdf.text_analyzer_service import TextAnalyzerService, get_analyze_text_service


logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/pdf/analyze", response_model=PDFAnalysisResponse)
async def analyze_pdf(
    file: UploadFile = File(...),
    query: str = Form(None),
    ai_service: TextAnalyzerService = Depends(get_analyze_text_service)
    ):
    """
    Extrai texto de um arquivo PDF.

    Args:
        file: Arquivo PDF para análise e extração de texto
        query: Pergunta opcional para análise de texto

    Returns:
        Análise completa do PDF, incluindo resumo, resposta à pergunta (se fornecida) e detalhes de cada página.
    """
    logger.info(f"Solicitação de análise de PDF: {file.filename}")

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

        ai_response = await ai_service.execute(
            TextAnalyzerRequest(
                extracted_text=extracted_text,
                query=query
            )
        )

        return PDFAnalysisResponse(
            filename=file.filename,
            total_pages=len(pages),
            summary=ai_response.summary,
            answer=ai_response.answer,
            pages=pages,
            usage=ai_response.usage
        )
        
    except Exception as e:
        logger.error(f"Erro na análise de PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar PDF: {str(e)}"
        )

