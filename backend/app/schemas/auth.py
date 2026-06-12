from pydantic import BaseModel, EmailStr, Field

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


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    email_delivery_mode: str = "smtp"
    dev_reset_url: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20, max_length=255)
    new_password: str = Field(min_length=6, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)
