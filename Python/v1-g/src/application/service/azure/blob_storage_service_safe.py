import os
import shutil
import time
import gc
from src.infrastructure.zip.zip_utils import unzip
from src.infrastructure.azure.blob_storage.blob_storage import import_from_blob
from src.infrastructure.chromadb.chroma_vector_db import fechar_chromadb

def import_from_blob_service(blob_name, to_folder):
    """
    Versão mais segura que usa estratégia de overlay em vez de remoção completa
    """
    import tempfile
    
    # Fechar todas as conexões ChromaDB
    fechar_chromadb()
    gc.collect()
    time.sleep(2)
    
    zip_name = "chroma_db_backup.zip"
    
    # Baixar o zip do blob
    import_from_blob(blob_name, zip_name)

    # Usar diretório temporário do sistema
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_extract_path = os.path.join(temp_dir, "chroma_extract")
        
        # Extrair para pasta temporária
        print(f"Extraindo backup para: {temp_extract_path}")
        unzip(zip_name, temp_extract_path)

        # Criar pasta destino se não existir
        if not os.path.exists(to_folder):
            os.makedirs(to_folder)
        
        # Copiar arquivos importantes um por um
        chroma_files = ["chroma.sqlite3", "chroma.sqlite3-shm", "chroma.sqlite3-wal"]
        
        for file_name in chroma_files:
            src_file = None
            dest_file = os.path.join(to_folder, file_name)

            # Procurar o arquivo na estrutura extraída
            for root, dirs, files in os.walk(temp_extract_path):
                if file_name in files:
                    src_file = os.path.join(root, file_name)
                    break
            
            if src_file and os.path.exists(src_file):
                try:
                    # Se arquivo destino existe, tentar removê-lo primeiro
                    if os.path.exists(dest_file):
                        try:
                            os.remove(dest_file)
                        except PermissionError:
                            # Se não conseguir remover, tentar sobreescrever
                            pass
                    
                    # Copiar arquivo
                    shutil.copy2(src_file, dest_file)
                    print(f"Arquivo copiado: {file_name}")
                    
                except Exception as e:
                    print(f"Erro ao copiar {file_name}: {e}")
        
        # Copiar outros arquivos/pastas se existirem
        for item in os.listdir(temp_extract_path):
            if item.startswith("chroma_db"):
                src_chroma_path = os.path.join(temp_extract_path, item)
                if os.path.isdir(src_chroma_path):
                    # Copiar conteúdo da pasta chroma_db
                    for sub_item in os.listdir(src_chroma_path):
                        src_path = os.path.join(src_chroma_path, sub_item)
                        dest_path = os.path.join(to_folder, sub_item)

                        try:
                            if os.path.isfile(src_path):
                                shutil.copy2(src_path, dest_path)
                            elif os.path.isdir(src_path):
                                if os.path.exists(dest_path):
                                    shutil.rmtree(dest_path)
                                shutil.copytree(src_path, dest_path)
                        except Exception as e:
                            print(f"Erro ao copiar {sub_item}: {e}")
    
    # Remover o zip local
    if os.path.exists(zip_name):
        try:
            os.remove(zip_name)
        except:
            print(f"Não foi possível remover {zip_name}")

    print(f"Importação segura concluída: {to_folder}")