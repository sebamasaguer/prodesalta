from fastapi import APIRouter
from sqlalchemy import text

from app.core.deps import DbSession


router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check():
    return {
        "ok": True,
        "service": "Prode Mundial API",
    }


@router.get("/db")
def database_health_check(db: DbSession):
    db.execute(text("SELECT 1"))
    return {
        "ok": True,
        "database": "connected",
    }