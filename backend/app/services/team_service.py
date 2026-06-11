from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.player import Player
from app.models.team import Team
from app.models.team_squad import TeamSquad
from app.schemas.team import PlayerInSquad, TeamCreate, TeamDetail, TeamUpdate


def list_teams(db: Session) -> list[Team]:
    stmt = select(Team).order_by(Team.name.asc())
    return list(db.execute(stmt).scalars().all())


def get_team_by_id(db: Session, team_id: int) -> Team | None:
    return db.get(Team, team_id)


def get_team_by_name_or_code(
    db: Session,
    name: str,
    code: str,
) -> Team | None:
    stmt = select(Team).where(
        or_(
            Team.name.ilike(name.strip()),
            Team.code.ilike(code.strip()),
        )
    )

    return db.execute(stmt).scalar_one_or_none()


def create_team(db: Session, data: TeamCreate) -> Team:
    name = data.name.strip()
    code = data.code.strip().upper()

    existing = get_team_by_name_or_code(db, name, code)

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un equipo con ese nombre o código",
        )

    team = Team(
        name=name,
        code=code,
        flag_url=data.flag_url.strip() if data.flag_url else None,
    )

    db.add(team)
    db.commit()
    db.refresh(team)

    return team


def get_team_detail(db: Session, team_id: int) -> TeamDetail | None:
    team = db.get(Team, team_id)
    if not team:
        return None

    stmt = (
        select(
            Player.id,
            Player.name,
            Player.age,
            Player.nationality,
            Player.photo_url,
            TeamSquad.jersey_number.label("number"),
            TeamSquad.position,
        )
        .join(TeamSquad, TeamSquad.player_id == Player.id)
        .where(TeamSquad.team_id == team_id)
        .order_by(TeamSquad.jersey_number.asc())
    )

    rows = db.execute(stmt).mappings().all()
    players = [PlayerInSquad(**row) for row in rows]

    return TeamDetail(
        id=team.id,
        name=team.name,
        code=team.code,
        flag_url=team.flag_url,
        coach_name=team.coach_name,
        coach_nationality=team.coach_nationality,
        country=team.country,
        founded=team.founded,
        first_wc_year=team.first_wc_year,
        wc_participations=team.wc_participations,
        wc_played=team.wc_played,
        wc_wins=team.wc_wins,
        wc_draws=team.wc_draws,
        wc_losses=team.wc_losses,
        wc_goals_scored=team.wc_goals_scored,
        wc_goals_conceded=team.wc_goals_conceded,
        players=players,
    )


def update_team(
    db: Session,
    team: Team,
    data: TeamUpdate,
) -> Team:
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] is not None:
        new_name = update_data["name"].strip()

        existing = db.execute(
            select(Team).where(
                Team.id != team.id,
                Team.name.ilike(new_name),
            )
        ).scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un equipo con ese nombre",
            )

        team.name = new_name

    if "code" in update_data and update_data["code"] is not None:
        new_code = update_data["code"].strip().upper()

        existing = db.execute(
            select(Team).where(
                Team.id != team.id,
                Team.code.ilike(new_code),
            )
        ).scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un equipo con ese código",
            )

        team.code = new_code

    simple_fields = [
        "flag_url", "country", "founded",
        "coach_name", "coach_nationality", "coach_photo",
        "venue_name", "venue_city", "venue_capacity", "venue_photo",
        "first_wc_year", "wc_participations", "wc_played",
        "wc_wins", "wc_draws", "wc_losses",
        "wc_goals_scored", "wc_goals_conceded",
    ]
    for field in simple_fields:
        if field in update_data:
            setattr(team, field, update_data[field])

    db.add(team)
    db.commit()
    db.refresh(team)

    return team