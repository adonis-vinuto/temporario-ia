import re
import unicodedata
from fastapi import HTTPException
from src.infrastructure.llm.groq_llm_client import GroqLLMClient
from src.domain.schema.file.pdf_schemas import PathExtractorRequest, PathExtractorResponse

class PathExtractorService:
    """
    Serviço responsável por extrair informações de documentos fiscais em PDF
    e gerar um path estruturado no formato:
    /CUPONS FISCAIS/[NOME_EMISSOR]/[MM-AAAA]/[NUMERO_NOTA]
    
    Exemplo: /CUPONS FISCAIS/ADONIS GABRIEL GONCALVES VINUTO/05-2025/52545-2
    """

    def __init__(self, llm_client: GroqLLMClient):
        self.llm_client = llm_client

    def _sanitize_path(self, path: str) -> str:
        """
        Sanitiza o path removendo caracteres especiais e normalizando acentos.
        """
        # Normalizar caracteres Unicode (remover acentos)
        path = unicodedata.normalize('NFD', path)
        path = ''.join(char for char in path if unicodedata.category(char) != 'Mn')
        
        # Remover caracteres especiais, manter apenas letras, números, espaços, hífens e barras
        path = re.sub(r'[^\w\s\-/]', '', path, flags=re.UNICODE)
        
        # Normalizar espaços múltiplos
        path = re.sub(r'\s+', ' ', path)
        
        # Converter para maiúsculas
        path = path.upper()
        
        return path.strip()

    async def execute(self, request: PathExtractorRequest) -> PathExtractorResponse:
        extracted_text = request.extracted_text

        # 1. Validação de texto vazio ou muito curto
        if not extracted_text or len(extracted_text.strip()) < 5:
            raise HTTPException(status_code=400, detail="Texto muito curto ou vazio.")

        # 2. Normalizar espaços: remover múltiplos espaços e quebras de linha
        normalized_text = re.sub(r"\s+", " ", extracted_text).strip()

        prompt = [
            (
                "system",
                "Você é um assistente especializado em extrair informações de documentos fiscais para gerar um path estruturado. "
                "Analise o documento e extraia: data de emissão, nome da empresa/pessoa emissora e número da nota fiscal. "
                "SEMPRE retorne EXATAMENTE no formato: 'PATH:/CUPONS FISCAIS/[NOME_EMISSOR]/[MM-AAAA]/[NUMERO_NOTA]' "
                "Regras importantes: "
                "1. Nome do emissor em MAIÚSCULAS, sem acentos e caracteres especiais "
                "2. Data no formato MM-AAAA (mês-ano) "
                "3. Número da nota com hífen se aplicável "
                "4. Se algum dado não for encontrado, use 'NAO_IDENTIFICADO' "
                "Exemplo: PATH:/CUPONS FISCAIS/ADONIS GABRIEL GONCALVES VINUTO/05-2025/52545-2"
            ),
            (
                "human",
                (
                    f"Documento fiscal: {normalized_text}\n\n"
                    "Extraia as informações necessárias e gere o path estruturado conforme as regras especificadas."
                )
            )
        ]

        response = await self.llm_client.invoke(prompt)
        content = response["content"]

        # Extrair o path usando regex específico
        path_match = re.search(r"PATH:(/CUPONS FISCAIS/[^\n]+)", content, re.IGNORECASE)
        
        if path_match:
            extracted_path = path_match.group(1).strip()
        else:
            # Fallback: tentar extrair qualquer path que comece com /CUPONS FISCAIS
            fallback_match = re.search(r"(/CUPONS FISCAIS/[^\n]+)", content)
            extracted_path = fallback_match.group(1).strip() if fallback_match else "/CUPONS FISCAIS/NAO_IDENTIFICADO/NAO_IDENTIFICADO/NAO_IDENTIFICADO"

        # Sanitizar o path extraído
        sanitized_path = self._sanitize_path(extracted_path)

        return PathExtractorResponse(
            filename=request.extracted_text,
            path=sanitized_path,
            usage=response.get("usage"),
        )

def get_path_extractor_service() -> PathExtractorService:
    llm_client = GroqLLMClient()
    service = PathExtractorService(llm_client)
    return service