# 🧪 Como Executar os Testes - GemelliAI

## 📋 Visão Geral

Após a reorganização da estrutura de testes, agora você tem várias opções para executar os testes do GemelliAI:

## 🚀 Métodos de Execução

### 1. Script Automatizado (Recomendado)

O script `run_smoketests.py` foi atualizado para a nova estrutura:

```bash
# Ative o ambiente virtual primeiro
.venv\Scripts\activate

# Opções disponíveis:
python run_smoketests.py stable    # ✅ RECOMENDADO - 10 testes passando
python run_smoketests.py health    # ✅ Apenas health (2 testes)
python run_smoketests.py chat      # ✅ Apenas chat básico (2 testes)
python run_smoketests.py all       # ⚠️  Todos os testes (alguns podem falhar)
python run_smoketests.py help      # 📖 Mostra ajuda
```

### 2. Pytest Direto

```bash
# Ative o ambiente virtual
.venv\Scripts\activate

# Todos os testes estáveis (recomendado)
python -m pytest src/tests/test_health.py src/tests/application/service/agent/test_chat_simple.py -v

# Apenas health
python -m pytest src/tests/test_health.py -v

# Apenas chat básico
python -m pytest src/tests/application/service/agent/test_chat_simple.py -v

# Todos os testes da nova estrutura
python -m pytest src/tests/ -v

# Apenas smoketests marcados
python -m pytest src/tests/ -m smoke -v
```

## ✅ Status Atual dos Testes

### Testes Estáveis (10/10 passando)

- **test_health.py**: 5 testes do endpoint `/health`
- **test_chat_simple.py**: 5 testes básicos de validação do chat

### Testes em Desenvolvimento

- **test_chat_ai_agent_standard.py**: Testes avançados (precisa ajustes nos schemas)

## 🎯 Recomendação de Uso

### Para Desenvolvimento Diário:

```bash
python run_smoketests.py stable
```

- ✅ Executa apenas testes que sempre passam
- ✅ Rápido (10 testes em ~0.1s)
- ✅ Valida funcionalidades essenciais

### Para Validação Completa:

```bash
python run_smoketests.py all
```

- ⚠️ Pode ter algumas falhas esperadas
- ⚠️ Inclui testes em desenvolvimento
- 📊 Mostra status geral do projeto

### Para Debug Específico:

```bash
# Health apenas
python run_smoketests.py health

# Chat básico apenas
python run_smoketests.py chat
```

## 📊 Exemplo de Saída Esperada

```
GemelliAI Smoketests Runner
Tipo de teste: stable
================================================================================
🚀 GEMELLIAI - EXECUÇÃO DE SMOKETESTS
================================================================================
Tipo: STABLE
Comando: python -m pytest src/tests/test_health.py src/tests/application/service/agent/test_chat_simple.py -v
Python: python
Sistema: Windows
================================================================================

src/tests/test_health.py::TestHealthEndpoint::test_health_endpoint_success PASSED
src/tests/test_health.py::TestHealthEndpoint::test_health_endpoint_response_structure PASSED
src/tests/test_health.py::TestHealthEndpoint::test_health_endpoint_multiple_calls PASSED
src/tests/test_health.py::TestHealthEndpoint::test_health_endpoint_method_not_allowed PASSED
src/tests/test_health.py::TestHealthEndpoint::test_health_endpoint_minimal_response PASSED
src/tests/application/service/agent/test_chat_simple.py::TestChatAIAgentSimple::test_chat_endpoint_validation_error PASSED
src/tests/application/service/agent/test_chat_simple.py::TestChatAIAgentSimple::test_chat_endpoint_missing_payload PASSED
src/tests/application/service/agent/test_chat_simple.py::TestChatAIAgentSimple::test_chat_endpoint_invalid_json PASSED
src/tests/application/service/agent/test_chat_simple.py::TestChatAIAgentSimple::test_chat_endpoint_valid_structure_mock PASSED
src/tests/application/service/agent/test_chat_simple.py::TestChatAIAgentSimple::test_chat_endpoint_with_history_mock PASSED

================================================= 10 passed in 0.11s =================================================

✅ SMOKETESTS CONCLUÍDOS COM SUCESSO!
```

## 🔧 Configurações

- **pytest.ini**: Configurado para `testpaths = src/tests`
- **conftest.py**: Fixtures atualizadas para nova estrutura
- **Markers**: `@pytest.mark.smoke` para testes críticos

## 📝 Comandos Úteis

```bash
# Ver apenas testes que falharam
python -m pytest src/tests/ --lf -v

# Executar com cobertura
python -m pytest src/tests/ --cov=src --cov-report=html

# Parar no primeiro erro
python -m pytest src/tests/ -x

# Executar em paralelo (se tiver pytest-xdist)
python -m pytest src/tests/ -n auto
```

---

**💡 Dica**: Use sempre `python run_smoketests.py stable` para validação rápida durante o desenvolvimento!
