from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbSession
from app.models.prode_group import GroupMemberRole, ProdeGroup
from app.schemas.prode_group import (
    GroupMemberRead,
    JoinGroupRequest,
    ProdeGroupCreate,
    ProdeGroupDetail,
    ProdeGroupRead,
    ProdeGroupUpdate,
)
from app.services.group_service import (
    count_group_members,
    create_group,
    ensure_personal_group_for_user,
    get_group_by_id,
    get_group_member,
    join_group_by_code,
    leave_group,
    list_my_groups,
    remove_member_from_group,
    update_group,
)


router = APIRouter(prefix="/prode-groups", tags=["prode-groups"])


def serialize_group_for_user(
    db: DbSession,
    group: ProdeGroup,
    current_user: CurrentUser,
) -> ProdeGroupRead:
    member = get_group_member(db, group.id, current_user.id)

    return ProdeGroupRead(
        id=group.id,
        name=group.name,
        description=group.description,
        invite_code=group.invite_code,
        owner_user_id=group.owner_user_id,
        is_active=group.is_active,
        is_personal=group.is_personal,
        created_at=group.created_at,
        members_count=count_group_members(db, group.id),
        my_role=member.role_in_group if member else None,
    )


def require_group_access(
    db: DbSession,
    group_id: int,
    current_user: CurrentUser,
) -> ProdeGroup:
    group = get_group_by_id(db, group_id)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grupo no encontrado",
        )

    member = get_group_member(db, group.id, current_user.id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No pertenecés a este grupo",
        )

    return group


def require_group_owner(
    db: DbSession,
    group_id: int,
    current_user: CurrentUser,
) -> ProdeGroup:
    group = require_group_access(db, group_id, current_user)

    member = get_group_member(db, group.id, current_user.id)

    if not member or member.role_in_group != GroupMemberRole.OWNER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el dueño del grupo puede realizar esta acción",
        )

    return group


@router.get("", response_model=list[ProdeGroupRead])
def my_groups(
    db: DbSession,
    current_user: CurrentUser,
):
    groups = list_my_groups(db, current_user)

    return [
        serialize_group_for_user(db, group, current_user)
        for group in groups
    ]

@router.get("/personal/me", response_model=ProdeGroupRead)
def my_personal_group(
    db: DbSession,
    current_user: CurrentUser,
):
    group = ensure_personal_group_for_user(db, current_user)

    return serialize_group_for_user(db, group, current_user)


@router.post("", response_model=ProdeGroupRead, status_code=status.HTTP_201_CREATED)
def create_my_group(
    data: ProdeGroupCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    group = create_group(db, data, current_user)

    return serialize_group_for_user(db, group, current_user)


@router.post("/join", response_model=ProdeGroupRead)
def join_group(
    data: JoinGroupRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    group = join_group_by_code(db, data.invite_code, current_user)

    return serialize_group_for_user(db, group, current_user)


@router.get("/{group_id}", response_model=ProdeGroupDetail)
def group_detail(
    group_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    group = require_group_access(db, group_id, current_user)

    base = serialize_group_for_user(db, group, current_user)

    members = [
        GroupMemberRead.model_validate(member)
        for member in group.members
    ]

    return ProdeGroupDetail(
        **base.model_dump(),
        members=members,
    )


@router.patch("/{group_id}", response_model=ProdeGroupRead)
def update_my_group(
    group_id: int,
    data: ProdeGroupUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    group = require_group_owner(db, group_id, current_user)
    updated_group = update_group(db, group, data)

    return serialize_group_for_user(db, updated_group, current_user)


@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group_member(
    group_id: int,
    user_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    group = require_group_owner(db, group_id, current_user)

    remove_member_from_group(
        db=db,
        group=group,
        user_id=user_id,
        current_user=current_user,
    )

    return None


@router.post("/{group_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_my_group(
    group_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    group = require_group_access(db, group_id, current_user)

    leave_group(db, group, current_user)

    return None