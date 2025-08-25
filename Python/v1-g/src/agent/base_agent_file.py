from langchain.agents import AgentExecutor

from src.agent.file.file_agent import create_agent_executor
from src.domain.schema.agent.chat_schema import Usage

from src.infrastructure.callback.metadata_callback import MetadataCallbackHandler

class BaseAgent:
    def __init__(self, id_agent: str):
        agent_executor, llm = create_agent_executor(id_agent)
        self.agent_executor: AgentExecutor = agent_executor
        self.llm = llm

    async def chat(self, user_input: str) -> dict:
        metadata_callback = MetadataCallbackHandler()

        response = await self.agent_executor.ainvoke(
            {"input": user_input},
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

def get_base_agent(id_agent: str) -> BaseAgent:
    """Dependency injector for the BaseAgent."""
    return BaseAgent(id_agent)