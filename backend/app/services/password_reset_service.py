from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.services.email_service import EmailDeliveryResult, send_password_reset_email

settings = get_settings()


class InvalidPasswordResetToken(Exception):
    pass


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _build_reset_url(token: str) -> str:
    frontend_base = settings.FRONTEND_BASE_URL.rstrip("/")
    return f"{frontend_base}/restablecer-contrasena?token={token}"


def request_password_reset(db: Session, user: User) -> EmailDeliveryResult:
    db.execute(
        delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id)
    )
    db.flush()

    token = secrets.token_urlsafe(48)
    now = datetime.now(timezone.utc)
    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=_hash_token(token),
        expires_at=now + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES),
        consumed=False,
    )
    db.add(reset_token)
    db.commit()

    return send_password_reset_email(
        to_email=user.email,
        full_name=user.full_name,
        reset_url=_build_reset_url(token),
    )


def consume_password_reset_token(db: Session, token: str, new_password: str) -> User:
    token_hash = _hash_token(token)
    reset_token = db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.consumed.is_(False),
        )
    ).scalar_one_or_none()

    if not reset_token:
        raise InvalidPasswordResetToken("El enlace de recuperación no es válido")

    now = datetime.now(timezone.utc)
    expires_at = reset_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        db.delete(reset_token)
        db.commit()
        raise InvalidPasswordResetToken("El enlace de recuperación venció. Solicitá uno nuevo")

    user = db.get(User, reset_token.user_id)
    if not user or not user.is_active:
        db.delete(reset_token)
        db.commit()
        raise InvalidPasswordResetToken("La cuenta no existe o está desactivada")

    user.password_hash = get_password_hash(new_password)
    db.delete(reset_token)
    db.commit()
    db.refresh(user)

    return user
