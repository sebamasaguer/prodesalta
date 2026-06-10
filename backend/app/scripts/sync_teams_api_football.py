"""
Sincroniza equipos y jugadores del Mundial 2026 desde api-football.com.
Uso: cd backend && python3 -m app.scripts.sync_teams_api_football

Estrategia para plan Free (100 req/día):
  1. Intenta season=2026 (planes pagos).
  2. Si falla por plan, cae a season=2022 (~3 req → 32 equipos del WC 2022).
  3. Para equipos de la DB sin match, busca por nombre (~1 req c/u).
  4. Por cada equipo, descarga la plantilla actual (~1 req c/u).
  Total aprox: 3 + ≤16 + 48 = ~67 requests.

Resiliencia:
  - Cada equipo se guarda con commit independiente.
  - Si el script se interrumpe, los ya guardados persisten.
  - Al reiniciar, saltea automáticamente los ya sincronizados (0 requests extra).
  - Usar --force para re-sincronizar todos.
"""

import sys
import time
import os

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import get_settings
from app.core.db import engine
from app.models.player import Player
from app.models.team import Team
from app.models.team_squad import TeamSquad

API_BASE = "https://v3.football.api-sports.io"
LEAGUE_ID = 1     # FIFA World Cup
SEASON = 2026
DELAY = 7         # segundos entre requests (plan Free = 10 req/min → mín 6s)


def api_headers(key: str) -> dict:
    return {"x-apisports-key": key}


def fetch_teams_by_league(key: str, season: int) -> list[dict]:
    teams: list[dict] = []
    page = 1
    while True:
        url = f"{API_BASE}/teams?league={LEAGUE_ID}&season={season}"
        if page > 1:
            url += f"&page={page}"
        data = api_get(key, url)

        errors = data.get("errors", {})
        if errors:
            err_str = str(errors)
            if "plan" in err_str.lower() or "free" in err_str.lower():
                raise RuntimeError(err_str)
            if "page" in err_str.lower():
                break
            raise RuntimeError(err_str)

        results = data.get("response", [])
        teams.extend(results)

        paging = data.get("paging", {})
        if paging.get("current", 1) >= paging.get("total", 1):
            break
        page += 1
        time.sleep(DELAY)

    return teams


def api_get(key: str, url: str, retries: int = 3) -> dict:
    """GET con reintento automático ante 429 (espera 65s para resetear el minuto)."""
    for attempt in range(retries):
        resp = httpx.get(url, headers=api_headers(key), timeout=30)
        if resp.status_code == 429:
            wait = 65
            print(f"\n   [429] Rate limit. Esperando {wait}s...", end=" ", flush=True)
            time.sleep(wait)
            print("reintentando")
            continue
        resp.raise_for_status()
        return resp.json()
    resp.raise_for_status()
    return {}


def search_team_by_code(key: str, code: str) -> list[dict]:
    """Busca equipo por código FIFA. Filtra por national=true para no confundir con clubes."""
    url = f"{API_BASE}/teams?code={code}"
    data = api_get(key, url)
    results = data.get("response", [])
    # Preferir selección nacional si hay múltiples resultados
    nationals = [r for r in results if r.get("team", {}).get("national") is True]
    return nationals if nationals else results


def fetch_squad(key: str, api_team_id: int) -> dict | None:
    url = f"{API_BASE}/players/squads?team={api_team_id}"
    data = api_get(key, url)
    results = data.get("response", [])
    return results[0] if results else None


def squad_already_synced(db: Session, db_team_id: int) -> bool:
    count = db.execute(
        select(func.count(TeamSquad.id)).where(
            TeamSquad.team_id == db_team_id,
            TeamSquad.season == SEASON,
        )
    ).scalar_one()
    return count > 0


def apply_team_data(db_team: Team, td: dict, vd: dict) -> None:
    """Actualiza campos del equipo con datos de la API sin hacer commit."""
    db_team.api_football_id = td["id"]
    if td.get("country"):
        db_team.country = td["country"]
    if td.get("founded"):
        db_team.founded = td["founded"]
    if td.get("logo") and not db_team.flag_url:
        db_team.flag_url = td["logo"]
    if vd.get("name") and not db_team.venue_name:
        db_team.venue_name = vd["name"]
    if vd.get("city") and not db_team.venue_city:
        db_team.venue_city = vd["city"]
    if vd.get("capacity") and not db_team.venue_capacity:
        db_team.venue_capacity = vd["capacity"]
    if vd.get("image") and not db_team.venue_photo:
        db_team.venue_photo = vd["image"]


def build_mapping_from_list(db: Session, api_teams: list[dict]) -> dict[int, int]:
    """
    Matchea una lista de equipos de la API contra la DB.
    Actualiza campos en teams. Retorna {api_football_id: db_team_id}.
    """
    mapping: dict[int, int] = {}

    for item in api_teams:
        td = item.get("team", {})
        vd = item.get("venue", {})
        api_id: int | None = td.get("id")
        api_name: str = (td.get("name") or "").strip()
        api_code: str = (td.get("code") or "").strip().upper()

        if not api_id:
            continue

        db_team = db.execute(
            select(Team).where(Team.code.ilike(api_code))
        ).scalar_one_or_none()

        if not db_team and api_name:
            db_team = db.execute(
                select(Team).where(Team.name.ilike(f"%{api_name}%"))
            ).scalar_one_or_none()

        if not db_team:
            print(f"  [SKIP] Sin coincidencia en DB: {api_name} ({api_code})")
            continue

        apply_team_data(db_team, td, vd)
        db.add(db_team)
        mapping[api_id] = db_team.id
        print(f"  [OK]   {api_name} ({api_code}) → team_id={db_team.id}")

    return mapping


def get_or_create_player(db: Session, player_data: dict) -> Player:
    api_pid: int | None = player_data.get("id")
    if api_pid:
        existing = db.execute(
            select(Player).where(Player.api_football_id == api_pid)
        ).scalar_one_or_none()
        if existing:
            return existing

    player = Player(
        api_football_id=api_pid,
        name=player_data.get("name") or "",
        age=player_data.get("age"),
        photo_url=player_data.get("photo"),
    )
    db.add(player)
    db.flush()
    return player


def sync_squad(db: Session, db_team_id: int, squad_data: dict) -> int:
    """
    Guarda coach y plantilla del equipo. Commit propio e independiente.
    Si se interrumpe antes del commit, este equipo no queda a medias.
    """
    coach = squad_data.get("coach") or {}
    if coach.get("name"):
        db_team = db.get(Team, db_team_id)
        if db_team:
            db_team.coach_name = coach["name"]
            db_team.coach_nationality = coach.get("nationality")
            db_team.coach_photo = coach.get("photo")
            db.add(db_team)

    old_squads = db.execute(
        select(TeamSquad).where(
            TeamSquad.team_id == db_team_id,
            TeamSquad.season == SEASON,
        )
    ).scalars().all()
    for sq in old_squads:
        db.delete(sq)
    db.flush()

    players_data: list[dict] = squad_data.get("players", [])
    for pd in players_data:
        player = get_or_create_player(db, pd)
        db.add(TeamSquad(
            team_id=db_team_id,
            player_id=player.id,
            position=pd.get("position"),
            jersey_number=pd.get("number"),
            season=SEASON,
        ))

    db.commit()   # commit individual por equipo
    return len(players_data)


def main() -> None:
    force = "--force" in sys.argv
    settings = get_settings()
    api_key = settings.API_FOOTBALL_KEY

    if not api_key:
        print("ERROR: API_FOOTBALL_KEY no configurada en .env")
        sys.exit(1)

    print(f"Sincronizando equipos del Mundial {SEASON} (league={LEAGUE_ID})...")
    if force:
        print("Modo --force: se re-sincronizan todos los equipos.\n")
    else:
        print("Equipos ya sincronizados se saltean (0 requests extra).")
        print("Usá --force para re-sincronizar todos.\n")

    with Session(engine) as db:
        # ── PASO 1: obtener lista de equipos ──────────────────────────────────
        print("1. Obteniendo lista de equipos desde api-football...")
        api_teams: list[dict] = []

        for try_season in [SEASON, 2022]:
            try:
                api_teams = fetch_teams_by_league(api_key, try_season)
                print(f"   {len(api_teams)} equipos obtenidos con season={try_season}")
                break
            except RuntimeError as exc:
                msg = str(exc)
                if "Free plans" in msg or "season" in msg.lower():
                    print(f"   season={try_season} no disponible en plan Free, intentando anterior...")
                    time.sleep(DELAY)
                else:
                    print(f"ERROR: {exc}")
                    sys.exit(1)

        if not api_teams:
            print("Sin datos de equipos de la API. Verificar key o plan.")
            sys.exit(1)

        # ── PASO 2: matchear y actualizar teams en DB ─────────────────────────
        print("\n2. Asociando equipos con la DB local...")
        mapping = build_mapping_from_list(db, api_teams)
        db.commit()   # commit de todos los updates de team info
        print(f"\n   {len(mapping)}/{len(api_teams)} equipos asociados")

        # ── PASO 3: buscar equipos de la DB que no matchearon ─────────────────
        all_db_teams = db.execute(select(Team)).scalars().all()
        unmatched = [t for t in all_db_teams if t.id not in mapping.values()]

        if unmatched:
            print(f"\n   Buscando {len(unmatched)} equipos sin match por código FIFA...")
            for db_team in unmatched:
                print(f"   code={db_team.code} ({db_team.name})...", end=" ", flush=True)
                try:
                    results = search_team_by_code(api_key, db_team.code)
                    matched = results[0] if results else None

                    if matched:
                        td = matched.get("team", {})
                        vd = matched.get("venue", {})
                        apply_team_data(db_team, td, vd)
                        db.add(db_team)
                        db.commit()
                        mapping[td["id"]] = db_team.id
                        print(f"OK → api_id={td['id']}")
                    else:
                        print("no encontrado")
                except Exception as exc:
                    print(f"ERROR: {exc}")
                time.sleep(DELAY)

        # ── PASO 4: sincronizar plantillas ────────────────────────────────────
        print(f"\n3. Sincronizando plantillas (season={SEASON})...")
        synced = skipped = errors = 0

        for api_id, db_team_id in mapping.items():
            if not force and squad_already_synced(db, db_team_id):
                print(f"   [YA CARGADO] team_id={db_team_id}")
                skipped += 1
                continue

            print(f"   api_id={api_id} (team_id={db_team_id})...", end=" ", flush=True)
            try:
                squad = fetch_squad(api_key, api_id)
                if squad:
                    count = sync_squad(db, db_team_id, squad)
                    print(f"{count} jugadores guardados")
                    synced += 1
                else:
                    print("sin datos de plantilla en la API")
            except Exception as exc:
                db.rollback()
                print(f"ERROR: {exc}")
                errors += 1

            time.sleep(DELAY)

    print(f"\n=== Resultado ===")
    print(f"  Sincronizados:          {synced}")
    print(f"  Ya cargados (salteados): {skipped}")
    print(f"  Errores:                {errors}")


if __name__ == "__main__":
    main()
