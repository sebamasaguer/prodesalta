from __future__ import annotations

import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from email.utils import formataddr

from app.core.config import get_settings


settings = get_settings()


class EmailDeliveryError(Exception):
    """Se lanza cuando el correo no pudo enviarse por SMTP."""


class EmailNotConfiguredError(EmailDeliveryError):
    """Se lanza cuando SMTP no está configurado y el entorno exige envío real."""


@dataclass(frozen=True)
class EmailDeliveryResult:
    sent: bool
    mode: str
    dev_verification_url: str | None = None


def _is_production_env() -> bool:
    return settings.APP_ENV.lower().strip() in {"prod", "production", "server"}


def _smtp_is_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)


def send_verification_email(*, to_email: str, full_name: str, verification_url: str) -> EmailDeliveryResult:
    """
    Envía el correo de verificación.

    - En producción/servidor, si SMTP no está configurado, falla para no mostrar un falso
      mensaje de "correo enviado".
    - En desarrollo local, si SMTP no está configurado, imprime el link en consola para pruebas.
    """
    subject = "Verificá tu correo - Prode Mundial"
    body = f"""Hola {full_name},

Para terminar tu registro en Prode Mundial, verificá tu correo ingresando en este enlace:

{verification_url}

Si no solicitaste esta cuenta, podés ignorar este mensaje.

Prode Mundial
"""

    if not _smtp_is_configured():
        if _is_production_env():
            raise EmailNotConfiguredError(
                "SMTP no está configurado. No se puede enviar el correo de verificación."
            )

        print("=" * 100)
        print("EMAIL DE VERIFICACION - MODO DESARROLLO / SMTP NO CONFIGURADO")
        print(f"Para: {to_email}")
        print(f"URL: {verification_url}")
        print("Configurar SMTP_HOST/SMTP_USERNAME/SMTP_PASSWORD para envío real.")
        print("=" * 100)
        return EmailDeliveryResult(
            sent=False,
            mode="dev_console",
            dev_verification_url=verification_url,
        )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = _format_from_header()
    message["To"] = to_email
    message.set_content(body)

    try:
        if settings.SMTP_USE_SSL:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
                _login_if_needed(server)
                server.send_message(message)
            return EmailDeliveryResult(sent=True, mode="smtp_ssl")

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
            server.ehlo()
            if settings.SMTP_USE_TLS:
                server.starttls()
                server.ehlo()
            _login_if_needed(server)
            server.send_message(message)
            return EmailDeliveryResult(sent=True, mode="smtp_tls" if settings.SMTP_USE_TLS else "smtp")
    except smtplib.SMTPAuthenticationError as exc:
        raise EmailDeliveryError(
            "SMTP rechazó usuario o contraseña. Revisá SMTP_USERNAME y SMTP_PASSWORD."
        ) from exc
    except smtplib.SMTPException as exc:
        raise EmailDeliveryError(f"No se pudo enviar el correo por SMTP: {exc}") from exc
    except OSError as exc:
        raise EmailDeliveryError(
            f"No se pudo conectar al servidor SMTP {settings.SMTP_HOST}:{settings.SMTP_PORT}: {exc}"
        ) from exc


def _format_from_header() -> str:
    if settings.SMTP_FROM_NAME:
        return formataddr((settings.SMTP_FROM_NAME, settings.SMTP_FROM_EMAIL))
    return settings.SMTP_FROM_EMAIL


def _login_if_needed(server: smtplib.SMTP | smtplib.SMTP_SSL) -> None:
    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
