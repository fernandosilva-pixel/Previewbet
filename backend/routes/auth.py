from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import supabase
from schemas import RegisterIn, LoginIn

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


def _require_supabase():
    if supabase is None:
        raise HTTPException(status_code=503, detail="Serviço de autenticação não configurado")


@router.post("/auth/register", response_model=dict)
async def register(body: RegisterIn):
    _require_supabase()
    try:
        res = supabase.auth.sign_up({"email": body.email, "password": body.password})
        if res.user is None:
            raise HTTPException(status_code=400, detail="Erro ao criar conta")
        return {
            "access_token": res.session.access_token if res.session else "",
            "token_type": "bearer",
            "user": {
                "id": str(res.user.id),
                "email": res.user.email,
                "role": "USER",
                "is_active": True,
                "has_subscription": False,
                "subscription_expires_at": None,
                "permissions": {"jogos": False, "aovivo": False, "bingos": False, "segmentos": False},
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/login", response_model=dict)
async def login(body: LoginIn):
    _require_supabase()
    try:
        res = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
        if res.user is None:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")

        sub = (
            supabase.table("user_subscriptions")
            .select("*, subscription_plans(*)")
            .eq("user_id", str(res.user.id))
            .eq("status", "active")
            .gte("expires_at", "now()")
            .maybe_single()
            .execute()
        )

        has_sub = sub.data is not None
        permissions = {"jogos": True, "aovivo": True, "bingos": True, "segmentos": True} if has_sub else \
                      {"jogos": False, "aovivo": False, "bingos": False, "segmentos": False}

        return {
            "access_token": res.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": str(res.user.id),
                "email": res.user.email,
                "role": res.user.user_metadata.get("role", "USER"),
                "is_active": True,
                "has_subscription": has_sub,
                "subscription_expires_at": sub.data["expires_at"] if has_sub else None,
                "permissions": permissions,
            },
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")


@router.get("/auth/me", response_model=dict)
async def me(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    _require_supabase()
    if not credentials:
        raise HTTPException(status_code=401, detail="Token não informado")
    try:
        res = supabase.auth.get_user(credentials.credentials)
        if res.user is None:
            raise HTTPException(status_code=401, detail="Token inválido")

        sub = (
            supabase.table("user_subscriptions")
            .select("*, subscription_plans(*)")
            .eq("user_id", str(res.user.id))
            .eq("status", "active")
            .gte("expires_at", "now()")
            .maybe_single()
            .execute()
        )

        has_sub = sub.data is not None
        permissions = {"jogos": True, "aovivo": True, "bingos": True, "segmentos": True} if has_sub else \
                      {"jogos": False, "aovivo": False, "bingos": False, "segmentos": False}

        return {
            "id": str(res.user.id),
            "email": res.user.email,
            "role": res.user.user_metadata.get("role", "USER"),
            "is_active": True,
            "has_subscription": has_sub,
            "subscription_expires_at": sub.data["expires_at"] if has_sub else None,
            "permissions": permissions,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
