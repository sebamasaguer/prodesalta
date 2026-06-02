from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.user import UserRead


class ProdeGroupCreate(BaseModel):
    name: str = Field(min_length=3, max_length=160)
    description: str | None = Field(default=None, max_length=2000)


class ProdeGroupUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    is_active: bool | None = None


class JoinGroupRequest(BaseModel):
    invite_code: str = Field(min_length=4, max_length=20)


class ProdeGroupRead(BaseModel):
    id: int
    name: str
    description: str | None
    invite_code: str
    owner_user_id: int
    is_active: bool
    is_personal: bool = False
    created_at: datetime
    members_count: int = 0
    my_role: str | None = None

    model_config = {
        "from_attributes": True,
    }


class GroupMemberRead(BaseModel):
    id: int
    group_id: int
    user_id: int
    role_in_group: str
    joined_at: datetime
    user: UserRead

    model_config = {
        "from_attributes": True,
    }


class ProdeGroupDetail(ProdeGroupRead):
    members: list[GroupMemberRead] = []