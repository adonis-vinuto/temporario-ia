# Qdrant Integration - GemelliAI

Este documento descreve como utilizar a integração com Qdrant no projeto GemelliAI para busca semântica de documentos e chat com documentos.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Chat com Documentos](#chat-com-documentos)
- [Ferramentas (Tools)](#ferramentas-tools)
- [Schemas](#schemas)
- [Exemplos de Uso](#exemplos-de-uso)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Qdrant é um banco de dados vetorial usado no GemelliAI para:
- Armazenar embeddings de documentos PDF
- Realizar buscas semânticas
- Prover contexto para conversas com documentos
- Gerenciar coleções de documentos por agente/organização

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Qdrant Configuration
QDRANT_URL=https://seu-cluster.qdrant.tech
QDRANT_API_KEY=sua_api_key_aqui
```

### Dependências

Adicione a dependência do Qdrant no `requirements.txt`:

```txt
qdrant-client>=1.7.0
```

## 🏗️ Estrutura do Projeto

```
src/
├── infrastructure/qdrant/
│   └── qdrant.py                 # Cliente Qdrant
├── application/service/qdrant/
│   └── qdrant_service.py         # Serviço de negócio
├── api/qdrant/
│   └── qdrant_router.py          # Endpoints da API
├── agent/people/
│   └── qdrant_tools.py           # Ferramentas para agents
├── domain/schema/qdrant/
│   └── qdrant_schema.py          # Schemas Pydantic
└── domain/enum/
    └── index_type_enum.py        # Enum para tipos de índice
```

## 🌐 API Endpoints

### 1. Armazenar Documento

```http
POST /qdrant/store
```

**Request Body:**
```json
{
  "text": "Conteúdo do documento",
  "metadata": {
    "titulo": "Exemplo",
    "autor": "Autor"
  },
  "doc_id": "doc_123"
}
```

**Response:**
```json
{
  "success": true,
  "doc_id": "doc_123",
  "message": "Document stored successfully"
}
```

### 2. Buscar Documentos

```http
POST /qdrant/search
```

**Request Body:**
```json
{
  "query_text": "Qual é o conteúdo sobre contratos?",
  "top_k": 5,
  "min_score": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "doc_123",
      "vector": [...],
      "metadata": {
        "titulo": "Contratos",
        "score": 0.85
      }
    }
  ]
}
```

### 3. Criar Coleção

```http
POST /qdrant/collections/{collection_name}?vector_size=1536
```

## 💬 Chat com Documentos

### Endpoint V2 (Recomendado)

```http
POST /chat-ai-with-doc-v2/{id_organization}/{module}/{id_agent}
```

**Request Body:**
```json
{
  "user": {
    "id-user": "user123",
    "name": "João Silva"
  },
  "message": "Qual é o resumo do documento sobre contratos?",
  "collection": "legal_docs",
  "chat-history": [
    {
      "role": 0,
      "content": "Olá"
    },
    {
      "role": 1,
      "content": "Olá! Como posso ajudá-lo?"
    }
  ]
}
```

**Response:**
```json
{
  "message-response": "Com base no documento sobre contratos...",
  "usage": {
    "model-name": "groq-model",
    "input-tokens": 150,
    "output-tokens": 300,
    "total-tokens": 450
  }
}
```

### Fluxo do Processamento

1. **Extração**: O sistema extrai o nome do documento da pergunta
2. **Busca Inicial**: Verifica se o documento já existe no Qdrant
3. **Busca por API**: Se não encontrado, busca os dados via API
4. **Inserção**: Insere o documento no banco vetorial
5. **Busca Semântica**: Realiza busca semântica para responder
6. **Resposta**: Retorna resposta baseada no contexto encontrado

## 🛠️ Ferramentas (Tools)

### 1. search_qdrant_tool

Busca informações no banco vetorial.

```python
@tool
def search_qdrant_tool(query: str, collection: str) -> str:
    """Procura no banco vetorial se já existe uma resposta sobre a pergunta."""
```

**Uso:**
```python
result = search_qdrant_tool(
    query="informações sobre contratos",
    collection="legal_docs"
)
```

### 2. insert_to_qdrant_tool

Insere documento no banco vetorial.

```python
@tool
def insert_to_qdrant_tool(collection: str, document_id: str = "current", agent_id: str = "") -> str:
    """Insere o documento atual no banco vetorial para futuras buscas."""
```

### 3. search_doc_qdrant_by_name_tool

Verifica se documento específico existe.

```python
@tool
def search_doc_qdrant_by_name_tool(agent_id: str, doc_name: str, collection: str, index_type: int) -> str:
    """Verifica se o documento com o nome fornecido e o agent_id já está inserido no Qdrant."""
```

## 📊 Schemas

### QdrantStoreRequest
```python
class QdrantStoreRequest(BaseModel):
    text: str
    metadata: dict[str, str] = {}
    doc_id: str
```

### QdrantSearchRequest
```python
class QdrantSearchRequest(BaseModel):
    query_text: str
    top_k: int = 5
    min_score: float = 0.0
```

### ChatRequestQdrant
```python
class ChatRequestQdrant(BaseModel):
    user: User
    message: str
    collection: str
    chat_history: List[ChatHistoryItem]
```

## 🚀 Exemplos de Uso

### 1. Chat Simples com Documento

```bash
curl -X POST "http://localhost:8000/chat-ai-with-doc-v2/org123/legal/456" \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "id-user": "user123",
      "name": "João"
    },
    "message": "Qual o resumo do contrato?",
    "collection": "contratos",
    "chat-history": []
  }'
```

### 2. Busca Direta no Qdrant

```bash
curl -X POST "http://localhost:8000/qdrant/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "cláusulas de rescisão",
    "top_k": 3,
    "min_score": 0.7
  }'
```

### 3. Inserir Documento Manualmente

```bash
curl -X POST "http://localhost:8000/qdrant/store" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Este é um contrato de prestação de serviços...",
    "metadata": {
      "tipo": "contrato",
      "cliente": "Empresa XYZ"
    },
    "doc_id": "contrato_001"
  }'
```

## 🐛 Troubleshooting

### Problema: "Collection not found"

**Solução:** Crie a coleção primeiro:
```bash
curl -X POST "http://localhost:8000/qdrant/collections/minha_colecao?vector_size=1536"
```

### Problema: "Index required but not found"

**Solução:** O sistema cria índices automaticamente, mas se persistir:
```python
# No código, os índices são criados automaticamente
client.create_index_service("field_name", IndexTypeEnum.KEYWORD)
```

### Problema: Documento não encontrado

**Verificações:**
1. Verifique se o `id_agent` está correto
2. Confirme se o documento existe na API de origem
3. Verifique se a coleção está correta

### Problema: Embeddings com dimensões incorretas

**Solução:** Verifique o tamanho do vetor no modelo de embedding:
- Padrão do projeto: 384 dimensões
- Para outros modelos: ajuste no `vector_size`

## 📝 Notas Importantes

1. **Coleções**: São criadas automaticamente se não existirem
2. **Embeddings**: Gerados automaticamente usando o serviço de embedding configurado
3. **Metadados**: Incluem informações como `agent-id`, `name-file`, `page-id`
4. **IDs**: Gerados usando UUID v5 para garantir consistência
5. **Indexação**: Campos `agent-id` e `name-file` são indexados automaticamente

## 🔄 Integração com Outros Componentes

- **Embedding Service**: Gera vetores dos textos
- **SQL Tools**: Gerencia documentos temporários
- **Azure Blob**: Armazena backups (no chat v1)
- **LangChain Agents**: Usa as ferramentas do Qdrant

## 📈 Performance

- **Busca**: ~100ms para coleções pequenas (<10k docs)
- **Inserção**: ~50ms por página de documento
- **Memória**: Baixo overhead com cliente HTTP
- **Escalabilidade**: Suporta milhões de vetores na nuvem Qdrant

---

**Versão:** 1.0
**Última atualização:** Janeiro 2025
**Mantenedor:** Equipe GemelliAI
