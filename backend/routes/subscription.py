from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import supabase
from mock_data import MOCK_SUBSCRIPTION_PLANS

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


@router.get("/subscription/plans", response_model=list[dict])
async def list_plans():
    return [p for p in MOCK_SUBSCRIPTION_PLANS if p["is_active"]]


@router.get("/subscription/status", response_model=dict)
async def subscription_status(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
):
    if not credentials:
        return _no_subscription()
    try:
        res = supabase.auth.get_user(credentials.credentials)
        if not res.user:
            return _no_subscription()

        sub = (
            supabase.table("user_subscriptions")
            .select("*, subscription_plans(name)")
            .eq("user_id", str(res.user.id))
            .eq("status", "active")
            .gte("expires_at", "now()")
            .maybe_single()
            .execute()
        )

        if not sub.data:
            return _no_subscription()

        return {
            "has_subscription": True,
            "status": "active",
            "plan_name": sub.data["subscription_plans"]["name"],
            "expires_at": sub.data["expires_at"],
            "permissions": {"jogos": True, "aovivo": True, "bingos": True, "segmentos": True},
        }
    except Exception:
        return _no_subscription()


def _no_subscription() -> dict:
    return {
        "has_subscription": False,
        "status": None,
        "plan_name": None,
        "expires_at": None,
        "permissions": {"jogos": False, "aovivo": False, "bingos": False, "segmentos": False},
    }
