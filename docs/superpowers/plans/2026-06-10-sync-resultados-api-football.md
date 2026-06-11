# Sync Automático de Resultados desde api-football — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sincronizar resultados de partidos del Mundial 2026 desde api-football cada 30 minutos cuando hay partidos pendientes, usando el plan Free (100 req/día).

**Architecture:** Se agrega `api_football_id` al modelo `Match` y un script one-time mapea cada partido a su fixture ID. Un servicio de sync consulta la API por fecha y actualiza resultados; APScheduler dentro de FastAPI lo dispara cada 30 minutos solo cuando existen partidos SCHEDULED o LIVE del día actual o anterior. El cálculo de puntajes ya se dispara automáticamente desde `set_match_result`.

**Tech Stack:** APScheduler 3.x (AsyncIOScheduler), httpx (ya instalado), FastAPI lifespan, Alembic migration.

---

## Archivos a crear/modificar

- Crear: `backend/app/alembic/versions/b2c3d4e5f6a7_add_api_football_id_to_matches.py`
- Modificar: `backend/app/models/match.py` — agregar columna `api_football_id`
- Crear: `backend/app/services/results_sync_service.py` — lógica de sync de resultados
- Crear: `backend/app/scripts/sync_fixture_ids.py` — script one-time para mapear fixture IDs
- Crear: `backend/app/scheduler.py` — setup de APScheduler
- Modificar: `backend/app/main.py` — lifespan para arrancar/parar scheduler
- Modificar: `requirements.txt` (raíz del repo) — agregar apscheduler
- Modificar: `backend/app/core/config.py` — verificar que API_FOOTBALL_KEY ya está

---

## Task 1: Dependencia APScheduler + migración api_football_id en matches

**Files:**
- Modify: `requirements.txt`
- Create: `backend/app/alembic/versions/b2c3d4e5f6a7_add_api_football_id_to_matches.py`
- Modify: `backend/app/models/match.py`

- [ ] **Step 1: Agregar apscheduler a requirements.txt**

En `/home/seba/Escritorio/hackathon/prodesalta/requirements.txt`, agregar al final:

```
apscheduler==3.10.4
```

- [ ] **Step 2: Instalar localmente**

```bash
pip install apscheduler==3.10.4
```

Salida esperada: `Successfully installed apscheduler-3.10.4`

- [ ] **Step 3: Crear migración**

Crear `/home/seba/Escritorio/hackathon/prodesalta/backend/app/alembic/versions/b2c3d4e5f6a7_add_api_football_id_to_matches.py`:

```python
"""add api_football_id to matches

Revision ID: b2c3d4e5f6a7
Revises: f3a1b2c4d5e6
Create Date: 2026-06-10 00:00:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "f3a1b2c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "matches",
        sa.Column("api_football_id", sa.Integer(), nullable=True),
    )
    op.create_index("ix_matches_api_football_id", "matches", ["api_football_id"])


def downgrade() -> None:
    op.drop_index("ix_matches_api_football_id", "matches")
    op.drop_column("matches", "api_football_id")
```

- [ ] **Step 4: Agregar campo al modelo Match**

En `backend/app/models/match.py`, agregar después de la línea `from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String`:

La línea ya importa `Integer`. Agregar el campo en la clase `Match` justo después de `id`:

```python
api_football_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
```

Ubicar después de:
```python
id: Mapped[int] = mapped_column(primary_key=True, index=True)
```

- [ ] **Step 5: Correr migración local**

```bash
cd /home/seba/Escritorio/hackathon/prodesalta/backend
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" alembic upgrade head
```

Salida esperada: `Running upgrade f3a1b2c4d5e6 -> b2c3d4e5f6a7, add api_football_id to matches`

- [ ] **Step 6: Commit**

```bash
git add requirements.txt \
        backend/app/alembic/versions/b2c3d4e5f6a7_add_api_football_id_to_matches.py \
        backend/app/models/match.py
git commit -m "feat: agregar api_football_id a matches y dependencia apscheduler"
```

---

## Task 2: Script one-time para mapear fixture IDs

**Files:**
- Create: `backend/app/scripts/sync_fixture_ids.py`

Este script corre una sola vez. Descarga todos los fixtures del WC 2026 desde api-football (~2-3 requests), cruza con los partidos de la DB por `home_team.api_football_id` + `away_team.api_football_id`, y guarda el `api_football_id` en cada match.

- [ ] **Step 1: Crear `backend/app/scripts/sync_fixture_ids.py`**

```python
"""
Mapea cada partido de la DB al fixture ID de api-football.
Corre una sola vez: cd backend && python3 -m app.scripts.sync_fixture_ids

Usa ~2-3 requests (trae todos los fixtures del WC 2026 paginado).
Los partidos ya mapeados se saltean automáticamente (0 requests extra).
Usar --force para re-mapear todos.
"""

import sys
import time
import os

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import get_settings
from app.core.db import engine
from app.models.match import Match
from app.models.team import Team

API_BASE = "https://v3.football.api-sports.io"
LEAGUE_ID = 1
SEASON = 2026
DELAY = 7  # plan Free: máx 10 req/min


def api_headers(key: str) -> dict:
    return {"x-apisports-key": key}


def api_get(key: str, url: str) -> dict:
    for attempt in range(3):
        resp = httpx.get(url, headers=api_headers(key), timeout=30)
        if resp.status_code == 429:
            print(f"  Rate limit, esperando 65s...")
            time.sleep(65)
            continue
        resp.raise_for_status()
        return resp.json()
    raise RuntimeError("Máximo de reintentos alcanzado")


def fetch_all_fixtures(key: str) -> list[dict]:
    """Descarga todos los fixtures del WC 2026 (paginado)."""
    fixtures = []
    page = 1
    while True:
        url = f"{API_BASE}/fixtures?league={LEAGUE_ID}&season={SEASON}&page={page}"
        print(f"  Fetching page {page}...")
        data = api_get(key, url)

        errors = data.get("errors", {})
        if errors:
            raise RuntimeError(f"Error API: {errors}")

        batch = data.get("response", [])
        fixtures.extend(batch)

        paging = data.get("paging", {})
        if paging.get("current", 1) >= paging.get("total", 1):
            break
        page += 1
        time.sleep(DELAY)

    return fixtures


def main():
    force = "--force" in sys.argv
    settings = get_settings()

    if not settings.API_FOOTBALL_KEY:
        print("ERROR: API_FOOTBALL_KEY no configurada en .env")
        sys.exit(1)

    key = settings.API_FOOTBALL_KEY

    with Session(engine) as db:
        # Construir índice: (home_api_id, away_api_id) -> Match
        matches = db.execute(
            select(Match).where(
                Match.home_team_id.isnot(None),
                Match.away_team_id.isnot(None),
            )
        ).scalars().all()

        if not force:
            pending = [m for m in matches if m.api_football_id is None]
        else:
            pending = matches

        if not pending:
            print("Todos los partidos ya están mapeados. Usar --force para re-mapear.")
            return

        print(f"Partidos a mapear: {len(pending)}")

        # Obtener api_football_id de los equipos
        teams = db.execute(select(Team)).scalars().all()
        team_by_db_id = {t.id: t.api_football_id for t in teams}

        # Índice: (home_api_id, away_api_id) -> Match
        match_index: dict[tuple[int, int], Match] = {}
        for m in pending:
            home_api = team_by_db_id.get(m.home_team_id)
            away_api = team_by_db_id.get(m.away_team_id)
            if home_api and away_api:
                match_index[(home_api, away_api)] = m

        print(f"Descargando fixtures de api-football (WC {SEASON})...")
        fixtures = fetch_all_fixtures(key)
        print(f"Fixtures recibidos: {len(fixtures)}")

        mapped = 0
        for fix in fixtures:
            home_id = fix["teams"]["home"]["id"]
            away_id = fix["teams"]["away"]["id"]
            fixture_id = fix["fixture"]["id"]

            match = match_index.get((home_id, away_id))
            if match:
                match.api_football_id = fixture_id
                db.add(match)
                db.commit()
                mapped += 1
                print(f"  ✓ {fix['teams']['home']['name']} vs {fix['teams']['away']['name']} → fixture {fixture_id}")

        print(f"\nMapeados: {mapped} / {len(pending)}")
        unmapped = len(pending) - mapped
        if unmapped:
            print(f"Sin mapear: {unmapped} (partidos sin equipos definidos aún — fase eliminatoria pendiente)")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Verificar que el script importa correctamente**

```bash
cd /home/seba/Escritorio/hackathon/prodesalta/backend
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" python3 -c "from app.scripts.sync_fixture_ids import main; print('OK')"
```

Salida esperada: `OK`

- [ ] **Step 3: Commit**

```bash
git add backend/app/scripts/sync_fixture_ids.py
git commit -m "feat: script one-time para mapear fixture IDs a partidos"
```

---

## Task 3: Servicio de sincronización de resultados

**Files:**
- Create: `backend/app/services/results_sync_service.py`

Este servicio es el núcleo del sync periódico. Consulta la API por la fecha UTC actual y la anterior, actualiza resultados, y dispara el cálculo de puntajes.

- [ ] **Step 1: Crear `backend/app/services/results_sync_service.py`**

```python
"""
Servicio de sincronización de resultados desde api-football.
Llamado por el scheduler cada 30 minutos cuando hay partidos pendientes.
"""

import logging
import time
from datetime import date, datetime, timedelta, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.match import Match, MatchStatus
from app.schemas.match import MatchResultUpdate
from app.services.match_service import get_match_by_id, set_match_result

logger = logging.getLogger(__name__)

API_BASE = "https://v3.football.api-sports.io"
LEAGUE_ID = 1
SEASON = 2026

# Mapeo de estados api-football → nuestros estados
FINISHED_STATUSES = {"FT", "AET", "PEN"}
LIVE_STATUSES = {"1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT", "LIVE"}


def _api_headers(key: str) -> dict:
    return {"x-apisports-key": key}


def _fetch_fixtures_for_date(key: str, target_date: date) -> list[dict]:
    url = f"{API_BASE}/fixtures?league={LEAGUE_ID}&season={SEASON}&date={target_date.isoformat()}"
    try:
        resp = httpx.get(url, headers=_api_headers(key), timeout=20)
        if resp.status_code == 429:
            logger.warning("api-football rate limit alcanzado")
            return []
        resp.raise_for_status()
        data = resp.json()
        errors = data.get("errors", {})
        if errors:
            logger.error(f"Error api-football: {errors}")
            return []
        return data.get("response", [])
    except Exception as exc:
        logger.error(f"Error consultando api-football: {exc}")
        return []


def has_pending_matches(db: Session) -> bool:
    """Retorna True si hay partidos SCHEDULED o LIVE en las últimas 24h o próximas 2h."""
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(hours=24)
    window_end = now + timedelta(hours=2)

    result = db.execute(
        select(Match.id).where(
            Match.status.in_([MatchStatus.SCHEDULED, MatchStatus.LIVE]),
            Match.match_datetime >= window_start,
            Match.match_datetime <= window_end,
        ).limit(1)
    ).scalar_one_or_none()

    return result is not None


def sync_results(db: Session) -> dict:
    """
    Descarga resultados de hoy y ayer UTC, actualiza partidos FINISHED.
    Retorna un resumen: {fetched, updated, skipped, errors}.
    """
    settings = get_settings()
    if not settings.API_FOOTBALL_KEY:
        logger.warning("API_FOOTBALL_KEY no configurada, sync omitido")
        return {"fetched": 0, "updated": 0, "skipped": 0, "errors": 1}

    key = settings.API_FOOTBALL_KEY
    today_utc = datetime.now(timezone.utc).date()
    yesterday_utc = today_utc - timedelta(days=1)

    stats = {"fetched": 0, "updated": 0, "skipped": 0, "errors": 0}

    for target_date in [yesterday_utc, today_utc]:
        fixtures = _fetch_fixtures_for_date(key, target_date)
        stats["fetched"] += len(fixtures)

        if not fixtures:
            continue

        # Índice de fixtures por api_football_id
        fixture_map = {f["fixture"]["id"]: f for f in fixtures}

        # Buscar nuestros partidos que tienen api_football_id en este lote
        fixture_ids = list(fixture_map.keys())
        if not fixture_ids:
            continue

        our_matches = db.execute(
            select(Match).where(Match.api_football_id.in_(fixture_ids))
        ).scalars().all()

        for match in our_matches:
            fix = fixture_map[match.api_football_id]
            fix_status = fix["fixture"]["status"]["short"]
            goals = fix.get("goals", {})
            home_score = goals.get("home")
            away_score = goals.get("away")

            if fix_status not in FINISHED_STATUSES:
                # Actualizar a LIVE si está en juego
                if fix_status in LIVE_STATUSES and match.status != MatchStatus.LIVE:
                    match.status = MatchStatus.LIVE
                    db.add(match)
                    db.commit()
                stats["skipped"] += 1
                continue

            if match.status == MatchStatus.FINISHED:
                stats["skipped"] += 1
                continue

            if home_score is None or away_score is None:
                logger.warning(f"Partido {match.id} terminado pero sin goles en API")
                stats["skipped"] += 1
                continue

            try:
                set_match_result(
                    db=db,
                    match=match,
                    data=MatchResultUpdate(
                        home_score=home_score,
                        away_score=away_score,
                        status=MatchStatus.FINISHED,
                    ),
                )
                logger.info(
                    f"Partido {match.id} actualizado: {home_score}-{away_score} FINISHED"
                )
                stats["updated"] += 1
            except Exception as exc:
                logger.error(f"Error actualizando partido {match.id}: {exc}")
                stats["errors"] += 1

        # Pausa entre requests de distintas fechas
        time.sleep(2)

    return stats
```

- [ ] **Step 2: Verificar que importa correctamente**

```bash
cd /home/seba/Escritorio/hackathon/prodesalta/backend
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" python3 -c "from app.services.results_sync_service import sync_results, has_pending_matches; print('OK')"
```

Salida esperada: `OK`

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/results_sync_service.py
git commit -m "feat: servicio de sync de resultados desde api-football"
```

---

## Task 4: Scheduler APScheduler + lifespan en FastAPI

**Files:**
- Create: `backend/app/scheduler.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Crear `backend/app/scheduler.py`**

```python
import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.db import SessionLocal

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="UTC")


def _sync_job() -> None:
    """Job sincrónico que corre en el event loop. Comprueba si hay partidos pendientes antes de llamar a la API."""
    from app.services.results_sync_service import has_pending_matches, sync_results

    with SessionLocal() as db:
        if not has_pending_matches(db):
            return

        logger.info("Iniciando sync de resultados api-football...")
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
        max_instances=1,  # evita solapamiento si un job tarda más de 30 min
    )
    scheduler.start()
    logger.info("Scheduler iniciado — sync cada 30 minutos")


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("Scheduler detenido")
```

- [ ] **Step 2: Modificar `backend/app/main.py` para usar lifespan**

Reemplazar el archivo completo con:

```python
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.routers import (
    auth,
    fixture_import,
    health,
    matches,
    predictions,
    prode_groups,
    rankings,
    scoring_rules,
    sponsors,
    stats,
    teams,
    tournaments,
    users,
)
from app.scheduler import start_scheduler, stop_scheduler

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.APP_DEBUG,
    version="0.9.5",
    lifespan=lifespan,
)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

STATIC_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=str(STATIC_DIR)),
    name="static",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(prode_groups.router, prefix="/api")
app.include_router(tournaments.router, prefix="/api")
app.include_router(teams.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(scoring_rules.router, prefix="/api")
app.include_router(sponsors.router, prefix="/api")
app.include_router(rankings.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(fixture_import.router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
        "static_dir": str(STATIC_DIR),
    }
```

- [ ] **Step 3: Verificar que el backend levanta con el scheduler**

```bash
cd /home/seba/Escritorio/hackathon/prodesalta/backend
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" python3 -c "from app.main import app; print('OK')"
```

Salida esperada: `OK`

- [ ] **Step 4: Levantar y verificar en logs**

```bash
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" uvicorn app.main:app --host 0.0.0.0 --port 8100 --reload
```

En los logs debe aparecer: `Scheduler iniciado — sync cada 30 minutos`

- [ ] **Step 5: Commit**

```bash
git add backend/app/scheduler.py backend/app/main.py
git commit -m "feat: scheduler APScheduler con sync de resultados cada 30 minutos"
```

---

## Task 5: Verificar API_FOOTBALL_KEY en config y .env de producción

**Files:**
- Verify: `backend/app/core/config.py`

- [ ] **Step 1: Confirmar que API_FOOTBALL_KEY ya está en config**

```bash
grep "API_FOOTBALL_KEY" /home/seba/Escritorio/hackathon/prodesalta/backend/app/core/config.py
```

Salida esperada: `API_FOOTBALL_KEY: str | None = None`

Si no está, agregar en la clase `Settings`:
```python
API_FOOTBALL_KEY: str | None = None
```

- [ ] **Step 2: Agregar la key al .env local para pruebas**

En `backend/.env`, verificar que exista:
```
API_FOOTBALL_KEY=tu_key_aqui
```

Si no está, agregarla. La key se obtiene desde el dashboard de api-football.com.

- [ ] **Step 3: Correr el script de mapeo de fixture IDs**

```bash
cd /home/seba/Escritorio/hackathon/prodesalta/backend
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" API_FOOTBALL_KEY="$(grep API_FOOTBALL_KEY .env | cut -d= -f2-)" python3 -m app.scripts.sync_fixture_ids
```

Salida esperada (ejemplo):
```
Partidos a mapear: 104
Descargando fixtures de api-football (WC 2026)...
Fetching page 1...
Fixtures recibidos: 104
  ✓ Mexico vs South Africa → fixture 1234567
  ✓ Korea Republic vs Czech Republic → fixture 1234568
  ...
Mapeados: 80 / 104
Sin mapear: 24 (partidos sin equipos definidos aún — fase eliminatoria pendiente)
```

Los partidos de fase eliminatoria sin equipos definidos quedarán con `api_football_id = NULL` hasta que se conozcan los clasificados (se pueden re-correr el script después).

- [ ] **Step 4: Verificar en DB que los IDs quedaron guardados**

```bash
DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" python3 -c "
from app.core.db import SessionLocal
from sqlalchemy import select, func
from app.models.match import Match
with SessionLocal() as db:
    total = db.execute(select(func.count()).select_from(Match)).scalar()
    mapped = db.execute(select(func.count()).select_from(Match).where(Match.api_football_id.isnot(None))).scalar()
    print(f'Total: {total} | Con api_football_id: {mapped}')
"
```

Salida esperada: `Total: 104 | Con api_football_id: 80` (o similar)

---

## Task 6: Push a producción y configurar API_FOOTBALL_KEY en Dokploy

- [ ] **Step 1: Push del código**

```bash
git push origin main
```

- [ ] **Step 2: Configurar variable en Dokploy**

En el panel de Dokploy, agregar la variable de entorno al servicio backend:
```
API_FOOTBALL_KEY=tu_key_aqui
```

Verificar también que `DATABASE_URL` siga apuntando a `prode-mundial` (no a `prodemundialcopia`).

- [ ] **Step 3: Redeploy en Dokploy**

La migración `b2c3d4e5f6a7` se correrá automáticamente al arrancar el backend.

En los logs del contenedor debe aparecer:
```
Running upgrade f3a1b2c4d5e6 -> b2c3d4e5f6a7, add api_football_id to matches
Scheduler iniciado — sync cada 30 minutos
```

- [ ] **Step 4: Correr el script de mapeo en producción**

Desde la máquina local (apuntando a la DB de producción):
```bash
cd /home/seba/Escritorio/hackathon/prodesalta/backend
DATABASE_URL="postgresql+psycopg://saltiadb:asdf3456@31.97.28.11:5433/prode-mundial" \
API_FOOTBALL_KEY="tu_key" \
python3 -m app.scripts.sync_fixture_ids
```

Este paso mapea los fixture IDs en la DB de producción. Solo se necesita correr una vez.
