from pydantic_settings import BaseSettings, SettingsConfigDict

class SettingsConfig(BaseSettings):
    """Configurações da aplicação carregadas de variáveis de ambiente."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    GROQ_API_KEY: str
    BASE_BACKEND_URL: str
    LOG_LEVEL: str
    SENDGRID_API_KEY: str
    FROM_EMAIL: str
    MAX_FILE_SIZE: int = 50 * 1024 * 1024
    MAX_CHAT_HISTORY: int = 100
    MAX_MESSAGE_LENGTH: int = 10000
    MAX_CONCURRENT_OCR: int = 5
    REQUEST_TIMEOUT: int = 30

# Instância global das configurações
settings = SettingsConfig()