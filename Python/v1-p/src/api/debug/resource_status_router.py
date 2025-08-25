from fastapi import APIRouter, Depends
from src.infrastructure.limits.resource_limits import get_resource_monitor

router = APIRouter()

@router.get("/resource-status", tags=["Debug"])
async def get_resource_status(
    monitor = Depends(get_resource_monitor)
):
    """
    Retorna status atual de recursos do sistema.
    
    Returns:
        Uso de CPU, memória e slots de OCR disponíveis
    """
    return monitor.get_resource_status()