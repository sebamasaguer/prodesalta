import random
import string

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.group_prize import GroupPrize
from app.models.prode_group import GroupMember, GroupMemberRole, ProdeGroup
from app.models.user import User
from app.schemas.prode_group import ProdeGroupCreate, ProdeGroupUpdate


def normalize_invite_code(code: str) -> str:
    return code.strip().upper()


def generate_invite_code(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choice(alphabet) for _ in range(length))


def generate_unique_invite_code(db: Session) -> str:
    for _ in range(20):
        code = generate_invite_code()
        existing = get_group_by_invite_code(db, code)
        if not existing:
            return code

    raise RuntimeError("No se pudo generar un código de invitación único")


def get_group_by_id(db: Session, group_id: int) -> ProdeGroup | None:
    stmt = (
        select(ProdeGroup)
        .options(
            selectinload(ProdeGroup.members).selectinload(GroupMember.user),
            selectinload(ProdeGroup.prizes),
        )
        .where(ProdeGroup.id == group_id)
    )

    return db.execute(stmt).scalar_one_or_none()


def get_group_by_invite_code(db: Session, invite_code: str) -> ProdeGroup | None:
    code = normalize_invite_code(invite_code)

    stmt = select(ProdeGroup).where(ProdeGroup.invite_code == code)

    return db.execute(stmt).scalar_one_or_none()


def get_group_member(
    db: Session,
    group_id: int,
    user_id: int,
) -> GroupMember | None:
    stmt = select(GroupMember).where(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id,
    )

    return db.execute(stmt).scalar_one_or_none()


def user_is_group_member(db: Session, group_id: int, user_id: int) -> bool:
    return get_group_member(db, group_id, user_id) is not None


def count_group_members(db: Session, group_id: int) -> int:
    stmt = select(func.count(GroupMember.id)).where(GroupMember.group_id == group_id)
    return int(db.execute(stmt).scalar_one())


def create_group(
    db: Session,
    data: ProdeGroupCreate,
    owner: User,
) -> ProdeGroup:
    invite_code = generate_unique_invite_code(db)

    group = ProdeGroup(
        name=data.name.strip(),
        description=data.description.strip() if data.description else None,
        invite_code=invite_code,
        owner_user_id=owner.id,
        is_active=True,
    )

    db.add(group)
    db.flush()

    member = GroupMember(
        group_id=group.id,
        user_id=owner.id,
        role_in_group=GroupMemberRole.OWNER.value,
    )

    db.add(member)
    db.commit()
    db.refresh(group)

    return group


def list_my_groups(db: Session, user: User) -> list[ProdeGroup]:
    stmt = (
        select(ProdeGroup)
        .join(GroupMember, GroupMember.group_id == ProdeGroup.id)
        .where(GroupMember.user_id == user.id)
        .order_by(ProdeGroup.created_at.desc())
    )

    return list(db.execute(stmt).scalars().all())


def join_group_by_code(
    db: Session,
    invite_code: str,
    user: User,
) -> ProdeGroup:
    group = get_group_by_invite_code(db, invite_code)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe un grupo con ese código",
        )

    if not group.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El grupo está inactivo",
        )

    existing_member = get_group_member(db, group.id, user.id)

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya pertenecés a este grupo",
        )

    member = GroupMember(
        group_id=group.id,
        user_id=user.id,
        role_in_group=GroupMemberRole.MEMBER.value,
    )

    db.add(member)
    db.commit()
    db.refresh(group)

    return group


def update_group(
    db: Session,
    group: ProdeGroup,
    data: ProdeGroupUpdate,
) -> ProdeGroup:
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"]:
        update_data["name"] = update_data["name"].strip()

    if "description" in update_data and update_data["description"]:
        update_data["description"] = update_data["description"].strip()

    for field, value in update_data.items():
        setattr(group, field, value)

    db.add(group)
    db.commit()
    db.refresh(group)

    return group


def remove_member_from_group(
    db: Session,
    group: ProdeGroup,
    user_id: int,
    current_user: User,
) -> None:
    current_member = get_group_member(db, group.id, current_user.id)

    if not current_member or current_member.role_in_group != GroupMemberRole.OWNER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el dueño del grupo puede quitar participantes",
        )

    if user_id == group.owner_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede quitar al dueño del grupo",
        )

    member = get_group_member(db, group.id, user_id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no pertenece al grupo",
        )

    db.delete(member)
    db.commit()


def leave_group(
    db: Session,
    group: ProdeGroup,
    user: User,
) -> None:
    if group.owner_user_id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El dueño no puede salir del grupo. Debe desactivar el grupo o transferirlo en una versión futura.",
        )

    member = get_group_member(db, group.id, user.id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pertenecés a este grupo",
        )

    db.delete(member)
    db.commit()

def get_personal_group_for_user(db: Session, user: User) -> ProdeGroup | None:
    stmt = select(ProdeGroup).where(
        ProdeGroup.owner_user_id == user.id,
        ProdeGroup.is_personal.is_(True),
    )

    return db.execute(stmt).scalar_one_or_none()


def ensure_personal_group_for_user(db: Session, user: User) -> ProdeGroup:
    existing = get_personal_group_for_user(db, user)

    if existing:
        return existing

    invite_code = generate_unique_invite_code(db)

    group = ProdeGroup(
        name=f"Individual - {user.username}",
        description="Grupo individual automático para cargar predicciones sin crear grupo.",
        invite_code=invite_code,
        owner_user_id=user.id,
        is_active=True,
        is_personal=True,
    )

    db.add(group)
    db.flush()

    member = GroupMember(
        group_id=group.id,
        user_id=user.id,
        role_in_group=GroupMemberRole.OWNER.value,
    )

    db.add(member)
    db.commit()
    db.refresh(group)

    return group

def get_group_prize_by_id(db: Session, prize_id: int) -> GroupPrize | None:
    return db.get(GroupPrize, prize_id)


def list_group_prizes(db: Session, group_id: int) -> list[GroupPrize]:
    stmt = (
        select(GroupPrize)
        .where(GroupPrize.group_id == group_id)
        .order_by(GroupPrize.position_order.asc(), GroupPrize.id.asc())
    )

    return list(db.execute(stmt).scalars().all())


def create_group_prize(
    db: Session,
    group: ProdeGroup,
    title: str,
    description: str | None,
    amount_label: str | None,
    position_order: int,
    current_user: User,
) -> GroupPrize:
    prize = GroupPrize(
        group_id=group.id,
        title=title.strip(),
        description=description.strip() if description else None,
        amount_label=amount_label.strip() if amount_label else None,
        position_order=position_order,
        created_by_user_id=current_user.id,
    )

    db.add(prize)
    db.commit()
    db.refresh(prize)

    return prize


def update_group_prize(
    db: Session,
    prize: GroupPrize,
    title: str | None = None,
    description: str | None = None,
    amount_label: str | None = None,
    position_order: int | None = None,
) -> GroupPrize:
    if title is not None:
        prize.title = title.strip()

    if description is not None:
        prize.description = description.strip() if description else None

    if amount_label is not None:
        prize.amount_label = amount_label.strip() if amount_label else None

    if position_order is not None:
        prize.position_order = position_order

    db.add(prize)
    db.commit()
    db.refresh(prize)

    return prize


def delete_group_prize(db: Session, prize: GroupPrize) -> None:
    db.delete(prize)
    db.commit()
