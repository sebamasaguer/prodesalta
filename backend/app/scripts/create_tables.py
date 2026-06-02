from app.core.db import Base, engine
from app.models import (
    GroupMember,
    Match,
    Prediction,
    ProdeGroup,
    ScoringRule,
    Team,
    Tournament,
    User,
)  # noqa: F401


def main():
    print("Creando tablas...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas correctamente.")


if __name__ == "__main__":
    main()