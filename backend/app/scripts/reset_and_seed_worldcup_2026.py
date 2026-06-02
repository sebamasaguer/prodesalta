from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from app.core.db import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models import (
    GroupMember,
    Match,
    MatchPhase,
    MatchStatus,
    Prediction,
    ProdeGroup,
    ScoringRule,
    Team,
    Tournament,
    User,
)
from app.models.user import UserRole


ET = ZoneInfo("America/New_York")


TEAMS = {
    "MEX": "México",
    "RSA": "Sudáfrica",
    "KOR": "República de Corea",
    "CZE": "Chequia",
    "CAN": "Canadá",
    "BIH": "Bosnia y Herzegovina",
    "QAT": "Catar",
    "SUI": "Suiza",
    "BRA": "Brasil",
    "MAR": "Marruecos",
    "HAI": "Haití",
    "SCO": "Escocia",
    "USA": "Estados Unidos",
    "PAR": "Paraguay",
    "AUS": "Australia",
    "TUR": "Turquía",
    "GER": "Alemania",
    "CUW": "Curazao",
    "CIV": "Costa de Marfil",
    "ECU": "Ecuador",
    "NED": "Países Bajos",
    "JPN": "Japón",
    "SWE": "Suecia",
    "TUN": "Túnez",
    "BEL": "Bélgica",
    "EGY": "Egipto",
    "IRN": "RI de Irán",
    "NZL": "Nueva Zelanda",
    "ESP": "España",
    "CPV": "Cabo Verde",
    "KSA": "Arabia Saudí",
    "URU": "Uruguay",
    "FRA": "Francia",
    "SEN": "Senegal",
    "IRQ": "Irak",
    "NOR": "Noruega",
    "ARG": "Argentina",
    "ALG": "Argelia",
    "AUT": "Austria",
    "JOR": "Jordania",
    "POR": "Portugal",
    "COD": "RD Congo",
    "UZB": "Uzbekistán",
    "COL": "Colombia",
    "ENG": "Inglaterra",
    "CRO": "Croacia",
    "GHA": "Ghana",
    "PAN": "Panamá",
}


GROUPS = {
    "A": ["MEX", "RSA", "KOR", "CZE"],
    "B": ["CAN", "BIH", "QAT", "SUI"],
    "C": ["BRA", "MAR", "HAI", "SCO"],
    "D": ["USA", "PAR", "AUS", "TUR"],
    "E": ["GER", "CUW", "CIV", "ECU"],
    "F": ["NED", "JPN", "SWE", "TUN"],
    "G": ["BEL", "EGY", "IRN", "NZL"],
    "H": ["ESP", "CPV", "KSA", "URU"],
    "I": ["FRA", "SEN", "IRQ", "NOR"],
    "J": ["ARG", "ALG", "AUT", "JOR"],
    "K": ["POR", "COD", "UZB", "COL"],
    "L": ["ENG", "CRO", "GHA", "PAN"],
}


# match_number, date, time_ET, phase, group, home_code, away_code
MATCHES = [
    # Fase de grupos
    (1, "2026-06-11", "15:00", "GROUP_STAGE", "A", "MEX", "RSA"),
    (2, "2026-06-11", "22:00", "GROUP_STAGE", "A", "KOR", "CZE"),
    (3, "2026-06-12", "15:00", "GROUP_STAGE", "B", "CAN", "BIH"),
    (4, "2026-06-12", "21:00", "GROUP_STAGE", "D", "USA", "PAR"),
    (5, "2026-06-13", "21:00", "GROUP_STAGE", "C", "HAI", "SCO"),
    (6, "2026-06-13", "00:00", "GROUP_STAGE", "D", "AUS", "TUR"),
    (7, "2026-06-13", "18:00", "GROUP_STAGE", "C", "BRA", "MAR"),
    (8, "2026-06-13", "15:00", "GROUP_STAGE", "B", "QAT", "SUI"),
    (9, "2026-06-14", "19:00", "GROUP_STAGE", "E", "CIV", "ECU"),
    (10, "2026-06-14", "13:00", "GROUP_STAGE", "E", "GER", "CUW"),
    (11, "2026-06-14", "16:00", "GROUP_STAGE", "F", "NED", "JPN"),
    (12, "2026-06-14", "22:00", "GROUP_STAGE", "F", "SWE", "TUN"),
    (13, "2026-06-15", "18:00", "GROUP_STAGE", "H", "KSA", "URU"),
    (14, "2026-06-15", "12:00", "GROUP_STAGE", "H", "ESP", "CPV"),
    (15, "2026-06-15", "21:00", "GROUP_STAGE", "G", "IRN", "NZL"),
    (16, "2026-06-15", "15:00", "GROUP_STAGE", "G", "BEL", "EGY"),
    (17, "2026-06-16", "15:00", "GROUP_STAGE", "I", "FRA", "SEN"),
    (18, "2026-06-16", "18:00", "GROUP_STAGE", "I", "IRQ", "NOR"),
    (19, "2026-06-16", "21:00", "GROUP_STAGE", "J", "ARG", "ALG"),
    (20, "2026-06-16", "00:00", "GROUP_STAGE", "J", "AUT", "JOR"),
    (21, "2026-06-17", "19:00", "GROUP_STAGE", "L", "GHA", "PAN"),
    (22, "2026-06-17", "16:00", "GROUP_STAGE", "L", "ENG", "CRO"),
    (23, "2026-06-17", "13:00", "GROUP_STAGE", "K", "POR", "COD"),
    (24, "2026-06-17", "22:00", "GROUP_STAGE", "K", "UZB", "COL"),
    (25, "2026-06-18", "12:00", "GROUP_STAGE", "A", "CZE", "RSA"),
    (26, "2026-06-18", "15:00", "GROUP_STAGE", "B", "SUI", "BIH"),
    (27, "2026-06-18", "18:00", "GROUP_STAGE", "B", "CAN", "QAT"),
    (28, "2026-06-18", "21:00", "GROUP_STAGE", "A", "MEX", "KOR"),
    (29, "2026-06-19", "21:00", "GROUP_STAGE", "C", "BRA", "HAI"),
    (30, "2026-06-19", "18:00", "GROUP_STAGE", "C", "SCO", "MAR"),
    (31, "2026-06-19", "23:00", "GROUP_STAGE", "D", "TUR", "PAR"),
    (32, "2026-06-19", "15:00", "GROUP_STAGE", "D", "USA", "AUS"),
    (33, "2026-06-20", "16:00", "GROUP_STAGE", "E", "GER", "CIV"),
    (34, "2026-06-20", "20:00", "GROUP_STAGE", "E", "ECU", "CUW"),
    (35, "2026-06-20", "13:00", "GROUP_STAGE", "F", "NED", "SWE"),
    (36, "2026-06-20", "00:00", "GROUP_STAGE", "F", "TUN", "JPN"),
    (37, "2026-06-21", "18:00", "GROUP_STAGE", "H", "URU", "CPV"),
    (38, "2026-06-21", "12:00", "GROUP_STAGE", "H", "ESP", "KSA"),
    (39, "2026-06-21", "15:00", "GROUP_STAGE", "G", "BEL", "IRN"),
    (40, "2026-06-21", "21:00", "GROUP_STAGE", "G", "NZL", "EGY"),
    (41, "2026-06-22", "20:00", "GROUP_STAGE", "I", "NOR", "SEN"),
    (42, "2026-06-22", "17:00", "GROUP_STAGE", "I", "FRA", "IRQ"),
    (43, "2026-06-22", "13:00", "GROUP_STAGE", "J", "ARG", "AUT"),
    (44, "2026-06-22", "23:00", "GROUP_STAGE", "J", "JOR", "ALG"),
    (45, "2026-06-23", "16:00", "GROUP_STAGE", "L", "ENG", "GHA"),
    (46, "2026-06-23", "19:00", "GROUP_STAGE", "L", "PAN", "CRO"),
    (47, "2026-06-23", "13:00", "GROUP_STAGE", "K", "POR", "UZB"),
    (48, "2026-06-23", "22:00", "GROUP_STAGE", "K", "COL", "COD"),
    (49, "2026-06-24", "18:00", "GROUP_STAGE", "C", "SCO", "BRA"),
    (50, "2026-06-24", "18:00", "GROUP_STAGE", "C", "MAR", "HAI"),
    (51, "2026-06-24", "15:00", "GROUP_STAGE", "B", "SUI", "CAN"),
    (52, "2026-06-24", "15:00", "GROUP_STAGE", "B", "BIH", "QAT"),
    (53, "2026-06-24", "21:00", "GROUP_STAGE", "A", "CZE", "MEX"),
    (54, "2026-06-24", "21:00", "GROUP_STAGE", "A", "RSA", "KOR"),
    (55, "2026-06-25", "16:00", "GROUP_STAGE", "E", "CUW", "CIV"),
    (56, "2026-06-25", "16:00", "GROUP_STAGE", "E", "ECU", "GER"),
    (57, "2026-06-25", "19:00", "GROUP_STAGE", "F", "JPN", "SWE"),
    (58, "2026-06-25", "19:00", "GROUP_STAGE", "F", "TUN", "NED"),
    (59, "2026-06-25", "22:00", "GROUP_STAGE", "D", "TUR", "USA"),
    (60, "2026-06-25", "22:00", "GROUP_STAGE", "D", "PAR", "AUS"),
    (61, "2026-06-26", "15:00", "GROUP_STAGE", "I", "NOR", "FRA"),
    (62, "2026-06-26", "15:00", "GROUP_STAGE", "I", "SEN", "IRQ"),
    (63, "2026-06-26", "23:00", "GROUP_STAGE", "G", "EGY", "IRN"),
    (64, "2026-06-26", "23:00", "GROUP_STAGE", "G", "NZL", "BEL"),
    (65, "2026-06-26", "20:00", "GROUP_STAGE", "H", "CPV", "KSA"),
    (66, "2026-06-26", "20:00", "GROUP_STAGE", "H", "URU", "ESP"),
    (67, "2026-06-27", "17:00", "GROUP_STAGE", "L", "PAN", "ENG"),
    (68, "2026-06-27", "17:00", "GROUP_STAGE", "L", "CRO", "GHA"),
    (69, "2026-06-27", "22:00", "GROUP_STAGE", "J", "ALG", "AUT"),
    (70, "2026-06-27", "22:00", "GROUP_STAGE", "J", "JOR", "ARG"),
    (71, "2026-06-27", "19:30", "GROUP_STAGE", "K", "COL", "POR"),
    (72, "2026-06-27", "19:30", "GROUP_STAGE", "K", "COD", "UZB"),

    # Dieciseisavos de final
    (73, "2026-06-28", "15:00", "ROUND_OF_32", None, "2A", "2B"),
    (74, "2026-06-29", "16:30", "ROUND_OF_32", None, "1E", "3ABCDF"),
    (75, "2026-06-29", "21:00", "ROUND_OF_32", None, "1F", "2C"),
    (76, "2026-06-29", "13:00", "ROUND_OF_32", None, "1C", "2F"),
    (77, "2026-06-30", "17:00", "ROUND_OF_32", None, "1I", "3CDFGH"),
    (78, "2026-06-30", "13:00", "ROUND_OF_32", None, "2E", "2I"),
    (79, "2026-06-30", "21:00", "ROUND_OF_32", None, "1A", "3CEFHI"),
    (80, "2026-07-01", "12:00", "ROUND_OF_32", None, "1L", "3EHIJK"),
    (81, "2026-07-01", "20:00", "ROUND_OF_32", None, "1D", "3BEFIJ"),
    (82, "2026-07-01", "16:00", "ROUND_OF_32", None, "1G", "3AEHIJ"),
    (83, "2026-07-02", "19:00", "ROUND_OF_32", None, "2K", "2L"),
    (84, "2026-07-02", "15:00", "ROUND_OF_32", None, "1H", "2J"),
    (85, "2026-07-02", "23:00", "ROUND_OF_32", None, "1B", "3EFGIJ"),
    (86, "2026-07-03", "18:00", "ROUND_OF_32", None, "1J", "2H"),
    (87, "2026-07-03", "21:30", "ROUND_OF_32", None, "1K", "3DEIJL"),
    (88, "2026-07-03", "14:00", "ROUND_OF_32", None, "2D", "2G"),

    # Octavos de final
    (89, "2026-07-04", "17:00", "ROUND_OF_16", None, "W74", "W77"),
    (90, "2026-07-04", "13:00", "ROUND_OF_16", None, "W73", "W75"),
    (91, "2026-07-05", "16:00", "ROUND_OF_16", None, "W76", "W78"),
    (92, "2026-07-05", "20:00", "ROUND_OF_16", None, "W79", "W80"),
    (93, "2026-07-06", "15:00", "ROUND_OF_16", None, "W83", "W84"),
    (94, "2026-07-06", "20:00", "ROUND_OF_16", None, "W81", "W82"),
    (95, "2026-07-07", "12:00", "ROUND_OF_16", None, "W86", "W88"),
    (96, "2026-07-07", "16:00", "ROUND_OF_16", None, "W85", "W87"),

    # Cuartos
    (97, "2026-07-09", "16:00", "QUARTER_FINAL", None, "W89", "W90"),
    (98, "2026-07-10", "15:00", "QUARTER_FINAL", None, "W93", "W94"),
    (99, "2026-07-11", "17:00", "QUARTER_FINAL", None, "W91", "W92"),
    (100, "2026-07-11", "21:00", "QUARTER_FINAL", None, "W95", "W96"),

    # Semifinales
    (101, "2026-07-14", "15:00", "SEMI_FINAL", None, "W97", "W98"),
    (102, "2026-07-15", "15:00", "SEMI_FINAL", None, "W99", "W100"),

    # Final de bronce y final
    (103, "2026-07-18", "17:00", "THIRD_PLACE", None, "L101", "L102"),
    (104, "2026-07-19", "15:00", "FINAL", None, "W101", "W102"),
]


def et_to_utc(date_str: str, time_str: str) -> datetime:
    local_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    local_dt = local_dt.replace(tzinfo=ET)
    return local_dt.astimezone(ZoneInfo("UTC"))


def placeholder_name(code: str) -> str:
    if code.startswith("W") and code[1:].isdigit():
        return f"Ganador partido {code[1:]}"

    if code.startswith("L") and code[1:].isdigit():
        return f"Perdedor partido {code[1:]}"

    if code.startswith("1") and len(code) == 2:
        return f"1° Grupo {code[1]}"

    if code.startswith("2") and len(code) == 2:
        return f"2° Grupo {code[1]}"

    if code.startswith("3"):
        groups = "/".join(list(code[1:]))
        return f"3° mejor de grupos {groups}"

    return code


def ensure_admin(db):
    admin = db.query(User).filter(User.username == "admin").first()

    if admin:
        admin.role = UserRole.ADMIN
        admin.is_active = True
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin

    admin = User(
        email="admin@prode.com",
        username="admin",
        first_name="Admin",
        last_name="Prode",
        password_hash=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin


def delete_all_except_admin(db, admin_id: int):
    print("Limpiando sistema...")

    db.query(Prediction).delete(synchronize_session=False)
    db.query(GroupMember).delete(synchronize_session=False)
    db.query(ProdeGroup).delete(synchronize_session=False)
    db.query(Match).delete(synchronize_session=False)
    db.query(ScoringRule).delete(synchronize_session=False)
    db.query(Team).delete(synchronize_session=False)
    db.query(Tournament).delete(synchronize_session=False)
    db.query(User).filter(User.id != admin_id).delete(synchronize_session=False)

    db.commit()

    print("Sistema limpio. Se conservó solo el usuario admin.")


def create_standard_rule(db):
    rule = ScoringRule(
        tournament_id=None,
        name="Regla estándar",
        exact_score_points=5,
        winner_points=3,
        goal_difference_points=2,
        participation_points=0,
        is_default=True,
        is_active=True,
    )

    db.add(rule)
    db.commit()

    print("Regla de puntaje estándar creada.")


def create_tournament(db):
    tournament = Tournament(
        name="Mundial 2026",
        year=2026,
        description=(
            "Copa Mundial de la FIFA 2026. Fixture cargado desde calendario oficial PDF. "
            "Horarios base en ET convertidos a UTC para almacenamiento."
        ),
        is_active=True,
    )

    db.add(tournament)
    db.commit()
    db.refresh(tournament)

    print(f"Torneo creado: {tournament.name}")

    return tournament


def get_or_create_team(db, code: str) -> Team:
    code = code.strip().upper()

    if code not in TEAMS:
        raise ValueError(f"No es un país válido para crear equipo: {code}")

    team = db.query(Team).filter(Team.code == code).first()

    if team:
        return team

    team = Team(
        name=TEAMS[code],
        code=code,
        flag_url=None,
    )

    db.add(team)
    db.commit()
    db.refresh(team)

    return team


def create_all_teams(db):
    for code in TEAMS:
        get_or_create_team(db, code)

    print(f"Selecciones creadas: {len(TEAMS)}")


def create_matches(db, tournament: Tournament):
    imported = 0

    for match_number, date_str, time_str, phase, group, home_code, away_code in MATCHES:
        match_dt = et_to_utc(date_str, time_str)
        prediction_deadline = match_dt - timedelta(hours=1)

        home_team_id = None
        away_team_id = None
        home_placeholder = None
        away_placeholder = None

        if home_code in TEAMS:
            home_team = get_or_create_team(db, home_code)
            home_team_id = home_team.id
        else:
            home_placeholder = placeholder_name(home_code)

        if away_code in TEAMS:
            away_team = get_or_create_team(db, away_code)
            away_team_id = away_team.id
        else:
            away_placeholder = placeholder_name(away_code)

        match = Match(
            tournament_id=tournament.id,
            phase=MatchPhase[phase],
            world_group=group,
            home_team_id=home_team_id,
            away_team_id=away_team_id,
            home_placeholder=home_placeholder,
            away_placeholder=away_placeholder,
            match_datetime=match_dt,
            prediction_deadline=prediction_deadline,
            status=MatchStatus.SCHEDULED,
            home_score=None,
            away_score=None,
        )

        db.add(match)
        imported += 1

    db.commit()

    print(f"Partidos creados: {imported}")


def main():
    print("Creando tablas si faltan...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        admin = ensure_admin(db)
        delete_all_except_admin(db, admin.id)

        admin = ensure_admin(db)

        create_standard_rule(db)
        tournament = create_tournament(db)
        create_all_teams(db)
        create_matches(db, tournament)

        print("")
        print("RESET Y CARGA COMPLETADOS")
        print("-------------------------")
        print("Usuario admin conservado/creado:")
        print("Usuario: admin")
        print("Email: admin@prode.com")
        print("Contraseña si fue creado nuevo: admin123")
        print("")
        print("Datos actuales:")
        print(f"Usuarios: {db.query(User).count()}")
        print(f"Torneos: {db.query(Tournament).count()}")
        print(f"Equipos: {db.query(Team).count()}")
        print(f"Partidos: {db.query(Match).count()}")
        print(f"Predicciones: {db.query(Prediction).count()}")
        print(f"Grupos: {db.query(ProdeGroup).count()}")

    finally:
        db.close()


if __name__ == "__main__":
    main()