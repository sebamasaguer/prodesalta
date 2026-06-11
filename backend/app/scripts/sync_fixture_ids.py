"""
Mapea cada partido de la DB al fixture ID de api-football.
Corre una sola vez: cd backend && python3 -m app.scripts.sync_fixture_ids

Usa ~2-3 requests para descargar todos los fixtures del WC 2026.
Los partidos ya mapeados se saltean (0 requests extra).
Usar --force para re-mapear todos igualmente.
"""

import sys
import time

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

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

        teams = db.execute(select(Team)).scalars().all()
        team_by_db_id = {t.id: t.api_football_id for t in teams}

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
                print(
                    f"  OK {fix['teams']['home']['name']} vs {fix['teams']['away']['name']} "
                    f"-> fixture {fixture_id}"
                )

        print(f"\nMapeados: {mapped} / {len(pending)}")
        unmapped = len(pending) - mapped
        if unmapped:
            print(
                f"Sin mapear: {unmapped} "
                f"(partidos sin equipos definidos — re-correr cuando se conozcan clasificados)"
            )


if __name__ == "__main__":
    main()
