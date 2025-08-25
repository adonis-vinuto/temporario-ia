#!/usr/bin/env python3
"""
GemelliAI - Script de Execução de Smoketests
============================================

Script simplificado para executar smoketests do projeto GemelliAI.
"""

import subprocess
import sys
import platform
from pathlib import Path

def get_python_command():
    """Retorna o comando Python correto para o ambiente atual."""
    if platform.system() == "Windows":
        # Caminho específico para o ambiente virtual do projeto
        venv_python = Path("C:/Users/statum/Desktop/GemelliAI FDS/GemelliAI/.venv/Scripts/python.exe")
        if venv_python.exists():
            return f'"{venv_python}"'
        else:
            return "python"
    else:
        return "python3"

def run_smoketests(test_type="all"):
    """Executa os smoketests especificados."""
    
    python_cmd = get_python_command()
    
    commands = {
        "health": f"{python_cmd} -m pytest src/tests/test_health.py -m smoke -v",
        "chat": f"{python_cmd} -m pytest src/tests/application/service/agent/test_chat_simple.py -m smoke -v", 
        "stable": f"{python_cmd} -m pytest src/tests/test_health.py src/tests/application/service/agent/test_chat_simple.py -v",
        "all": f"{python_cmd} -m pytest src/tests/ -v",
        "quick": f"{python_cmd} -m pytest src/tests/test_health.py src/tests/application/service/agent/test_chat_simple.py -v"
    }
    
    if test_type not in commands:
        print(f"❌ Tipo de teste '{test_type}' não reconhecido.")
        print("Tipos disponíveis: health, chat, stable, quick, all")
        return False
    
    command = commands[test_type]
    
    print("=" * 80)
    print("🚀 GEMELLIAI - EXECUÇÃO DE SMOKETESTS")
    print("=" * 80)
    print(f"Tipo: {test_type.upper()}")
    print(f"Comando: {command}")
    print(f"Python: {python_cmd}")
    print(f"Sistema: {platform.system()}")
    print("=" * 80)
    
    try:
        result = subprocess.run(command, shell=True, cwd=Path.cwd())
        
        if result.returncode == 0:
            print("\n✅ SMOKETESTS CONCLUÍDOS COM SUCESSO!")
            return True
        else:
            print(f"\n⚠️  SMOKETESTS CONCLUÍDOS COM ALGUMAS FALHAS (código: {result.returncode})")
            return False
            
    except KeyboardInterrupt:
        print("\n🛑 EXECUÇÃO INTERROMPIDA PELO USUÁRIO")
        return False
    except Exception as e:
        print(f"\n❌ ERRO DURANTE EXECUÇÃO: {e}")
        return False

def main():
    """Função principal."""
    
    if len(sys.argv) > 1:
        test_type = sys.argv[1].lower()
    else:
        test_type = "stable"  # Padrão: health + chat-ai com agente STANDARD
    
    print(f"GemelliAI Smoketests Runner")
    print(f"Tipo de teste: {test_type}")
    
    if test_type in ["help", "-h", "--help"]:
        print("\nUso: python run_smoketests.py [tipo]")
        print("\nTipos disponíveis:")
        print("  health  - Testa apenas o endpoint /health")
        print("  chat    - Testa apenas validações básicas do chat")
        print("  stable  - Testa health + chat básico (RECOMENDADO)")
        print("  quick   - Mesmo que stable (compatibilidade)")
        print("  all     - Executa todos os testes disponíveis")
        print("\nExemplos:")
        print("  python run_smoketests.py stable")
        print("  python run_smoketests.py health")
        print("\n💡 RECOMENDAÇÃO: Use 'stable' para executar apenas testes que sempre passam!")
        return
    
    success = run_smoketests(test_type)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
