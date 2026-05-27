from typing import Optional

from fastapi import APIRouter

from mock_data import MOCK_BINGOS

router = APIRouter()


@router.get("/bingos", response_model=list)
async def list_bingos(category: Optional[str] = None):
    bingos = [b for b in MOCK_BINGOS if b["is_active"]]
    if category:
        bingos = [b for b in bingos if b["category"] == category]
    return bingos
