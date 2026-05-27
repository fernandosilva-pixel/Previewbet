"""
APScheduler: agenda tarefas automáticas de coleta de dados.

Cadência:
  - sync_fixtures  → a cada 3 horas  (busca jogos dos próximos 2 dias)
  - sync_today     → a cada 2 minutos (atualiza placares do dia)
  - No startup     → sync imediato, sem esperar o primeiro ciclo
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

    # scores do dia a cada 2 minutos
    _scheduler.add_job(
        _job_today,
        trigger=IntervalTrigger(minutes=2),
        id="today",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    _scheduler.start()
    _started = True
    print("[scheduler] Iniciado (fixtures/3h + today/2min)", flush=True)

    # sync imediato no startup (não espera o primeiro ciclo)
    asyncio.create_task(_job_fixtures())


def stop() -> None:
    global _started
    if _started:
        _scheduler.shutdown(wait=False)
        _started = False
        print("[scheduler] Encerrado", flush=True)
