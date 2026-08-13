"""Background scheduler for watchlist monitoring (bonus objective).

Runs a lightweight sweep every 15 minutes: for each watched target whose
`interval_hours` has elapsed since `last_checked`, re-run the investigation
and raise an alert if new entities appeared.
"""

from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.database.mongo import watchlist_collection
from app.services.monitor_service import MonitorService

_scheduler: AsyncIOScheduler | None = None
_monitor = MonitorService()


async def _sweep(investigate_fn):
    col = watchlist_collection()
    if col is None:
        return

    now = datetime.now(timezone.utc)

    async for watch in col.find({}):
        last_checked = watch.get("last_checked")

        due = (
            last_checked is None
            or (now - last_checked.replace(tzinfo=timezone.utc)).total_seconds()
            >= watch.get("interval_hours", 24) * 3600
        )

        if due:
            try:
                await _monitor.run_check(watch, investigate_fn)
            except Exception:  # noqa: BLE001
                # A single bad target shouldn't kill the sweep; source
                # health tracking already records the underlying failure.
                continue


def start_scheduler(investigate_fn):
    global _scheduler

    if _scheduler is not None:
        return _scheduler

    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(
        _sweep,
        "interval",
        minutes=15,
        args=[investigate_fn],
        id="watchlist_sweep",
        next_run_time=datetime.now(timezone.utc),
    )
    _scheduler.start()
    return _scheduler
