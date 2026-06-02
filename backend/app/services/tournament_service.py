from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tournament import Tournament
from app.schemas.tournament import TournamentCreate, TournamentUpdate


def list_tournaments(db: Session) -> list[Tournament]:
    stmt = select(Tournament).order_by(Tournament.year.desc(), Tournament.name.asc())
    return list(db.execute(stmt).scalars().all())


def list_active_tournaments(db: Session) -> list[Tournament]:
    stmt = (
        select(Tournament)
        .where(Tournament.is_active.is_(True))
        .order_by(Tournament.year.desc(), Tournament.name.asc())
    )
    return list(db.execute(stmt).scalars().all())


def get_tournament_by_id(db: Session, tournament_id: int) -> Tournament | None:
    return db.get(Tournament, tournament_id)


def create_tournament(db: Session, data: TournamentCreate) -> Tournament:
    tournament = Tournament(
        name=data.name.strip(),
        year=data.year,
        description=data.description.strip() if data.description else None,
        is_active=data.is_active,
    )

    db.add(tournament)
    db.commit()
    db.refresh(tournament)

    return tournament


def update_tournament(
    db: Session,
    tournament: Tournament,
    data: TournamentUpdate,
) -> Tournament:
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"]:
        update_data["name"] = update_data["name"].strip()

    if "description" in update_data and update_data["description"]:
        update_data["description"] = update_data["description"].strip()

    for field, value in update_data.items():
        setattr(tournament, field, value)

    db.add(tournament)
    db.commit()
    db.refresh(tournament)

    return tournament