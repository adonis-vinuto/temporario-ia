"""
Sistema de limpeza de arquivos ChromaDB com estratégias múltiplas
"""
import os
import shutil
import time
import gc
import threading
from datetime import datetime, timedelta

def create_cleanup_script():
    """
    Cria um script batch para limpeza posterior dos arquivos
    """
    script_content = '''@echo off
echo Iniciando limpeza de arquivos ChromaDB temporarios...
timeout /t 30 /nobreak > nul

for /d %%i in (chroma_db_cleanup_*) do (
    echo Removendo %%i...
    rmdir /s /q "%%i" 2>nul
    if exist "%%i" (
        echo Falha ao remover %%i
    ) else (
        echo %%i removido com sucesso
    )
)

for /d %%i in (chroma_db_temp_*) do (
    echo Removendo %%i...
    rmdir /s /q "%%i" 2>nul
    if exist "%%i" (
        echo Falha ao remover %%i
    ) else (
        echo %%i removido com sucesso
    )
)

echo Limpeza concluida.
del "%~f0"
'''
    
    script_path = "cleanup_chromadb.bat"
    try:
        with open(script_path, 'w') as f:
            f.write(script_content)
        return script_path
    except:
        return None

def cleanup_chromadb_smart(chroma_path="./chroma_db", max_attempts=3):
    """
    Limpeza inteligente do ChromaDB com múltiplas estratégias
    """
    if not os.path.exists(chroma_path):
        print("✓ Pasta ChromaDB não existe - nada para limpar")
        return True
    
    print(f"Iniciando limpeza inteligente: {chroma_path}")
    
    # Estratégia 0: Forçar fechamento de processos primeiro
    try:
        from src.infrastructure.chromadb.process_utils import force_kill_processes_using_path, unlock_files_windows
        
        print("Tentando forçar fechamento de processos...")
        force_kill_processes_using_path(chroma_path)
        
        print("Tentando desbloquear arquivos...")
        unlock_files_windows(chroma_path)
        
        # Aguardar um pouco após forçar fechamento
        time.sleep(3)
        
    except Exception as e:
        print(f"Erro ao forçar fechamento: {e}")
    
    # Estratégia 1: Remoção direta
    for attempt in range(max_attempts):
        try:
            # Força liberação de recursos
            for _ in range(5):
                gc.collect()
                time.sleep(0.5)
            
            shutil.rmtree(chroma_path)
            print("✓ Pasta removida com sucesso (método direto)")
            return True
            
        except PermissionError as e:
            print(f"Tentativa {attempt + 1} falhou: {e}")
            if attempt < max_attempts - 1:
                # Tentar forçar novamente entre tentativas
                try:
                    force_kill_processes_using_path(chroma_path)
                    time.sleep(2)
                except:
                    pass
            continue
        except Exception as e:
            print(f"Erro inesperado na tentativa {attempt + 1}: {e}")
            break
    
    # Estratégia 2: Mover arquivos individuais para pasta temporária
    try:
        print("Tentando mover arquivos individuais...")
        timestamp = int(time.time())
        temp_path = f"./temp_chromadb_{timestamp}"
        os.makedirs(temp_path, exist_ok=True)
        
        moved_count = 0
        for root, dirs, files in os.walk(chroma_path):
            for file in files:
                src_file = os.path.join(root, file)
                try:
                    rel_path = os.path.relpath(src_file, chroma_path)
                    dest_file = os.path.join(temp_path, rel_path)
                    os.makedirs(os.path.dirname(dest_file), exist_ok=True)
                    shutil.move(src_file, dest_file)
                    moved_count += 1
                except:
                    continue
        
        if moved_count > 0:
            print(f"✓ {moved_count} arquivos movidos para {temp_path}")
            
            # Tentar remover diretórios vazios
            try:
                for root, dirs, files in os.walk(chroma_path, topdown=False):
                    for dir in dirs:
                        dir_path = os.path.join(root, dir)
                        try:
                            os.rmdir(dir_path)
                        except:
                            pass
                os.rmdir(chroma_path)
                print("✓ Diretórios vazios removidos")
                return True
            except:
                pass
        
    except Exception as e:
        print(f"Erro ao mover arquivos: {e}")
    
    # Estratégia 3: Renomear para limpeza posterior
    try:
        timestamp = int(time.time())
        backup_name = f"./chroma_db_cleanup_{timestamp}"
        
        print(f"Renomeando para limpeza posterior: {backup_name}")
        os.rename(chroma_path, backup_name)
        
        # Estratégia 4: Script de limpeza em background
        script_path = create_cleanup_script()
        if script_path:
            def run_cleanup_script():
                time.sleep(60)  # Aguarda 1 minuto
                try:
                    import subprocess
                    subprocess.Popen(script_path, shell=True)
                except:
                    pass
            
            thread = threading.Thread(target=run_cleanup_script, daemon=True)
            thread.start()
            print("✓ Script de limpeza agendado")
        
        print(f"✓ Pasta renomeada para limpeza posterior: {backup_name}")
        return True
        
    except Exception as e:
        print(f"✗ Falha ao renomear pasta: {e}")
    
    # Estratégia 5: Marcação para limpeza manual
    try:
        marker_file = os.path.join(chroma_path, "DELETE_ME.txt")
        with open(marker_file, 'w') as f:
            f.write(f"Esta pasta pode ser removida manualmente.\n")
            f.write(f"Criada em: {datetime.now()}\n")
            f.write(f"Processo: Limpeza ChromaDB\n")
            f.write(f"Comando para remoção forçada:\n")
            f.write(f"rmdir /s /q \"{os.path.abspath(chroma_path)}\"\n")
        
        print(f"⚠ Pasta marcada para remoção manual: {chroma_path}")
        return False
        
    except:
        print(f"⚠ Não foi possível limpar nem marcar a pasta: {chroma_path}")
        return False

def cleanup_old_chromadb_folders(max_age_hours=24):
    """
    Remove pastas antigas de cleanup que possam ter ficado
    """
    current_time = time.time()
    removed_count = 0
    
    try:
        for item in os.listdir("."):
            if item.startswith("chroma_db_cleanup_") or item.startswith("chroma_db_temp_"):
                try:
                    # Extrair timestamp do nome
                    timestamp_str = item.split("_")[-1]
                    folder_time = int(timestamp_str)
                    
                    # Verificar se é antiga o suficiente
                    age_hours = (current_time - folder_time) / 3600
                    
                    if age_hours > max_age_hours:
                        if os.path.exists(item):
                            shutil.rmtree(item)
                            print(f"✓ Pasta antiga removida: {item}")
                            removed_count += 1
                            
                except (ValueError, OSError):
                    continue
    except:
        pass
    
    if removed_count > 0:
        print(f"✓ {removed_count} pastas antigas foram limpas")
    
    return removed_count
