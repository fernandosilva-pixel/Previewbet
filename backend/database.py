"""
Cliente Supabase para operações CRUD, Auth e Realtime.
SQLAlchemy/Redis removidos para reduzir uso de memória no Railway free tier.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    anthropic_api_key: str = ""
    jwt_secret: str = "dev-secret-change-in-production"

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
        print(f"[database] Supabase OK", flush=True)
    except Exception as e:
        print(f"[database] Supabase erro: {e}", flush=True)
else:
    print("[database] Supabase sem env vars — usando mock data", flush=True)


async def get_db():
    """Placeholder mantido para compatibilidade com imports."""
    raise RuntimeError("Use supabase client diretamente")
