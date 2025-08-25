# Guia de Uso da API Pinecone

## Configuração Inicial

### 1. Configure o arquivo `.env`

Substitua as linhas do Pinecone no seu `.env`:

```properties
# Pinecone Configuration
PINECONE_API_KEY=sua_chave_real_aqui
PINECONE_ENVIRONMENT=gcp-starter
```

### 2. Obtenha sua chave do Pinecone

1. Acesse [https://www.pinecone.io/](https://www.pinecone.io/)
2. Faça login ou crie uma conta gratuita
3. No dashboard, vá em "API Keys"
4. Copie sua API Key

### 3. Instale as dependências

```bash
pip install sentence-transformers pinecone
```

### 4. Teste a configuração

Execute o script de teste:

```bash
python test_pinecone_config.py
```

## Endpoints da API

Com o servidor rodando (`uvicorn src.main:app --reload`), você terá acesso aos seguintes endpoints:

### 1. Health Check
```http
GET /api/v1/pinecone/health
```

### 2. Armazenar Texto
```http
POST /api/v1/pinecone/store
Content-Type: application/json

{
    "text": "Seu texto aqui",
    "metadata": {
        "source": "documento1",
        "category": "exemplo"
    },
    "doc_id": "opcional-id-customizado"
}
```

### 3. Buscar Textos (POST)
```http
POST /api/v1/pinecone/search
Content-Type: application/json

{
    "query_text": "texto para buscar",
    "top_k": 5,
    "min_score": 0.0
}
```

### 4. Buscar Textos (GET)
```http
GET /api/v1/pinecone/search?query=texto+para+buscar&top_k=5&min_score=0.0
```

### 5. Armazenar Múltiplos Textos
```http
POST /api/v1/pinecone/store/bulk
Content-Type: application/json

{
    "texts": [
        "Primeiro texto",
        "Segundo texto"
    ],
    "metadatas": [
        {"source": "doc1"},
        {"source": "doc2"}
    ]
}
```

### 6. Deletar Documento
```http
DELETE /api/v1/pinecone/documents/doc-id-aqui
```

### 7. Limpar Todos os Documentos
```http
DELETE /api/v1/pinecone/clear
```

### 8. Estatísticas do Índice
```http
GET /api/v1/pinecone/stats
```

## Exemplos de Uso

### Exemplo 1: Armazenar um documento
```bash
curl -X POST "http://localhost:8000/api/v1/pinecone/store" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "Este é um documento sobre inteligência artificial",
       "metadata": {
         "title": "IA Explicada",
         "author": "João",
         "date": "2025-01-01"
       }
     }'
```

### Exemplo 2: Buscar documentos similares
```bash
curl -X GET "http://localhost:8000/api/v1/pinecone/search?query=inteligência%20artificial&top_k=3"
```

### Exemplo 3: Ver estatísticas
```bash
curl -X GET "http://localhost:8000/api/v1/pinecone/stats"
```

## Funcionalidades

- ✅ **Embeddings Automáticos**: Os textos são automaticamente convertidos em embeddings usando o modelo `all-MiniLM-L6-v2`
- ✅ **Busca Semântica**: Encontra textos similares mesmo com palavras diferentes
- ✅ **Metadata**: Suporte a metadata customizada para cada documento
- ✅ **Operações em Lote**: Armazene múltiplos documentos de uma vez
- ✅ **Health Check**: Verifique se o serviço está funcionando
- ✅ **Estatísticas**: Monitore quantos documentos estão armazenados

## Documentação Interativa

Com o servidor rodando, acesse:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Resolução de Problemas

### Erro: "API key do Pinecone é obrigatória"
- Verifique se configurou `PINECONE_API_KEY` no arquivo `.env`
- Certifique-se de que não está usando o valor padrão `your_pinecone_api_key`

### Erro: "Erro ao criar índice"
- Verifique sua conta Pinecone
- Contas gratuitas têm limitações de índices
- Certifique-se de que tem créditos disponíveis

### Erro: "Modelo de embedding não encontrado"
- Execute: `pip install sentence-transformers`
- Na primeira execução, o modelo será baixado automaticamente

## Performance

- **Embeddings**: ~1-10ms por texto (dependendo do tamanho)
- **Busca**: ~50-200ms (dependendo do número de documentos e top_k)
- **Dimensão**: 384 (modelo all-MiniLM-L6-v2)
- **Precisão**: Boa para a maioria dos casos de uso em português e inglês
