from langchain.agents import AgentExecutor
from langchain_core.messages import HumanMessage, AIMessage

from src.agent.people.people_agent import create_agent_executor
from src.domain.schema.agent.chat_schema import RoleEnum, Usage

from src.infrastructure.callback.metadata_callback import MetadataCallbackHandler

class BaseAgent:
    def __init__(self, id_agent: str):
        agent_executor, llm = create_agent_executor(id_agent)
        self.agent_executor: AgentExecutor = agent_executor
        self.llm = llm

    async def chat(self, user_input: str, chat_history: list) -> dict:
        try:
            langchain_chat_history = []
            for message in chat_history:
                if message.get("role") == RoleEnum.USER.value:
                    langchain_chat_history.append(HumanMessage(content=message["content"]))
                elif message.get("role") == RoleEnum.AGENT.value:
                    langchain_chat_history.append(AIMessage(content=message["content"]))
            
            metadata_callback = MetadataCallbackHandler()

            response = await self.agent_executor.ainvoke(
                {"input": user_input, "chat_history": langchain_chat_history},
                config={"callbacks": [metadata_callback]}
            )

            usage = {}
            if metadata_callback.metadata_list:
                last_call_metadata = metadata_callback.metadata_list[-1]
                
                # Instancia o modelo Usage com os dados do callback
                usage = Usage(
                    **{
                        "model-name": last_call_metadata.get("model_name"),
                        "finish-reason": last_call_metadata.get("finish_reason"),
                        "input-tokens": last_call_metadata.get("input_tokens"),
                        "output-tokens": last_call_metadata.get("output_tokens"),
                        "total-tokens": last_call_metadata.get("total_tokens"),
                    }
                )
            else:
                # Cria um objeto Usage vazio se nenhum metadado for encontrado
                usage = Usage(
                    **{
                        "model-name": "",
                        "finish-reason": "",
                        "input-tokens": 0,
                        "output-tokens": 0,
                        "total-tokens": 0,
                    }
                )
            
            # Adiciona o objeto de 'usage' à resposta final
            response["usage"] = usage

            print("response", response)

            return response
            
        except Exception as e:
            error_str = str(e)
            print(f"ERRO no BaseAgent.chat: {error_str}")
            
            # Verificar se é um erro específico do Groq sobre function calling
            if "Failed to call a function" in error_str or "APIError" in error_str:
                print("ERRO: Problema específico com function calling do Groq")
                return {
                    "output": "Erro na execução de ferramentas. Tente reformular sua solicitação.",
                    "usage": Usage(
                        **{
                            "model-name": "llama3-70b-8192",
                            "finish-reason": "error",
                            "input-tokens": 0,
                            "output-tokens": 0,
                            "total-tokens": 0,
                        }
                    )
                }
            
            import traceback
            traceback.print_exc()
            # Retorna uma resposta de erro estruturada
            return {
                "output": f"Erro interno do agente: {error_str}",
                "usage": Usage(
                    **{
                        "model-name": "",
                        "finish-reason": "error",
                        "input-tokens": 0,
                        "output-tokens": 0,
                        "total-tokens": 0,
                    }
                )
            }

def get_base_agent(id_agent: str) -> BaseAgent:
    """Dependency injector for the BaseAgent."""
    return BaseAgent(id_agent)