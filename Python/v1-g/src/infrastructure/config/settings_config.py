from pydantic_settings import BaseSettings, SettingsConfigDict

class SettingsConfig(BaseSettings):
    """Configurações da aplicação carregadas de variáveis de ambiente."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    GROQ_API_KEY: str
    BASE_BACKEND_URL: str
    LOG_LEVEL: str
    SENDGRID_API_KEY: str
    FROM_EMAIL: str

    LANGSMITH_TRACING: bool = False
    LANGSMITH_API_KEY: str
    LANGSMITH_PROJECT: str
    LANGSMITH_ENDPOINT: str
    
    OCI_COMPARTMENT_ID: str
    
    AZURE_STORAGE_ACCOUNT_NAME: str
    AZURE_STORAGE_CONNECTION_STRING: str
    AZURE_STORAGE_CONTAINER_NAME: str

    # Pinecone Configuration
    PINECONE_API_KEY: str 
    PINECONE_INDEX_NAME: str 

    CHROMA_API_KEY: str
    CHROMA_TENANT: str
    CHROMA_DATABASE: str

    # ChromaDB Cloud Configuration
    CHROMA_CLOUD_API_KEY: str = ""
    CHROMA_CLOUD_TENANT: str = "default_tenant"
    CHROMA_CLOUD_DATABASE: str = "default_database" 

    # Qdrant Configuration
    QDRANT_URL: str
    QDRANT_API_KEY: str

# Instância global das configurações
settings = SettingsConfig()