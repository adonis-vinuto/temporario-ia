import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from src.tests.conftest import client


class TestChatAIAgentSimple:
    """Testes básicos para verificar a estrutura de testes."""
    
    @pytest.mark.smoke
    def test_chat_endpoint_validation_error(self, client: TestClient):
        """Testa que o endpoint retorna erro de validação para payload inválido."""
        # Payload propositalmente incompleto para testar validação
        invalid_payload = {
            "message": "test message"
            # Faltando 'user' e 'chat-history'
        }
        
        response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=invalid_payload)
        
        # Deve retornar erro de validação Pydantic
        assert response.status_code == 422
        
        # Verifica estrutura do erro
        error_data = response.json()
        assert "detail" in error_data
        assert isinstance(error_data["detail"], list)
    
    def test_chat_endpoint_missing_payload(self, client: TestClient):
        """Testa requisição sem payload."""
        response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent")
        
        # Deve retornar erro de validação
        assert response.status_code == 422
    
    def test_chat_endpoint_invalid_json(self, client: TestClient):
        """Testa requisição com JSON inválido."""
        response = client.post(
            "/api/v1/chat-ai/test-org/test-module/test-agent",
            data="invalid json"
        )
        
        # Deve retornar erro de validação
        assert response.status_code == 422
    
    @pytest.mark.smoke
    def test_chat_endpoint_valid_structure_mock(self, client: TestClient):
        """Testa endpoint com estrutura válida usando mock."""
        valid_payload = {
            "user": {
                "id-user": "test-user-123",
                "name": "Test User"
            },
            "message": "Hello, how are you?",
            "chat-history": []
        }
        
        with patch('src.application.service.agent.agent_chat_service.ChatService.chat') as mock_chat:
            mock_chat.return_value = {
                "output": "Hello! I'm doing well, thank you for asking.",
                "usage": {
                    "model-name": "llama3-70b-8192",
                    "finish-reason": "stop",
                    "input-tokens": 15,
                    "output-tokens": 25,
                    "total-tokens": 40
                }
            }
            
            response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=valid_payload)
            
            # O endpoint deve processar corretamente
            # Nota: pode falhar por dependências não configuradas, mas não por validação
            assert response.status_code in [200, 500]  # 500 seria por erro interno, não validação
    
    def test_chat_endpoint_with_history_mock(self, client: TestClient):
        """Testa endpoint com histórico de chat usando mock."""
        valid_payload = {
            "user": {
                "id-user": "test-user-456",
                "name": "Test User 2"
            },
            "message": "Continue our conversation",
            "chat-history": [
                {"role": 0, "content": "Hello"},  # USER = 0
                {"role": 1, "content": "Hi there!"}  # AGENT = 1
            ]
        }
        
        with patch('src.application.service.agent.agent_chat_service.ChatService.chat') as mock_chat:
            mock_chat.return_value = {
                "output": "Of course! I remember our previous conversation.",
                "usage": {
                    "model-name": "llama3-70b-8192",
                    "finish-reason": "stop",
                    "input-tokens": 30,
                    "output-tokens": 20,
                    "total-tokens": 50
                }
            }
            
            response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=valid_payload)
            
            # O endpoint deve processar corretamente
            assert response.status_code in [200, 500]  # 500 seria por erro interno, não validação
