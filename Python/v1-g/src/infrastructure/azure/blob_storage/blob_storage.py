from azure.storage.blob import BlobServiceClient
from src.infrastructure.config.settings_config import settings

# Upload para Azure Blob (exportar)
def exportar_para_blob(caminho_arquivo, nome_blob):
    blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
    blob_client = blob_service_client.get_blob_client(container=settings.AZURE_STORAGE_CONTAINER_NAME, blob=nome_blob)

    with open(caminho_arquivo, 'rb') as data:
        blob_client.upload_blob(data, overwrite=True)
    print(f"Arquivo enviado para o Blob: {nome_blob}")

# Download do Azure Blob (importar)
def importar_do_blob(nome_blob, destino_local):
    blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
    blob_client = blob_service_client.get_blob_client(container=settings.AZURE_STORAGE_CONTAINER_NAME, blob=nome_blob)

    with open(destino_local, "wb") as download_file:
        download_stream = blob_client.download_blob()
        download_file.write(download_stream.readall())
    print(f"Arquivo baixado do Blob para: {destino_local}")