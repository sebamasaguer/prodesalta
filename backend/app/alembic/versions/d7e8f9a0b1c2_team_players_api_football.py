"""team wc stats

Revision ID: d7e8f9a0b1c2
Revises: 97a0cd219d4f
Create Date: 2026-06-09 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d7e8f9a0b1c2"
down_revision: Union[str, None] = "97a0cd219d4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("teams", sa.Column("first_wc_year", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("wc_participations", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("wc_played", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("wc_wins", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("wc_draws", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("wc_losses", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("wc_goals_scored", sa.Integer(), nullable=True))
    op.add_column("teams", sa.Column("wc_goals_conceded", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("teams", "wc_goals_conceded")
    op.drop_column("teams", "wc_goals_scored")
    op.drop_column("teams", "wc_losses")
    op.drop_column("teams", "wc_draws")
    op.drop_column("teams", "wc_wins")
    op.drop_column("teams", "wc_played")
    op.drop_column("teams", "wc_participations")
    op.drop_column("teams", "first_wc_year")
