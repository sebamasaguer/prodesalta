from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, DbSession, require_admin
from app.models.user import User
from app.schemas.scoring_rule import (
    MatchScoreCalculationRead,
    ScoringRuleCreate,
    ScoringRuleRead,
    ScoringRuleUpdate,
)
from app.services.match_service import get_match_by_id
from app.services.scoring_service import (
    calculate_points_for_match,
    create_scoring_rule,
    get_active_rule_for_tournament,
    get_scoring_rule_by_id,
    list_scoring_rules,
    update_scoring_rule,
)


router = APIRouter(prefix="/scoring-rules", tags=["scoring-rules"])


@router.get("", response_model=list[ScoringRuleRead])
def get_scoring_rules(
    db: DbSession,
    current_user: CurrentUser,
):
    return list_scoring_rules(db)


@router.get("/active", response_model=ScoringRuleRead)
def get_active_scoring_rule(
    db: DbSession,
    current_user: CurrentUser,
    tournament_id: int | None = None,
):
    return get_active_rule_for_tournament(db, tournament_id)


@router.post("", response_model=ScoringRuleRead, status_code=status.HTTP_201_CREATED)
def create_new_scoring_rule(
    data: ScoringRuleCreate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    return create_scoring_rule(db, data)


@router.patch("/{rule_id}", response_model=ScoringRuleRead)
def patch_scoring_rule(
    rule_id: int,
    data: ScoringRuleUpdate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    rule = get_scoring_rule_by_id(db, rule_id)

    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Regla de puntaje no encontrada",
        )

    return update_scoring_rule(db, rule, data)


@router.post("/matches/{match_id}/calculate", response_model=MatchScoreCalculationRead)
def recalculate_match_points(
    match_id: int,
    db: DbSession,
    _: User = Depends(require_admin),
):
    match = get_match_by_id(db, match_id)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partido no encontrado",
        )

    result = calculate_points_for_match(db, match)

    return MatchScoreCalculationRead(
        match_id=match.id,
        predictions_processed=result["predictions_processed"],
        predictions_locked=result["predictions_locked"],
    )