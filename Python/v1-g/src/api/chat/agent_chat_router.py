from fastapi import APIRouter, Depends
from src.domain.schema.agent.chat_schema import ChatRequest, ChatRequestQdrant, ChatResponse, ChatHistoryItem, RoleEnum
from src.domain.schema.agent.agent_schema import AgentContext
from src.application.service.agent.agent_chat_service import ChatService, get_chat_service
from src.infrastructure.config.settings_config import settings
import requests
import os
from fastapi import HTTPException
from src.application.service.chromadb.chromadb_service import ChromaDBService, get_chromadb_service
from src.application.service.azure.blob_storage_service import exportar_para_blob_service, importar_do_blob_service_safe
from src.application.service.qdrant.qdrant_service import QdrantService, get_qdrant_service


router = APIRouter()
chromadb_service: ChromaDBService = get_chromadb_service()

@router.post("/chat-ai/{id_organization}/{module}/{id_agent}", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    agent_context: AgentContext = Depends(),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Main endpoint to chat with the agent."""
    print("OKKKKKK")
    response = await chat_service.chat(
        agent_context=agent_context,
        user_input=request.message,
        chat_history=[item.model_dump() for item in request.chat_history],
    )
    
    agent_output = response.get("output", "")
    usage = response.get("usage", {})

    return ChatResponse(
        **{
            "message-response": agent_output,
            "usage": usage
        }
    )

@router.post("/chat-ai-with-doc/{id_organization}/{module}/{id_agent}", response_model=ChatResponse)
async def chat_with_agent_doc(
    id_agent: int,
    request: ChatRequest,
    agent_context: AgentContext = Depends(),
    chat_service: ChatService = Depends(get_chat_service),
):
    """
    Chat com documentos - VERSÃO SIMPLIFICADA
    """
    chroma_path = "./chroma_db"
    
    try:
        print(f"=== CHAT COM DOCUMENTO - Agent ID: {id_agent} ===")
        
        # 1. Fechar ChromaDB e importar backup
        print("1. Importando backup...")
        chromadb_service.close()
        
        try:
            chroma_path = importar_do_blob_service_safe("chroma_db_backup.zip", "./chroma_db")
        except Exception as e:
            print(f"Erro na importação: {e}")
            raise HTTPException(status_code=500, detail=f"Erro ao importar backup: {str(e)}")
        
        # 2. Reinicializar ChromaDB
        print("2. Reinicializando ChromaDB...")
        if not chromadb_service.reinitialize():
            raise HTTPException(status_code=500, detail="Falha ao reinicializar ChromaDB")
        
        # 3. Primeira tentativa: verificar se existe documento específico no banco
        print("3. Primeira tentativa: verificando se documento já existe no banco...")
        
        # Primeiro, vamos buscar dados do documento na API para saber qual file_id procurar
        api_url = f"{settings.BASE_BACKEND_URL}/api/people/sql-tool/pdf-data/{id_agent}"
        try:
            api_response = requests.get(api_url, timeout=30)
            if api_response.status_code == 200:
                api_data = api_response.json()
                target_file_id = str(api_data["id-file"])
                target_file_name = api_data["name-file"]
                
                print(f"Verificando se arquivo {target_file_name} (ID: {target_file_id}) já existe...")
                
                # Verificar se documento específico já existe no banco
                try:
                    search_result = await chromadb_service.search_documents(
                        query=target_file_name,
                        n_results=1,
                        where={"file_id": target_file_id}
                    )
                    
                    if search_result and hasattr(search_result, 'documents') and search_result.documents:
                        print(f"✓ Documento {target_file_name} já existe no banco")
                        document_found_by_title = True
                    else:
                        print(f"✗ Documento {target_file_name} não encontrado no banco")
                        document_found_by_title = False
                except Exception as e:
                    print(f"Erro ao verificar documento específico: {e}")
                    document_found_by_title = False
            else:
                print(f"Erro ao acessar API: {api_response.status_code}")
                document_found_by_title = False
        except Exception as e:
            print(f"Erro ao acessar API: {e}")
            document_found_by_title = False
        
        # Primeira tentativa: buscar direto no banco vetorial
        print("4. Primeira tentativa: buscando no banco vetorial existente...")
        
        first_attempt = f"""
        {request.message}
        
        Por favor, utilize a ferramenta de search_documents para buscar informações relevantes e responda baseado nos resultados encontrados.
        
        IMPORTANTE: Se você não encontrar informações relevantes ou se os documentos encontrados não parecerem relacionados à pergunta do usuário, responda EXATAMENTE: "DOCUMENTO_NAO_ENCONTRADO"
        """

        first_response = await chat_service.chat(
            agent_context=agent_context,
            user_input=first_attempt,
            chat_history=[item.model_dump() for item in request.chat_history],
        )
        
        first_answer = first_response.get("output", "")
        
        # 5. Verificar se a primeira resposta foi satisfatória e se encontrou documentos relevantes
        if "DOCUMENTO_NAO_ENCONTRADO" not in first_answer:
            print("5. ✓ Documento encontrado no banco vetorial - usando resposta existente")
            response = first_response
        else:
            print("5. ✗ Documento não encontrado no banco vetorial - buscando na API...")
            
            # 6. Buscar dados do documento na API
            print("6. Buscando dados do documento na API...")
            api_url = f"{settings.BASE_BACKEND_URL}/api/people/sql-tool/pdf-data/{id_agent}"
            api_response = requests.get(api_url, timeout=30)
            
            if api_response.status_code != 200:
                raise HTTPException(status_code=api_response.status_code, 
                                  detail=f"Erro na API: {api_response.text}")
            
            api_data = api_response.json()
            file_id = api_data["id-file"]
            file_name = api_data["name-file"]
            
            # 7. Verificar se o documento já existe no banco antes de inserir
            print(f"7. Verificando se documento {file_name} (ID: {file_id}) já existe no banco...")
            
            document_exists = False
            try:
                # Buscar por file_id específico nos metadados
                search_result = await chromadb_service.search_documents(
                    query=file_name,
                    n_results=1,
                    where={"file_id": str(file_id)}
                )
                
                if search_result and hasattr(search_result, 'documents') and search_result.documents:
                    document_exists = True
                    print(f"✓ Documento {file_name} já existe no banco vetorial")
            except Exception as e:
                print(f"Erro ao verificar existência do documento: {e}")
            
            if document_exists:
                # Documento já existe, fazer nova busca mais específica
                print("8. Documento já existe - fazendo busca mais específica...")
                
                specific_search = f"""
                {request.message}
                
                Por favor, utilize a ferramenta de search_documents para buscar informações relevantes no documento "{file_name}" (ID: {file_id}) e responda baseado nos resultados encontrados.
                """

                response = await chat_service.chat(
                    agent_context=agent_context,
                    user_input=specific_search,
                    chat_history=[item.model_dump() for item in request.chat_history],
                )
                print("✓ Resposta gerada com documento existente")
            else:
                # Documento não existe, inserir no banco
                print(f"8. Documento não existe - inserindo {file_name} (ID: {file_id}) no banco...")
                
                documents = []
                metadatas = []
                ids = []
                
                for page_data in api_data["pages"]:
                    page_number = page_data["page"]
                    page_content = page_data.get("content", "")
                    
                    if page_content and page_content.strip():
                        documents.append(page_content)
                        metadatas.append({
                            "file_id": str(file_id),
                            "name_file": file_name,
                            "page_number": page_number
                        })
                        ids.append(f"file_{file_id}_page_{page_number}_content")
                
                if documents:
                    await chromadb_service.insert_documents(documents, metadatas, ids)
                    print(f"✓ {len(documents)} documentos inseridos no banco")
                    
                    # 9. Fazer backup após inserção
                    print("9. Fazendo backup do banco atualizado...")
                    chromadb_service.close()
                    exportar_para_blob_service(chroma_path, "chroma_db_backup.zip")
                    chromadb_service.reinitialize()
                    print("✓ Backup realizado")
                    
                    # 10. Segunda tentativa: buscar novamente com o documento inserido
                    print("10. Segunda tentativa: buscando com documento inserido...")
                    
                    second_attempt = f"""
                    {request.message}
                    
                    Por favor, utilize a ferramenta de search_documents para buscar informações relevantes no documento "{file_name}" e responda baseado nos resultados encontrados.
                    """

                    response = await chat_service.chat(
                        agent_context=agent_context,
                        user_input=second_attempt,
                        chat_history=[item.model_dump() for item in request.chat_history],
                    )
                    print("✓ Resposta gerada com documento inserido")
                else:
                    raise HTTPException(status_code=400, detail="Nenhum conteúdo válido encontrado no documento")

        return ChatResponse(
            **{
                "message-response": response.get("output", ""),
                "usage": response.get("usage", {})
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro inesperado: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    finally:
        # Sempre exportar backup antes de limpar (caso tenha havido mudanças)
        print("=== BACKUP FINAL ===")
        try:
            if os.path.exists(chroma_path):
                print("Fazendo backup final...")
                exportar_para_blob_service(chroma_path, "chroma_db_backup.zip")
                print("✓ Backup final realizado")
        except Exception as e:
            print(f"Aviso no backup final: {e}")
        
        # Limpeza SIMPLES
        print("=== LIMPEZA ===")
        try:
            chromadb_service.close()
            
            # Remover pasta completamente no final
            import os
            import shutil
            import time
            
            if os.path.exists(chroma_path):
                try:
                    # Aguardar um pouco para liberar arquivos
                    time.sleep(1)
                    shutil.rmtree(chroma_path)
                    print(f"Pasta {chroma_path} removida completamente")
                except PermissionError:
                    # Se der erro de permissão, tentar várias vezes
                    for attempt in range(5):
                        time.sleep(2)
                        try:
                            shutil.rmtree(chroma_path)
                            print(f"Pasta {chroma_path} removida na tentativa {attempt + 1}")
                            break
                        except:
                            if attempt == 4:  # última tentativa
                                print(f"Não foi possível remover {chroma_path} - arquivos ainda em uso")
                            continue
                except Exception as e:
                    print(f"Erro ao remover pasta: {e}")
            
        except Exception as e:
            print(f"Aviso na limpeza: {e}")
        
        print("=== FIM ===")

@router.post("/chat-ai-with-doc-v2/{id_organization}/{module}/{id_agent}", response_model=ChatResponse)
async def chat_with_agent_doc_v2(
    id_agent: int,
    request: ChatRequestQdrant,
    agent_context: AgentContext = Depends(),
    chat_service: ChatService = Depends(get_chat_service),
):
    try:
        query_prompt = f"""
        Você é um assistente especializado em busca de documentos.

        Sua tarefa é responder à pergunta: "{request.message}"

        Siga os seguintes passos:

        1. Extraia o nome do documento mencionado na pergunta (ex: "documento X").

        2. Use search_doc_qdrant_by_name_tool com:
        - doc_name: nome do documento extraído
        - collection: "{request.collection}"
        - id_agent: "{id_agent}"

        3. Se a resposta for "NÃO ENCONTRADO":
            - Use a ferramenta pdf_data com o ID "{id_agent}"
            - Armazene os dados com set_temp_document("current", <resultado>)
            - Use insert_to_qdrant_tool com:
                - collection: "{request.collection}"
                - document_id: "current"

        4. Por fim, utilize search_qdrant_tool com:
            - query: "{request.message}"
            - collection: "{request.collection}"

        Retorne a resposta com base no conteúdo mais relevante encontrado.
        """


        agent_request = await chat_service.chat(
            agent_context=agent_context,
            user_input=query_prompt,
            chat_history=[item.model_dump() for item in request.chat_history],
        )
        response = agent_request.get("output", "")
        
        return ChatResponse(
            **{
                "message-response": response,
                "usage": agent_request.get("usage", {})
            }
        )      

    except Exception as e:
        print(f"Erro ao processar requisição: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
