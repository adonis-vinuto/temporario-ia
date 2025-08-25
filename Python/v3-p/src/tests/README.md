# Configuração específica para testes

# Este arquivo contém informações sobre a estrutura de testes do projeto GemelliAI

## Estrutura de Testes

A estrutura de testes foi reorganizada para seguir as melhores práticas Python:

```
src/
  tests/
    conftest.py                 # Configurações e fixtures globais
    test_health.py             # Testes do endpoint de health
    application/
      service/
        agent/
          test_chat_ai_agent_standard.py  # Testes do serviço de chat
        komsales/              # Testes dos serviços Komsales
        pdf/                   # Testes dos serviços PDF
    agent/                     # Testes dos agentes
    infrastructure/
      helpers/                 # Testes dos helpers
```

## Fixtures Disponíveis

### conftest.py

- `client`: TestClient do FastAPI para requisições HTTP
- `base_url`: URL base para testes
- `sample_usage`: Objeto de usage de exemplo
- `sample_chat_history`: Histórico de chat de exemplo
- `mock_komsales_service`: Mock do KomSalesService

### Configuração de Ambiente

- Variáveis de ambiente específicas para testes
- Configuração de logs reduzida (ERROR level)
- Chaves de API mock para isolamento

## Executando os Testes

### Todos os testes:

```bash
pytest src/tests/
```

### Testes específicos:

```bash
pytest src/tests/test_health.py
pytest src/tests/application/service/agent/test_chat_ai_agent_standard.py
```

### Com cobertura:

```bash
pytest src/tests/ --cov=src --cov-report=html
```

## Convenções

1. **Naming**: Arquivos de teste começam com `test_`
2. **Classes**: Agrupam testes relacionados (ex: `TestHealthEndpoint`)
3. **Métodos**: Descrevem o cenário testado (ex: `test_health_endpoint_success`)
4. **Fixtures**: Reutilizam configurações comuns entre testes
5. **Mocks**: Isolam dependências externas (APIs, banco de dados)

## Cobertura de Testes

### Funcionalidades Testadas:

- ✅ Health endpoint
- ✅ Chat agent standard
- 🔄 Komsales service (estrutura criada)
- 🔄 PDF services (estrutura criada)
- 🔄 Infrastructure helpers (estrutura criada)

### Cenários de Teste:

- Casos de sucesso
- Validação de entrada
- Tratamento de erros
- Edge cases (entradas longas, históricos extensos)
- Múltiplas chamadas
- Métodos HTTP não permitidos
