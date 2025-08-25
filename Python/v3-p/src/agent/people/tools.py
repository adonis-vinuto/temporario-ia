from langchain_core.tools import tool
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from src.infrastructure.config.settings_config import settings
from src.infrastructure.repository.people_ropository import fetch_employee_data

@tool(return_direct=False)
async def fetch_employee_data_tool(id_agent: str, employee_id: str) -> dict:
    """
    Busca os dados completos do employee pelo seu próprio ID.
    Use esta ferramenta para obter informações detalhadas do colaborador.
    """
    fetch_employee_data_result = await fetch_employee_data(id_agent, employee_id)
    if "error" in fetch_employee_data_result:
        return {"error": fetch_employee_data_result["error"]}
    return fetch_employee_data_result

@tool(return_direct=True)
def greet_user() -> str:
    """Greet the user"""
    return (
        "Olá, sou o agente People de HR. Posso responder perguntas básicas, "
        "trazer dados de funcionários pelo ID e pesquisar informações na internet caso você precise. "
        "Como posso ajudar você hoje?"
    )

@tool
def send_email_tool(to: str, subject: str, body: str) -> str:
    """
    Envia um e-mail usando SendGrid.
    Parâmetros:
    - to: e-mail do destinatário
    - subject: assunto do e-mail
    - body: corpo do e-mail (aceita HTML)
    Retorna mensagem de sucesso ou erro.
    """
    SENDGRID_API_KEY = settings.SENDGRID_API_KEY # API Key do SendGrid
    FROM_EMAIL = settings.FROM_EMAIL  # E-mail do remetente

    if not SENDGRID_API_KEY or not FROM_EMAIL:
        return "Configuração de e-mail ausente."

    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to,
        subject=subject,
        html_content=body
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        if response.status_code == 202:
            return f"E-mail enviado para {to} com sucesso!"
        else:
            return f"Erro ao enviar e-mail: {response.status_code} - {response.body}"
    except Exception as e:
        return f"Erro ao enviar e-mail: {str(e)}"