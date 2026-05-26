from fastapi import APIRouter, HTTPException

from mock_data import MOCK_STATS

router = APIRouter()


@router.get("/stats/accuracy", response_model=list[dict])
async def accuracy_all():
    return MOCK_STATS


@router.get("/stats/accuracy/league/{league}", response_model=dict)
async def accuracy_by_league(league: str):
    stat = next((s for s in MOCK_STATS if s["league"].lower() == league.lower()), None)
    if not stat:
        raise HTTPException(status_code=404, detail="Liga não encontrada")
    return stat


@router.get("/alerts/active", response_model=list[dict])
async def active_alerts():
    from mock_data import MOCK_LIVE_ALERTS
    return [a for a in MOCK_LIVE_ALERTS if a["is_active"]]
