from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.player import Player
from app.models.team_squad import TeamSquad
from app.schemas.player import PlayerCreate, PlayerUpdate


def list_team_players(db: Session, team_id: int) -> list[dict]:
    stmt = (
        select(
            Player.id,
            Player.name,
            Player.firstname,
            Player.lastname,
            Player.nationality,
            Player.age,
            Player.photo_url,
            TeamSquad.position,
            TeamSquad.jersey_number,
        )
        .join(TeamSquad, TeamSquad.player_id == Player.id)
        .where(TeamSquad.team_id == team_id)
        .order_by(TeamSquad.jersey_number.asc().nullslast(), Player.name.asc())
    )
    rows = db.execute(stmt).mappings().all()
    return [dict(row) for row in rows]


def create_player_in_team(db: Session, team_id: int, data: PlayerCreate) -> dict:
    player = Player(
        name=data.name,
        firstname=data.firstname,
        lastname=data.lastname,
        nationality=data.nationality,
        age=data.age,
        photo_url=data.photo_url,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(player)
    db.flush()

    squad = TeamSquad(
        team_id=team_id,
        player_id=player.id,
        position=data.position,
        jersey_number=data.jersey_number,
        season=2026,
        created_at=datetime.utcnow(),
    )
    db.add(squad)
    db.commit()
    db.refresh(player)

    return {
        "id": player.id,
        "name": player.name,
        "firstname": player.firstname,
        "lastname": player.lastname,
        "nationality": player.nationality,
        "age": player.age,
        "photo_url": player.photo_url,
        "position": squad.position,
        "jersey_number": squad.jersey_number,
    }


def update_player_in_team(
    db: Session, team_id: int, player_id: int, data: PlayerUpdate
) -> dict | None:
    player = db.get(Player, player_id)
    if not player:
        return None

    squad = db.execute(
        select(TeamSquad).where(
            TeamSquad.player_id == player_id,
            TeamSquad.team_id == team_id,
        )
    ).scalar_one_or_none()

    update_data = data.model_dump(exclude_unset=True)

    for field in ["name", "firstname", "lastname", "nationality", "age", "photo_url"]:
        if field in update_data:
            setattr(player, field, update_data[field])

    if squad:
        if "position" in update_data:
            squad.position = update_data["position"]
        if "jersey_number" in update_data:
            squad.jersey_number = update_data["jersey_number"]
        db.add(squad)

    db.add(player)
    db.commit()
    db.refresh(player)

    return {
        "id": player.id,
        "name": player.name,
        "firstname": player.firstname,
        "lastname": player.lastname,
        "nationality": player.nationality,
        "age": player.age,
        "photo_url": player.photo_url,
        "position": squad.position if squad else None,
        "jersey_number": squad.jersey_number if squad else None,
    }


def remove_player_from_team(db: Session, team_id: int, player_id: int) -> bool:
    squad = db.execute(
        select(TeamSquad).where(
            TeamSquad.player_id == player_id,
            TeamSquad.team_id == team_id,
        )
    ).scalar_one_or_none()

    if not squad:
        return False

    db.delete(squad)
    db.flush()

    remaining = db.execute(
        select(TeamSquad).where(TeamSquad.player_id == player_id)
    ).scalar_one_or_none()

    if not remaining:
        player = db.get(Player, player_id)
        if player:
            db.delete(player)

    db.commit()
    return True
