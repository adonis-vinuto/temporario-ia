import pytest
from unittest.mock import AsyncMock, MagicMock
from src.application.service.pdf.path_extractor_service import PathExtractorService
from src.domain.schema.file.pdf_schemas import PathExtractorRequest, PathExtractorResponse


class TestPathExtractorService:
    """Testes para o serviço de extração de paths de documentos fiscais."""
    
    def setup_method(self):
        """Setup executado antes de cada teste."""
        self.mock_llm_client = AsyncMock()
        self.service = PathExtractorService(self.mock_llm_client)
    
    def test_sanitize_path_removes_accents(self):
        """Testa se a sanitização remove acentos corretamente."""
        path_with_accents = "/CUPONS FISCAIS/JOÃO ANDRÉ ÇÃO/05-2025/123-4"
        expected = "/CUPONS FISCAIS/JOAO ANDRE CAO/05-2025/123-4"
        
        result = self.service._sanitize_path(path_with_accents)
        
        assert result == expected
    
    def test_sanitize_path_removes_special_chars(self):
        """Testa se a sanitização remove caracteres especiais."""
        path_with_specials = "/CUPONS FISCAIS/EMPRESA@#$/05-2025/123&4"
        expected = "/CUPONS FISCAIS/EMPRESA/05-2025/1234"
        
        result = self.service._sanitize_path(path_with_specials)
        
        assert result == expected
    
    def test_sanitize_path_normalizes_spaces(self):
        """Testa se a sanitização normaliza espaços múltiplos."""
        path_with_spaces = "/CUPONS  FISCAIS/EMPRESA    TESTE/05-2025/123-4"
        expected = "/CUPONS FISCAIS/EMPRESA TESTE/05-2025/123-4"
        
        result = self.service._sanitize_path(path_with_spaces)
        
        assert result == expected
    
    def test_sanitize_path_converts_to_uppercase(self):
        """Testa se a sanitização converte para maiúsculas."""
        path_lowercase = "/cupons fiscais/empresa teste ltda/05-2025/123-4"
        expected = "/CUPONS FISCAIS/EMPRESA TESTE LTDA/05-2025/123-4"
        
        result = self.service._sanitize_path(path_lowercase)
        
        assert result == expected
    
    @pytest.mark.asyncio
    async def test_execute_success_with_valid_path(self):
        """Testa execução bem-sucedida com path válido."""
        # Arrange
        request = PathExtractorRequest(extracted_text="Nota fiscal emitida por João Silva em 05/2025 número 123-45")
        
        self.mock_llm_client.invoke.return_value = {
            "content": "PATH:/CUPONS FISCAIS/JOAO SILVA/05-2025/123-45",
            "usage": {"tokens": 100}
        }
        
        # Act
        result = await self.service.execute(request)
        
        # Assert
        assert isinstance(result, PathExtractorResponse)
        assert result.path == "/CUPONS FISCAIS/JOAO SILVA/05-2025/123-45"
        assert result.filename == request.extracted_text
        assert result.usage == {"tokens": 100}
    
    @pytest.mark.asyncio
    async def test_execute_with_accents_in_response(self):
        """Testa execução com acentos na resposta da LLM."""
        # Arrange
        request = PathExtractorRequest(extracted_text="Nota fiscal teste")
        
        self.mock_llm_client.invoke.return_value = {
            "content": "PATH:/CUPONS FISCAIS/JOÃO ANDRÉ ÇÃO/05-2025/123-4",
            "usage": {"tokens": 100}
        }
        
        # Act
        result = await self.service.execute(request)
        
        # Assert
        assert result.path == "/CUPONS FISCAIS/JOAO ANDRE CAO/05-2025/123-4"
    
    @pytest.mark.asyncio
    async def test_execute_fallback_when_no_path_prefix(self):
        """Testa fallback quando não há prefixo PATH: na resposta."""
        # Arrange
        request = PathExtractorRequest(extracted_text="Nota fiscal teste")
        
        self.mock_llm_client.invoke.return_value = {
            "content": "/CUPONS FISCAIS/EMPRESA TESTE/05-2025/123-4",
            "usage": {"tokens": 100}
        }
        
        # Act
        result = await self.service.execute(request)
        
        # Assert
        assert result.path == "/CUPONS FISCAIS/EMPRESA TESTE/05-2025/123-4"
    
    @pytest.mark.asyncio
    async def test_execute_default_path_when_no_match(self):
        """Testa path padrão quando nenhum match é encontrado."""
        # Arrange
        request = PathExtractorRequest(extracted_text="Nota fiscal teste")
        
        self.mock_llm_client.invoke.return_value = {
            "content": "Não foi possível extrair informações do documento",
            "usage": {"tokens": 50}
        }
        
        # Act
        result = await self.service.execute(request)
        
        # Assert
        assert result.path == "/CUPONS FISCAIS/NAO_IDENTIFICADO/NAO_IDENTIFICADO/NAO_IDENTIFICADO"
    
    @pytest.mark.asyncio
    async def test_execute_validates_empty_text(self):
        """Testa validação de texto vazio."""
        # Arrange
        request = PathExtractorRequest(extracted_text="")
        
        # Act & Assert
        with pytest.raises(Exception) as exc_info:
            await self.service.execute(request)
        
        assert "Texto muito curto ou vazio" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_execute_validates_short_text(self):
        """Testa validação de texto muito curto."""
        # Arrange
        request = PathExtractorRequest(extracted_text="abc")
        
        # Act & Assert
        with pytest.raises(Exception) as exc_info:
            await self.service.execute(request)
        
        assert "Texto muito curto ou vazio" in str(exc_info.value)
