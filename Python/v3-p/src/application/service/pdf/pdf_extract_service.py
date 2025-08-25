import pytesseract
import pypdfium2 as pdfium
from PIL import Image
import logging
from typing import List, Dict, Optional
from src.application.service.pdf.ocr_config import OCRConfig
from src.domain.schema.file.pdf_schemas import PDFPageResult
import io


class PDFExtractor:
    """
    Classe utilitária para extração de texto de PDFs usando OCR
    """
    
    def __init__(self, 
                 dpi: int = 300, 
                 language: str = 'por',
                 tesseract_config: str = '--oem 3 --psm 6'):
        """
        Inicializa o extrator de OCR
        
        Args:
            dpi: Resolução para conversão PDF->imagem (padrão: 300)
            language: Idioma do Tesseract (padrão: 'por' para português)
            tesseract_config: Configurações específicas do Tesseract
        """
        self.dpi = dpi
        self.language = language
        self.tesseract_config = tesseract_config
        
    def extract_text_from_pdf_bytes(self, pdf_bytes: bytes) -> List[PDFPageResult]:
        """
        Extrai texto de um PDF a partir de bytes
        
        Args:
            pdf_bytes: Bytes do arquivo PDF
            
        Returns:
            Lista das páginas com texto extraído
            
        Raises:
            Exception: Erro durante processamento OCR
        """
        try:
            logging.info(f"Iniciando extração OCR - DPI: {self.dpi}, Idioma: {self.language}")
            
            # Converte PDF para imagens usando pypdfium2
            pdf = pdfium.PdfDocument(io.BytesIO(pdf_bytes))
            print(pdf)
            n_pages = len(pdf)
            logging.info(f"PDF convertido em {n_pages} páginas")
            
            result_pages = []
            
            for i in range(n_pages):
                try:
                    # Renderiza página como imagem PIL (apenas com scale)
                    page = pdf[i]
                    rendered = page.render(scale=self.dpi / 72)
                    if rendered is None:
                        logging.error(f"Renderização falhou na página {i+1}")
                        result_pages.append(
                            PDFPageResult(
                                page=i + 1,
                                text="",
                                raw_text="",
                                char_count=0,
                                error="Falha na renderização da página"
                            )
                        )
                        continue
                    pil_image = rendered.to_pil()

                    page_text = pytesseract.image_to_string(
                        pil_image,
                        lang=self.language,
                        config=self.tesseract_config
                    )

                    cleaned_text = self._clean_text(page_text)

                    result_pages.append(
                        PDFPageResult(
                            page=i + 1,
                            text=cleaned_text,
                            raw_text=page_text,
                            char_count=len(cleaned_text),
                            error=None
                        )
                    )

                    logging.info(f"Página {i + 1} processada - {len(cleaned_text)} caracteres")

                except Exception as page_error:
                    logging.error(f"Erro na página {i + 1}: {repr(page_error)}")
                    result_pages.append(
                        PDFPageResult(
                            page=i + 1,
                            text="",
                            raw_text="",
                            char_count=0,
                            error=repr(page_error)
                        )
                    )

            logging.info(f"Extração concluída - {len(result_pages)} páginas processadas")
            return result_pages

        except Exception as e:
            logging.error(f"Erro geral na extração OCR: {e}")
            raise Exception(f"Falha na extração de texto: {str(e)}")
    
    def extract_text_from_pdf_file(self, file_path: str) -> List[Dict[str, any]]:
        """
        Extrai texto de um arquivo PDF
        
        Args:
            file_path: Caminho para o arquivo PDF
            
        Returns:
            Lista de dicionários com página e texto extraído
        """
        try:
            with open(file_path, 'rb') as pdf_file:
                pdf_bytes = pdf_file.read()
            return self.extract_text_from_pdf_bytes(pdf_bytes)
        except FileNotFoundError:
            raise Exception(f"Arquivo não encontrado: {file_path}")
        except Exception as e:
            raise Exception(f"Erro ao ler arquivo {file_path}: {str(e)}")
    
    def _clean_text(self, text: str) -> str:
        """
        Limpa o texto extraído removendo quebras de linha excessivas e espaços
        
        Args:
            text: Texto bruto extraído pelo OCR
            
        Returns:
            Texto limpo
        """
        if not text:
            return ""
        
        # Remove quebras de linha excessivas e espaços múltiplos
        cleaned = ' '.join(text.strip().split())
        
        # Remove caracteres especiais indesejados (opcional)
        # cleaned = re.sub(r'[^\w\s\.,;:!?()-]', '', cleaned)
        
        return cleaned
    
    def extract_text_simple(self, pdf_bytes: bytes) -> str:
        """
        Extrai texto simples (todas as páginas concatenadas)
        
        Args:
            pdf_bytes: Bytes do arquivo PDF
            
        Returns:
            Texto de todas as páginas concatenado
        """
        pages = self.extract_text_from_pdf_bytes(pdf_bytes)
        return "\n\n--- PAGE BREAK ---\n\n".join([page.text for page in pages])
    
    def get_statistics(self, pdf_bytes: bytes) -> Dict[str, any]:
        """
        Retorna estatísticas sobre o documento processado
        
        Args:
            pdf_bytes: Bytes do arquivo PDF
            
        Returns:
            Dicionário com estatísticas
        """
        pages = self.extract_text_from_pdf_bytes(pdf_bytes)
        
        total_chars = sum(page.char_count for page in pages)
        pages_with_text = len([p for p in pages if p.char_count > 0])
        pages_with_errors = len([p for p in pages if p.error is not None])
        
        return {
            "total_pages": len(pages),
            "pages_with_text": pages_with_text,
            "pages_with_errors": pages_with_errors,
            "total_characters": total_chars,
            "average_chars_per_page": total_chars / len(pages) if pages else 0,
            "success_rate": (pages_with_text / len(pages)) * 100 if pages else 0
        }

# Factory function para facilitar o uso
def create_pdf_extractor(preset: str = "default") -> PDFExtractor:
    """
    Cria um extrator PDF com configurações predefinidas
    
    Args:
        preset: Tipo de configuração ('default', 'high_quality', 'low_quality', 'fast')
        
    Returns:
        Instância configurada do PDFOCRExtractor
    """
    configs = {
        'default': {'dpi': 300},
        'high_quality': OCRConfig.HIGH_QUALITY,
        'low_quality': OCRConfig.LOW_QUALITY,
        'fast': OCRConfig.FAST,
        'tables': OCRConfig.TABLES
    }
    
    config = configs.get(preset, configs['default'])
    return PDFExtractor(**config)