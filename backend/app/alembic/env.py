from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import get_settings
from app.core.db import Base

# Importar módulos reales para registrar modelos en Base.metadata.
from app.models.user import User  # noqa: F401
from app.models.team import Team  # noqa: F401
from app.models.tournament import Tournament  # noqa: F401
from app.models.match import Match  # noqa: F401
from app.models.prediction import Prediction  # noqa: F401
from app.models.prode_group import ProdeGroup, GroupMember  # noqa: F401
from app.models.scoring_rule import ScoringRule  # noqa: F401


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


settings = get_settings()

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)

    if configuration is None:
        configuration = {}

    configuration["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()