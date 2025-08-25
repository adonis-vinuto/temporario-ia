from pydantic_settings import BaseSettings, SettingsConfigDict

class SettingsConfig(BaseSettings):
    """Configurações da aplicação carregadas de variáveis de ambiente."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    GROQ_API_KEY: str
    BASE_BACKEND_URL: str
    LOG_LEVEL: str
    SENDGRID_API_KEY: str
    FROM_EMAIL: str

    #LANGSMITH
    LANGSMITH_TRACING: str
    LANGSMITH_ENDPOINT: str
    LANGSMITH_API_KEY: str 
    LANGSMITH_PROJECT: str 

# Instância global das configurações
settings = SettingsConfig()