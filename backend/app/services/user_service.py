from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate

from datetime import datetime, timezone
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


def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    stmt = select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)

    return user