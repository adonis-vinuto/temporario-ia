from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from pydantic.types import SecretStr
from src.infrastructure.config.settings_config import settings

def create_agent_executor(id_agent: str):
    """Creates a generic agent"""
    tools = [
    ]
    
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", f"Você é um agente de IA {id_agent} especializado em processar documentos. Suas principais funções incluem: resumir textos, criar títulos descritivos e extrair informações relevantes de documentos."),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0,
        api_key=SecretStr(settings.GROQ_API_KEY),
    )

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent, tools=tools,
        return_intermediate_steps=True,
        verbose=True
        )

    return agent_executor, llm