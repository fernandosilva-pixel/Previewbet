from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    external_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    league: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[Optional[str]] = mapped_column(String(50))
    home_team: Mapped[str] = mapped_column(String(100), nullable=False)
    away_team: Mapped[str] = mapped_column(String(100), nullable=False)
    home_logo: Mapped[Optional[str]] = mapped_column(Text)
    away_logo: Mapped[Optional[str]] = mapped_column(Text)
    datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="scheduled")

    home_score: Mapped[Optional[int]] = mapped_column(Integer)
    away_score: Mapped[Optional[int]] = mapped_column(Integer)
    clock: Mapped[Optional[str]] = mapped_column(String(20))
    period: Mapped[int] = mapped_column(Integer, default=0)

    home_possession: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2))
    away_possession: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2))
    home_shots: Mapped[int] = mapped_column(Integer, default=0)
    away_shots: Mapped[int] = mapped_column(Integer, default=0)
    home_corners: Mapped[int] = mapped_column(Integer, default=0)
    away_corners: Mapped[int] = mapped_column(Integer, default=0)
    home_yellow_cards: Mapped[int] = mapped_column(Integer, default=0)
    away_yellow_cards: Mapped[int] = mapped_column(Integer, default=0)

    has_odds: Mapped[bool] = mapped_column(Boolean, default=False)
    odds_home: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2))
    odds_draw: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2))
    odds_away: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2))

    source: Mapped[Optional[str]] = mapped_column(String(30))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    analyses: Mapped[list["Analysis"]] = relationship("Analysis", back_populates="game")
    live_alerts: Mapped[list["LiveAlert"]] = relationship("LiveAlert", back_populates="game")


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"), nullable=False)

    resultado_previsto: Mapped[Optional[str]] = mapped_column(String(20))
    confianca: Mapped[Optional[str]] = mapped_column(String(10))

    resultado_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    gols_json: Mapped[Optional[dict]] = mapped_column(JSONB)
    escanteios_json: Mapped[Optional[dict]] = mapped_column(JSONB)
    cartoes_json: Mapped[Optional[dict]] = mapped_column(JSONB)
    placar_json: Mapped[Optional[dict]] = mapped_column(JSONB)
    combinacoes_json: Mapped[Optional[dict]] = mapped_column(JSONB)

    prompt_usado: Mapped[Optional[str]] = mapped_column(Text)
    resposta_bruta: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    game: Mapped["Game"] = relationship("Game", back_populates="analyses")
    verified_result: Mapped[Optional["VerifiedResult"]] = relationship(
        "VerifiedResult", back_populates="analysis", uselist=False
    )


class VerifiedResult(Base):
    __tablename__ = "verified_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"), nullable=False)

    resultado_real: Mapped[Optional[str]] = mapped_column(String(20))
    gols_real: Mapped[Optional[int]] = mapped_column(Integer)

    acertou_resultado: Mapped[Optional[bool]] = mapped_column(Boolean)
    acertou_gols: Mapped[Optional[bool]] = mapped_column(Boolean)
    acertou_escanteios: Mapped[Optional[bool]] = mapped_column(Boolean)
    acertou_cartoes: Mapped[Optional[bool]] = mapped_column(Boolean)

    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="verified_result")


class Bingo(Base):
    __tablename__ = "bingos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(30))  # conservador | moderado | maximo
    tier: Mapped[Optional[str]] = mapped_column(String(30))      # seguro | moderado | risco
    total_odd: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2))
    confidence_pct: Mapped[Optional[int]] = mapped_column(Integer)
    selections: Mapped[dict] = mapped_column(JSONB, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LiveAlert(Base):
    __tablename__ = "live_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    market: Mapped[Optional[str]] = mapped_column(String(50))
    signal: Mapped[Optional[str]] = mapped_column(Text)
    confidence: Mapped[Optional[str]] = mapped_column(String(10))
    pressure_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    game: Mapped["Game"] = relationship("Game", back_populates="live_alerts")


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    interval: Mapped[str] = mapped_column(String(20), nullable=False)  # weekly | biweekly | monthly
    module_access: Mapped[dict] = mapped_column(
        JSONB,
        default={"jogos": True, "aovivo": True, "bingos": True, "segmentos": True},
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    subscriptions: Mapped[list["UserSubscription"]] = relationship("UserSubscription", back_populates="plan")


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # user_id referencia auth.users do Supabase (UUID como string)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    plan_id: Mapped[int] = mapped_column(ForeignKey("subscription_plans.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    payment_ref: Mapped[Optional[str]] = mapped_column(String(200))

    plan: Mapped["SubscriptionPlan"] = relationship("SubscriptionPlan", back_populates="subscriptions")
