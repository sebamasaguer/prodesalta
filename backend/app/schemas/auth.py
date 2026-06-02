from pydantic import BaseModel, Field

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    username_or_email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class RegisterResponse(BaseModel):
    message: str
    email: str
    email_delivery_mode: str = "smtp"
    dev_verification_url: str | None = None


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=20, max_length=255)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
