import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.db import SessionLocal

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="UTC")


def _sync_job() -> None:
    from app.services.results_sync_service import has_pending_matches, sync_results

    with SessionLocal() as db:
        if not has_pending_matches(db):
            return

        logger.info("Iniciando sync de resultados desde api-football...")
        stats = sync_results(db)
        logger.info(
            f"Sync completado — fetched={stats['fetched']} updated={stats['updated']} "
            f"skipped={stats['skipped']} errors={stats['errors']}"
        )


def start_scheduler() -> None:
    scheduler.add_job(
        _sync_job,
        trigger=IntervalTrigger(minutes=30),
        id="sync_results",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.start()
    logger.info("Scheduler iniciado — sync de resultados cada 30 minutos")


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("Scheduler detenido")
