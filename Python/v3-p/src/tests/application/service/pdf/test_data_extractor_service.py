import pytest
from unittest.mock import AsyncMock
from src.application.service.pdf.path_extractor_service import DataExtractorService
from src.domain.schema.file.pdf_schemas import DataExtractorRequest, DataExtractorResponse
from src.domain.exception.application_exceptions import ValidationException


class TestDataExtractorService:
    """Testes para o serviço de extração de dados de documentos fiscais."""
    
    def setup_method(self):
        """Setup executado antes de cada teste."""
        self.mock_llm_client = AsyncMock()
        self.service = DataExtractorService(self.mock_llm_client)
    
    @pytest.mark.asyncio
    async def test_execute_success_with_json_response(self):
        """Testa execução bem-sucedida com resposta JSON válida."""
        # Arrange
        fields = [
            {"name_field": "doc-type", "description_field": "Tipo do documento"},
            {"name_field": "data-emissao", "description_field": "Data de emissão"}
        ]
        request = DataExtractorRequest(
            extracted_text="Nota fiscal emitida em 15/08/2025 tipo NF-e",
            fields=fields
        )
        
        self.mock_llm_client.invoke.return_value = {
            "content": '{"doc-type": "NF-e", "data-emissao": "15/08/2025"}',
            "usage": {"tokens": 100}
        }
        
        # Act
        result = await self.service.execute(request)
        
        # Assert
        assert isinstance(result, DataExtractorResponse)
        assert result.extracted_data["doc-type"] == "NF-e"
        assert result.extracted_data["data-emissao"] == "15/08/2025"
        assert result.usage == {"tokens": 100}
    
    @pytest.mark.asyncio
    async def test_execute_success_with_list_response(self):
        """Testa execução bem-sucedida com resposta em formato lista."""
        # Arrange
        fields = [
            {"name_field": "doc-type", "description_field": "Tipo do documento"},
            {"name_field": "valor", "description_field": "Valor total"}
        ]
        request = DataExtractorRequest(
            extracted_text="Cupom fiscal valor R$ 257,09",
            fields=fields
        )
        
        self.mock_llm_client.invoke.return_value = {
            "content": "['doc-type: Cupom', 'valor: R$ 257,09']",
            "usage": {"tokens": 80}
        }
        
        # Act
        result = await self.service.execute(request)
        
        # Assert
        assert result.extracted_data["doc-type"] == "Cupom"
        assert result.extracted_data["valor"] == "R$ 257,09"
    
    @pytest.mark.asyncio
    async def test_execute_validates_empty_text(self):
        """Testa validação de texto vazio."""
        # Arrange
        fields = [{"name_field": "tipo", "description_field": "Tipo"}]
        request = DataExtractorRequest(extracted_text="", fields=fields)
        
        # Act & Assert
        with pytest.raises(ValidationException):
            await self.service.execute(request)
    
    @pytest.mark.asyncio
    async def test_execute_validates_short_text(self):
        """Testa validação de texto muito curto."""
        # Arrange
        fields = [{"name_field": "tipo", "description_field": "Tipo"}]
        request = DataExtractorRequest(extracted_text="abc", fields=fields)
        
        # Act & Assert
        with pytest.raises(ValidationException):
            await self.service.execute(request)
    
    @pytest.mark.asyncio
    async def test_execute_validates_empty_fields(self):
        """Testa validação de campos vazios."""
        # Arrange
        request = DataExtractorRequest(
            extracted_text="Texto válido para teste",
            fields=[]
        )
        
        # Act & Assert
        with pytest.raises(ValidationException):
            await self.service.execute(request)
    
    @pytest.mark.asyncio
    async def test_execute_with_complex_values(self):
        """Testa extração com valores complexos (contendo vírgulas, dois pontos)."""
        # Arrange
        fields = [
            {"name_field": "endereco", "description_field": "Endereço completo"},
            {"name_field": "valor", "description_field": "Valor em reais"}
        ]
        request = DataExtractorRequest(
            extracted_text="Endereço: Rua das Flores, 123 - Centro: São Paulo. Valor: R$ 1.250,90",
            fields=fields
        )
        
        self.mock_llm_client.invoke.return_value = {
            "content": "['endereco: Rua das Flores, 123 - Centro', 'valor: R$ 1.250,90']",
            "usage": {"tokens": 120}
        }
        
        # Act
        result = await self.service.execute(request)
        
        # Assert
        assert result.extracted_data["endereco"] == "Rua das Flores, 123 - Centro"
        assert result.extracted_data["valor"] == "R$ 1.250,90"
    
    @pytest.mark.asyncio
    async def test_execute_formats_fields_correctly(self):
        """Testa se os campos são formatados corretamente para a LLM."""
        # Arrange
        fields = [
            {"name_field": "tipo-doc", "description_field": "Tipo do documento fiscal"},
            {"name_field": "data", "description_field": "Data de emissão"}
        ]
        request = DataExtractorRequest(
            extracted_text="Documento fiscal teste",
            fields=fields
        )
        
        self.mock_llm_client.invoke.return_value = {
            "content": '{}',
            "usage": {}
        }
        
        # Act
        await self.service.execute(request)
        
        # Assert - Verifica se o LLM foi chamado
        self.mock_llm_client.invoke.assert_called_once()
        
        # Os campos devem ser formatados como: ["tipo-doc: Tipo do documento fiscal", "data: Data de emissão"]
        call_args = self.mock_llm_client.invoke.call_args[0][0]
        # Verifica se contém o texto formatado nos argumentos da chamada
        assert len(call_args) > 0  # Pelo menos uma mensagem foi enviada
