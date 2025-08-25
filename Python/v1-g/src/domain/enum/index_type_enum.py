from enum import Enum
from qdrant_client.http.models import PayloadSchemaType

class IndexTypeEnum(Enum):
    KEYWORD = 1
    TEXT = 2
    INTEGER = 3
    FLOAT = 4
    BOOL = 5

    def to_qdrant_type(self):
        mapping = {
            IndexTypeEnum.KEYWORD: PayloadSchemaType.KEYWORD,
            IndexTypeEnum.TEXT: PayloadSchemaType.TEXT,
            IndexTypeEnum.INTEGER: PayloadSchemaType.INTEGER,
            IndexTypeEnum.FLOAT: PayloadSchemaType.FLOAT,
            IndexTypeEnum.BOOL: PayloadSchemaType.BOOL,
        }
        return mapping[self]
