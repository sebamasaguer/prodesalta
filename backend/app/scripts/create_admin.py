from getpass import getpass

from app.core.db import SessionLocal
from app.models.user import UserRole
from app.schemas.user import UserCreate
from app.services.user_service import (
    create_user,
    get_user_by_email,
    get_user_by_username,
)


def main():
    print("Crear usuario administrador")

    email = input("Email: ").strip().lower()
    username = input("Usuario: ").strip().lower()
    first_name = input("Nombre: ").strip()
    last_name = input("Apellido: ").strip()
    password = getpass("Contraseña: ").strip()

    db = SessionLocal()

    try:
        if get_user_by_email(db, email):
            print("Ya existe un usuario con ese email.")
            return

        if get_user_by_username(db, username):
            print("Ya existe un usuario con ese nombre de usuario.")
            return

        user_data = UserCreate(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
        )

        user = create_user(db, user_data, role=UserRole.ADMIN)

        print(f"Administrador creado correctamente. ID: {user.id}")

    finally:
        db.close()


if __name__ == "__main__":
    main()