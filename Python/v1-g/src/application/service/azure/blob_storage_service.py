from src.infrastructure.azure.blob_storage.blob_storage import exportar_para_blob, importar_do_blob
from src.infrastructure.zip.zip_utils import zipar, extrair
import os
import shutil
import time

def exportar_para_blob_service(pasta_local, nome_blob):
    """
    Zipar a pasta local e enviar o zip para o Azure Blob Storage.
    """
    nome_zip = "chroma_db_backup.zip"
    
    # Criar zip da pasta
    zipar(pasta_local, nome_zip)
    
    # Enviar para Azure Blob
    exportar_para_blob(nome_zip, nome_blob)
    
    # Apagar zip local
    if os.path.exists(nome_zip):
        os.remove(nome_zip)
        
def importar_do_blob_service_safe(nome_blob, pasta_destino):
    """
    Versão SIMPLES: Baixa e extrai substituindo pasta existente
    """
    arquivo_zip_local = "chroma_db_backup.zip"
    
    # Baixar o zip do blob
    importar_do_blob(nome_blob, arquivo_zip_local)
    
    # Remover pasta existente se existir
    if os.path.exists(pasta_destino):
        try:
            shutil.rmtree(pasta_destino)
            print(f"Pasta existente {pasta_destino} removida")
        except PermissionError:
            # Se der erro de permissão, aguardar e tentar novamente
            time.sleep(2)
            try:
                shutil.rmtree(pasta_destino)
                print(f"Pasta existente {pasta_destino} removida na segunda tentativa")
            except:
                print(f"Não foi possível remover {pasta_destino} - usando pasta alternativa")
                pasta_destino = f"{pasta_destino}_{int(time.time())}"
    
    # Extrair para pasta destino
    extrair(arquivo_zip_local, pasta_destino)
    print(f"Backup extraído para: {pasta_destino}")
    
    # Remover zip local
    if os.path.exists(arquivo_zip_local):
        os.remove(arquivo_zip_local)
    
    return pasta_destino  # Retorna o caminho real usado

