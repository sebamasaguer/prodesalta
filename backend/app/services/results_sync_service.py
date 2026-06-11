"""
Servicio de sincronización de resultados usando la API pública de ESPN.
Llamado por el scheduler cada 30 minutos cuando hay partidos pendientes.
No requiere API key. Usa los códigos FIFA (3 letras) para emparejar equipos.
"""

import logging
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus
from app.models.team import Team
from app.schemas.match import MatchResultUpdate
from app.services.match_service import set_match_result

logger = logging.getLogger(__name__)

ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard"

# Mapeo de estados ESPN → nuestros estados
ESPN_FINISHED = {"STATUS_FINAL", "STATUS_FULL_TIME"}
ESPN_LIVE = {"STATUS_IN_PROGRESS", "STATUS_HALFTIME"}


def _fetch_espn_scoreboard(target_date: datetime) -> list[dict]:
    date_str = target_date.strftime("%Y%m%d")
    url = f"{ESPN_BASE}?dates={date_str}"
    try:
        resp = httpx.get(url, timeout=20)
        resp.raise_for_status()
        return resp.json().get("events", [])
    except Exception as exc:
        logger.error(f"Error consultando ESPN scoreboard para {date_str}: {exc}")
        return []


def _extract_event_data(event: dict) -> dict | None:
    """Extrae home_code, away_code, home_score, away_score, status de un evento ESPN."""
    try:
        comp = event["competitions"][0]
        competitors = comp["competitors"]
        home = next((t for t in competitors if t["homeAway"] == "home"), None)
        away = next((t for t in competitors if t["homeAway"] == "away"), None)
        if not home or not away:
            return None
        return {
            "home_code": home["team"]["abbreviation"],
            "away_code": away["team"]["abbreviation"],
            "home_score": int(home.get("score") or 0),
            "away_score": int(away.get("score") or 0),
            "espn_status": event["status"]["type"]["name"],
        }
    except (KeyError, TypeError, ValueError):
        return None


def has_pending_matches(db: Session) -> bool:
    """True si hay partidos SCHEDULED o LIVE en el día actual o en el anterior (UTC)."""
    now = datetime.now(timezone.utc)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
    day_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    result = db.execute(
        select(Match.id).where(
            Match.status.in_([MatchStatus.SCHEDULED, MatchStatus.LIVE]),
            Match.match_datetime >= day_start,
            Match.match_datetime <= day_end,
        ).limit(1)
    ).scalar_one_or_none()

    return result is not None


def sync_results(db: Session) -> dict:
    """
    Descarga resultados de hoy y ayer UTC desde ESPN y actualiza partidos terminados.
    Retorna dict con estadísticas: fetched, updated, skipped, errors.
    """
    now = datetime.now(timezone.utc)
    yesterday = now - timedelta(days=1)

    stats = {"fetched": 0, "updated": 0, "skipped": 0, "errors": 0}

    # Construir índice de equipos: code -> team_id
    teams = db.execute(select(Team.id, Team.code)).all()
    code_to_id = {t.code: t.id for t in teams if t.code}

    for target_date in [yesterday, now]:
        events = _fetch_espn_scoreboard(target_date)
        stats["fetched"] += len(events)

        if not events:
            continue

        for event in events:
            ev = _extract_event_data(event)
            if not ev:
                continue

            home_id = code_to_id.get(ev["home_code"])
            away_id = code_to_id.get(ev["away_code"])

            if not home_id or not away_id:
                logger.debug(
                    f"No se encontraron equipos en DB: {ev['home_code']} vs {ev['away_code']}"
                )
                continue

            match = db.execute(
                select(Match).where(
                    Match.home_team_id == home_id,
                    Match.away_team_id == away_id,
                )
            ).scalar_one_or_none()

            if not match:
                stats["skipped"] += 1
                continue

            espn_status = ev["espn_status"]

            # Actualizar a LIVE si está en juego
            if espn_status in ESPN_LIVE and match.status != MatchStatus.LIVE:
                match.status = MatchStatus.LIVE
                db.add(match)
                db.commit()
                logger.info(f"Partido {match.id} marcado como LIVE")
                stats["skipped"] += 1
                continue

            if espn_status not in ESPN_FINISHED:
                stats["skipped"] += 1
                continue

            if match.status == MatchStatus.FINISHED:
                stats["skipped"] += 1
                continue

            try:
                set_match_result(
                    db=db,
                    match=match,
                    data=MatchResultUpdate(
                        home_score=ev["home_score"],
                        away_score=ev["away_score"],
                        status=MatchStatus.FINISHED,
                    ),
                )
                logger.info(
                    f"Partido {match.id} ({ev['home_code']} vs {ev['away_code']}) "
                    f"actualizado: {ev['home_score']}-{ev['away_score']} FINISHED"
                )
                stats["updated"] += 1
            except Exception as exc:
                logger.error(f"Error actualizando partido {match.id}: {exc}")
                stats["errors"] += 1

    return stats
