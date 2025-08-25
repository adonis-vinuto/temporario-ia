from langchain.agents import tool
# Importamos a classe DDGS diretamente da biblioteca!
from ddgs import DDGS

# FERRAMENTA 1: BUSCA GERAL AVANÇADA
@tool
def web_search_tool(query: str) -> str:
    """
    Use esta ferramenta para fazer uma busca geral e avançada na web por informações
    ou eventos. Ela é otimizada para retornar resultados do Brasil.
    """
    print(f"--- EXECUTANDO BUSCA AVANÇADA PARA: {query} ---")
    
    # Usamos o DDGS() diretamente, nos dando acesso total aos parâmetros
    with DDGS() as ddgs:
        resultados = ddgs.text(
            query,
            region='br-pt',      # <<< A MUDANÇA MAIS IMPORTANTE! Resultados para Brasil/Português.
            safesearch='moderate', # Opções: 'strict', 'moderate', 'off'
            max_results=5      # Pedimos por mais resultados para ter mais contexto.
        )
        if not resultados:
            return "Nenhum resultado encontrado."
        
        # Formatamos a lista de dicionários em uma string legível para o LLM
        return "\n".join([f"Trecho: {r['body']}\nTítulo: {r['title']}\nLink: {r['href']}\n---" for r in resultados])

# FERRAMENTA 2: BUSCA DE NOTÍCIAS
@tool
def news_search_tool(query: str) -> str:
    """
    Use esta ferramenta ESPECIFICAMENTE para encontrar as notícias mais recentes
    sobre um tópico, empresa ou pessoa.
    """
    print(f"--- EXECUTANDO BUSCA DE NOTÍCIAS PARA: {query} ---")

    with DDGS() as ddgs:
        resultados = ddgs.news(
            query,
            region='br-pt',
            safesearch='moderate',
            max_results=5
        )
        if not resultados:
            return "Nenhuma notícia recente encontrada."
            
        # Formatamos a lista de dicionários de notícias
        return "\n".join([f"Notícia: {r['body']}\nTítulo: {r['title']}\nFonte: {r['source']} ({r['date']})\nLink: {r['url']}\n---" for r in resultados])