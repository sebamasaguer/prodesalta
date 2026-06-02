from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import DbSession, require_admin
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.services.user_service import get_user_by_id, list_users, update_user


router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def get_users(
    db: DbSession,
    _: User = Depends(require_admin),
    skip: int = 0,
    limit: int = 100,
):
    return list_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: DbSession,
    _: User = Depends(require_admin),
):
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return user


@router.patch("/{user_id}", response_model=UserRead)
def patch_user(
    user_id: int,
    data: UserUpdate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return update_user(db, user, data)