import re
import unicodedata
from fastapi import HTTPException
from src.infrastructure.llm.groq_llm_client import GroqLLMClient
from src.domain.schema.file.pdf_schemas import PathExtractorRequest, PathExtractorResponse
from src.domain.exception.application_exceptions import ValidationException, PathExtractionException

class PathExtractorService:
    """
    Serviço responsável por extrair informações de documentos fiscais em PDF
    e gerar um path estruturado no formato:
    /[TIPO_DOCUMENTO]/[RAZAO_SOCIAL_RECEPTOR]/[MM-AAAA]/[NUMERO_DOCUMENTO]
    
    Tipos de documento:
    - NF-e -> "Nota Fiscal"
    - NFS-e -> "Serviço" 
    - Cupom Fiscal/NFC-e -> "Cupom"
    
    Exemplo: /Nota Fiscal/ADONIS GABRIEL GONCALVES VINUTO/05-2025/52545-2
    """

    def __init__(self, llm_client: GroqLLMClient):
        self.llm_client = llm_client

    def _sanitize_path(self, path: str) -> str:
        """
        Sanitiza o path removendo caracteres especiais e normalizando acentos,
        mas preserva o formato correto dos tipos de documento.
        """
        # Dividir o path em partes
        parts = path.strip('/').split('/')
        
        if len(parts) >= 1:
            # Primeira parte: tipo de documento - manter formato específico
            document_type = parts[0].strip()
            if 'servico' in document_type.lower() or 'serviço' in document_type.lower():
                parts[0] = 'Serviço'
            elif 'nota' in document_type.lower() and 'fiscal' in document_type.lower():
                parts[0] = 'Nota Fiscal'
            elif ('cupom' in document_type.lower() or 
                  'nfc-e' in document_type.lower() or 
                  'nfce' in document_type.lower()):
                parts[0] = 'Cupom'
            else:
                parts[0] = document_type.upper()
        
        # Para as outras partes (razão social, data, número)
        for i in range(1, len(parts)):
            part = parts[i]
            # Normalizar caracteres Unicode (remover acentos)
            part = unicodedata.normalize('NFD', part)
            part = ''.join(char for char in part if unicodedata.category(char) != 'Mn')
            
            # Remover caracteres especiais, manter apenas letras, números, espaços e hífens
            part = re.sub(r'[^\w\s\-]', '', part, flags=re.UNICODE)
            
            # Normalizar espaços múltiplos
            part = re.sub(r'\s+', ' ', part)
            
            # Converter para maiúsculas
            parts[i] = part.upper().strip()
        
        return '/' + '/'.join(parts)

    async def execute(self, request: PathExtractorRequest) -> PathExtractorResponse:
        extracted_text = request.extracted_text

        # 1. Validação de texto vazio ou muito curto
        if not extracted_text or len(extracted_text.strip()) < 5:
            raise ValidationException({
                "extracted_text": ["Texto muito curto ou vazio para processamento."]
            })

        # 2. Normalizar espaços: remover múltiplos espaços e quebras de linha
        normalized_text = re.sub(r"\s+", " ", extracted_text).strip()

        prompt = [
            (
            "system",
            "Você é um assistente especializado em extrair informações de documentos fiscais para gerar um path estruturado. "
            "Primeiro, identifique o tipo de documento: NF-e, NFS-e, NFC-e ou Cupom Fiscal. "
            "Em seguida, extraia os dados do RECEPTOR (destinatário) do documento, ignorando os dados do emissor. "
            "Você pode receber metadados com possíveis nomes de clientes. compare como o texto extraído e ignore se for um endereço."
            "SEMPRE retorne EXATAMENTE no formato: 'PATH:/[TIPO_DOCUMENTO]/[RAZAO_SOCIAL_RECEPTOR]/[MM-AAAA]/[NUMERO_DOCUMENTO]' "
            "Mapeamento de tipos: "
            "- NF-e -> 'Nota Fiscal' "
            "- NFS-e -> 'Serviço' "
            "- NFC-e -> 'Cupom' "
            "- Cupom Fiscal -> 'Cupom' "
            "Regras importantes: "
            "1. Razão social do RECEPTOR: procure por campos como 'Nome/Razão Social', 'Destinatário', 'Cliente' do RECEPTOR. "
            "   NÃO use endereços, ruas, avenidas (av.), cidades, bairros ou CEPs. Use apenas o NOME da pessoa/empresa receptora. "
            "   Se o nome do receptor NÃO for um nome brasileiro (provável erro de OCR), coloque 'NAO_IDENTIFICADO'. "
            "2. Data no formato MM-AAAA (mês-ano) da emissão "
            "3. Número do documento: "
            "   - Para NF-e: número da nota fiscal eletrônica "
            # "   - Para NFS-e: número da nota de serviço eletrônica "
            "   - Para NFS-e: número do RPS Substituto (não o número da NFS-e) "
            "   - Para NFC-e/Cupom: número do cupom fiscal "
            "4. Se algum dado não for encontrado, use 'NAO_IDENTIFICADO' "
            "5. IGNORE dados da Cooperativa de Boa Esperança (emissor) "
            "6. NÃO IGNORE outras AGROPECUÁRIAS"
            # "6. Se o dado extraído não for claro por causa da OCR, use 'NAO_IDENTIFICADO'"
            "Exemplo: PATH:/Nota Fiscal/ADONIS GABRIEL GONCALVES VINUTO/05-2025/52545-2"
            ),
            (
            "human",
            (
                f"Documento fiscal: {normalized_text}\n\n"
                "Identifique o tipo de documento (NF-e, NFS-e, NFC-e ou Cupom Fiscal) e extraia os dados do RECEPTOR (destinatário). "
                "IMPORTANTE: Para a razão social, use apenas o NOME da pessoa ou empresa receptora, não inclua endereços, ruas, cidades ou CEPs. "
                # "Se possivel, corrija erros de OCR no nome do receptor."
                "Procure por campos específicos como 'Nome/Razão Social do Destinatário', 'Cliente', etc. "
                "Se o nome do receptor não for claramente brasileiro, coloque 'NAO_IDENTIFICADO'."
            )
            )
        ]

        response = await self.llm_client.invoke(prompt)
        content = response["content"]

        # Extrair o path usando regex específico
        path_match = re.search(r"PATH:((?:/(?:Nota Fiscal|Serviço|Cupom)/[^\n]+)|(?:/[^/\n]+/[^/\n]+/[^/\n]+/[^\n]+))", content, re.IGNORECASE)
        
        if path_match:
            extracted_path = path_match.group(1).strip()
        else:
            # Fallback: tentar extrair qualquer path estruturado
            fallback_match = re.search(r"(/(?:Nota Fiscal|Serviço|Cupom)/[^\n]+)", content, re.IGNORECASE)
            if fallback_match:
                extracted_path = fallback_match.group(1).strip()
            else:
                # Se nada for encontrado, usar estrutura padrão
                extracted_path = "/NAO_IDENTIFICADO/NAO_IDENTIFICADO/NAO_IDENTIFICADO/NAO_IDENTIFICADO"

        # Sanitizar o path extraído
        sanitized_path = self._sanitize_path(extracted_path)

        # Extrair o tipo do documento de forma mais robusta
        path_parts = extracted_path.strip('/').split('/')
        document_type = "NAO_IDENTIFICADO"
        
        if len(path_parts) >= 1 and path_parts[0]:
            # Verificar se é um tipo válido
            first_part = path_parts[0].strip()
            if first_part and first_part != "NAO_IDENTIFICADO":
                document_type = first_part

        return PathExtractorResponse(
            filename=request.extracted_text,
            type=document_type,
            path=sanitized_path,
            usage=response.get("usage"),
        )

def get_path_extractor_service() -> PathExtractorService:
    llm_client = GroqLLMClient()
    service = PathExtractorService(llm_client)
    return service