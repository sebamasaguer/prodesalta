from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=80)
    first_name: str = Field(min_length=2, max_length=120)
    last_name: str = Field(min_length=2, max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)
    accept_terms: bool = False


class UserUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=2, max_length=120)
    last_name: str | None = Field(default=None, min_length=2, max_length=120)
    is_active: bool | None = None
    role: UserRole | None = None


class UserRead(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    terms_accepted_at: datetime | None = None
    terms_version: str | None = None

    model_config = {
        "from_attributes": True,
    }