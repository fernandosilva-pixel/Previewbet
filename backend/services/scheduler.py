"""
APScheduler: agenda tarefas automáticas de coleta, análise e verificação.
Inicializado no lifespan do FastAPI após o banco estar configurado.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler(timezone="America/Sao_Paulo")


def setup_scheduler():
    """Registra todos os jobs. Chamar no startup do FastAPI."""
    # scheduler.add_job(fetch_and_store_games, "interval", minutes=30, id="collect_games")
    # scheduler.add_job(verify_finished_games, "interval", hours=1, id="verify_results")
    scheduler.start()
    return scheduler
