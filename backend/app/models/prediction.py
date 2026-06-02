from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    match_id: Mapped[int] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    group_id: Mapped[int] = mapped_column(
        ForeignKey("prode_groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    home_score_predicted: Mapped[int] = mapped_column(Integer, nullable=False)
    away_score_predicted: Mapped[int] = mapped_column(Integer, nullable=False)

    points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

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

    match = relationship("Match")
    user = relationship("User")
    group = relationship("ProdeGroup")

    __table_args__ = (
        UniqueConstraint(
            "match_id",
            "user_id",
            "group_id",
            name="uq_prediction_match_user_group",
        ),
    )