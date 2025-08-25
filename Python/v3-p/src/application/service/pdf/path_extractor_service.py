import re
from langchain import hub

from src.infrastructure.llm.groq_llm_client import GroqLLMClient
from src.domain.schema.file.pdf_schemas import DataExtractorRequest, DataExtractorResponse
from src.domain.exception.application_exceptions import ValidationException

class DataExtractorService:
    """
    Serviço para extrair dados estruturados de documentos fiscais usando LLM.
    
    Recebe texto de documentos (NF-e, NFS-e, Cupom) e uma lista de campos
    personalizáveis, retornando dados extraídos em formato JSON.
    
    Exemplo:
    ```python
    fields = [{"name_field": "doc-type", "description_field": "Tipo do documento"}]
    response = await service.execute(DataExtractorRequest(text, fields))
    # retorna: {"extracted_data": {"doc-type": "NF-e"}, "usage": {...}}
    ```
    """

    def __init__(self, llm_client: GroqLLMClient):
        self.llm_client = llm_client

    async def execute(self, request: DataExtractorRequest) -> DataExtractorResponse:
        extracted_text = request.extracted_text
        fields = request.fields

        # Validando o texto e a lista de campos
        if not extracted_text or len(extracted_text.strip()) < 5:
            raise ValidationException({
                "extracted_text": ["Texto muito curto ou vazio para processamento."]
            })
        
        if not fields:
            raise ValidationException({
                "fields": ["Campos são obrigatórios para processamento."]
            })

        #  Normalizar espaços: remover múltiplos espaços e quebras de linha
        normalized_text = re.sub(r"\s+", " ", extracted_text).strip()

        # Formatar os fields como uma lista de strings para a LLM
        formatted_fields = [f"{field['name_field']}: {field['description_field']}" for field in fields]

        # Puxando do langsmith
        prompt = hub.pull("custom-extractor")
        # Passando os parametros
        formatted_prompt = prompt.invoke({"normalized_text": normalized_text, "fields": formatted_fields})

        # Usar o LLM client para executar o prompt
        response = await self.llm_client.invoke(formatted_prompt.to_messages())
        
        # O conteúdo está na propriedade content do response
        content = response["content"]

        # Parsear o conteúdo - formato simples
        extracted_data = {}
        
        # Tentar parsear JSON primeiro
        try:
            import json
            extracted_data = json.loads(content)
        except:
            # Se não for JSON, dividir por vírgulas e depois por dois pontos
            # Remove colchetes e aspas se existirem
            clean_content = content.strip("[]'\"")
            items = [item.strip().strip("'\"") for item in clean_content.split("',")]
            
            for item in items:
                if ':' in item:
                    key, value = item.split(':', 1)  # Split apenas no primeiro ':'
                    extracted_data[key.strip()] = value.strip()

        return DataExtractorResponse(
            extracted_data=extracted_data,
            usage=response.get("usage"),
        )

def get_path_extractor_service() -> DataExtractorService:
    llm_client = GroqLLMClient()
    service = DataExtractorService(llm_client)
    return service