from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from pydantic.types import SecretStr
from src.infrastructure.config.settings_config import settings
from src.agent.people.tools import (
    greet_user,
    send_email_tool,
    fetch_employee_data_tool
)

from src.agent.people.sql_tools import (
    pdf_data,
)

from src.agent.people.vector_db_tools import (
    search_documents
)

from src.agent.people.search_tools import (
    web_search_tool,
    news_search_tool
)

from src.agent.people.qdrant_tools import (
    search_qdrant_tool,
    insert_to_qdrant_tool,
    search_doc_qdrant_tool,
    search_doc_qdrant_by_name_tool
)

def create_agent_executor(id_agent: str):
    """Creates a generic agent"""
    tools = [
        greet_user,
        fetch_employee_data_tool,
        web_search_tool,
        send_email_tool,
        news_search_tool,
        search_documents,
        pdf_data,
        search_qdrant_tool,
        insert_to_qdrant_tool,
        search_doc_qdrant_tool,
        search_doc_qdrant_by_name_tool
    ]
    
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", f"You are a helpful assistant HR with the id_agent {id_agent}. Use tools only when necessary e.g.: 'Greet the user', otherwise answer directly and in portuguese."),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    
    llm = ChatGroq(
        model="llama3-70b-8192",
        temperature=0.01,  # Usar valor mínimo em vez de 0
        api_key=SecretStr(settings.GROQ_API_KEY),
        max_retries=2,
        request_timeout=45.0
    )

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent, 
        tools=tools,
        return_intermediate_steps=True,
        handle_parsing_errors=True,
        verbose=True,
        max_iterations=5,  # Limitar número de iterações
        early_stopping_method="generate"  # Parar na primeira resposta válida
    )

    return agent_executor, llm