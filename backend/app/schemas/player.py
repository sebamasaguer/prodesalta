from pydantic import BaseModel, Field


class PlayerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    firstname: str | None = Field(default=None, max_length=100)
    lastname: str | None = Field(default=None, max_length=100)
    nationality: str | None = Field(default=None, max_length=100)
    age: int | None = None
    photo_url: str | None = Field(default=None, max_length=500)
    position: str | None = Field(default=None, max_length=60)
    jersey_number: int | None = None


class PlayerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    firstname: str | None = Field(default=None, max_length=100)
    lastname: str | None = Field(default=None, max_length=100)
    nationality: str | None = Field(default=None, max_length=100)
    age: int | None = None
    photo_url: str | None = Field(default=None, max_length=500)
    position: str | None = Field(default=None, max_length=60)
    jersey_number: int | None = None


class PlayerRead(BaseModel):
    id: int
    name: str
    firstname: str | None = None
    lastname: str | None = None
    nationality: str | None = None
    age: int | None = None
    photo_url: str | None = None
    position: str | None = None
    jersey_number: int | None = None

    model_config = {
        "from_attributes": True,
    }
