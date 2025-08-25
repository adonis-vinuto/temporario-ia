from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from pydantic.types import SecretStr
from src.infrastructure.config.settings_config import settings
from src.agent.komsales.tools import greet_user

def create_agent_executor():
    """Creates a generic agent"""
    tools = [greet_user]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful sales agent. Assist sales representatives with their questions, provide relevant information, and use tools only when necessary. Otherwise, answer directly and in Portuguese."),
            MessagesPlaceholder(variable_name="chat_history"),
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

    return agent_executor