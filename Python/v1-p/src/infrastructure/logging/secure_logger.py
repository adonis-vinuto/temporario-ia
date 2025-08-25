import re
import hashlib
import json
from typing import Any, Dict, List, Union
from copy import deepcopy
import logging

class DataSanitizer:
    """Classe responsável por sanitizar dados sensíveis antes do logging."""
    
    # Padrões de dados sensíveis
    SENSITIVE_PATTERNS = {
        'email': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
        'cpf': re.compile(r'\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b'),
        'phone': re.compile(r'\b\d{2,3}[-.\s]?\d{4,5}[-.\s]?\d{4}\b'),
    }
    
    # Campos que sempre devem ser mascarados
    SENSITIVE_FIELDS = {
        'password', 'senha', 'token', 'api_key', 'apikey', 'secret',
        'authorization', 'auth', 'key', 'private', 'ssn', 'cpf',
        'credit_card', 'card_number', 'cvv', 'pin', 'access_token',
        'refresh_token', 'client_secret', 'webhook_secret'
    }
    
    @classmethod
    def sanitize(cls, data: Any, depth: int = 0) -> Any:
        """
        Sanitiza recursivamente dados sensíveis.
        
        Args:
            data: Dados para sanitizar
            depth: Profundidade da recursão (para evitar loops infinitos)
        
        Returns:
            Dados sanitizados
        """
        if depth > 10:  # Proteção contra recursão infinita
            return "***DEPTH_LIMIT***"
        
        if isinstance(data, dict):
            return cls._sanitize_dict(data, depth)
        elif isinstance(data, (list, tuple)):
            return cls._sanitize_list(data, depth)
        elif isinstance(data, str):
            return cls._sanitize_string(data)
        else:
            return data
    
    @classmethod
    def _sanitize_dict(cls, data: Dict, depth: int) -> Dict:
        """Sanitiza dicionários."""
        sanitized = {}
        for key, value in data.items():
            # Verifica se a chave é sensível
            if any(sensitive in key.lower() for sensitive in cls.SENSITIVE_FIELDS):
                sanitized[key] = "***REDACTED***"
            else:
                sanitized[key] = cls.sanitize(value, depth + 1)
        return sanitized
    
    @classmethod
    def _sanitize_list(cls, data: List, depth: int) -> List:
        """Sanitiza listas."""
        return [cls.sanitize(item, depth + 1) for item in data]
    
    @classmethod
    def _sanitize_string(cls, text: str) -> str:
        """Sanitiza strings com padrões sensíveis."""
        sanitized_text = text
        
        # Aplica padrões de sanitização
        for pattern_name, pattern in cls.SENSITIVE_PATTERNS.items():
            if pattern.search(sanitized_text):
                if pattern_name == 'email':
                    # Mantém domínio mas oculta usuário
                    sanitized_text = pattern.sub(
                        lambda m: f"***@{m.group().split('@')[1]}" if '@' in m.group() else "***",
                        sanitized_text
                    )
                elif pattern_name == 'cpf':
                    # Mostra apenas últimos 2 dígitos
                    sanitized_text = pattern.sub(
                        lambda m: f"***.***.**{m.group()[-3:]}" if len(m.group()) >= 11 else "***",
                        sanitized_text
                    )
                else:
                    sanitized_text = pattern.sub(f"***{pattern_name.upper()}***", sanitized_text)
        
        return sanitized_text
    
    @classmethod
    def hash_identifier(cls, identifier: str) -> str:
        """
        Cria hash consistente para identificadores (user_id, etc).
        
        Args:
            identifier: Identificador para hash
            
        Returns:
            Hash truncado do identificador
        """
        if not identifier:
            return "EMPTY"
        return hashlib.sha256(str(identifier).encode()).hexdigest()[:8]

class SecureLogger:
    """Logger seguro que sanitiza automaticamente dados sensíveis."""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.sanitizer = DataSanitizer
    
    def _prepare_message(self, msg: Any) -> str:
        """Prepara mensagem para logging."""
        if isinstance(msg, str):
            return self.sanitizer._sanitize_string(msg)
        elif isinstance(msg, (dict, list)):
            sanitized = self.sanitizer.sanitize(msg)
            return json.dumps(sanitized, ensure_ascii=False, default=str)
        else:
            return str(msg)
    
    def _prepare_kwargs(self, kwargs: Dict) -> Dict:
        """Sanitiza kwargs extras."""
        if 'extra' in kwargs and isinstance(kwargs['extra'], dict):
            kwargs['extra'] = self.sanitizer.sanitize(kwargs['extra'])
        return kwargs
    
    def debug(self, msg: Any, *args, **kwargs):
        sanitized_msg = self._prepare_message(msg)
        kwargs = self._prepare_kwargs(kwargs)
        self.logger.debug(sanitized_msg, *args, **kwargs)
    
    def info(self, msg: Any, *args, **kwargs):
        sanitized_msg = self._prepare_message(msg)
        kwargs = self._prepare_kwargs(kwargs)
        self.logger.info(sanitized_msg, *args, **kwargs)
    
    def warning(self, msg: Any, *args, **kwargs):
        sanitized_msg = self._prepare_message(msg)
        kwargs = self._prepare_kwargs(kwargs)
        self.logger.warning(sanitized_msg, *args, **kwargs)
    
    def error(self, msg: Any, *args, **kwargs):
        sanitized_msg = self._prepare_message(msg)
        kwargs = self._prepare_kwargs(kwargs)
        # Remove stack traces sensíveis
        if 'exc_info' in kwargs and kwargs['exc_info']:
            kwargs['exc_info'] = False  # Não loga stack trace completo
            self.logger.error(f"{sanitized_msg} [Stack trace omitted for security]", *args, **kwargs)
        else:
            self.logger.error(sanitized_msg, *args, **kwargs)
    
    def critical(self, msg: Any, *args, **kwargs):
        sanitized_msg = self._prepare_message(msg)
        kwargs = self._prepare_kwargs(kwargs)
        self.logger.critical(sanitized_msg, *args, **kwargs)

# Factory function atualizada
def get_secure_logger(name: str) -> SecureLogger:
    """Retorna instância de logger seguro."""
    return SecureLogger(name)