"""
APScheduler: agenda tarefas automáticas de coleta de dados.

Cadência:
  - sync_fixtures → a cada 3 horas
  - sync_today    → a cada 3 minutos
  - startup sync  → após 30s do boot (dá tempo do uvicorn estar pronto)
"""

import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from services.data_collector import sync_fixtures, sync_today

_scheduler = AsyncIOScheduler(timezone="UTC")
_started   = False


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------

async def _job_fixtures() -> None:
    try:
        count = await sync_fixtures(days_ahead=2)
        print(f"[scheduler] fixtures: {count} jogos sincronizados", flush=True)
    except Exception as exc:
        print(f"[scheduler] fixtures error: {exc}", flush=True)


async def _job_today() -> None:
    try:
        count = await sync_today()
        print(f"[scheduler] today: {count} jogos atualizados", flush=True)
    except Exception as exc:
        print(f"[scheduler] today error: {exc}", flush=True)


async def _delayed_startup_sync() -> None:
    """Aguarda 30s para o uvicorn estar pronto antes do primeiro sync."""
    await asyncio.sleep(30)
    print("[scheduler] Iniciando sync de startup...", flush=True)
    await _job_fixtures()


# ---------------------------------------------------------------------------
# Ciclo de vida
# ---------------------------------------------------------------------------

def start() -> None:
    global _started
    if _started:
        return

    # fixtures a cada 3 horas
    _scheduler.add_job(
        _job_fixtures,
        trigger=IntervalTrigger(hours=3),
        id="fixtures",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    # scores do dia a cada 3 minutos
    _scheduler.add_job(
        _job_today,
        trigger=IntervalTrigger(minutes=3),
        id="today",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    _scheduler.start()
    _started = True
    print("[scheduler] Iniciado (fixtures/3h + today/3min, startup sync em 30s)", flush=True)

    # sync inicial com delay — não trava o boot do uvicorn
    asyncio.create_task(_delayed_startup_sync())


def stop() -> None:
    global _started
    if _started:
        _scheduler.shutdown(wait=False)
        _started = False
        print("[scheduler] Encerrado", flush=True)
