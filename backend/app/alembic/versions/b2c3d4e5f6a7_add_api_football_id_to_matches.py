"""add api_football_id to matches

Revision ID: b2c3d4e5f6a7
Revises: f3a1b2c4d5e6
Create Date: 2026-06-10 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "f3a1b2c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text(
        "ALTER TABLE matches ADD COLUMN IF NOT EXISTS api_football_id INTEGER"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_matches_api_football_id ON matches (api_football_id)"
    ))


def downgrade() -> None:
    op.drop_index("ix_matches_api_football_id", "matches")
    op.drop_column("matches", "api_football_id")
