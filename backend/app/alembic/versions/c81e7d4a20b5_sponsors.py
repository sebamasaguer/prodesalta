"""sponsors

Revision ID: c81e7d4a20b5
Revises: a42c9e5d1f71
Create Date: 2026-06-03 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c81e7d4a20b5"
down_revision: Union[str, None] = "a42c9e5d1f71"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sponsors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("phone", sa.String(length=80), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sponsors_id"), "sponsors", ["id"], unique=False)
    op.create_index(op.f("ix_sponsors_name"), "sponsors", ["name"], unique=False)
    op.create_index("ix_sponsors_active_order", "sponsors", ["is_active", "display_order"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_sponsors_active_order", table_name="sponsors")
    op.drop_index(op.f("ix_sponsors_name"), table_name="sponsors")
    op.drop_index(op.f("ix_sponsors_id"), table_name="sponsors")
    op.drop_table("sponsors")
