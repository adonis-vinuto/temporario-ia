from langchain_core.tools import tool
from src.infrastructure.config.settings_config import settings
import requests

# Temporary storage for document data during processing
_temp_document_storage = {}

def set_temp_document(key: str, document: dict):
    """Store document temporarily for tool access"""
    global _temp_document_storage
    _temp_document_storage[key] = document

def get_temp_document(key: str) -> dict:
    """Retrieve document from temporary storage"""
    global _temp_document_storage
    return _temp_document_storage.get(key, {})

@tool
def pdf_data(doc_id: str) -> dict:
    """
    Busca dados completos de PDF por ID do documento.
    
    Esta ferramenta retorna um objeto JSON COMPLETO com TODOS os campos necessários para processamento:
    - id-file: Identificador único do documento
    - name-file: Nome/título do documento
    - url-file: URL do documento
    - resume-pdf: Resumo completo do documento
    - pages: Array de objetos de página, cada um contendo:
        * page: Número da página (inteiro)
        * title: Título da página
        * content: Conteúdo completo da página
        * resume-page: Resumo da página
    - usage: Objeto de estatísticas de uso
    
    IMPORTANTE: O objeto retornado contém TODOS os campos necessários para a operação insert_pdf.
    NÃO modifique ou remova nenhum campo ao usar estes dados com outras ferramentas.
    
    Args:
        doc_id (int): O ID do documento para buscar dados
        
    Returns:
        dict: Dados completos do documento PDF com todos os campos obrigatórios
    """
    api_url = f"{settings.BASE_BACKEND_URL}/api/people/sql-tool/pdf-data/{doc_id}"
    
    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an error for bad responses
        if response.status_code == 200:
            data = response.json()
            set_temp_document(doc_id, data)  # Store the document for later use
            return data
        else:
            return {"error": "Documento não encontrado ou erro ao buscar dados."}
    except requests.RequestException as e:
        return {"error": str(e)}
    

