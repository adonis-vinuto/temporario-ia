import asyncio
import json
import logging
import os
import time
import uuid
from pathlib import Path
from typing import Dict, Any, Optional, List
import PyPDF2
from src.application.service.agent.agent_chat_file_service import AgentChatFileService
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

from src.domain.schema.file.pdf_schema import PdfProcessingResult, PdfPage, PdfUsage, PdfProcessingStatus
from src.infrastructure.oci.oci_service import oci_document_extraction

logger = logging.getLogger(__name__)


class PdfToTextService:
    def __init__(self):
        self.agent_chat_file = AgentChatFileService()
        self.processing_tasks: Dict[str, PdfProcessingStatus] = {}
        self.results_dir = Path("temp/pdf_results")
        self.results_dir.mkdir(parents=True, exist_ok=True)
    
    async def start_pdf_processing(self, file_content: bytes, filename: str) -> str:
        """Inicia o processamento assíncrono do PDF e retorna o task_id"""
        task_id = str(uuid.uuid4())
        
        # Registra a tarefa como em processamento
        self.processing_tasks[task_id] = PdfProcessingStatus(
            task_id=task_id,
            status="processing"
        )
        
        # Salva arquivo temporariamente
        temp_file_path = self.results_dir / f"{task_id}_{filename}"
        with open(temp_file_path, "wb") as f:
            f.write(file_content)
        
        # Inicia processamento em background
        asyncio.create_task(self._process_pdf_async(task_id, temp_file_path))
        
        return task_id
    
    async def _process_pdf_async(self, task_id: str, file_path: Path):
        """Processa o PDF de forma assíncrona"""
        start_time = time.time()
        
        try:
            logger.info(f"Iniciando processamento do PDF para task_id: {task_id}")
            
            # Extrai texto do PDF usando OCI
            pages_content = await self._extract_text_from_pdf(file_path)
            print("Conteúdo extraído das páginas:", pages_content)
            
            # Verifica se conseguiu extrair conteúdo
            if not pages_content:
                logger.warning(f"Nenhum conteúdo extraído do PDF para task_id: {task_id}")
                pages_content = [
                    PdfPage(page=1, title="", content="Não foi possível extrair texto do PDF", resume_page="")
                ]
            
            # Gera resumo geral do PDF
            logger.info(f"Iniciando geração de resumo geral do PDF para task_id: {task_id}")
            resume_pdf = await self._generate_pdf_summary(pages_content)
            logger.info(f"Resumo gerado para task_id: {task_id}. Tamanho: {len(resume_pdf)} caracteres")
            
            # Calcula métricas de uso
            total_time = int((time.time() - start_time) * 1000)  # em ms
            usage = PdfUsage(
                total_tokens=sum(len(page.content.split()) for page in pages_content),
                total_time=total_time,
                total_oracle_interactions=len(pages_content)
            )
            
            # Cria resultado final
            result = PdfProcessingResult(
                resume_pdf=resume_pdf,
                pages=pages_content,
                usage=usage,
                status=0  # sucesso
            )
            
            # Atualiza status da tarefa
            self.processing_tasks[task_id].status = "completed"
            self.processing_tasks[task_id].result = result
            
            # Salva resultado em arquivo JSON
            await self._save_result_to_file(task_id, result)
            
            logger.info(f"Processamento concluído para task_id: {task_id}")
            
        except Exception as e:
            logger.error(f"Erro no processamento do PDF para task_id {task_id}: {str(e)}")
            self.processing_tasks[task_id].status = "failed"
            self.processing_tasks[task_id].error = str(e)
        
        finally:
            # Remove arquivo temporário
            if file_path.exists():
                file_path.unlink()
    
    async def _extract_text_from_pdf(self, file_path: Path) -> List[PdfPage]:
        """Extrai texto do PDF usando OCI Document AI"""
        pages = []
        
        try:
            logger.info(f"Iniciando extração de texto com OCI para: {file_path}")
            
            # Usa a função OCI para extrair texto
            with open(file_path, 'rb') as file:
                pdf_bytes = file.read()
            
            logger.info(f"Arquivo PDF carregado. Tamanho: {len(pdf_bytes)} bytes")
            
            # Extrai texto usando OCI
            oci_pages = oci_document_extraction(pdf_bytes)
            
            logger.info(f"OCI retornou {len(oci_pages)} páginas")
            
            # Verifica se o OCI conseguiu extrair algum texto
            has_text = any(page.get("text", "").strip() for page in oci_pages)
            
            logger.info(f"Has text: {has_text}")
            
            if not has_text:
                logger.warning("OCI não extraiu texto útil, usando fallback")
                pages = await self._extract_text_fallback(file_path)
            else:
                # Primeiro converte todas as páginas sem gerar títulos
                for oci_page in oci_pages:
                    page_number = oci_page.get("page", 1)
                    text_content = oci_page.get("text", "")
                    
                    logger.info(f"Página {page_number}: {len(text_content)} caracteres extraídos")
                    logger.debug(f"Conteúdo da página {page_number}: {text_content[:100]}...")

                    pdf_page = PdfPage(
                        page=page_number,
                        title="",  # Será preenchido depois
                        content=text_content.strip(),
                        resume_page=""  # Não gerar resumo
                    )
                    pages.append(pdf_page)
                
                # Agora gera títulos e resumos para páginas que têm conteúdo
                for page in pages:
                    if page.content.strip():
                        try:
                            logger.info(f"Gerando título para página {page.page}")
                            
                            # Pega as primeiras palavras mais significativas do conteúdo
                            content_preview = page.content[:800].strip()
                            
                            message = f"""Baseado no texto abaixo, crie um título conciso e descritivo que capture o tema principal. 
                                    O título deve ter no máximo 8 palavras e ser informativo sobre o conteúdo.

                                    Texto:
                                    {content_preview}

                                    Responda APENAS com o título, sem explicações adicionais."""
                            
                            title_response = await self.agent_chat_file.simple_chat(message, "file")
                            generated_title = title_response.get("output", "").strip()
                            
                            logger.info(f"Agent retornou para página {page.page}: '{generated_title}'")
                            
                            # Se o agent retornou um título válido, usa ele. Senão, cria um baseado no conteúdo
                            if generated_title and len(generated_title) > 3 and not generated_title.lower().startswith("erro"):
                                page.title = generated_title
                                logger.info(f"Usando título do agent: {generated_title}")
                            else:
                                # Fallback: pega as primeiras palavras significativas
                                words = page.content.split()[:10]
                                page.title = " ".join(words) + "..." if len(words) >= 10 else " ".join(words)
                                logger.warning(f"Usando fallback para página {page.page}: {page.title[:50]}...")
                            
                            # Agora gera o resumo da página
                            logger.info(f"Gerando resumo para página {page.page}")
                            
                            resume_message = f"""Faça um resumo conciso e informativo do seguinte texto.
                                            O resumo deve capturar os pontos principais em 2-3 frases, mantendo as informações mais relevantes.

                                            Texto:
                                            {page.content}

                                            Responda APENAS com o resumo, sem explicações adicionais."""
                            
                            resume_response = await self.agent_chat_file.simple_chat(resume_message, "file")
                            generated_resume = resume_response.get("output", "").strip()
                            
                            logger.info(f"Agent retornou resumo para página {page.page}: '{generated_resume[:100]}...'")
                            
                            # Se o agent retornou um resumo válido, usa ele
                            if generated_resume and len(generated_resume) > 10 and not generated_resume.lower().startswith("erro"):
                                page.resume_page = generated_resume
                                logger.info(f"Resumo da página {page.page} gerado com sucesso")
                            else:
                                # Fallback: pega as primeiras frases do conteúdo
                                sentences = page.content.split('.')[:3]
                                page.resume_page = '. '.join(sentences).strip() + '.' if sentences else "Resumo não disponível"
                                logger.warning(f"Usando fallback para resumo da página {page.page}")
                            
                            logger.info(f"Título e resumo gerados para página {page.page}")
                            
                        except Exception as e:
                            logger.error(f"Erro ao gerar título/resumo para página {page.page}: {str(e)}")
                            # Fallback: usa as primeiras palavras do conteúdo
                            words = page.content.split()[:8]
                            page.title = " ".join(words) + "..." if len(words) >= 8 else " ".join(words)
                            # Fallback para resumo: primeiras frases
                            sentences = page.content.split('.')[:2]
                            page.resume_page = '. '.join(sentences).strip() + '.' if sentences else "Resumo não disponível"
                    else:
                        page.title = f"Página {page.page} (vazia)"
                        page.resume_page = "Página sem conteúdo"
            
                logger.info(f"Extração OCI concluída. {len(pages)} páginas processadas.")
            
        except Exception as e:
            logger.error(f"Erro na extração com OCI: {str(e)}")
            logger.exception("Stack trace completo:")
            logger.info("Tentando fallback com PyMuPDF/PyPDF2...")
            
            # Fallback para métodos locais se OCI falhar
            pages = await self._extract_text_fallback(file_path)
        
        return pages
    
    async def _generate_pdf_summary(self, pages: List[PdfPage]) -> str:
        """Gera um resumo do PDF usando o agent_file"""
        try:
            # Combina todo o conteúdo das páginas
            full_content = "\n\n".join([
                f"--- Página {page.page} ---\n{page.content}" 
                for page in pages if page.content.strip()
            ])
            
            if not full_content.strip():
                return "Não foi possível gerar resumo: conteúdo vazio."
            
            # Prepara a mensagem para o agent_file
            prompt = f"""Faça um resumo executivo detalhado e bem estruturado do seguinte documento PDF:

                    {full_content}

                    Instruções para o resumo:
                    1. Identifique o tema principal e objetivo do documento
                    2. Extraia os pontos mais importantes de cada seção
                    3. Organize as informações de forma clara e estruturada
                    4. Use formatação em markdown para melhor legibilidade
                    5. Mantenha um tamanho apropriado (2-3 parágrafos principais)
                    6. Destaque conclusões e informações relevantes

                    Resumo Executivo:"""
            
            logger.info(f"Enviando conteúdo para agent_file para gerar resumo. Tamanho: {len(full_content)} caracteres")
            
            # Chama o agent_file para gerar o resumo
            response = await self.agent_chat_file.simple_chat(
                user_input=prompt,
                id_agent="file"  # Usando o agent específico para arquivos
            )
            
            # Extrai o resumo da resposta
            resume = response.get("output", "")
            
            if not resume.strip():
                logger.warning("Agent_file retornou resumo vazio")
                return "Resumo não foi gerado pelo agente."
            
            logger.info(f"Resumo gerado com sucesso. Tamanho: {len(resume)} caracteres")
            return resume.strip()
            
        except Exception as e:
            logger.error(f"Erro ao gerar resumo do PDF: {str(e)}")
            logger.exception("Stack trace completo:")
            return f"Erro ao gerar resumo: {str(e)}"
    
    async def _save_result_to_file(self, task_id: str, result: PdfProcessingResult):
        """Salva o resultado em arquivo JSON"""
        result_file = self.results_dir / f"{task_id}_result.json"
        with open(result_file, "w", encoding="utf-8") as f:
            json.dump(result.model_dump(), f, ensure_ascii=False, indent=2)
    
    def get_processing_status(self, task_id: str) -> Optional[PdfProcessingStatus]:
        """Retorna o status do processamento"""
        return self.processing_tasks.get(task_id)
    
    async def get_processing_result(self, task_id: str) -> Optional[PdfProcessingResult]:
        """Retorna o resultado do processamento se estiver completo"""
        status = self.processing_tasks.get(task_id)
        if status and status.status == "completed":
            return status.result
        
        # Tenta carregar do arquivo se não estiver em memória
        result_file = self.results_dir / f"{task_id}_result.json"
        if result_file.exists():
            try:
                with open(result_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return PdfProcessingResult(**data)
            except Exception as e:
                logger.error(f"Erro ao carregar resultado do arquivo: {e}")
        
        return None


# Instância singleton do serviço
_pdf_service = None

def get_pdf_service() -> PdfToTextService:
    global _pdf_service
    if _pdf_service is None:
        _pdf_service = PdfToTextService()
    return _pdf_service
