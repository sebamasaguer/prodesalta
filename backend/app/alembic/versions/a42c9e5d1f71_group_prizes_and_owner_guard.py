"""group prizes and owner guard

Revision ID: a42c9e5d1f71
Revises: 9f1c2a8d7b34
Create Date: 2026-06-02 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a42c9e5d1f71"
down_revision: Union[str, None] = "9f1c2a8d7b34"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "group_prizes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("group_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("amount_label", sa.String(length=160), nullable=True),
        sa.Column("position_order", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["group_id"], ["prode_groups.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_group_prizes_id"), "group_prizes", ["id"], unique=False)
    op.create_index(op.f("ix_group_prizes_group_id"), "group_prizes", ["group_id"], unique=False)
    op.create_index(op.f("ix_group_prizes_created_by_user_id"), "group_prizes", ["created_by_user_id"], unique=False)

    op.create_index(
        "uq_group_members_single_owner_per_group",
        "group_members",
        ["group_id"],
        unique=True,
        postgresql_where=sa.text("role_in_group = 'OWNER'"),
    )


def downgrade() -> None:
    op.drop_index("uq_group_members_single_owner_per_group", table_name="group_members")
    op.drop_index(op.f("ix_group_prizes_created_by_user_id"), table_name="group_prizes")
    op.drop_index(op.f("ix_group_prizes_group_id"), table_name="group_prizes")
    op.drop_index(op.f("ix_group_prizes_id"), table_name="group_prizes")
    op.drop_table("group_prizes")
