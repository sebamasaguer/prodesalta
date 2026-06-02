from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.team import Team
from app.schemas.team import TeamCreate, TeamUpdate


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

    if "flag_url" in update_data:
        team.flag_url = (
            update_data["flag_url"].strip()
            if update_data["flag_url"]
            else None
        )

    db.add(team)
    db.commit()
    db.refresh(team)

    return team