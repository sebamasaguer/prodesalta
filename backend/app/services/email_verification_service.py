from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.legal import TERMS_VERSION
from app.core.security import get_password_hash
from app.models.email_verification import EmailVerificationLog, PendingEmailRegistration
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.services.email_service import EmailDeliveryResult, send_verification_email

settings = get_settings()


class PendingRegistrationConflict(Exception):
    pass


class InvalidVerificationToken(Exception):
    pass


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def build_verification_url(token: str) -> str:
    frontend_base = settings.FRONTEND_BASE_URL.rstrip("/")
    return f"{frontend_base}/verificar-correo?token={token}"


def create_pending_registration(db: Session, data: UserCreate) -> EmailDeliveryResult:
    clean_email = data.email.lower().strip()
    clean_username = data.username.lower().strip()

    existing_pending = db.execute(
        select(PendingEmailRegistration).where(
            (PendingEmailRegistration.email == clean_email)
            | (PendingEmailRegistration.username == clean_username)
        )
    ).scalar_one_or_none()

    if existing_pending:
        db.delete(existing_pending)
        db.flush()

    token = secrets.token_urlsafe(48)
    now = datetime.now(timezone.utc)
    pending = PendingEmailRegistration(
        email=clean_email,
        username=clean_username,
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        password_hash=get_password_hash(data.password),
        token_hash=_hash_token(token),
        expires_at=now + timedelta(minutes=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES),
        terms_accepted_at=now if data.accept_terms else None,
        terms_version=TERMS_VERSION if data.accept_terms else None,
        consumed=False,
    )

    db.add(pending)
    db.commit()

    return send_verification_email(
        to_email=pending.email,
        full_name=f"{pending.first_name} {pending.last_name}".strip(),
        verification_url=build_verification_url(token),
    )


def verify_pending_registration(db: Session, token: str) -> User:
    token_hash = _hash_token(token)
    pending = db.execute(
        select(PendingEmailRegistration).where(
            PendingEmailRegistration.token_hash == token_hash,
            PendingEmailRegistration.consumed.is_(False),
        )
    ).scalar_one_or_none()

    now = datetime.now(timezone.utc)

    if not pending:
        raise InvalidVerificationToken("El enlace de verificación no es válido")

    expires_at = pending.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        db.delete(pending)
        db.commit()
        raise InvalidVerificationToken("El enlace de verificación venció. Registrate nuevamente")

    existing_user = db.execute(
        select(User).where((User.email == pending.email) | (User.username == pending.username))
    ).scalar_one_or_none()

    if existing_user:
        db.delete(pending)
        db.commit()
        raise PendingRegistrationConflict("El email o usuario ya fue registrado")

    user = User(
        email=pending.email,
        username=pending.username,
        first_name=pending.first_name,
        last_name=pending.last_name,
        password_hash=pending.password_hash,
        role=UserRole.PLAYER,
        is_active=True,
        email_verified_at=now,
        terms_accepted_at=pending.terms_accepted_at,
        terms_version=pending.terms_version,
    )

    db.add(user)
    db.flush()

    db.add(
        EmailVerificationLog(
            user_id=user.id,
            email=user.email,
            verified_at=now,
        )
    )

    pending.consumed = True
    pending.verified_at = now
    db.delete(pending)
    db.commit()
    db.refresh(user)

    return user


def purge_expired_pending_registrations(db: Session) -> int:
    result = db.execute(
        delete(PendingEmailRegistration).where(
            PendingEmailRegistration.expires_at < datetime.now(timezone.utc)
        )
    )
    db.commit()
    return result.rowcount or 0
