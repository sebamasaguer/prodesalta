from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate

from app.core.legal import TERMS_VERSION


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email.lower().strip())
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_username(db: Session, username: str) -> User | None:
    stmt = select(User).where(User.username == username.lower().strip())
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_username_or_email(db: Session, value: str) -> User | None:
    clean_value = value.lower().strip()

    stmt = select(User).where(
        or_(
            User.email == clean_value,
            User.username == clean_value,
        )
    )

    return db.execute(stmt).scalar_one_or_none()


def create_user(db: Session, data: UserCreate, role: UserRole = UserRole.PLAYER) -> User:
    user = User(
        email=data.email.lower().strip(),
        username=data.username.lower().strip(),
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        password_hash=get_password_hash(data.password),
        role=role,
        is_active=True,
        terms_accepted_at=datetime.now(timezone.utc) if data.accept_terms else None,
        terms_version=TERMS_VERSION if data.accept_terms else None,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db: Session, username_or_email: str, password: str) -> User | None:
    user = get_user_by_username_or_email(db, username_or_email)

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def _users_filtered_stmt(
    *,
    q: str | None = None,
    role: UserRole | None = None,
    is_active: bool | None = None,
    email_verified: bool | None = None,
):
    stmt = select(User)

    if q:
        clean_q = f"%{q.lower().strip()}%"
        stmt = stmt.where(
            or_(
                func.lower(User.email).like(clean_q),
                func.lower(User.username).like(clean_q),
                func.lower(User.first_name).like(clean_q),
                func.lower(User.last_name).like(clean_q),
            )
        )

    if role is not None:
        stmt = stmt.where(User.role == role)

    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)

    if email_verified is True:
        stmt = stmt.where(User.email_verified_at.is_not(None))
    elif email_verified is False:
        stmt = stmt.where(User.email_verified_at.is_(None))

    return stmt


def list_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    q: str | None = None,
    role: UserRole | None = None,
    is_active: bool | None = None,
    email_verified: bool | None = None,
) -> list[User]:
    stmt = (
        _users_filtered_stmt(
            q=q,
            role=role,
            is_active=is_active,
            email_verified=email_verified,
        )
        .order_by(User.created_at.desc(), User.id.desc())
        .offset(skip)
        .limit(min(limit, 200))
    )
    return list(db.execute(stmt).scalars().all())


def count_users(
    db: Session,
    q: str | None = None,
    role: UserRole | None = None,
    is_active: bool | None = None,
    email_verified: bool | None = None,
) -> int:
    subquery = _users_filtered_stmt(
        q=q,
        role=role,
        is_active=is_active,
        email_verified=email_verified,
    ).subquery()
    return int(db.execute(select(func.count()).select_from(subquery)).scalar_one())


def count_users_by_role(db: Session, role: UserRole) -> int:
    return int(db.execute(select(func.count(User.id)).where(User.role == role)).scalar_one())


def get_user_admin_stats(db: Session) -> dict[str, int]:
    total_users = int(db.execute(select(func.count(User.id))).scalar_one())
    active_users = int(db.execute(select(func.count(User.id)).where(User.is_active.is_(True))).scalar_one())
    verified_users = int(db.execute(select(func.count(User.id)).where(User.email_verified_at.is_not(None))).scalar_one())

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "verified_users": verified_users,
        "unverified_users": total_users - verified_users,
        "admin_users": count_users_by_role(db, UserRole.ADMIN),
        "organizer_users": count_users_by_role(db, UserRole.ORGANIZER),
        "player_users": count_users_by_role(db, UserRole.PLAYER),
    }


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    update_data = data.model_dump(exclude_unset=True)
    email_verified = update_data.pop("email_verified", None)

    for field, value in update_data.items():
        setattr(user, field, value)

    if email_verified is not None:
        user.email_verified_at = datetime.now(timezone.utc) if email_verified else None

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
