import io
import re
import logging
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple

import cv2
import numpy as np
import pytesseract
import pypdfium2 as pdfium
from PIL import Image

from src.application.service.pdf.ocr_config import OCRConfig
from src.domain.schema.file.pdf_schemas import PDFPageResult
from src.domain.exception.application_exceptions import (
    DocumentProcessingException,
    FileFormatException,
    TextExtractionException,
)

# =========================
# Config
# =========================

@dataclass
class ProcessingConfig:
    # Geral
    dpi: int = 300
    tesseract_lang: str = 'por'  # pode usar 'por+eng' se quiser
    tesseract_config: str = '--oem 1 --psm 6 -c preserve_interword_spaces=1'

    # Estratégia
    min_acceptable_chars: int = 25
    try_without_signature_too: bool = True
    enable_deskew: bool = True
    deskew_max_angle_deg: float = 5.0

    # Remoção por cor (HSV) – assinaturas azuis e outras cores
    enable_color_removal: bool = True
    blue_lower_bound: Tuple[int, int, int] = (90, 80, 40)
    blue_upper_bound: Tuple[int, int, int] = (150, 255, 255)
    # Adicionar detecção para outras cores comuns em assinaturas
    enable_multi_color_removal: bool = True
    # Cores adicionais para detecção (preto/cinza escuro, verde, vermelho)
    black_lower_bound: Tuple[int, int, int] = (0, 0, 0)
    black_upper_bound: Tuple[int, int, int] = (180, 255, 50)  # tons escuros
    green_lower_bound: Tuple[int, int, int] = (35, 40, 40)
    green_upper_bound: Tuple[int, int, int] = (85, 255, 255)
    red_lower_bound: Tuple[int, int, int] = (0, 120, 70)
    red_upper_bound: Tuple[int, int, int] = (10, 255, 255)
    color_mask_min_area_threshold: float = 0.001  # 0.1%

    # Remoção por contornos – traços alongados/pouco sólidos
    enable_contour_removal: bool = True
    contour_min_area_ratio: float = 8e-6     # proporcional à área
    contour_max_area_ratio: float = 0.02
    contour_max_solidity: float = 0.55
    contour_min_aspect: float = 1.6
    contour_min_length_px: int = 25

    # Morfologia + inpainting
    morph_closing_kernel_size: int = 5
    inpainting_radius: int = 4
    inpainting_algorithm: int = cv2.INPAINT_TELEA

    # ===== NFC-e (papel térmico) =====
    receipt_mode: bool = False                 # liga pipeline especial para cupom
    upscale_factor: float = 1.7                # upsampling quando fonte pequena
    nfce_block_size: int = 25                  # janela do adaptive threshold
    nfce_C: int = 7                            # C do adaptive threshold
    limit_blue_mask_to_bottom_ratio: float = 0.50  # aplicar máscara azul só no rodapé (50% inferior)

class AdvancedPDFExtractor:
    """
    Extrator OCR robusto p/ PDFs-foto com possíveis assinaturas.
    Mantém contrato público: extract_text_from_pdf_bytes, extract_text_from_pdf_file,
    extract_text_simple, get_statistics; e a factory create_advanced_pdf_extractor.
    """

    def __init__(
        self,
        config: Optional[ProcessingConfig] = None,
        dpi: Optional[int] = None,
        language: Optional[str] = None,
        tesseract_config: Optional[str] = None,
    ):
        if config is None:
            config = ProcessingConfig(
                dpi=dpi or 300,
                tesseract_lang=language or 'por',
                tesseract_config=tesseract_config or '--oem 1 --psm 6 -c preserve_interword_spaces=1',
            )
        else:
            if dpi is not None:
                config.dpi = dpi
            if language is not None:
                config.tesseract_lang = language
            if tesseract_config is not None:
                config.tesseract_config = tesseract_config

        self.config = config
        self.dpi = config.dpi
        self.language = config.tesseract_lang
        self.tesseract_config = config.tesseract_config
        self.logger = logging.getLogger(__name__)

    # ============ Utils ============
    def _clean_text(self, text: str) -> str:
        if not text:
            return ""
        return ' '.join(text.strip().split())

    def _ensure_gray(self, img_bgr_or_gray: np.ndarray) -> np.ndarray:
        if img_bgr_or_gray.ndim == 2:
            return img_bgr_or_gray
        return cv2.cvtColor(img_bgr_or_gray, cv2.COLOR_BGR2GRAY)

    def _ocr_data(self, image_pil: Image.Image, config: str) -> Tuple[str, float, List[str]]:
        data = pytesseract.image_to_data(
            image_pil,
            lang=self.config.tesseract_lang,
            config=config,
            output_type=pytesseract.Output.DICT
        )
        confs = []
        for c in data.get("conf", []):
            try:
                cf = float(c)
                if cf >= 0:
                    confs.append(cf)
            except Exception:
                continue
        words = [w for w in data.get("text", []) if w and w.strip()]
        text = " ".join(words)
        avg_conf = (sum(confs) / len(confs)) if confs else 0.0
        return self._clean_text(text), avg_conf, words

    def _score_text(self, text: str, avg_conf: float, words: List[str]) -> float:
        # score = 70% confiança + 25% qualidade lexical + 5% comprimento normalizado
        alpha_words = sum(1 for w in words if re.search(r"[A-Za-zÀ-ÿ]{2,}", w))
        good_ratio = alpha_words / max(1, len(words))
        length_norm = min(len(text) / 800.0, 1.0)
        return (avg_conf / 100.0) * 0.7 + good_ratio * 0.25 + length_norm * 0.05

    # ============ Baseline ============
    def _baseline_images(self, pil_img: Image.Image) -> Tuple[Image.Image, Image.Image]:
        arr = np.array(pil_img)
        gray = self._ensure_gray(arr)
        _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        if np.mean(otsu) < 127:
            otsu = cv2.bitwise_not(otsu)
        return Image.fromarray(gray), Image.fromarray(otsu)

    # ============ Deskew ============
    def _deskew(self, gray: np.ndarray) -> np.ndarray:
        if not self.config.enable_deskew:
            return gray
        try:
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            lines = cv2.HoughLines(edges, 1, np.pi/180.0, threshold=120)
            if lines is None:
                return gray
            angles = []
            for rho, theta in lines[:, 0]:
                ang = (theta * 180.0 / np.pi) - 90.0
                if -self.config.deskew_max_angle_deg <= ang <= self.config.deskew_max_angle_deg:
                    angles.append(ang)
            if not angles:
                return gray
            angle = float(np.median(angles))
            if abs(angle) < 0.2:
                return gray
            (h, w) = gray.shape
            M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
            return cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        except Exception:
            return gray

    # ============ Binarização robusta (geral) ============
    def _binarize_robust(self, gray: np.ndarray) -> np.ndarray:
        den = cv2.bilateralFilter(gray, d=5, sigmaColor=35, sigmaSpace=35)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        den = clahe.apply(den)
        blur = cv2.GaussianBlur(den, (0, 0), 1.0)
        sharp = cv2.addWeighted(den, 1.6, blur, -0.6, 0)
        bin_img = cv2.adaptiveThreshold(
            sharp, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 10
        )
        if np.mean(bin_img) < 127:
            bin_img = cv2.bitwise_not(bin_img)
        return bin_img

    # ============ NFC-e helpers ============
    def _nfce_background_normalize(self, gray: np.ndarray) -> np.ndarray:
        blur = cv2.GaussianBlur(gray, (0, 0), 21)
        norm = cv2.divide(gray, blur, scale=128)
        return norm

    def _nfce_remove_banding(self, gray: np.ndarray) -> np.ndarray:
        inv = cv2.bitwise_not(gray)
        k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))
        vertical = cv2.morphologyEx(inv, cv2.MORPH_OPEN, k)
        cleaned = cv2.subtract(inv, vertical)
        return cv2.bitwise_not(cleaned)

    def _nfce_binarize(self, gray: np.ndarray) -> np.ndarray:
        norm = self._nfce_background_normalize(gray)
        den = cv2.bilateralFilter(norm, d=5, sigmaColor=40, sigmaSpace=40)
        clahe = cv2.createCLAHE(clipLimit=3.2, tileGridSize=(8, 8))
        den = clahe.apply(den)
        sharp = cv2.addWeighted(den, 1.5, cv2.GaussianBlur(den, (0, 0), 1.0), -0.5, 0)
        deband = self._nfce_remove_banding(sharp)
        bin_img = cv2.adaptiveThreshold(
            deband, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,
            self.config.nfce_block_size, self.config.nfce_C
        )
        if np.mean(bin_img) < 127:
            bin_img = cv2.bitwise_not(bin_img)
        return bin_img

    def _maybe_upscale_for_small_text(self, gray: np.ndarray) -> np.ndarray:
        th = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
                                   cv2.THRESH_BINARY_INV, 31, 12)
        k = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 3))
        th = cv2.morphologyEx(th, cv2.MORPH_OPEN, k, iterations=1)
        contours, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        heights = [cv2.boundingRect(c)[3] for c in contours if 6 <= cv2.boundingRect(c)[3] <= 40]
        median_h = np.median(heights) if heights else 0
        if median_h and median_h < 12:
            new_w = int(gray.shape[1] * self.config.upscale_factor)
            new_h = int(gray.shape[0] * self.config.upscale_factor)
            return cv2.resize(gray, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        return gray

    # ============ Assinatura (máscara) ============
    def _mask_by_color(self, bgr: np.ndarray) -> Optional[np.ndarray]:
        if not self.config.enable_color_removal:
            return None
        
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        combined_mask = None
        
        # Detecta múltiplas cores se habilitado
        color_ranges = [
            (self.config.blue_lower_bound, self.config.blue_upper_bound),  # azul
        ]
        
        if self.config.enable_multi_color_removal:
            color_ranges.extend([
                (self.config.black_lower_bound, self.config.black_upper_bound),  # preto/cinza escuro
                (self.config.green_lower_bound, self.config.green_upper_bound),  # verde
                (self.config.red_lower_bound, self.config.red_upper_bound),     # vermelho
            ])
        
        for lower, upper in color_ranges:
            mask = cv2.inRange(hsv, lower, upper)
            
            # limitar ao rodapé no modo cupom apenas para azul
            if self.config.receipt_mode and lower == self.config.blue_lower_bound:
                h, w = mask.shape
                cut = int(h * (1.0 - self.config.limit_blue_mask_to_bottom_ratio))
                mask[:cut, :] = 0  # zera metade (ou % configurado) superior
            
            if combined_mask is None:
                combined_mask = mask
            else:
                combined_mask = cv2.bitwise_or(combined_mask, mask)
        
        if combined_mask is None:
            return None
            
        area_ratio = float(np.sum(combined_mask > 0)) / (bgr.shape[0] * bgr.shape[1])
        if area_ratio < self.config.color_mask_min_area_threshold:
            return None

        k = np.ones((self.config.morph_closing_kernel_size,)*2, np.uint8)
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, k)
        return combined_mask

    def _mask_by_contours(self, bgr: np.ndarray) -> Optional[np.ndarray]:
        if not self.config.enable_contour_removal:
            return None
        gray = self._ensure_gray(bgr)
        bin_inv = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 31, 10
        )
        contours, _ = cv2.findContours(bin_inv, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        h, w = gray.shape
        img_area = float(h * w)
        min_area = max(int(self.config.contour_min_area_ratio * img_area), 30)
        max_area = int(self.config.contour_max_area_ratio * img_area)

        mask = np.zeros_like(gray)
        drawn = 0
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < min_area or area > max_area:
                continue
            hull = cv2.convexHull(cnt)
            hull_area = cv2.contourArea(hull) or 1.0
            solidity = float(area) / hull_area
            x, y, cw, ch = cv2.boundingRect(cnt)
            major = max(cw, ch)
            aspect = (max(cw, ch) / (min(cw, ch) or 1))
            if (solidity < self.config.contour_max_solidity) or \
               (aspect >= self.config.contour_min_aspect and major >= self.config.contour_min_length_px):
                cv2.drawContours(mask, [cnt], -1, 255, thickness=cv2.FILLED)
                drawn += 1

        if drawn == 0 or np.sum(mask) == 0:
            return None
        k = np.ones((self.config.morph_closing_kernel_size,)*2, np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k)
        return mask

    def _inpaint(self, bgr: np.ndarray, mask: np.ndarray) -> np.ndarray:
        return cv2.inpaint(bgr, mask, self.config.inpainting_radius, self.config.inpainting_algorithm)

    # ============ Prep p/ OCR ============
    def _prep_for_ocr(self, pil_img: Image.Image) -> Tuple[Image.Image, Image.Image]:
        bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        gray = self._ensure_gray(bgr)
        gray = self._deskew(gray)

        if self.config.receipt_mode:
            gray_proc = self._maybe_upscale_for_small_text(gray)
            bin_orig = self._nfce_binarize(gray_proc)
            pil_orig = Image.fromarray(bin_orig)
            # máscara limitada ao rodapé; contorno desativado no modo cupom
            bgr2 = cv2.cvtColor(gray_proc, cv2.COLOR_GRAY2BGR)
            mask = self._mask_by_color(bgr2)
            if mask is not None and np.sum(mask) > 0:
                mask_ratio = float(np.sum(mask > 0)) / (mask.shape[0]*mask.shape[1])
                if mask_ratio < 0.10:
                    inpainted = self._inpaint(bgr2, mask)
                    gray2 = self._ensure_gray(inpainted)
                    gray2 = self._maybe_upscale_for_small_text(gray2)
                    bin_inp = self._nfce_binarize(gray2)
                    return Image.fromarray(bin_inp), pil_orig
            return pil_orig, pil_orig

        # não-receipt (geral)
        bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        bin_orig = self._binarize_robust(gray)
        pil_orig = Image.fromarray(bin_orig)
        mask = self._mask_by_color(bgr)
        if mask is None:
            mask = self._mask_by_contours(bgr)
        if mask is not None and np.sum(mask) > 0:
            mask_ratio = float(np.sum(mask > 0)) / (mask.shape[0]*mask.shape[1])
            if mask_ratio < 0.15:
                inpainted = self._inpaint(bgr, mask)
                gray2 = self._ensure_gray(inpainted)
                bin_inp = self._binarize_robust(gray2)
                return Image.fromarray(bin_inp), pil_orig
        return pil_orig, pil_orig

    def _rotate_candidates(self, img: Image.Image) -> List[Tuple[str, Image.Image]]:
        if self.config.receipt_mode:
            return [("rot0", img), ("rot90", img.rotate(90, expand=True))]
        return [
            ("rot0", img),
            ("rot90", img.rotate(90, expand=True)),
            ("rot180", img.rotate(180, expand=True)),
            ("rot270", img.rotate(270, expand=True)),
        ]

    # ============ Micro-OCR (NFC-e) ============
    def _has_client_name(self, text: str) -> bool:
        """
        Verifica se o texto já contém um nome de cliente completo e válido.
        Agora mais restritivo para permitir reconstrução de nomes fragmentados.
        """
        # Procura por padrões mais específicos de nome completo
        patterns = [
            r'(CLIENTE|CONSUMIDOR|DESTINAT[ÁA]RIO?)\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ]+(?:\s+[A-ZÀ-Ÿ][A-ZÀ-Ÿ]+){2,})',  # pelo menos 3 palavras
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                name_part = match.group(2).strip()
                # Verifica se é um nome válido e completo (não fragmentado)
                words = name_part.split()
                if len(words) >= 3:  # pelo menos 3 palavras para considerar completo
                    # Verifica se não tem fragmentos óbvios
                    if not any(len(word) <= 2 or '!' in word for word in words):
                        return True
        
        return False

    def _micro_ocr_name_candidate(self, bin_or_gray_image: np.ndarray) -> Optional[str]:
        """
        Varre faixas horizontais e tenta extrair uma linha de nome com técnicas avançadas.
        Agora inclui reconstrução de fragmentos para nomes cobertos por assinaturas.
        """
        if bin_or_gray_image.ndim == 3:
            gray = cv2.cvtColor(bin_or_gray_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = bin_or_gray_image

        h, w = gray.shape
        # Faixas típicas: 30%–65% da altura
        centers = [int(h*0.32), int(h*0.45), int(h*0.58)]
        strip_h = max(int(h*0.10), 80)  # 10% de h ou 80px

        best_candidates = []
        
        for cy in centers:
            y0 = max(0, cy - strip_h//2)
            y1 = min(h, y0 + strip_h)
            roi = gray[y0:y1, :]
            
            # Aplica múltiplas técnicas de pré-processamento
            techniques = self._advanced_preprocessing_techniques(roi)
            
            for technique_name, processed_roi in techniques:
                pil_roi = Image.fromarray(processed_roi)

                for psm in ("--psm 7", "--psm 13", "--psm 6"):
                    cfg = f"{self.tesseract_config.split('--psm')[0].strip()} {psm} -c preserve_interword_spaces=1"
                    txt, conf, words = self._ocr_data(pil_roi, cfg)
                    
                    if not txt:
                        continue
                    
                    # Procura por padrões de cliente/consumidor/destinatário
                    cliente_found = re.search(r'(CLIENTE|CONSUMIDOR|DESTINAT[ÁA]RIO?)', txt, re.IGNORECASE)
                    
                    # Se encontrou padrão explícito de cliente
                    if cliente_found and conf >= 35:  # limiar reduzido para fragmentos
                        
                        # 1. Tenta extração direta
                        direct_name = self._extract_name_from_text_advanced(txt)
                        if direct_name and self._is_valid_name(direct_name):
                            quality = self._evaluate_name_quality(direct_name)
                            best_candidates.append((direct_name, conf, quality, "direct"))
                        
                        # 2. Tenta reconstrução por fragmentos
                        fragments = self._extract_name_fragments(txt)
                        if fragments:
                            reconstructed = self._reconstruct_name_from_fragments(fragments)
                            if reconstructed:
                                quality = self._evaluate_name_quality(reconstructed)
                                best_candidates.append((reconstructed, conf, quality, "reconstructed"))
                        
                        # 3. Fallback: extrai possível nome após o marcador (método original)
                        m = re.search(r'(CLIENTE|CONSUMIDOR|DESTINAT[ÁA]RIO?)\s*[:\-]?\s*(.+)', txt, re.IGNORECASE)
                        if m:
                            candidate = m.group(2).strip()
                            # Remove caracteres comuns de OCR incorreto
                            candidate = re.sub(r'[!@#$%^&*()_+=\[\]{}|;:,.<>?/~`]', ' ', candidate)
                            candidate = ' '.join(candidate.split())  # normaliza espaços
                            
                            if len(re.findall(r'[A-ZÀ-Ÿ]{2,}', candidate, flags=re.IGNORECASE)) >= 2:
                                quality = self._evaluate_name_quality(candidate)
                                best_candidates.append((candidate, conf, quality, "fallback"))
                    
                    # Procura por fragmentos de nome mesmo sem marcador explícito de cliente
                    # (para casos onde "Cliente:" está em linha diferente ou mal reconhecido)
                    elif conf >= 30:  # limiar ainda menor para fragmentos puros
                        fragments = self._extract_name_fragments(txt)
                        if fragments and len(fragments) >= 2:  # pelo menos 2 fragmentos
                            reconstructed = self._reconstruct_name_from_fragments(fragments)
                            if reconstructed:
                                quality = self._evaluate_name_quality(reconstructed)
                                # Penaliza um pouco por não ter marcador explícito
                                best_candidates.append((reconstructed, conf * 0.8, quality, "fragments_only"))

        # Ordena candidatos por qualidade e confiança
        if best_candidates:
            best_candidates.sort(key=lambda x: (x[2], x[1]), reverse=True)
            return best_candidates[0][0]

        return None

    def _enhanced_name_extraction(self, bgr_image: np.ndarray) -> Optional[str]:
        """
        Método avançado para extrair nomes que podem estar parcialmente cobertos por assinaturas.
        Usa múltiplas técnicas: inpainting agressivo, morfologia e OCR focado.
        """
        gray = self._ensure_gray(bgr_image)
        h, w = gray.shape
        
        # Procurar por regiões que podem conter nomes (baseado em patterns comuns)
        name_candidates = []
        
        # Foca na região onde tipicamente aparece o nome do cliente (40%-70% da altura)
        y_start = int(h * 0.4)
        y_end = int(h * 0.7)
        roi = gray[y_start:y_end, :]
        
        # Aplica diferentes técnicas de pré-processamento otimizadas
        for technique_name, processed_roi in self._advanced_preprocessing_techniques(roi):
            pil_roi = Image.fromarray(processed_roi)
            
            # Tenta diferentes configurações do Tesseract otimizadas para nomes
            configs = [
                "--oem 1 --psm 6 -c preserve_interword_spaces=1",
                "--oem 1 --psm 7 -c preserve_interword_spaces=1", 
                "--oem 1 --psm 8 -c preserve_interword_spaces=1",
                "--oem 1 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ: ",
            ]
            
            for config in configs:
                try:
                    data = pytesseract.image_to_data(
                        pil_roi,
                        lang=self.config.tesseract_lang,
                        config=config,
                        output_type=pytesseract.Output.DICT
                    )
                    
                    # Filtra palavras com confiança razoável
                    words = []
                    for i, word in enumerate(data['text']):
                        if word.strip() and int(data['conf'][i]) > 25:  # limiar mais baixo para fragmentos
                            words.append(word.strip())
                    
                    if words:
                        full_text = ' '.join(words)
                        
                        # Busca por padrões de nome mais específicos
                        candidate = self._extract_name_from_text_advanced(full_text)
                        if candidate:
                            quality = self._evaluate_name_quality(candidate)
                            name_candidates.append((candidate, quality, technique_name, config))
                        
                        # Também guarda fragmentos para reconstrução posterior
                        fragments = self._extract_name_fragments(full_text)
                        if fragments:
                            reconstructed = self._reconstruct_name_from_fragments(fragments)
                            if reconstructed:
                                quality = self._evaluate_name_quality(reconstructed)
                                name_candidates.append((reconstructed, quality, f"{technique_name}_reconstructed", config))
                        
                except Exception:
                    continue
        
        # Retorna o melhor candidato
        if name_candidates:
            # Ordena por qualidade
            name_candidates.sort(key=lambda x: x[1], reverse=True)
            best_candidate = name_candidates[0][0]
            
            # Validação final - deve parecer um nome válido
            if self._is_valid_name(best_candidate):
                return best_candidate
        
        return None
    
    def _advanced_preprocessing_techniques(self, roi: np.ndarray) -> List[Tuple[str, np.ndarray]]:
        """
        Aplica técnicas avançadas de pré-processamento otimizadas para OCR de nomes.
        """
        techniques = []
        
        # 1. CLAHE agressivo para melhorar contraste
        clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(roi)
        bin_enhanced = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 6)
        if np.mean(bin_enhanced) < 127:
            bin_enhanced = cv2.bitwise_not(bin_enhanced)
        techniques.append(("clahe_enhanced", bin_enhanced))
        
        # 2. Binarização adaptativa otimizada
        adaptive1 = cv2.adaptiveThreshold(roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 4)
        adaptive2 = cv2.adaptiveThreshold(roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 8)
        
        for i, img in enumerate([adaptive1, adaptive2]):
            if np.mean(img) < 127:
                img = cv2.bitwise_not(img)
            techniques.append((f"adaptive_{i+1}", img))
        
        # 3. Morfologia para conectar caracteres fragmentados por assinatura
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 2))
        morph_close = cv2.morphologyEx(adaptive1, cv2.MORPH_CLOSE, kernel)
        techniques.append(("morph_connect", morph_close))
        
        # 4. Unsharp mask para melhorar definição
        gaussian = cv2.GaussianBlur(roi, (0, 0), 1.5)
        unsharp = cv2.addWeighted(roi, 2.0, gaussian, -1.0, 0)
        unsharp = np.clip(unsharp, 0, 255).astype(np.uint8)
        unsharp_bin = cv2.adaptiveThreshold(unsharp, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 6)
        if np.mean(unsharp_bin) < 127:
            unsharp_bin = cv2.bitwise_not(unsharp_bin)
        techniques.append(("unsharp", unsharp_bin))
        
        # 5. Erosão seguida de dilatação para remover ruído de assinatura
        kernel_noise = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
        eroded = cv2.erode(adaptive1, kernel_noise, iterations=1)
        dilated = cv2.dilate(eroded, kernel_noise, iterations=2)
        techniques.append(("denoise", dilated))
        
        return techniques
    
    def _extract_name_from_text_advanced(self, text: str) -> Optional[str]:
        """
        Extrai nome de texto usando padrões mais sofisticados.
        """
        # Padrões específicos para documentos brasileiros
        patterns = [
            r'(?:CLIENTE|CONSUMIDOR|DESTINAT[ÁA]RIO?)\s*[:\-]?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s]+?)(?:\s+CPF|\s+RG|$)',
            r'(?:^|\s)([A-ZÀ-Ÿ][A-ZÀ-Ÿ]+(?:\s+[A-ZÀ-Ÿ][A-ZÀ-Ÿ]+){1,4})(?:\s+CPF|\s+RG|\s+ENDEREÇO)',
            r'([A-ZÀ-Ÿ][A-ZÀ-Ÿ]+\s+[A-ZÀ-Ÿ][A-ZÀ-Ÿ]+(?:\s+[A-ZÀ-Ÿ][A-ZÀ-Ÿ]+)?)',  # 2-3 palavras grandes
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                candidate = match.group(1).strip()
                # Remove palavras comuns que não são nomes
                words = candidate.split()
                filtered_words = []
                skip_words = {'ENDERECO', 'ENDEREÇO', 'CPF', 'RG', 'TELEFONE', 'FONE', 'CEP', 'CIDADE'}
                
                for word in words:
                    if word.upper() not in skip_words and len(word) >= 2:
                        filtered_words.append(word)
                
                if len(filtered_words) >= 2:
                    result = ' '.join(filtered_words)
                    if self._is_valid_name(result):
                        return result
        
        return None
    

    def _extract_name_fragments(self, text: str) -> List[str]:
        """Extrai possíveis tokens de nome de forma genérica.

        Regras:
          - Token alfabético (incluindo acentos) de tamanho 3–20.
          - Pelo menos 70% de letras (protege contra ruído OCR).
          - Remove palavras de blacklist típicas de campos ou ruído.
          - Mantém ordem de aparição, removendo duplicatas consecutivas.
        """
        blacklist = {
            'CPF','RG','ENDERECO','ENDEREÇO','FONE','TELEFONE','CEP','CIDADE','DATA',
            'VALOR','TOTAL','NOTA','EMITENTE','DOCUMENTO','NR','Nº','N°','NUMERO','NÚMERO',
            'ITEM','QTDE','CUPOM','FISCAL','TRIBUTO','CODIGO','CÓDIGO','UF'
        }
        # Captura tokens alfabéticos (aceita letras acentuadas)
        raw_tokens = re.findall(r"[A-Za-zÀ-ÿ]{2,}", text or "")
        fragments: List[str] = []
        last = None
        for token in raw_tokens:
            up = token.upper()
            if up in blacklist:
                continue
            if not (3 <= len(up) <= 20):  # tamanho típico de nomes
                continue
            # Ratio alfabético (protege contra OCR que injeta outros caracteres)
            alpha_ratio = len(re.findall(r"[A-Za-zÀ-ÿ]", up)) / len(up)
            if alpha_ratio < 0.7:
                continue
            if up != last:  # evita repetição consecutiva (artefato OCR)
                fragments.append(up)
                last = up
        return fragments

    def _reconstruct_name_from_fragments(self, fragments: List[str]) -> Optional[str]:
        """Reconstrói um possível nome completo a partir de fragments genéricos.

        Estratégia:
          - Percorre janelas deslizantes de 2 a 5 tokens consecutivos.
          - Aplica heurísticas de pontuação (número de palavras, diversidade de tamanho, ausência de tokens muito curtos).
          - Retorna a melhor janela cujo score >= limiar, validada por _is_valid_name.
        """
        if not fragments:
            return None

        best_seq: Optional[List[str]] = None
        best_score = 0.0

        def score(seq: List[str]) -> float:
            if len(seq) < 2 or len(seq) > 5:
                return 0.0
            joined = " ".join(seq)
            # Comprimento plausível global
            if not (8 <= len(joined) <= 60):
                return 0.0
            # Penaliza tokens excessivamente curtos
            short_pen = sum(1 for w in seq if len(w) <= 2)
            # Diversidade de tamanhos: preferir se há pelo menos duas faixas
            lengths = [len(w) for w in seq]
            diversity = (max(lengths) - min(lengths)) >= 2
            # Base: favorece 2–4 palavras
            base = 0.5 if 2 <= len(seq) <= 4 else 0.35  # 5 palavras permitido mas menor base
            if diversity:
                base += 0.15
            base -= short_pen * 0.2
            return max(0.0, min(1.0, base))

        n = len(fragments)
        for i in range(n):
            for j in range(i + 2, min(i + 6, n + 1)):  # j exclusivo; tamanho 2..5
                window = fragments[i:j]
                sc = score(window)
                if sc > best_score:
                    best_score = sc
                    best_seq = window

        if best_seq and best_score >= 0.45:
            candidate = " ".join(best_seq).title()
            if self._is_valid_name(candidate):
                return candidate
        return None
    
    def _is_valid_name(self, candidate: str) -> bool:
        """
        Valida se um candidato parece ser um nome válido.
        """
        if not candidate or len(candidate) < 4:
            return False
        
        # Pelo menos 2 palavras
        words = candidate.split()
        if len(words) < 2:
            return False
        
        # Cada palavra deve ter pelo menos 2 caracteres alfabéticos
        for word in words:
            if len(re.findall(r'[A-ZÀ-Ÿ]', word, re.IGNORECASE)) < 2:
                return False
        
        # Não deve conter muitos números ou símbolos
        # Não deve conter muitos números ou símbolos
        alpha_ratio = len(re.findall(r'[A-ZÀ-Ÿ]', candidate, re.IGNORECASE)) / len(candidate)
        if alpha_ratio < 0.7:
            return False
        
        return True
    
    def _evaluate_name_quality(self, name: str) -> float:
        """
        Avalia a qualidade de um nome candidato (0-1).
        """
        if not name:
            return 0.0
        
        score = 0.0
        words = name.split()
        
        # Pontuação por número de palavras (nomes típicos têm 2-4 palavras)
        if 2 <= len(words) <= 4:
            score += 0.3
        elif len(words) == 1:
            score += 0.1
        
        # Pontuação por comprimento adequado
        if 10 <= len(name) <= 40:
            score += 0.3
        
        # Pontuação por presença de caracteres alfabéticos
        alpha_ratio = len(re.findall(r'[A-ZÀ-Ÿ]', name, re.IGNORECASE)) / len(name)
        score += alpha_ratio * 0.4
        
        return min(score, 1.0)

    # ============ Orquestração por página ============
    def _process_page_and_ocr(self, pil_image: Image.Image) -> Tuple[str, Dict[str, int]]:
        trials = []
        base_cfg = re.sub(r"--psm\s+\d+", "", self.tesseract_config).strip()

        # 0) Baselines (não-destrutivos)
        gray_pil, otsu_pil = self._baseline_images(pil_image)
        for label, img in [("baseline_gray", gray_pil), ("baseline_otsu", otsu_pil)]:
            for psm in ["--psm 6", "--psm 4"]:
                cfg = f"{base_cfg} {psm} -c preserve_interword_spaces=1"
                txt, conf, words = self._ocr_data(img, cfg)
                score = self._score_text(txt, conf, words)
                trials.append((score, conf, len(txt), label, psm, "rot0", txt))

        best = max(trials, key=lambda x: (x[0], x[1], x[2]))
        # se baseline já está bom, retorna
        if best[0] >= 0.55 and best[1] >= 60 and best[2] >= self.config.min_acceptable_chars:
            text = best[6]
            meta = {
                "len_clean": 0, "len_orig": best[2],
                "used_variant": 0, "avg_conf": int(round(best[1])),
                "rot": best[5], "psm": best[4],
            }
            # micro-OCR (apenas modo cupom)
            if self.config.receipt_mode and not self._has_client_name(text):
                # usar a versão OTSU como base das faixas
                micro = self._micro_ocr_name_candidate(np.array(otsu_pil.convert("L")))
                if micro:
                    # Nunca altera o texto – apenas registra candidatos
                    meta.setdefault("name_candidates", []).append({
                        "value": micro,
                        "source": "micro_baseline",
                        "quality": self._evaluate_name_quality(micro)
                    })
            return text, meta

        # 1) Pipeline robusto (só agora)
        img_clean, img_proc = self._prep_for_ocr(pil_image)
        if self.config.receipt_mode:
            psms = ["--psm 11", "--psm 7", "--psm 6"]  # sparse + single-line + default
        else:
            psms = ["--psm 6", "--psm 4", "--psm 11"]

        for label, img in [("clean", img_clean), ("proc", img_proc)]:
            for rot_label, rot_img in self._rotate_candidates(img):
                for psm in psms:
                    cfg = f"{base_cfg} {psm} -c preserve_interword_spaces=1"
                    txt, conf, words = self._ocr_data(rot_img, cfg)
                    score = self._score_text(txt, conf, words)
                    trials.append((score, conf, len(txt), f"{label}_{rot_label}", psm, rot_label, txt))

        best = max(trials, key=lambda x: (x[0], x[1], x[2]))
        text = best[6]
        meta = {
            "len_clean": 0, "len_orig": best[2],
            "used_variant": 1 if best[3].startswith("clean") else 0,
            "avg_conf": int(round(best[1])),
            "rot": best[5],
            "psm": best[4],
        }

        # micro-OCR (apenas modo cupom) – tenta melhorar o nome do cliente
        if self.config.receipt_mode and not self._has_client_name(text):
            ref_img = np.array(img_clean.convert("L")) if best[3].startswith("clean") else np.array(img_proc.convert("L"))
            micro = self._micro_ocr_name_candidate(ref_img)

            # Sempre tenta extração avançada também, podendo gerar outro candidato
            bgr_img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            enhanced_name = self._enhanced_name_extraction(bgr_img)

            candidates_local = []
            if micro:
                candidates_local.append((micro, "micro"))
            if enhanced_name and enhanced_name != micro:
                candidates_local.append((enhanced_name, "enhanced"))

            for cand, source in candidates_local:
                meta.setdefault("name_candidates", []).append({
                    "value": cand,
                    "source": source,
                    "quality": self._evaluate_name_quality(cand)
                })

        return text, meta

    # ============ API pública ============
    def extract_text_from_pdf_bytes(self, pdf_bytes: bytes) -> List[PDFPageResult]:
        results = []
        try:
            self.logger.info(f"OCR start - DPI:{self.dpi} Lang:{self.language}")
            pdf = pdfium.PdfDocument(io.BytesIO(pdf_bytes))

            for i, page in enumerate(pdf):
                page_num = i + 1
                try:
                    scale = self.dpi / 72.0
                    pil_image = page.render(scale=scale).to_pil()
                    page_text, meta = self._process_page_and_ocr(pil_image)

                    results.append(PDFPageResult(
                        page=page_num,
                        text=page_text,
                        raw_text=page_text,
                        char_count=len(page_text or ""),
                        error=None,
                        meta=meta
                    ))
                    self.logger.info(
                        f"Page {page_num} OK - chars:{len(page_text)} conf:{meta.get('avg_conf')} {meta.get('psm')} {meta.get('rot')} used:{'clean' if meta.get('used_variant')==1 else 'base/processed'}"
                    )
                except Exception as page_error:
                    self.logger.exception(f"Erro na página {page_num}: {page_error}")
                    results.append(PDFPageResult(page=page_num, text="", raw_text="", char_count=0, error=repr(page_error)))

            return results

        except Exception as e:
            self.logger.exception(f"Erro fatal na extração: {e}")
            raise TextExtractionException(f"Falha na extração de texto do PDF: {str(e)}")

    def extract_text_from_pdf_file(self, file_path: str) -> List[PDFPageResult]:
        try:
            with open(file_path, 'rb') as f:
                pdf_bytes = f.read()
            return self.extract_text_from_pdf_bytes(pdf_bytes)
        except FileNotFoundError:
            raise FileFormatException(f"Arquivo não encontrado: {file_path}")
        except Exception as e:
            raise DocumentProcessingException(f"Erro ao ler o arquivo {file_path}: {str(e)}")

    def extract_text_simple(self, pdf_bytes: bytes) -> str:
        pages = self.extract_text_from_pdf_bytes(pdf_bytes)
        return "\n\n--- PAGE BREAK ---\n\n".join([page.text for page in pages])

    def get_statistics(self, pdf_bytes: bytes) -> Dict[str, any]:
        pages = self.extract_text_from_pdf_bytes(pdf_bytes)
        total_chars = sum(p.char_count for p in pages)
        pages_with_text = sum(1 for p in pages if p.char_count > 0)
        pages_with_errors = sum(1 for p in pages if p.error is not None)
        return {
            "total_pages": len(pages),
            "pages_with_text": pages_with_text,
            "pages_with_errors": pages_with_errors,
            "total_characters": total_chars,
            "average_chars_per_page": total_chars / len(pages) if pages else 0,
            "success_rate": (pages_with_text / len(pages)) * 100 if pages else 0
        }


# =========================
# Factory
# =========================
def create_advanced_pdf_extractor(preset: str = "default") -> AdvancedPDFExtractor:
    """
    Preserva compatibilidade com seus presets existentes (OCRConfig) e adiciona alguns focados em foto.
    """
    if preset == "default":
        return AdvancedPDFExtractor()

    # Presets do seu OCRConfig (se existirem)
    ocr_configs = {
        'high_quality': OCRConfig.HIGH_QUALITY,
        'low_quality': OCRConfig.LOW_QUALITY,
        'fast': OCRConfig.FAST,
        'tables': OCRConfig.TABLES,
    }
    if preset in ocr_configs:
        oc = ocr_configs[preset]
        cfg = ProcessingConfig(
            dpi=oc.get('dpi', 300),
            tesseract_config=oc.get('tesseract_config', '--oem 1 --psm 6 -c preserve_interword_spaces=1'),
        )
        return AdvancedPDFExtractor(config=cfg)

    # Presets avançados focados em foto/assinatura
    if preset == "color_only":
        return AdvancedPDFExtractor(config=ProcessingConfig(enable_contour_removal=False))
    if preset == "contour_only":
        return AdvancedPDFExtractor(config=ProcessingConfig(enable_color_removal=False))
    if preset == "high_dpi":
        return AdvancedPDFExtractor(config=ProcessingConfig(dpi=400))
    if preset == "fast_processing":
        return AdvancedPDFExtractor(config=ProcessingConfig(
            dpi=220, enable_color_removal=True, enable_contour_removal=False,
            morph_closing_kernel_size=5, inpainting_radius=4
        ))
    if preset == "photo_hard":
        return AdvancedPDFExtractor(config=ProcessingConfig(
            dpi=380, tesseract_lang='por+eng',
            morph_closing_kernel_size=5, inpainting_radius=4,
            enable_multi_color_removal=True,
            enable_contour_removal=True, enable_color_removal=True
        ))
    if preset == "signature_resistant":
        return AdvancedPDFExtractor(config=ProcessingConfig(
            dpi=350, tesseract_lang='por+eng',
            enable_multi_color_removal=True,
            enable_contour_removal=True, 
            enable_color_removal=True,
            morph_closing_kernel_size=7,
            inpainting_radius=6,
            receipt_mode=True,
            upscale_factor=2.0
        ))
    
    # Presets específicos por tipo de documento
    if preset == "nfe":
        # NF-e costuma vir “limpa” -> conservador
        cfg = ProcessingConfig(
            dpi=300,
            tesseract_lang='por',
            tesseract_config='--oem 1 --psm 6 -c preserve_interword_spaces=1',
            enable_deskew=True,
            enable_color_removal=False,
            enable_contour_removal=False,
            morph_closing_kernel_size=5,
            inpainting_radius=4,
        )
        return AdvancedPDFExtractor(config=cfg)

    if preset == "nfse":
        # NFS-e: scan/foto com carimbo/assinatura
        cfg = ProcessingConfig(
            dpi=360,
            tesseract_lang='por+eng',  # ajuda com números/códigos
            tesseract_config='--oem 1 --psm 6 -c preserve_interword_spaces=1',
            enable_deskew=True,
            enable_color_removal=True,     # tenta remover caneta azul
            enable_contour_removal=True,   # e traços pretos
            morph_closing_kernel_size=5,
            inpainting_radius=4,
        )
        return AdvancedPDFExtractor(config=cfg)

    if preset in ("nfce", "nfc-e", "nfce_cupom", "cupom"):
        # NFC-e / Cupom: papel térmico, baixo contraste, layout esparso
        cfg = ProcessingConfig(
            dpi=360,
            tesseract_lang='por',
            tesseract_config='--oem 1 --psm 6 -c preserve_interword_spaces=1',
            enable_deskew=True,
            enable_color_removal=True,     # pode ter caneta azul (rodapé)
            enable_contour_removal=False,  # evita “comer” números finos do cupom
            morph_closing_kernel_size=5,
            inpainting_radius=4,
            receipt_mode=True,             # <-- liga o modo térmico
            upscale_factor=1.7,
            nfce_block_size=25,
            nfce_C=7,
            limit_blue_mask_to_bottom_ratio=0.50,
        )
        return AdvancedPDFExtractor(config=cfg)

    if preset == "high_quality_ocr":
        # OCR de alta qualidade para nomes e texto crítico
        cfg = ProcessingConfig(
            dpi=450,
            tesseract_lang='por',
            tesseract_config='--oem 1 --psm 4 -c preserve_interword_spaces=1',
            min_acceptable_chars=50,
            enable_deskew=True,
            deskew_max_angle_deg=2.0,
            upscale_factor=4.0,
            
            # Detecção de cor muito conservadora
            enable_color_removal=True,
            blue_lower_bound=(95, 120, 60),
            blue_upper_bound=(130, 255, 255),
            color_mask_min_area_threshold=0.003,
            
            # Contornos muito seletivos
            enable_contour_removal=True,
            contour_max_solidity=0.20,
            contour_min_aspect=2.5,
            contour_min_length_px=40,
            
            morph_closing_kernel_size=3,
            receipt_mode=True,
            limit_blue_mask_to_bottom_ratio=0.20,
        )
        return AdvancedPDFExtractor(config=cfg)

    if preset == "name_focused":
        # Configuração específica para preservar nomes completos
        cfg = ProcessingConfig(
            dpi=500,  # DPI alto mas não extremo
            tesseract_lang='por',
            tesseract_config='--oem 1 --psm 6 -c preserve_interword_spaces=1',
            min_acceptable_chars=100,  # Mais texto necessário
            enable_deskew=True,
            deskew_max_angle_deg=1.5,
            upscale_factor=3.5,  # Upscale moderado
            
            # Remoção muito conservadora para preservar nomes
            enable_color_removal=True,
            blue_lower_bound=(108, 150, 80),  # Azul bem específico
            blue_upper_bound=(118, 255, 255),
            color_mask_min_area_threshold=0.008,  # Bem conservador
            
            # Contornos seletivos mas não extremos
            enable_contour_removal=True,
            contour_max_solidity=0.15,  # Baixo mas não extremo
            contour_min_aspect=3.5,     # Seletivo
            contour_min_length_px=60,   # Médio-alto
            
            morph_closing_kernel_size=2,  # Processamento suave
            receipt_mode=True,
            limit_blue_mask_to_bottom_ratio=0.08,  # Muito pouca remoção
        )
        return AdvancedPDFExtractor(config=cfg)

    if preset == "name_hybrid":
        # Híbrido: remoção seletiva de assinatura mas preserva nomes
        cfg = ProcessingConfig(
            dpi=420,
            tesseract_lang='por',
            tesseract_config='--oem 1 --psm 6 -c preserve_interword_spaces=1',
            enable_deskew=True,
            deskew_max_angle_deg=1.5,
            upscale_factor=2.8,
            
            # Remoção de cor bem específica para assinaturas azuis
            enable_color_removal=True,
            blue_lower_bound=(105, 140, 70),  # Azul de caneta específico
            blue_upper_bound=(125, 255, 255),
            color_mask_min_area_threshold=0.005,  # Conservador
            
            # Contornos focados em assinaturas, não em texto
            enable_contour_removal=True,
            contour_max_solidity=0.25,  # Moderado
            contour_min_aspect=2.8,     # Traços alongados
            contour_min_length_px=35,   # Tamanho médio
            
            morph_closing_kernel_size=3,
            receipt_mode=True,
            limit_blue_mask_to_bottom_ratio=0.15,  # Remove só 15% inferior
        )
        return AdvancedPDFExtractor(config=cfg)

    if preset == "signature_removal":
        # Especializado em remover assinaturas azuis preservando nomes
        cfg = ProcessingConfig(
            dpi=450,
            tesseract_lang='por',
            tesseract_config='--oem 1 --psm 6 -c preserve_interword_spaces=1',
            enable_deskew=True,
            deskew_max_angle_deg=1.2,
            upscale_factor=3.0,
            
            # Detecção específica de azul de caneta
            enable_color_removal=True,
            blue_lower_bound=(100, 130, 60),   # Azul de caneta mais específico
            blue_upper_bound=(130, 255, 255),
            color_mask_min_area_threshold=0.003,  # Sensível mas não extremo
            
            # Contornos focados especificamente em assinaturas
            enable_contour_removal=True,
            contour_max_solidity=0.30,  # Formas irregulares típicas de assinatura
            contour_min_aspect=1.8,     # Traços de assinatura
            contour_min_length_px=30,   # Tamanho médio
            
            morph_closing_kernel_size=4,  # Conecta fragmentos de assinatura
            receipt_mode=True,
            limit_blue_mask_to_bottom_ratio=0.25,  # Foca na área de assinatura
        )
        return AdvancedPDFExtractor(config=cfg)

    if preset == "blue_signature_focused":
        # Versão ultra-específica para assinaturas azuis em nomes
        cfg = ProcessingConfig(
            dpi=400,
            tesseract_lang='por',
            tesseract_config='--oem 1 --psm 6 -c preserve_interword_spaces=1',
            enable_deskew=True,
            deskew_max_angle_deg=1.0,
            upscale_factor=2.5,
            
            # Range muito específico para caneta azul comum
            enable_color_removal=True,
            blue_lower_bound=(110, 150, 80),   # Azul saturado típico de caneta
            blue_upper_bound=(125, 255, 220),  # Range bem específico
            color_mask_min_area_threshold=0.004,  # Conservador
            
            # Contornos extremamente seletivos para assinaturas
            enable_contour_removal=True,
            contour_max_solidity=0.20,  # Muito baixo - só formas muito irregulares
            contour_min_aspect=3.0,     # Traços bem alongados
            contour_min_length_px=40,   # Traços grandes típicos de assinatura
            
            morph_closing_kernel_size=3,
            receipt_mode=True,
            limit_blue_mask_to_bottom_ratio=0.20,  # Área limitada
        )
        return AdvancedPDFExtractor(config=cfg)

    return AdvancedPDFExtractor()