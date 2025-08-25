import os
import zipfile

def zipar(origem, destino_zip):
    with zipfile.ZipFile(destino_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        if os.path.isdir(origem):
            for root, dirs, files in os.walk(origem):
                for file in files:
                    caminho_completo = os.path.join(root, file)
                    caminho_relativo = os.path.relpath(caminho_completo, os.path.dirname(origem))
                    zipf.write(caminho_completo, caminho_relativo)
        else:
            zipf.write(origem, os.path.basename(origem))
    print(f"Arquivo zipado: {destino_zip}")

# Função para extrair arquivos ZIP
def extrair(arquivo_zip, destino_pasta):
    with zipfile.ZipFile(arquivo_zip, 'r') as zipf:
        zipf.extractall(destino_pasta)
    print(f"Arquivo extraído em: {destino_pasta}")