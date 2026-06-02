from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUser, DbSession
from app.core.security import create_access_token
from app.models.user import UserRole
from app.schemas.auth import LoginRequest, RegisterResponse, TokenResponse, VerifyEmailRequest
from app.schemas.user import UserCreate, UserRead
from app.services.email_service import EmailDeliveryError, EmailNotConfiguredError
from app.services.email_verification_service import (
    InvalidVerificationToken,
    PendingRegistrationConflict,
    create_pending_registration,
    verify_pending_registration,
)
from app.services.user_service import (
    authenticate_user,
    get_user_by_email,
    get_user_by_username,
)


router = APIRouter(prefix="/auth", tags=["auth"])


def _build_token_response(user) -> TokenResponse:
    token = create_access_token(
        subject=user.id,
        extra_claims={
            "role": user.role.value,
        },
    )

    return TokenResponse(
        access_token=token,
        user=UserRead.model_validate(user),
    )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_202_ACCEPTED)
def register(data: UserCreate, db: DbSession):
    if not data.accept_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debés aceptar los Términos y Condiciones para crear una cuenta",
        )

    existing_email = get_user_by_email(db, data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado",
        )

    existing_username = get_user_by_username(db, data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El usuario ya está registrado",
        )

    try:
        email_result = create_pending_registration(db, data)
    except EmailNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except EmailDeliveryError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    if email_result.sent:
        message = "Te enviamos un correo de verificación. Revisá tu bandeja de entrada para terminar el registro."
    else:
        message = "SMTP no está configurado en desarrollo. Revisá la consola del backend para abrir el enlace de verificación."

    return RegisterResponse(
        message=message,
        email=data.email.lower().strip(),
        email_delivery_mode=email_result.mode,
        dev_verification_url=email_result.dev_verification_url,
    )


@router.post("/verify-email", response_model=TokenResponse)
def verify_email_post(data: VerifyEmailRequest, db: DbSession):
    return _verify_email(data.token, db)


@router.get("/verify-email", response_model=TokenResponse)
def verify_email_get(db: DbSession, token: str = Query(min_length=20, max_length=255)):
    return _verify_email(token, db)


def _verify_email(token: str, db: DbSession):
    try:
        user = verify_pending_registration(db, token)
    except InvalidVerificationToken as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except PendingRegistrationConflict as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return _build_token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: DbSession):
    user = authenticate_user(db, data.username_or_email, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )

    return _build_token_response(user)


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser):
    return current_user
