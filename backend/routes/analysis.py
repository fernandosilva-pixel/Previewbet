from fastapi import APIRouter, HTTPException

from mock_data import MOCK_ANALYSES, MOCK_STATS

router = APIRouter()


@router.get("/analysis/{game_id}", response_model=dict)
async def get_analysis(game_id: int):
    analysis = MOCK_ANALYSES.get(game_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada para este jogo")
    return analysis


@router.get("/analysis/summary", response_model=dict)
async def get_analysis_summary():
    geral = next((s for s in MOCK_STATS if s["league"] == "Geral"), None)
    return geral or {"total": 0, "correct": 0, "accuracy_pct": 0.0, "by_confidence": {}}
