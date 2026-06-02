from app.core.db import SessionLocal
from app.models.tournament import Tournament
from app.schemas.team import TeamCreate
from app.schemas.tournament import TournamentCreate
from app.services.team_service import create_team, get_team_by_name_or_code
from app.services.tournament_service import create_tournament, list_tournaments


TEAMS = [
    ("Argentina", "ARG"),
    ("Brasil", "BRA"),
    ("Uruguay", "URU"),
    ("Francia", "FRA"),
    ("Alemania", "GER"),
    ("España", "ESP"),
    ("Italia", "ITA"),
    ("Inglaterra", "ENG"),
    ("Portugal", "POR"),
    ("Países Bajos", "NED"),
    ("Bélgica", "BEL"),
    ("Croacia", "CRO"),
    ("México", "MEX"),
    ("Estados Unidos", "USA"),
    ("Canadá", "CAN"),
    ("Japón", "JPN"),
]


def ensure_tournament(db):
    existing = [
        tournament
        for tournament in list_tournaments(db)
        if tournament.name == "Mundial 2026" and tournament.year == 2026
    ]

    if existing:
        print("Torneo Mundial 2026 ya existe.")
        return existing[0]

    tournament = create_tournament(
        db,
        TournamentCreate(
            name="Mundial 2026",
            year=2026,
            description="Torneo base para el Prode Mundial 2026.",
            is_active=True,
        ),
    )

    print(f"Torneo creado: {tournament.name}")
    return tournament


def ensure_teams(db):
    for name, code in TEAMS:
        existing = get_team_by_name_or_code(db, name, code)

        if existing:
            print(f"Equipo existente: {name}")
            continue

        team = create_team(
            db,
            TeamCreate(
                name=name,
                code=code,
                flag_url=None,
            ),
        )

        print(f"Equipo creado: {team.name}")


def main():
    db = SessionLocal()

    try:
        ensure_tournament(db)
        ensure_teams(db)
        print("Seed base completado.")
    finally:
        db.close()


if __name__ == "__main__":
    main()