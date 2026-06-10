from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, index=True, nullable=False)
    flag_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    api_football_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    country: Mapped[str | None] = mapped_column(String(120), nullable=True)
    founded: Mapped[int | None] = mapped_column(Integer, nullable=True)

    coach_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    coach_nationality: Mapped[str | None] = mapped_column(String(100), nullable=True)
    coach_photo: Mapped[str | None] = mapped_column(String(500), nullable=True)

    venue_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    venue_city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    venue_capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    venue_photo: Mapped[str | None] = mapped_column(String(500), nullable=True)

    first_wc_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wc_participations: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wc_played: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wc_wins: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wc_draws: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wc_losses: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wc_goals_scored: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wc_goals_conceded: Mapped[int | None] = mapped_column(Integer, nullable=True)

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

    squads = relationship("TeamSquad", back_populates="team", cascade="all, delete-orphan")
