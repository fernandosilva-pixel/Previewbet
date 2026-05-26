from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, EmailStr


# ---------------------------------------------------------------------------
# Game
# ---------------------------------------------------------------------------

class GameOut(BaseModel):
    id: int
    external_id: str
    league: str
    country: Optional[str] = None
    home_team: str
    away_team: str
    home_logo: Optional[str] = None
    away_logo: Optional[str] = None
    datetime: datetime
    status: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    clock: Optional[str] = None
    period: Optional[int] = None
    home_possession: Optional[Decimal] = None
    away_possession: Optional[Decimal] = None
    home_shots: int = 0
    away_shots: int = 0
    home_corners: int = 0
    away_corners: int = 0
    home_yellow_cards: int = 0
    away_yellow_cards: int = 0
    has_odds: bool = False
    odds_home: Optional[Decimal] = None
    odds_draw: Optional[Decimal] = None
    odds_away: Optional[Decimal] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------

class AnalysisOut(BaseModel):
    id: int
    game_id: int
    resultado_previsto: Optional[str] = None
    confianca: Optional[str] = None
    resultado_json: dict
    gols_json: Optional[dict] = None
    escanteios_json: Optional[dict] = None
    cartoes_json: Optional[dict] = None
    placar_json: Optional[dict] = None
    combinacoes_json: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisSummaryOut(BaseModel):
    total: int
    correct: int
    accuracy_pct: float
    by_confidence: dict


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

class AccuracyStatsOut(BaseModel):
    league: str
    total: int
    correct: int
    accuracy_pct: float
    by_confidence: dict


# ---------------------------------------------------------------------------
# Bingo
# ---------------------------------------------------------------------------

class BingoOut(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    tier: Optional[str] = None
    total_odd: Optional[Decimal] = None
    confidence_pct: Optional[int] = None
    selections: list
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserOut(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool
    has_subscription: bool
    subscription_expires_at: Optional[datetime] = None
    permissions: dict


# ---------------------------------------------------------------------------
# Subscription
# ---------------------------------------------------------------------------

class SubscriptionPlanOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price_cents: int
    interval: str
    module_access: dict
    is_active: bool

    class Config:
        from_attributes = True


class SubscriptionStatusOut(BaseModel):
    has_subscription: bool
    status: Optional[str] = None
    plan_name: Optional[str] = None
    expires_at: Optional[datetime] = None
    permissions: dict


# ---------------------------------------------------------------------------
# Live
# ---------------------------------------------------------------------------

class LiveAlertOut(BaseModel):
    id: int
    game_id: int
    market: Optional[str] = None
    signal: Optional[str] = None
    confidence: Optional[str] = None
    pressure_data: Optional[dict] = None
    triggered_at: datetime
    is_active: bool

    class Config:
        from_attributes = True
