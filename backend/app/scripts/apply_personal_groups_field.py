from sqlalchemy import text

from app.core.db import engine


def column_exists(connection, table_name: str, column_name: str) -> bool:
    result = connection.execute(
        text(
            """
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_name = :table_name
              AND column_name = :column_name
            """
        ),
        {
            "table_name": table_name,
            "column_name": column_name,
        },
    )

    return int(result.scalar() or 0) > 0


def main():
    with engine.begin() as connection:
        if not column_exists(connection, "prode_groups", "is_personal"):
            print("Agregando columna prode_groups.is_personal...")
            connection.execute(
                text(
                    """
                    ALTER TABLE prode_groups
                    ADD COLUMN is_personal BOOLEAN NOT NULL DEFAULT FALSE
                    """
                )
            )
        else:
            print("La columna prode_groups.is_personal ya existe.")

    print("Campo de grupo personal aplicado correctamente.")


if __name__ == "__main__":
    main()