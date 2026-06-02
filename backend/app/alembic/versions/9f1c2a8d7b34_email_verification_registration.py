"""email verification registration

Revision ID: 9f1c2a8d7b34
Revises: e982293fbdf0
Create Date: 2026-06-02 22:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f1c2a8d7b34"
down_revision: Union[str, None] = "e982293fbdf0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "pending_email_registrations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("first_name", sa.String(length=120), nullable=False),
        sa.Column("last_name", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("terms_accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("terms_version", sa.String(length=30), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("consumed", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_pending_email_registrations_id"),
        "pending_email_registrations",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_pending_email_registrations_email"),
        "pending_email_registrations",
        ["email"],
        unique=True,
    )
    op.create_index(
        op.f("ix_pending_email_registrations_username"),
        "pending_email_registrations",
        ["username"],
        unique=True,
    )
    op.create_index(
        op.f("ix_pending_email_registrations_token_hash"),
        "pending_email_registrations",
        ["token_hash"],
        unique=True,
    )

    op.create_table(
        "email_verification_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_email_verification_logs_id"),
        "email_verification_logs",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_email_verification_logs_email"),
        "email_verification_logs",
        ["email"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_email_verification_logs_email"), table_name="email_verification_logs")
    op.drop_index(op.f("ix_email_verification_logs_id"), table_name="email_verification_logs")
    op.drop_table("email_verification_logs")

    op.drop_index(op.f("ix_pending_email_registrations_token_hash"), table_name="pending_email_registrations")
    op.drop_index(op.f("ix_pending_email_registrations_username"), table_name="pending_email_registrations")
    op.drop_index(op.f("ix_pending_email_registrations_email"), table_name="pending_email_registrations")
    op.drop_index(op.f("ix_pending_email_registrations_id"), table_name="pending_email_registrations")
    op.drop_table("pending_email_registrations")

    op.drop_column("users", "email_verified_at")
