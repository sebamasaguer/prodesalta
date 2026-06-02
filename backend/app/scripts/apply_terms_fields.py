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
        if not column_exists(connection, "users", "terms_accepted_at"):
            print("Agregando columna users.terms_accepted_at...")
            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE NULL
                    """
                )
            )
        else:
            print("La columna users.terms_accepted_at ya existe.")

        if not column_exists(connection, "users", "terms_version"):
            print("Agregando columna users.terms_version...")
            connection.execute(
                text(
                    """
                    ALTER TABLE users
                    ADD COLUMN terms_version VARCHAR(30) NULL
                    """
                )
            )
        else:
            print("La columna users.terms_version ya existe.")

    print("Campos legales aplicados correctamente.")


if __name__ == "__main__":
    main()