"""
Este módulo é responsável por criar e configurar as instâncias concretas
dos 'cérebros' dos agentes (Runnables e AgentExecutors).

Ele combina os modelos de linguagem (infraestrutura) com os prompts (lógica de negócio)
e as ferramentas (infraestrutura) para produzir componentes prontos para serem
usados pela camada de aplicação.
"""
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.runnables import Runnable
from pydantic.types import SecretStr

from src.agent.people.search_tools import web_search_tool, news_search_tool
from src.infrastructure.config.settings_config import settings

# --- Configuração Centralizada dos LLMs ---
# Instanciamos os modelos aqui para serem reutilizados pelas fábricas.
# Isso centraliza a configuração, facilitando a troca de modelos no futuro.

# Um modelo mais rápido e barato para tarefas de roteamento e crítica.
llm_fast = ChatGroq(
    model="llama3-8b-8192", 
    temperature=0,
    api_key=SecretStr(settings.GROQ_API_KEY)
)

# Um modelo mais poderoso para a tarefa principal de escrita.
llm_powerful = ChatGroq(
    model="llama3-70b-8192", 
    temperature=0.2,
    api_key=SecretStr(settings.GROQ_API_KEY)
)


def create_researcher_agent_executor() -> AgentExecutor:
    """
    Cria e configura o AgentExecutor para o pesquisador.
    Este agente é mais complexo pois precisa escolher entre múltiplas ferramentas.
    """
    print("--- Fábrica: Criando o Agente Pesquisador com ferramentas. ---")
    tools = [web_search_tool, news_search_tool]
    
    # O prompt define a "personalidade" e as instruções do agente.
    prompt = ChatPromptTemplate.from_messages([
        ("system", 
         "Você é um assistente de pesquisa altamente qualificado. Sua tarefa é analisar o tópico fornecido e escolher a melhor ferramenta para encontrar as informações mais relevantes. "
         "Se o tópico parece pedir por notícias recentes, use 'news_search_tool'. Para todos os outros casos, use 'web_search_tool'. Responda em português."),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}") # Essencial para o agente funcionar
    ])
    
    # Cria o agente que sabe como chamar as ferramentas
    agent = create_tool_calling_agent(llm_fast, tools, prompt)
    
    # Cria o executor que efetivamente roda o agente em um loop
    return AgentExecutor(
        agent=agent, 
        tools=tools, 
        verbose=False # Desligamos o verbose para não poluir o log da API
    )


def create_writer_runnable() -> Runnable:
    """
    Cria e configura o Runnable para o escritor.
    Este é um 'chain' mais simples (Prompt + LLM), pois não precisa de ferramentas.
    """
    print("--- Fábrica: Criando o Runnable do Escritor. ---")
    prompt = ChatPromptTemplate.from_template(
        "Você é um redator de conteúdo técnico sênior, especialista em tecnologia e IA. "
        "Seu objetivo é escrever um artigo informativo e bem estruturado sobre '{topic}' com base na pesquisa fornecida. "
        "Se for uma revisão, reescreva o rascunho anterior para incorporar a crítica de forma precisa.\n\n"
        "PESQUISA:\n{research_summary}\n\n"
        "RASCUNHO ANTERIOR (se houver):\n{draft}\n\n"
        "CRÍTICA A SER ABORDADA (se houver):\n{critique}\n\n"
        "VERSÃO COMPLETA E REVISADA DO ARTIGO:"
    )
    
    # Usamos o modelo mais poderoso para garantir alta qualidade na escrita
    return prompt | llm_powerful


def create_critic_runnable() -> Runnable:
    """
    Cria e configura o Runnable para o crítico.
    """
    print("--- Fábrica: Criando o Runnable do Crítico. ---")
    prompt = ChatPromptTemplate.from_template(
        "Você é um editor-chefe exigente e detalhista. Sua função é fornecer uma crítica construtiva sobre o rascunho do artigo. "
        "Seja específico sobre os pontos a serem melhorados (clareza, profundidade, exemplos, etc.). "
        "Se houver feedback de um supervisor humano, priorize-o.\n"
        "No final da sua crítica, escreva a palavra 'APROVADO' em uma nova linha se o artigo estiver excelente e pronto para publicação, ou 'REVISAR' se precisar de alterações.\n\n"
        "RASCUNHO PARA AVALIAR:\n{draft}\n\n"
        "FEEDBACK DO SUPERVISOR HUMANO (se houver):\n{human_feedback}"
    )

    # Usamos o modelo mais rápido, pois a tarefa de crítica é menos complexa que a de escrita
    return prompt | llm_fast