# Refatoração de Estrutura: FastAPI para DDD/Clean Architecture

## Setup Básico do Projeto

```bash
# 1. Criar ambiente virtual
python -m venv .venv

# 2. Ativar o ambiente virtual
# No Windows:
.venv\Scripts\activate
# No Linux/Mac:
source .venv/bin/activate

# 3. Instalar as dependências
pip install -r requirements.txt

# 4. Criar o arquivo `.env` com a variável de ambiente necessária
# No diretório raiz do projeto, crie um arquivo chamado `.env` com o seguinte conteúdo (copie e cole):

GROQ_API_KEY=SuaCHaveAqui
BASE_BACKEND_URL=http://127.0.0.1:3658/m1/965561-950186-default
LOG_LEVEL=DEBUG
SENDGRID_API_KEY=SuaChaveAqui
FROM_EMAIL=no-reply@statum.com.br


# Substitua pela sua chave real, que pode ser obtida em: https://console.groq.com/keys
# Substitua pela sua URL do seu mock server, se necessário

# 5. Rodar a API
uvicorn src.main:app --reload
```


## Estrutura Atual

```
app/
  agents/
    user_management/
    employee_management/
    doc_qa/
  api/
    routers/
  core/
    config.py
  persistence/
    database.py
    employee_repository.py
    user_repository.py
  schemas/
    chat.py
    employee.py
    user.py
  services/
    chat_service.py
    doc_qa_service.py
    employee_service.py
main.py
```

---

## Nova Estrutura Proposta

```
src/
  API/
    chat_router.py
    doc_qa_router.py
    employee_management_router.py
    status_router.py
    __init__.py
  Application/
    chat_service.py
    doc_qa_service.py
    employee_service.py
    agents/
      user_management/
        agent.py
        tools.py
        __init__.py
      employee_management/
        agent.py
        tools.py
        __init__.py
      doc_qa/
        agent.py
        __init__.py
    __init__.py
  Domain/
    chat.py
    employee.py
    user.py
    __init__.py
  Infrastructure/
    database.py
    employee_repository.py
    user_repository.py
    config.py
    __init__.py
  Authentication/
    __init__.py
  __init__.py
main.py
README.md
.gitignore
```

---

## Mapeamento de Pastas e Arquivos

| Origem (Atual)                    | Destino (DDD/Clean)          | Descrição                                 |
| --------------------------------- | ---------------------------- | ----------------------------------------- |
| app/api/routers/                  | src/API/                     | Rotas e endpoints FastAPI                 |
| app/services/                     | src/Application/             | Serviços e lógica de aplicação            |
| app/agents/                       | src/Application/agents/      | Agents e ferramentas de agentes           |
| app/schemas/                      | src/Domain/                  | Modelos, entidades, DTOs                  |
| app/persistence/                  | src/Infrastructure/          | Repositórios, banco de dados, integrações |
| app/core/config.py                | src/Infrastructure/config.py | Configurações                             |
| main.py                           | main.py                      | Ponto de entrada da aplicação             |
| (futura) autenticação/autorização | src/Authentication/          | Lógica de autenticação/autorização        |

---

## Detalhes por Camada

### API

- **Responsabilidade:** Expor endpoints REST, receber requisições HTTP.
- **Arquivos:** Routers FastAPI.

### Application

- **Responsabilidade:** Orquestração, casos de uso, lógica de aplicação.
- **Arquivos:** Serviços, agents, ferramentas de agents.

### Domain

- **Responsabilidade:** Entidades, modelos, regras de negócio puras.
- **Arquivos:** Schemas, DTOs, entidades.

### Infrastructure

- **Responsabilidade:** Integração com banco de dados, repositórios, configurações, serviços externos.
- **Arquivos:** Repositórios, database, config.

### Authentication

- **Responsabilidade:** Lógica de autenticação/autorização.
- **Arquivos:** (Adicionar aqui se necessário)

---
