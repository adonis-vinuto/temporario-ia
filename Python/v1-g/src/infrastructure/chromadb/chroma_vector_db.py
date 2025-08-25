import requests
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import shutil
import os

# Inicializa o banco vetorial em memória
chroma_client = chromadb.PersistentClient(path="chroma_db")

# Cria uma coleção para armazenar os dados dos PDFs
collection = chroma_client.get_or_create_collection("pdf_data")

def insert_pdf_chroma(documents, metadatas, ids):
    """
    Insere um novo PDF no banco vetorial.
    
    Args:
        data: Dicionário com os dados do PDF a serem inseridos
    
    Returns:
        Mensagem de sucesso ou erro
    """
    try:
        # Adiciona ao banco vetorial
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

        return f"PDF inserido com sucesso"

    except Exception as e:
        return f"Erro ao inserir PDF: {str(e)}"
    

def query_pdf_chroma_id(query_text, n_results=3, ids = None):
    """
    Busca PDFs no banco vetorial.
    
    Args:
        query_text: Texto da consulta
        n_results: Número de resultados a serem retornados
    
    Returns:
        Resultados da consulta
    """
    if ids is None:
        ids = []
    results = collection.query(query_texts=[query_text], n_results=n_results, ids=ids)
    return results

def query_pdf_chroma(query_text, n_results=3):
    """
    Busca PDFs no banco vetorial.
    
    Args:
        query_text: Texto da consulta
        n_results: Número de resultados a serem retornados
    
    Returns:
        Resultados da consulta
    """
    results = collection.query(query_texts=[query_text], n_results=n_results)
    return results

# Alias para compatibilidade
def query_resume(query_text, n_results=3):
    """
    Alias para query_pdf_chroma - Busca PDFs no banco vetorial.
    
    Args:
        query_text: Texto da consulta
        n_results: Número de resultados a serem retornados
    
    Returns:
        Resultados da consulta
    """
    return query_pdf_chroma(query_text, n_results)

def delete_chroma_db():
    """
    Deleta o banco vetorial persistente.
    
    Returns:
        Mensagem de sucesso ou erro
    """
    global chroma_client, collection
    
    db_path = "chroma_db"
    try:
        # Primeiro, limpa todos os documentos da coleção
        try:
            all_data = collection.get()
            if all_data["ids"]:
                collection.delete(ids=all_data["ids"])
        except:
            pass
        
        # Fecha e limpa o cliente atual
        if chroma_client:
            try:
                # Deleta a coleção explicitamente
                chroma_client.delete_collection("pdf_data")
            except:
                pass
            try:
                # Reseta o cliente
                chroma_client.reset()
            except:
                pass
        
        # Força a coleta de lixo para liberar recursos
        import gc
        gc.collect()
        
        # Aguarda um pouco para o sistema liberar os arquivos
        import time
        time.sleep(0.5)
        
        # Tenta remover o diretório físico com retry
        max_retries = 5
        for attempt in range(max_retries):
            try:
                if os.path.exists(db_path):
                    shutil.rmtree(db_path)
                break
            except PermissionError as e:
                if attempt < max_retries - 1:
                    time.sleep(1)  # Aguarda 1 segundo antes de tentar novamente
                    gc.collect()  # Força coleta de lixo novamente
                else:
                    # Se ainda não conseguiu após todas as tentativas, 
                    # apenas limpa a coleção em vez de deletar o banco físico
                    pass
        
        # Reinicializa o cliente e a coleção
        chroma_client = chromadb.PersistentClient(path="chroma_db")
        collection = chroma_client.get_or_create_collection("pdf_data")
        
        # Verifica se realmente está vazio
        remaining_data = collection.get()
        if not remaining_data["ids"]:
            return "Banco vetorial limpo com sucesso."
        else:
            return f"Banco vetorial reinicializado. {len(remaining_data['ids'])} documentos ainda presentes."
            
    except Exception as e:
        # Em caso de erro, tenta pelo menos reinicializar o cliente
        try:
            chroma_client = chromadb.PersistentClient(path="chroma_db")
            collection = chroma_client.get_or_create_collection("pdf_data")
        except:
            pass
        return f"Erro ao deletar o banco vetorial: {str(e)}"

def clear_collection():
    """
    Limpa todos os dados da coleção atual sem deletar o banco.
    
    Returns:
        Mensagem de sucesso ou erro
    """
    global collection
    
    try:
        # Pega todos os IDs da coleção
        all_data = collection.get()
        if all_data["ids"]:
            # Deleta todos os documentos pelos IDs em lotes para evitar problemas
            ids_list = all_data["ids"]
            batch_size = 1000  # Processa em lotes de 1000
            
            total_deleted = 0
            for i in range(0, len(ids_list), batch_size):
                batch_ids = ids_list[i:i + batch_size]
                collection.delete(ids=batch_ids)
                total_deleted += len(batch_ids)
            
            # Verifica se realmente foi limpo
            remaining_data = collection.get()
            if not remaining_data["ids"]:
                return f"Coleção limpa com sucesso. {total_deleted} documentos removidos."
            else:
                return f"Coleção parcialmente limpa. {total_deleted} documentos removidos, {len(remaining_data['ids'])} ainda restam."
        else:
            return "Coleção já está vazia."
    except Exception as e:
        return f"Erro ao limpar a coleção: {str(e)}"

def force_recreate_collection():
    """
    Força a recriação da coleção quando o delete normal não funciona.
    
    Returns:
        Mensagem de sucesso ou erro
    """
    global chroma_client, collection
    
    try:
        # Tenta deletar a coleção existente
        try:
            chroma_client.delete_collection("pdf_data")
        except:
            pass
        
        # Recria a coleção
        collection = chroma_client.get_or_create_collection("pdf_data")
        
        # Verifica se está vazia
        data = collection.get()
        return f"Coleção recriada com sucesso. Documentos restantes: {len(data['ids'])}"
        
    except Exception as e:
        return f"Erro ao recriar a coleção: {str(e)}"

def fechar_chromadb():
    global chroma_client, collection
    try:
        # Limpar referências
        collection = None
        chroma_client = None
        
        # Coleta de lixo simples
        import gc
        gc.collect()
        
        print("ChromaDB fechado")
        
    except Exception as e:
        print(f"Erro ao fechar ChromaDB: {e}")
        chroma_client = None
        collection = None

def reinicializar_chromadb():
    """
    Reinicializa o cliente ChromaDB
    """
    global chroma_client, collection
    try:
        chroma_client = chromadb.PersistentClient(path="chroma_db")
        collection = chroma_client.get_or_create_collection("pdf_data")
        print("ChromaDB reinicializado")
        return True
    except Exception as e:
        print(f"Erro ao reinicializar ChromaDB: {e}")
        return False