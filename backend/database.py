"""
Dois clientes de banco de dados:
- Supabase client: operações CRUD simples, Auth e Realtime
- SQLAlchemy async: queries complexas com JOINs e agregações

Todos os clientes são opcionais — o backend inicia mesmo sem env vars configuradas
(rotas que usam mock data continuam funcionando; rotas que precisam do banco falham
apenas quando chamadas).
"""

from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    database_url: str = ""
    anthropic_api_key: str = ""
    rapidapi_key: str = ""
    the_odds_api_key: str = ""
    jwt_secret: str = "dev-secret-change-in-production"
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"


settings = Settings()

# ---------------------------------------------------------------------------
# Supabase client — criado apenas se as env vars estiverem configuradas
# ---------------------------------------------------------------------------

supabase = None
supabase_anon = None

if settings.supabase_url and settings.supabase_service_role_key:
    try:
        from supabase import create_client
        supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
        supabase_anon = create_client(settings.supabase_url, settings.supabase_anon_key)
    except Exception as e:
        print(f"[database] Supabase não inicializado: {e}")

# ---------------------------------------------------------------------------
# SQLAlchemy async engine — criado apenas se DATABASE_URL estiver configurada
# ---------------------------------------------------------------------------

engine = None
AsyncSessionLocal = None

if settings.database_url:
    try:
        from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
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
    except Exception as e:
        print(f"[database] SQLAlchemy não inicializado: {e}")


class Base:
    pass

try:
    from sqlalchemy.orm import DeclarativeBase
    class Base(DeclarativeBase):  # type: ignore
        pass
except Exception:
    pass


async def get_db():
    """Dependency FastAPI para injetar sessão do banco."""
    if AsyncSessionLocal is None:
        raise RuntimeError("DATABASE_URL não configurada")
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
    if engine is None:
        return
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
