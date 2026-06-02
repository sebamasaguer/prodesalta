from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import DbSession, require_admin
from app.models.user import User, UserRole
from app.schemas.user import UserAdminStats, UserRead, UserUpdate
from app.services.user_service import (
    count_users_by_role,
    get_user_admin_stats,
    get_user_by_id,
    list_users,
    update_user,
)


router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def get_users(
    db: DbSession,
    _: User = Depends(require_admin),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    q: str | None = Query(default=None, max_length=120),
    role: UserRole | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    email_verified: bool | None = Query(default=None),
):
    return list_users(
        db,
        skip=skip,
        limit=limit,
        q=q,
        role=role,
        is_active=is_active,
        email_verified=email_verified,
    )


@router.get("/stats", response_model=UserAdminStats)
def get_users_stats(
    db: DbSession,
    _: User = Depends(require_admin),
):
    return get_user_admin_stats(db)


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
    current_admin: User = Depends(require_admin),
):
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    if user.id == current_admin.id and data.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No podés desactivar tu propio usuario administrador",
        )

    if user.role == UserRole.ADMIN and data.role is not None and data.role != UserRole.ADMIN:
        if count_users_by_role(db, UserRole.ADMIN) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés quitar el rol al último administrador del sistema",
            )

    if user.role == UserRole.ADMIN and data.is_active is False:
        if count_users_by_role(db, UserRole.ADMIN) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés desactivar al último administrador del sistema",
            )

    return update_user(db, user, data)
