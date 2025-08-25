import httpx
from src.infrastructure.config.settings_config import settings
from typing import Dict, Any, Optional

async def make_api_request(endpoint: str, params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Função genérica para realizar chamadas HTTP ao servidor de backend.

    Args:
        endpoint (str): Caminho do endpoint relativo (ex.: '/api/people/sql-tool/search-employee/{id_agent}/{employee_id}').
        params (Optional[Dict[str, str]]): Parâmetros para formatar o endpoint, se necessário.

    Returns:
        Dict[str, Any]: Resposta JSON da API ou dicionário com erro.

    Example:
        await make_api_request(
            endpoint="/api/people/sql-tool/search-employee/{id_agent}/{employee_id}",
            params={"id_agent": "123", "employee_id": "456"}
        )
    """
    if params:
        try:
            url = f"{settings.BASE_BACKEND_URL}{endpoint.format(**params)}"
        except KeyError as e:
            return {"error": f"Parâmetro ausente para formatar endpoint: {str(e)}"}
    else:
        url = f"{settings.BASE_BACKEND_URL}{endpoint}"

    headers = {"Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        return {"error": f"Erro na requisição: {e.response.status_code} - {e.response.text}"}
    except httpx.RequestError as e:
        return {"error": f"Erro de conexão: {str(e)}"}
    except Exception as e:
        return {"error": f"Erro inesperado: {str(e)}"}

async def fetch_employee_data(id_agent: str, employee_id: str) -> Dict[str, Any]:
    """
    Busca os dados completos do employee pelo seu próprio ID.

    Args:
        id_agent (str): ID do agente que realiza a consulta.
        employee_id (str): ID do funcionário a ser consultado.

    Returns:
        Dict[str, Any]: Dados do funcionário ou erro.
    """
    if not id_agent or not employee_id:
        return {"error": "ID do agente ou do employee ausente."}
    return await make_api_request(
        endpoint="/api/people/sql-tool/search-employee/{id_agent}/{employee_id}",
        params={"id_agent": id_agent, "employee_id": employee_id}
    )

async def fetch_rh_ai_ferias(cpf: str, agent_id: str) -> Dict[str, Any]:
    """
    Consulta as férias de um colaborador pelo CPF.

    Args:
        cpf (str): CPF do funcionário.
        agent_id (str): ID do agente que realiza a consulta.

    Returns:
        Dict[str, Any]: Dados das férias ou erro.
    """
    if not cpf or not agent_id:
        return {"error": "CPF ou ID do agente ausente."}
    return await make_api_request(
        endpoint="/api/people/senior-hcm-tools/rh-ai-ferias/{cpf}/{agent_id}",
        params={"cpf": cpf, "agent_id": agent_id}
    )

async def fetch_rh_ai_holerite(cpf: str, agent_id: str) -> Dict[str, Any]:
    """
    Consulta o holerite do funcionário pelo CPF.

    Args:
        cpf (str): CPF do funcionário.
        agent_id (str): ID do agente que realiza a consulta.

    Returns:
        Dict[str, Any]: Dados do holerite ou erro.
    """
    if not cpf or not agent_id:
        return {"error": "CPF ou ID do agente ausente."}
    return await make_api_request(
        endpoint="/api/people/senior-hcm-tools/rh-ai-holerite/{cpf}/{agent_id}",
        params={"cpf": cpf, "agent_id": agent_id}
    )

async def fetch_rh_ai_cartao_de_ponto(cpf: str, agent_id: str) -> Dict[str, Any]:
    """
    Consulta o cartão de ponto do funcionário pelo CPF.

    Args:
        cpf (str): CPF do funcionário.
        agent_id (str): ID do agente que realiza a consulta.

    Returns:
        Dict[str, Any]: Dados do cartão de ponto ou erro.
    """
    if not cpf or not agent_id:
        return {"error": "CPF ou ID do agente ausente."}
    return await make_api_request(
        endpoint="/api/people/senior-hcm-tools/rh-ai-cartao-de-ponto/{cpf}/{agent_id}",
        params={"cpf": cpf, "agent_id": agent_id}
    )

async def fetch_rh_ai_saldo_banco_horas(cpf: str, agent_id: str) -> Dict[str, Any]:
    """
    Consulta o saldo no banco de horas do funcionário pelo CPF.

    Args:
        cpf (str): CPF do funcionário.
        agent_id (str): ID do agente que realiza a consulta.

    Returns:
        Dict[str, Any]: Dados do saldo de banco de horas ou erro.
    """
    if not cpf or not agent_id:
        return {"error": "CPF ou ID do agente ausente."}
    return await make_api_request(
        endpoint="/api/people/senior-hcm-tools/rh-ai-saldo-banco-horas/{cpf}/{agent_id}",
        params={"cpf": cpf, "agent_id": agent_id}
    )

# Para adicionar uma nova função, siga este padrão:
#
# async def fetch_novo_recurso(param1: str, param2: str) -> Dict[str, Any]:
#     """
#     Descrição da nova funcionalidade.
#
#     Args:
#         param1 (str): Descrição do parâmetro 1.
#         param2 (str): Descrição do parâmetro 2.
#
#     Returns:
#         Dict[str, Any]: Dados retornados ou erro.
#     """
#     if not param1 or not param2:
#         return {"error": "Parâmetro 1 ou 2 ausente."}
#     return await make_api_request(
#         endpoint="/api/caminho/do/novo/recurso/{param1}/{param2}",
#         params={"param1": param1, "param2": param2}
#     )