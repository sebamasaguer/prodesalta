from dataclasses import dataclass

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus
from app.models.prediction import Prediction
from app.models.scoring_rule import ScoringRule
from app.models.tournament import Tournament
from app.schemas.scoring_rule import ScoringRuleCreate, ScoringRuleUpdate


@dataclass
class ScoreBreakdown:
    points: int
    reason: str


def list_scoring_rules(db: Session) -> list[ScoringRule]:
    stmt = select(ScoringRule).order_by(
        ScoringRule.is_default.desc(),
        ScoringRule.created_at.desc(),
    )
    return list(db.execute(stmt).scalars().all())


def get_scoring_rule_by_id(db: Session, rule_id: int) -> ScoringRule | None:
    return db.get(ScoringRule, rule_id)


def get_active_rule_for_tournament(
    db: Session,
    tournament_id: int | None,
) -> ScoringRule:
    if tournament_id is not None:
        stmt = (
            select(ScoringRule)
            .where(ScoringRule.tournament_id == tournament_id)
            .where(ScoringRule.is_active.is_(True))
            .order_by(ScoringRule.is_default.desc(), ScoringRule.created_at.desc())
        )

        rule = db.execute(stmt).scalars().first()

        if rule:
            return rule

    stmt = (
        select(ScoringRule)
        .where(ScoringRule.tournament_id.is_(None))
        .where(ScoringRule.is_active.is_(True))
        .order_by(ScoringRule.is_default.desc(), ScoringRule.created_at.desc())
    )

    rule = db.execute(stmt).scalars().first()

    if rule:
        return rule

    return create_default_scoring_rule(db)


def create_default_scoring_rule(db: Session) -> ScoringRule:
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

    return rule


def create_scoring_rule(db: Session, data: ScoringRuleCreate) -> ScoringRule:
    if data.tournament_id is not None:
        tournament = db.get(Tournament, data.tournament_id)

        if not tournament:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Torneo no encontrado",
            )

    if data.is_default:
        unset_default_rules(db, data.tournament_id)

    rule = ScoringRule(
        tournament_id=data.tournament_id,
        name=data.name.strip(),
        exact_score_points=data.exact_score_points,
        winner_points=data.winner_points,
        goal_difference_points=data.goal_difference_points,
        participation_points=data.participation_points,
        is_default=data.is_default,
        is_active=data.is_active,
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule


def update_scoring_rule(
    db: Session,
    rule: ScoringRule,
    data: ScoringRuleUpdate,
) -> ScoringRule:
    update_data = data.model_dump(exclude_unset=True)

    if update_data.get("is_default") is True:
        unset_default_rules(db, rule.tournament_id)

    if "name" in update_data and update_data["name"]:
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(rule, field, value)

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule


def unset_default_rules(db: Session, tournament_id: int | None) -> None:
    stmt = select(ScoringRule).where(ScoringRule.tournament_id == tournament_id)
    rules = list(db.execute(stmt).scalars().all())

    for rule in rules:
        rule.is_default = False
        db.add(rule)

    db.flush()


def match_outcome(home_score: int, away_score: int) -> int:
    if home_score > away_score:
        return 1

    if home_score < away_score:
        return -1

    return 0


def calculate_prediction_points(
    official_home: int,
    official_away: int,
    predicted_home: int,
    predicted_away: int,
    rule: ScoringRule,
) -> ScoreBreakdown:
    if official_home == predicted_home and official_away == predicted_away:
        return ScoreBreakdown(
            points=rule.exact_score_points,
            reason="Resultado exacto",
        )

    official_outcome = match_outcome(official_home, official_away)
    predicted_outcome = match_outcome(predicted_home, predicted_away)

    if official_outcome == predicted_outcome:
        return ScoreBreakdown(
            points=rule.winner_points,
            reason="Ganador o empate acertado",
        )

    official_difference = official_home - official_away
    predicted_difference = predicted_home - predicted_away

    if official_difference == predicted_difference:
        return ScoreBreakdown(
            points=rule.goal_difference_points,
            reason="Diferencia de gol acertada",
        )

    return ScoreBreakdown(
        points=rule.participation_points,
        reason="Participación",
    )


def get_predictions_for_match(db: Session, match_id: int) -> list[Prediction]:
    stmt = (
        select(Prediction)
        .where(Prediction.match_id == match_id)
        .order_by(Prediction.created_at.asc())
    )

    return list(db.execute(stmt).scalars().all())


def calculate_points_for_match(
    db: Session,
    match: Match,
) -> dict[str, int]:
    if match.home_score is None or match.away_score is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El partido no tiene resultado oficial cargado",
        )

    rule = get_active_rule_for_tournament(db, match.tournament_id)
    predictions = get_predictions_for_match(db, match.id)

    processed = 0
    locked = 0

    for prediction in predictions:
        breakdown = calculate_prediction_points(
            official_home=match.home_score,
            official_away=match.away_score,
            predicted_home=prediction.home_score_predicted,
            predicted_away=prediction.away_score_predicted,
            rule=rule,
        )

        prediction.points = breakdown.points
        prediction.is_locked = True

        db.add(prediction)

        processed += 1
        locked += 1

    db.commit()

    return {
        "predictions_processed": processed,
        "predictions_locked": locked,
    }


def finish_match_and_calculate_points(
    db: Session,
    match: Match,
    home_score: int,
    away_score: int,
) -> dict[str, int]:
    match.home_score = home_score
    match.away_score = away_score
    match.status = MatchStatus.FINISHED

    db.add(match)
    db.commit()
    db.refresh(match)

    return calculate_points_for_match(db, match)