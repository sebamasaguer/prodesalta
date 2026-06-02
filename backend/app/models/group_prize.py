from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class GroupPrize(Base):
    __tablename__ = "group_prizes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    group_id: Mapped[int] = mapped_column(
        ForeignKey("prode_groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    amount_label: Mapped[str | None] = mapped_column(String(160), nullable=True)
    position_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

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

    group = relationship("ProdeGroup", back_populates="prizes")
    created_by = relationship("User")
