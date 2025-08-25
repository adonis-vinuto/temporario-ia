# ChromaDB Cloud API - Exemplos de Uso

## Configuração Necessária

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
CHROMA_CLOUD_API_KEY=your_chroma_cloud_api_key_here
CHROMA_CLOUD_TENANT=default_tenant
CHROMA_CLOUD_DATABASE=default_database
```

## Endpoints Disponíveis

### 1. Health Check
```bash
GET /api/v1/chroma-cloud/health
```

### 2. Inicializar Base de Conhecimento
```bash
POST /api/v1/chroma-cloud/initialize
Content-Type: application/json

{
    "collection_name": "minha_colecao"  // opcional
}
```

### 3. Adicionar Documentos
```bash
POST /api/v1/chroma-cloud/documents
Content-Type: application/json

{
    "documents": [
        {
            "content": "Este é o conteúdo do primeiro documento sobre IA.",
            "metadata": {
                "source": "artigo_ia",
                "categoria": "tecnologia",
                "autor": "João Silva"
            },
            "document_id": "doc_001"  // opcional
        },
        {
            "content": "Segundo documento falando sobre machine learning.",
            "metadata": {
                "source": "tutorial_ml",
                "categoria": "educação"
            }
        }
    ],
    "collection_name": "gemelli_knowledge_base"  // opcional
}
```

### 4. Buscar Conhecimento
```bash
POST /api/v1/chroma-cloud/search
Content-Type: application/json

{
    "query": "Como funciona inteligência artificial?",
    "max_results": 5,
    "filters": {
        "categoria": "tecnologia"
    },
    "collection_name": "gemelli_knowledge_base"  // opcional
}
```

### 5. Atualizar Documento
```bash
PUT /api/v1/chroma-cloud/documents/doc_001
Content-Type: application/json

{
    "new_content": "Conteúdo atualizado do documento sobre IA.",
    "new_metadata": {
        "source": "artigo_ia_v2",
        "categoria": "tecnologia",
        "autor": "João Silva",
        "versao": "2.0"
    },
    "collection_name": "gemelli_knowledge_base"  // opcional
}
```

### 6. Deletar Documentos
```bash
DELETE /api/v1/chroma-cloud/documents
Content-Type: application/json

{
    "document_ids": ["doc_001", "doc_002"],
    "collection_name": "gemelli_knowledge_base"  // opcional
}
```

### 7. Obter Estatísticas da Coleção
```bash
GET /api/v1/chroma-cloud/collections/gemelli_knowledge_base/stats
```

ou para a coleção padrão:

```bash
GET /api/v1/chroma-cloud/collections/stats
```

### 8. Criar Coleção Especializada
```bash
POST /api/v1/chroma-cloud/collections
Content-Type: application/json

{
    "name": "documentos_juridicos",
    "description": "Coleção especializada para documentos e textos jurídicos"
}
```

### 9. Listar Todas as Coleções
```bash
GET /api/v1/chroma-cloud/collections
```

### 10. Fazer Backup de Coleção
```bash
POST /api/v1/chroma-cloud/collections/gemelli_knowledge_base/backup?limit=1000
```

## Exemplos de Respostas

### Resposta de Busca
```json
{
    "success": true,
    "query": "Como funciona inteligência artificial?",
    "results": [
        {
            "document_id": "doc_001",
            "content": "Este é o conteúdo do primeiro documento sobre IA...",
            "metadata": {
                "source": "artigo_ia",
                "categoria": "tecnologia",
                "autor": "João Silva"
            },
            "score": 0.95
        }
    ],
    "total_found": 1,
    "collection_name": "gemelli_knowledge_base"
}
```

### Resposta de Estatísticas
```json
{
    "collection_name": "gemelli_knowledge_base",
    "total_documents": 150,
    "sample_documents": 5,
    "last_checked": "2025-07-28T15:30:00",
    "sources": {
        "artigo_ia": 25,
        "tutorial_ml": 30,
        "documentos_internos": 95
    }
}
```

## Erros Comuns

### 401 - Unauthorized
Verifique se a `CHROMA_CLOUD_API_KEY` está configurada corretamente.

### 404 - Collection Not Found
A coleção especificada não existe. Use o endpoint de inicialização primeiro.

### 500 - Internal Server Error
Erro interno do servidor. Verifique os logs para mais detalhes.

## Integração com Frontend

### JavaScript/TypeScript
```javascript
const API_BASE = 'http://localhost:8000/api/v1/chroma-cloud';

// Buscar conhecimento
async function searchKnowledge(query) {
    const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            max_results: 5
        })
    });
    
    return await response.json();
}

// Adicionar documento
async function addDocument(content, metadata) {
    const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documents: [{
                content: content,
                metadata: metadata
            }]
        })
    });
    
    return await response.json();
}
```

### Python Requests
```python
import requests

API_BASE = 'http://localhost:8000/api/v1/chroma-cloud'

def search_knowledge(query, max_results=5):
    response = requests.post(f'{API_BASE}/search', json={
        'query': query,
        'max_results': max_results
    })
    return response.json()

def add_document(content, metadata=None):
    response = requests.post(f'{API_BASE}/documents', json={
        'documents': [{
            'content': content,
            'metadata': metadata or {}
        }]
    })
    return response.json()
```
