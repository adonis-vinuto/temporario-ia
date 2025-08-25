import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from src.tests.conftest import client, base_url


class TestHealthEndpoint:
    """Testes para o endpoint de health check."""
    
    @pytest.mark.smoke
    def test_health_endpoint_success(self, client: TestClient):
        """Testa se o endpoint de health retorna resposta de sucesso."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "ok"
    
    @pytest.mark.smoke
    def test_health_endpoint_response_structure(self, client: TestClient):
        """Testa a estrutura completa da resposta do health endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verifica campos obrigatórios
        expected_fields = ["status"]
        for field in expected_fields:
            assert field in data, f"Campo '{field}' não encontrado na resposta"
        
        # Verifica tipos
        assert isinstance(data["status"], str)
        assert data["status"] == "ok"
    
    def test_health_endpoint_multiple_calls(self, client: TestClient):
        """Testa múltiplas chamadas ao endpoint de health."""
        responses = []
        
        # Faz múltiplas chamadas
        for _ in range(3):
            response = client.get("/health")
            responses.append(response)
        
        # Verifica que todas foram bem-sucedidas
        for response in responses:
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "ok"
    
    def test_health_endpoint_method_not_allowed(self, client: TestClient):
        """Testa que métodos HTTP não permitidos retornam erro adequado."""
        # Testa POST (não deveria ser permitido)
        response = client.post("/health")
        assert response.status_code == 405  # Method Not Allowed
        
        # Testa PUT (não deveria ser permitido)
        response = client.put("/health")
        assert response.status_code == 405  # Method Not Allowed
        
        # Testa DELETE (não deveria ser permitido)
        response = client.delete("/health")
        assert response.status_code == 405  # Method Not Allowed
    
    def test_health_endpoint_minimal_response(self, client: TestClient):
        """Testa que a resposta é mínima e consistente."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verifica que tem apenas o campo status
        assert len(data) == 1
        assert "status" in data
        assert data["status"] == "ok"
