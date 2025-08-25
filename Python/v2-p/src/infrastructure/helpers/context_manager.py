"""
Utilitários para gerenciamento de contexto e controle de tokens.
"""
import re
from typing import Dict, Any


def truncate_text(text: str, max_chars: int = 2000) -> str:
    """
    Trunca um texto para um número máximo de caracteres.
    Tenta quebrar em parágrafos ou sentenças para manter coerência.
    """
    if len(text) <= max_chars:
        return text
    
    # Tenta quebrar em parágrafos primeiro
    paragraphs = text.split('\n\n')
    if len(paragraphs) > 1:
        result = ""
        for para in paragraphs:
            if len(result + para) <= max_chars - 50:  # Deixa espaço para "..."
                result += para + '\n\n'
            else:
                break
        if result:
            return result.strip() + "\n\n[...conteúdo truncado...]"
    
    # Se não conseguir quebrar em parágrafos, quebra em sentenças
    sentences = re.split(r'[.!?]+', text)
    result = ""
    for sentence in sentences:
        if len(result + sentence) <= max_chars - 50:
            result += sentence + ". "
        else:
            break
    
    return result.strip() + " [...conteúdo truncado...]"


def summarize_content(content: str, max_chars: int = 1000) -> str:
    """
    Cria um resumo do conteúdo para manter apenas as informações essenciais.
    """
    if len(content) <= max_chars:
        return content
    
    # Extrai apenas os primeiros parágrafos ou pontos principais
    lines = content.split('\n')
    summary_lines = []
    current_length = 0
    
    for line in lines:
        if current_length + len(line) <= max_chars - 50:
            summary_lines.append(line)
            current_length += len(line)
        else:
            break
    
    summary = '\n'.join(summary_lines)
    return summary + "\n[...resumo dos pontos principais...]"


def manage_workflow_context(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Gerencia o contexto do workflow para evitar excesso de tokens.
    Trunca ou resume conteúdos longos mantendo informações essenciais.
    """
    managed_state = state.copy()
    
    # Limita o tamanho da pesquisa
    if 'research_summary' in managed_state and managed_state['research_summary']:
        managed_state['research_summary'] = truncate_text(
            managed_state['research_summary'], 
            max_chars=1500
        )
    
    # Para revisões, mantém apenas um resumo do draft anterior
    if 'draft' in managed_state and managed_state['draft']:
        revision_number = managed_state.get('revision_number', 0)
        if revision_number > 1:  # A partir da segunda revisão
            managed_state['draft'] = summarize_content(
                managed_state['draft'], 
                max_chars=800
            )
        else:
            managed_state['draft'] = truncate_text(
                managed_state['draft'], 
                max_chars=2000
            )
    
    # Limita o tamanho da crítica
    if 'critique' in managed_state and managed_state['critique']:
        managed_state['critique'] = truncate_text(
            managed_state['critique'], 
            max_chars=1000
        )
    
    # Limita o feedback humano
    if 'human_feedback' in managed_state and managed_state['human_feedback']:
        managed_state['human_feedback'] = truncate_text(
            managed_state['human_feedback'], 
            max_chars=500
        )
    
    return managed_state
