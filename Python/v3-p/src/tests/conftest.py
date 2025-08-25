import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Adiciona o diretório raiz ao Python path para imports
project_root = Path(__file__).parent.parent.parent  # src/tests/conftest.py -> projeto raiz
sys.path.insert(0, str(project_root))

# Configura variáveis de ambiente para testes
os.environ.setdefault("GROQ_API_KEY", "test_key_for_testing")
os.environ.setdefault("BASE_BACKEND_URL", "http://test-backend-url")
os.environ.setdefault("LOG_LEVEL", "ERROR")  # Reduz logs durante testes
os.environ.setdefault("SENDGRID_API_KEY", "test_sendgrid_key")
os.environ.setdefault("FROM_EMAIL", "test@example.com")

try:
    from main import app
except ImportError as e:
    pytest.exit(f"Erro ao importar a aplicação: {e}. Certifique-se de estar no diretório correto.")


@pytest.fixture
def client():
    """
    Fixture que retorna um cliente de teste para a aplicação FastAPI.
    
    O TestClient do FastAPI simula requisições HTTP sem precisar
    iniciar um servidor real, tornando os testes mais rápidos e isolados.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def base_url():
    """Fixture que retorna a URL base para os testes."""
    return "http://testserver"


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """
    Configuração global dos testes executada uma vez por sessão.
    
    Esta fixture é executada automaticamente e configura o ambiente
    de teste para garantir isolamento das configurações de produção.
    """
    print("Configurando ambiente de teste...")
    yield
    print("Limpando ambiente de teste...")


@pytest.fixture
def mock_komsales_service():
    """Fixture para mockar o KomSalesService."""
    from unittest.mock import AsyncMock, MagicMock
    
    mock_service = MagicMock()
    mock_service.chat = AsyncMock()
    mock_service.chat.return_value = {
        "output": "Mock response from Komsales",
        "usage": {
            "model-name": "mock-model",
            "finish-reason": "stop",
            "input-tokens": 10,
            "output-tokens": 20,
            "total-tokens": 30
        }
    }
    return mock_service


@pytest.fixture
def sample_usage():
    """Fixture que retorna um usage de exemplo."""
    return {
        "model-name": "llama3-70b-8192",
        "finish-reason": "stop",
        "input-tokens": 100,
        "output-tokens": 50,
        "total-tokens": 150
    }


@pytest.fixture
def sample_chat_history():
    """Fixture que retorna um histórico de chat de exemplo."""
    return [
        {"role": "user", "content": "Olá"},
        {"role": "agent", "content": "Olá! Como posso ajudar?"}
    ]
