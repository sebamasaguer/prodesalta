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
    # Columnas nuevas en teams
    op.add_column("teams", sa.Column("api_football_id", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("country", sa.String(120), nullable=True))
    op.add_column("teams", sa.Column("founded", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("coach_name", sa.String(160), nullable=True))
    op.add_column("teams", sa.Column("coach_nationality", sa.String(100), nullable=True))
    op.add_column("teams", sa.Column("coach_photo", sa.String(500), nullable=True))
    op.add_column("teams", sa.Column("venue_name", sa.String(200), nullable=True))
    op.add_column("teams", sa.Column("venue_city", sa.String(120), nullable=True))
    op.add_column("teams", sa.Column("venue_capacity", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("venue_photo", sa.String(500), nullable=True))
    op.create_index("ix_teams_api_football_id", "teams", ["api_football_id"])

    # Tabla players
    op.create_table(
        "players",
        sa.Column("id", sa.Integer(), primary_key=True, index=True, nullable=False),
        sa.Column("api_football_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("firstname", sa.String(100), nullable=True),
        sa.Column("lastname", sa.String(100), nullable=True),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("birth_place", sa.String(120), nullable=True),
        sa.Column("birth_country", sa.String(100), nullable=True),
        sa.Column("nationality", sa.String(100), nullable=True),
        sa.Column("height", sa.String(20), nullable=True),
        sa.Column("weight", sa.String(20), nullable=True),
        sa.Column("photo_url", sa.String(500), nullable=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_players_id", "players", ["id"])
    op.create_index("ix_players_api_football_id", "players", ["api_football_id"])

    # Tabla team_squads
    op.create_table(
        "team_squads",
        sa.Column("id", sa.Integer(), primary_key=True, index=True, nullable=False),
        sa.Column("team_id", sa.Integer(), sa.ForeignKey("teams.id", ondelete="CASCADE"), nullable=False),
        sa.Column("player_id", sa.Integer(), sa.ForeignKey("players.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position", sa.String(60), nullable=True),
        sa.Column("jersey_number", sa.Integer(), nullable=True),
        sa.Column("season", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_team_squads_id", "team_squads", ["id"])
    op.create_index("ix_team_squads_team_id", "team_squads", ["team_id"])
    op.create_index("ix_team_squads_player_id", "team_squads", ["player_id"])
    op.create_index("ix_team_squads_season", "team_squads", ["season"])


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
