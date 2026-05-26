"""
Dois clientes de banco de dados:
- Supabase client: operações CRUD simples, Auth e Realtime
- SQLAlchemy async: queries complexas com JOINs e agregações
"""

from supabase import create_client, Client
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    database_url: str
    anthropic_api_key: str
    rapidapi_key: str = ""
    the_odds_api_key: str = ""
    jwt_secret: str
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"


settings = Settings()

# ---------------------------------------------------------------------------
# Supabase client (service role para operações server-side)
# ---------------------------------------------------------------------------
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,
)

# Cliente anon para operações que respeitam RLS (como verificar sessão de usuário)
supabase_anon: Client = create_client(
    settings.supabase_url,
    settings.supabase_anon_key,
)

# ---------------------------------------------------------------------------
# SQLAlchemy async engine (queries complexas com JOINs e agregações)
# ---------------------------------------------------------------------------
engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """Dependency FastAPI para injetar sessão do banco."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Cria tabelas que ainda não existem (usado em dev; em prod use Supabase SQL Editor)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
