"""create players, team_squads and add missing team columns

Revision ID: f3a1b2c4d5e6
Revises: d7e8f9a0b1c2
Create Date: 2026-06-10 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f3a1b2c4d5e6"
down_revision: Union[str, None] = "d7e8f9a0b1c2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Columnas nuevas en teams (IF NOT EXISTS para idempotencia)
    for col, typedef in [
        ("api_football_id", "INTEGER"),
        ("country", "VARCHAR(120)"),
        ("founded", "INTEGER"),
        ("coach_name", "VARCHAR(160)"),
        ("coach_nationality", "VARCHAR(100)"),
        ("coach_photo", "VARCHAR(500)"),
        ("venue_name", "VARCHAR(200)"),
        ("venue_city", "VARCHAR(120)"),
        ("venue_capacity", "INTEGER"),
        ("venue_photo", "VARCHAR(500)"),
    ]:
        conn.execute(sa.text(
            f"ALTER TABLE teams ADD COLUMN IF NOT EXISTS {col} {typedef}"
        ))

    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_teams_api_football_id ON teams (api_football_id)"
    ))

    # Tabla players
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS players (
            id SERIAL PRIMARY KEY,
            api_football_id INTEGER,
            name VARCHAR(200) NOT NULL,
            firstname VARCHAR(100),
            lastname VARCHAR(100),
            birth_date DATE,
            birth_place VARCHAR(120),
            birth_country VARCHAR(100),
            nationality VARCHAR(100),
            height VARCHAR(20),
            weight VARCHAR(20),
            photo_url VARCHAR(500),
            age INTEGER,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_players_id ON players (id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_players_api_football_id ON players (api_football_id)"))

    # Tabla team_squads
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS team_squads (
            id SERIAL PRIMARY KEY,
            team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
            player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
            position VARCHAR(60),
            jersey_number INTEGER,
            season INTEGER,
            created_at TIMESTAMPTZ NOT NULL
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_team_squads_id ON team_squads (id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_team_squads_team_id ON team_squads (team_id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_team_squads_player_id ON team_squads (player_id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_team_squads_season ON team_squads (season)"))


def downgrade() -> None:
    op.drop_table("team_squads")
    op.drop_table("players")
    op.drop_index("ix_teams_api_football_id", "teams")
    op.drop_column("teams", "venue_photo")
    op.drop_column("teams", "venue_capacity")
    op.drop_column("teams", "venue_city")
    op.drop_column("teams", "venue_name")
    op.drop_column("teams", "coach_photo")
    op.drop_column("teams", "coach_nationality")
    op.drop_column("teams", "coach_name")
    op.drop_column("teams", "founded")
    op.drop_column("teams", "country")
    op.drop_column("teams", "api_football_id")
