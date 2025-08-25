import os
import time
import gc
import subprocess
import sys

def force_kill_processes_using_path(path):
    """
    Força o fechamento de processos que estão usando um caminho específico (Windows)
    """
    if sys.platform != "win32":
        return False
    
    try:
        # Normalizar o caminho
        abs_path = os.path.abspath(path)
        
        # Usar comando Windows para encontrar processos
        # handle.exe -u [path] mostra processos usando o caminho
        try:
            result = subprocess.run([
                'powershell', '-Command',
                f'Get-Process | Where-Object {{$_.Modules.FileName -like "*{abs_path}*"}} | Stop-Process -Force'
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                print("✓ Processos forçadamente finalizados via PowerShell")
                return True
        except:
            pass
        
        # Método alternativo usando tasklist e taskkill
        try:
            # Buscar por python.exe que pode estar usando os arquivos
            result = subprocess.run([
                'taskkill', '/F', '/IM', 'python.exe'
            ], capture_output=True, text=True, timeout=5)
            
            if "SUCCESS" in result.stdout:
                print("✓ Processos Python finalizados")
                time.sleep(2)
                return True
        except:
            pass
        
        return False
        
    except Exception as e:
        print(f"Erro ao forçar fechamento de processos: {e}")
        return False

def unlock_files_windows(path):
    """
    Tenta desbloquear arquivos usando métodos específicos do Windows
    """
    if sys.platform != "win32":
        return False
    
    try:
        abs_path = os.path.abspath(path)
        
        # Método 1: Usar handle.exe se disponível
        try:
            result = subprocess.run([
                'handle.exe', abs_path
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and result.stdout:
                print(f"Handles encontrados para {path}:")
                lines = result.stdout.split('\n')
                for line in lines:
                    if abs_path in line and 'pid:' in line:
                        # Extrair PID e tentar fechar
                        try:
                            pid = line.split('pid: ')[1].split(' ')[0]
                            subprocess.run(['taskkill', '/F', '/PID', pid], 
                                         capture_output=True, timeout=5)
                            print(f"✓ Processo {pid} finalizado")
                        except:
                            continue
                return True
        except FileNotFoundError:
            print("handle.exe não encontrado")
        except:
            pass
        
        # Método 2: Usar PowerShell para liberar handles
        try:
            ps_script = f'''
            $processes = Get-Process
            foreach ($proc in $processes) {{
                try {{
                    $proc.Modules | Where-Object {{$_.FileName -like "*{abs_path}*"}} | ForEach-Object {{
                        Stop-Process -Id $proc.Id -Force
                        Write-Host "Processo $($proc.ProcessName) finalizado"
                    }}
                }} catch {{}}
            }}
            '''
            
            result = subprocess.run([
                'powershell', '-Command', ps_script
            ], capture_output=True, text=True, timeout=15)
            
            time.sleep(2)
            return True
            
        except:
            pass
        
        return False
        
    except Exception as e:
        print(f"Erro ao desbloquear arquivos: {e}")
        return False

def verify_file_not_in_use(file_path, max_wait_seconds=5):
    """
    Verifica se um arquivo não está em uso, esperando até que seja liberado
    """
    start_time = time.time()
    
    while time.time() - start_time < max_wait_seconds:
        try:
            # Tenta abrir o arquivo em modo de escrita exclusiva
            with open(file_path, 'r+b') as f:
                pass
            return True  # Arquivo não está em uso
        except (PermissionError, IOError):
            time.sleep(0.2)
            continue
        except FileNotFoundError:
            return True  # Arquivo não existe, então não está em uso
    
    return False  # Timeout - arquivo ainda em uso

def force_close_file_handles(file_path):
    """
    Força o fechamento de handles de arquivo no Windows
    """
    try:
        if sys.platform == "win32":
            # No Windows, usa handle.exe se disponível
            try:
                result = subprocess.run(['handle.exe', file_path], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    print(f"Handles encontrados para {file_path}:")
                    print(result.stdout)
            except (subprocess.TimeoutExpired, FileNotFoundError):
                print("handle.exe não encontrado, usando método alternativo")
        
        # Força coleta de lixo múltiplas vezes
        for _ in range(5):
            gc.collect()
            time.sleep(0.2)
            
    except Exception as e:
        print(f"Erro ao tentar fechar handles: {e}")

def wait_for_file_release(file_path, max_wait_seconds=10):
    """
    Aguarda até que um arquivo seja liberado (não esteja mais em uso)
    """
    start_time = time.time()
    
    while time.time() - start_time < max_wait_seconds:
        try:
            # Tenta abrir o arquivo em modo exclusivo
            with open(file_path, 'r+b') as f:
                pass
            return True  # Arquivo foi liberado
        except (PermissionError, IOError):
            time.sleep(0.5)
            continue
    
    return False  # Timeout

def safe_remove_directory(dir_path, max_retries=5):
    """
    Remove um diretório de forma segura, com múltiplas tentativas
    """
    import shutil
    
    for attempt in range(max_retries):
        try:
            if os.path.exists(dir_path):
                # Tenta remover atributos readonly primeiro
                try:
                    for root, dirs, files in os.walk(dir_path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            os.chmod(file_path, 0o777)
                except:
                    pass
                
                shutil.rmtree(dir_path)
                print(f"Diretório {dir_path} removido com sucesso")
                return True
                
        except PermissionError as e:
            print(f"Tentativa {attempt + 1} falhou: {e}")
            if attempt < max_retries - 1:
                # Força liberação de recursos antes da próxima tentativa
                force_close_file_handles(dir_path)
                time.sleep(2)
            else:
                print(f"Não foi possível remover {dir_path} após {max_retries} tentativas")
                return False
        except Exception as e:
            print(f"Erro inesperado ao remover {dir_path}: {e}")
            return False
    
    return False

def wait_for_chromadb_complete_release(chroma_path="./chroma_db", max_wait_seconds=15):
    """
    Aguarda até que todos os arquivos do ChromaDB sejam completamente liberados
    """
    import time
    import os
    import gc
    
    print(f"Aguardando liberação completa dos arquivos ChromaDB...")
    
    # Lista de arquivos críticos que costumam ficar travados
    critical_files = []
    
    # Percorrer toda a estrutura para encontrar arquivos potencialmente problemáticos
    if os.path.exists(chroma_path):
        for root, dirs, files in os.walk(chroma_path):
            for file in files:
                file_path = os.path.join(root, file)
                # Arquivos que costumam ficar em uso
                if any(ext in file.lower() for ext in ['.bin', '.sqlite3', '.lock', '.log']):
                    critical_files.append(file_path)
    
    start_time = time.time()
    all_released = False
    
    while time.time() - start_time < max_wait_seconds and not all_released:
        all_released = True
        
        # Força múltiplas coletas de lixo
        for _ in range(3):
            gc.collect()
            time.sleep(0.3)
        
        # Verifica cada arquivo crítico
        for file_path in critical_files:
            if os.path.exists(file_path):
                if not verify_file_not_in_use(file_path, 1):
                    all_released = False
                    print(f"Aguardando liberação: {os.path.basename(file_path)}")
                    break
        
        if not all_released:
            time.sleep(1)
    
    if all_released:
        print("✓ Todos os arquivos ChromaDB foram liberados")
    else:
        print(f"⚠ Alguns arquivos ainda em uso após {max_wait_seconds}s")
    
    return all_released
