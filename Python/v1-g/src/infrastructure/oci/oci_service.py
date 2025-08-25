import oci
import base64
import logging
from src.infrastructure.config.settings_config import settings
from PyPDF2 import PdfReader, PdfWriter
import io

logger = logging.getLogger(__name__)

def split_pdf_in_chunks(pdf_bytes, chunk_size=5):
    # Lê o pdf
    reader = PdfReader(io.BytesIO(pdf_bytes))
    total_pages = len(reader.pages)
    chunks = []
    
    # Percorre as páginas em bloco de tamanho definido no chunk_size
    for start in range(0, total_pages, chunk_size):
        writer = PdfWriter()
        for i in range(start, min(start + chunk_size, total_pages)):
            writer.add_page(reader.pages[i])
        output = io.BytesIO()
        writer.write(output)
        chunks.append(output.getvalue())
    return chunks

def oci_document_extraction(arquivo_pdf):
    # Se for uma string (caminho do arquivo), lê o arquivo
    if isinstance(arquivo_pdf, str):
        with open(arquivo_pdf, 'rb') as file:
            pdf_bytes = file.read()
    # Se for bytes, usa diretamente
    elif isinstance(arquivo_pdf, bytes):
        pdf_bytes = arquivo_pdf
    # Se for um objeto de arquivo, lê o conteúdo
    else:
        pdf_bytes = arquivo_pdf.read()

    # Divide o PDF em partes de até 5 páginas
    pdf_chunks = split_pdf_in_chunks(pdf_bytes, chunk_size=5)

    # Configuração padrão OCI
    config = oci.config.from_file("config", profile_name="DEFAULT")
    ai_document_client = oci.ai_document.AIServiceDocumentClient(config)

    paginas_texto = []
    page_offset = 0

    # Percorre por partes do pdf para a extração
    for chunk in pdf_chunks:
        file_data = base64.b64encode(chunk).decode('utf-8')
        analyze_document_details = oci.ai_document.models.AnalyzeDocumentDetails(
            features=[
                oci.ai_document.models.DocumentFeature(
                    feature_type="TEXT_EXTRACTION"
                )
            ],
            document=oci.ai_document.models.InlineDocumentDetails(
                source="INLINE",
                data=file_data
            ),
            compartment_id=settings.OCI_COMPARTMENT_ID
        )
        response = ai_document_client.analyze_document(
            analyze_document_details=analyze_document_details
        )
        
        logger.debug(f"OCI Response: {len(response.data.pages)} páginas encontradas")
        
        for page in response.data.pages:
            logger.debug(f"Processando página {page.page_number}")
            linhas_pagina = []
            
            # Verifica se page.lines existe e não é None
            if hasattr(page, 'lines') and page.lines is not None:
                logger.debug(f"Página {page.page_number} tem {len(page.lines)} linhas")
                for line in page.lines:
                    if hasattr(line, 'text') and line.text:
                        linhas_pagina.append(line.text)
                        logger.debug(f"Linha extraída: {line.text[:50]}...")
            else:
                logger.warning(f"Página {page.page_number} não tem linhas ou lines é None")
                
                # Verifica se há outros campos com texto
                if hasattr(page, 'words') and page.words is not None:
                    logger.debug(f"Tentando extrair de words: {len(page.words)} palavras")
                    for word in page.words:
                        if hasattr(word, 'text') and word.text:
                            linhas_pagina.append(word.text)
            
            texto_final = " ".join(linhas_pagina) if linhas_pagina else ""
            logger.debug(f"Texto final da página {page.page_number}: '{texto_final[:100]}...'")
            
            paginas_texto.append({
                "page": page.page_number + page_offset,
                "text": texto_final
            })
        page_offset += len(response.data.pages)

    return paginas_texto