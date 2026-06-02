from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Prode Mundial"
    APP_ENV: str = "dev"
    APP_DEBUG: bool = True

    DATABASE_URL: str

    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    FRONTEND_BASE_URL: str = "http://localhost:5173"
    EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str = "no-reply@prodemundial.local"
    SMTP_FROM_NAME: str = "Prode Mundial"
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()