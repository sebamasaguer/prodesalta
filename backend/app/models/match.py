import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class MatchPhase(str, enum.Enum):
    GROUP_STAGE = "GROUP_STAGE"
    ROUND_OF_32 = "ROUND_OF_32"
    ROUND_OF_16 = "ROUND_OF_16"
    QUARTER_FINAL = "QUARTER_FINAL"
    SEMI_FINAL = "SEMI_FINAL"
    THIRD_PLACE = "THIRD_PLACE"
    FINAL = "FINAL"


class MatchStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    CLOSED = "CLOSED"
    LIVE = "LIVE"
    FINISHED = "FINISHED"
    CANCELLED = "CANCELLED"


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    api_football_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    tournament_id: Mapped[int] = mapped_column(
        ForeignKey("tournaments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    phase: Mapped[MatchPhase] = mapped_column(
        Enum(MatchPhase, name="match_phase"),
        nullable=False,
        index=True,
    )

    world_group: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)

    home_team_id: Mapped[int | None] = mapped_column(
        ForeignKey("teams.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    away_team_id: Mapped[int | None] = mapped_column(
        ForeignKey("teams.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    home_placeholder: Mapped[str | None] = mapped_column(String(160), nullable=True)
    away_placeholder: Mapped[str | None] = mapped_column(String(160), nullable=True)

    match_datetime: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    prediction_deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    status: Mapped[MatchStatus] = mapped_column(
        Enum(MatchStatus, name="match_status"),
        default=MatchStatus.SCHEDULED,
        nullable=False,
        index=True,
    )

    home_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    away_score: Mapped[int | None] = mapped_column(Integer, nullable=True)

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

    tournament = relationship("Tournament", back_populates="matches")
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])