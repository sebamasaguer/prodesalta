"""api football schema stub

Revision ID: 97a0cd219d4f
Revises: c81e7d4a20b5
Create Date: 2026-06-09 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "97a0cd219d4f"
down_revision: Union[str, None] = "c81e7d4a20b5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
