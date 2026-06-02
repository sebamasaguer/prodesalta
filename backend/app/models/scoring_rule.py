from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class ScoringRule(Base):
    __tablename__ = "scoring_rules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    tournament_id: Mapped[int | None] = mapped_column(
        ForeignKey("tournaments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(160), nullable=False, default="Regla estándar")

    exact_score_points: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    winner_points: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    goal_difference_points: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    participation_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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

    tournament = relationship("Tournament")