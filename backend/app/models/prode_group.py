import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class GroupMemberRole(str, enum.Enum):
    OWNER = "OWNER"
    MEMBER = "MEMBER"


class ProdeGroup(Base):
    __tablename__ = "prode_groups"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    invite_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )

    owner_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_personal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    owner = relationship("User", foreign_keys=[owner_user_id])
    members = relationship(
        "GroupMember",
        back_populates="group",
        cascade="all, delete-orphan",
    )
    prizes = relationship(
        "GroupPrize",
        back_populates="group",
        cascade="all, delete-orphan",
        order_by="GroupPrize.position_order.asc(), GroupPrize.id.asc()",
    )


class GroupMember(Base):
    __tablename__ = "group_members"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    group_id: Mapped[int] = mapped_column(
        ForeignKey("prode_groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    role_in_group: Mapped[GroupMemberRole] = mapped_column(
        String(20),
        default=GroupMemberRole.MEMBER.value,
        nullable=False,
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    group = relationship("ProdeGroup", back_populates="members")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="uq_group_member_group_user"),
    )