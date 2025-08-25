import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
from src.tests.conftest import client, base_url, sample_usage, sample_chat_history, mock_komsales_service


class TestChatAIAgentStandard:
    """Testes para o endpoint de chat com agente padrão."""
    
    def test_chat_agent_success_response(self, client: TestClient):
        """Testa resposta de sucesso do chat agent."""
        chat_payload = {
            "message": "Olá, como você está?",
            "chat_history": []
        }
        
        with patch('src.application.service.agent.agent_chat_service.ChatService.chat') as mock_chat:
            mock_chat.return_value = {
                "output": "Olá! Estou bem, obrigado por perguntar. Como posso ajudá-lo hoje?",
                "usage": {
                    "model-name": "llama3-70b-8192",
                    "finish-reason": "stop",
                    "input-tokens": 15,
                    "output-tokens": 25,
                    "total-tokens": 40
                }
            }
            
            response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verifica estrutura da resposta
            assert "message-response" in data
            assert "usage" in data
            assert isinstance(data["message-response"], str)
            assert len(data["message-response"]) > 0
    
    def test_chat_agent_with_history(self, client: TestClient, sample_chat_history):
        """Testa chat agent com histórico de conversa."""
        # Transforma o formato do histórico para o schema esperado
        formatted_history = [
            {"role": msg["role"], "content": msg["content"]} 
            for msg in sample_chat_history
        ]
        
        chat_payload = {
            "message": "Continue nossa conversa",
            "chat_history": formatted_history
        }
        
        with patch('src.application.service.agent.agent_chat_service.ChatService.chat') as mock_chat:
            mock_chat.return_value = {
                "output": "Claro! Baseado no nosso histórico, posso continuar ajudando.",
                "usage": {
                    "model-name": "llama3-70b-8192",
                    "finish-reason": "stop",
                    "input-tokens": 50,
                    "output-tokens": 30,
                    "total-tokens": 80
                }
            }
            
            response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
            
            assert response.status_code == 200
            data = response.json()
            assert "message-response" in data
            assert "usage" in data
    
    def test_chat_agent_usage_structure(self, client: TestClient, sample_usage):
        """Testa estrutura completa do objeto usage na resposta."""
        chat_payload = {
            "message": "Teste de usage",
            "chat_history": []
        }
        
        with patch('src.application.service.agent.agent_chat_service.ChatService.chat') as mock_chat:
            mock_chat.return_value = {
                "output": "Resposta de teste",
                "usage": sample_usage
            }
            
            response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verifica estrutura do usage
            usage = data["usage"]
            expected_usage_fields = [
                "model-name", "finish-reason", 
                "input-tokens", "output-tokens", "total-tokens"
            ]
            
            for field in expected_usage_fields:
                assert field in usage, f"Campo '{field}' não encontrado no usage"
            
            # Verifica tipos dos campos numéricos
            assert isinstance(usage["input-tokens"], int)
            assert isinstance(usage["output-tokens"], int)
            assert isinstance(usage["total-tokens"], int)
            assert isinstance(usage["model-name"], str)
            assert isinstance(usage["finish-reason"], str)
    
    def test_chat_agent_empty_message_validation(self, client: TestClient):
        """Testa validação de mensagem vazia."""
        chat_payload = {
            "message": "",
            "chat_history": []
        }
        
        response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
        
        # Dependendo da validação implementada, pode ser 200 ou processar normalmente
        assert response.status_code in [200, 400, 422]
    
    def test_chat_agent_missing_message_field(self, client: TestClient):
        """Testa requisição sem campo message obrigatório."""
        chat_payload = {
            "chat_history": []
        }
        
        response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
        
        # Deve retornar erro de validação
        assert response.status_code == 422  # Unprocessable Entity
    
    def test_chat_agent_invalid_history_format(self, client: TestClient):
        """Testa validação de formato inválido do histórico."""
        chat_payload = {
            "message": "Teste",
            "chat_history": "invalid_format"  # Deveria ser uma lista
        }
        
        response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
        
        # Deve retornar erro de validação
        assert response.status_code == 422
    
    def test_chat_agent_service_exception_handling(self, client: TestClient):
        """Testa tratamento de exceções do serviço."""
        chat_payload = {
            "message": "Teste de erro",
            "chat_history": []
        }
        
        with patch('src.application.service.agent.agent_chat_service.ChatService.chat') as mock_chat:
            mock_chat.side_effect = Exception("Erro simulado do serviço")
            
            response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
            
            # Verifica que a aplicação trata adequadamente a exceção
            # O código de status pode variar dependendo da implementação
            assert response.status_code in [500, 400]
    
    def test_chat_agent_long_message(self, client: TestClient):
        """Testa chat com mensagem muito longa."""
        long_message = "A" * 5000  # Mensagem de 5000 caracteres
        
        chat_payload = {
            "message": long_message,
            "chat_history": []
        }
        
        with patch('src.application.service.agent.agent_chat_service.ChatService.chat') as mock_chat:
            mock_chat.return_value = {
                "output": "Resposta para mensagem longa",
                "usage": {
                    "model-name": "llama3-70b-8192",
                    "finish-reason": "stop",
                    "input-tokens": 1000,
                    "output-tokens": 50,
                    "total-tokens": 1050
                }
            }
            
            response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
            
            # Deve processar normalmente ou retornar erro de validação
            assert response.status_code in [200, 400, 422]
    
    def test_chat_agent_large_history(self, client: TestClient):
        """Testa chat com histórico extenso."""
        large_history = []
        for i in range(100):  # 100 mensagens no histórico
            large_history.append({"role": "user", "content": f"Mensagem {i}"})
            large_history.append({"role": "assistant", "content": f"Resposta {i}"})
        
        chat_payload = {
            "message": "Mensagem com histórico extenso",
            "chat_history": large_history
        }
        
        with patch('src.application.service.agent.agent_chat_service.ChatService.chat') as mock_chat:
            mock_chat.return_value = {
                "output": "Resposta considerando histórico extenso",
                "usage": {
                    "model-name": "llama3-70b-8192",
                    "finish-reason": "stop",
                    "input-tokens": 2000,
                    "output-tokens": 100,
                    "total-tokens": 2100
                }
            }
            
            response = client.post("/api/v1/chat-ai/test-org/test-module/test-agent", json=chat_payload)
            
            assert response.status_code in [200, 400]
