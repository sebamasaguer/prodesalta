from __future__ import annotations

import sys

from app.services.email_service import EmailDeliveryError, send_verification_email


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: python -m app.scripts.test_smtp_email correo_destino@dominio.com")
        return 1

    to_email = sys.argv[1]

    try:
        result = send_verification_email(
            to_email=to_email,
            full_name="Prueba SMTP",
            verification_url="http://localhost:5173/verificar-correo?token=token-de-prueba-smtp",
        )
    except EmailDeliveryError as exc:
        print(f"ERROR SMTP: {exc}")
        return 2

    print(f"OK. Resultado: sent={result.sent}, mode={result.mode}")
    if result.dev_verification_url:
        print(f"Link desarrollo: {result.dev_verification_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
