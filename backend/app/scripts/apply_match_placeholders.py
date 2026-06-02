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
        print("Permitiendo NULL en matches.home_team_id...")
        connection.execute(
            text(
                """
                ALTER TABLE matches
                ALTER COLUMN home_team_id DROP NOT NULL
                """
            )
        )

        print("Permitiendo NULL en matches.away_team_id...")
        connection.execute(
            text(
                """
                ALTER TABLE matches
                ALTER COLUMN away_team_id DROP NOT NULL
                """
            )
        )

        if not column_exists(connection, "matches", "home_placeholder"):
            print("Agregando matches.home_placeholder...")
            connection.execute(
                text(
                    """
                    ALTER TABLE matches
                    ADD COLUMN home_placeholder VARCHAR(160) NULL
                    """
                )
            )
        else:
            print("matches.home_placeholder ya existe.")

        if not column_exists(connection, "matches", "away_placeholder"):
            print("Agregando matches.away_placeholder...")
            connection.execute(
                text(
                    """
                    ALTER TABLE matches
                    ADD COLUMN away_placeholder VARCHAR(160) NULL
                    """
                )
            )
        else:
            print("matches.away_placeholder ya existe.")

    print("Campos de placeholders aplicados correctamente.")


if __name__ == "__main__":
    main()