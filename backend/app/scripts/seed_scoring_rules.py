from sqlalchemy import select

from app.core.db import SessionLocal
from app.models.scoring_rule import ScoringRule


def main():
    db = SessionLocal()

    try:
        existing = db.execute(
            select(ScoringRule).where(
                ScoringRule.tournament_id.is_(None),
                ScoringRule.is_default.is_(True),
            )
        ).scalars().first()

        if existing:
            print("La regla estándar ya existe.")
            print(
                {
                    "exact_score_points": existing.exact_score_points,
                    "winner_points": existing.winner_points,
                    "goal_difference_points": existing.goal_difference_points,
                    "participation_points": existing.participation_points,
                }
            )
            return

        rule = ScoringRule(
            tournament_id=None,
            name="Regla estándar",
            exact_score_points=5,
            winner_points=3,
            goal_difference_points=2,
            participation_points=0,
            is_default=True,
            is_active=True,
        )

        db.add(rule)
        db.commit()
        db.refresh(rule)

        print("Regla estándar creada correctamente.")
        print(
            {
                "id": rule.id,
                "exact_score_points": rule.exact_score_points,
                "winner_points": rule.winner_points,
                "goal_difference_points": rule.goal_difference_points,
                "participation_points": rule.participation_points,
            }
        )

    finally:
        db.close()


if __name__ == "__main__":
    main()