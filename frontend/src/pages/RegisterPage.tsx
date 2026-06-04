import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { registerUser } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    accept_terms: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setDevVerificationUrl(null);

    if (!form.accept_terms) {
      setErrorMessage(
        "Debés aceptar los Términos y Condiciones para crear una cuenta",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerUser(form);
      setSuccessMessage(response.message);
      setSuccessEmail(response.email);
      setDevVerificationUrl(response.dev_verification_url || null);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo crear la cuenta",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mundial-dark px-4 py-6 text-white sm:py-10">
      <div className="w-full max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mx-auto mb-6 flex justify-center">
              <img
                src="/logosistema.jpeg"
                alt="Prode Mundial"
                className="h-auto w-40 object-contain sm:w-44"
              />
            </div>

            <h1 className="text-3xl font-black">Crear cuenta</h1>

            <p className="mt-2 text-sm text-slate-300">
              Registrate como jugador y empezá a participar en modo individual
              o en grupos.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 text-sm font-semibold text-red-100">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-4 text-sm font-semibold text-green-100">
              <p>{successMessage}</p>
              <p className="mt-2 text-slate-200">
                El usuario se va a crear recién cuando verifiques el correo
                {successEmail ? ` ${successEmail}` : ""}.
              </p>

              {devVerificationUrl && (
                <div className="mt-3 rounded-xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-yellow-100">
                  <p className="font-bold">Modo desarrollo: SMTP no configurado.</p>
                  <p className="mt-1 break-all text-xs">
                    Abrí este enlace para probar la verificación local: {" "}
                    <a
                      href={devVerificationUrl}
                      className="underline hover:text-white"
                    >
                      {devVerificationUrl}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Nombre
              </label>

              <input
                type="text"
                value={form.first_name}
                onChange={(event) =>
                  updateField("first_name", event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-red"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Apellido
              </label>

              <input
                type="text"
                value={form.last_name}
                onChange={(event) =>
                  updateField("last_name", event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-red"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-red"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Usuario
              </label>

              <input
                type="text"
                value={form.username}
                onChange={(event) =>
                  updateField("username", event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-red"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Contraseña
              </label>

              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                minLength={6}
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-red"
                required
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-mundial-dark/70 p-4 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.accept_terms}
                onChange={(event) =>
                  updateField("accept_terms", event.target.checked)
                }
                className="mt-1"
                required
              />

              <span className="text-sm leading-6 text-slate-200">
                Acepto los{" "}
                <Link
                  to="/terminos"
                  target="_blank"
                  className="font-bold text-mundial-greenSoft hover:text-mundial-greenSoft"
                >
                  Términos y Condiciones
                </Link>{" "}
                y el{" "}
                <Link
                  to="/reglamento"
                  target="_blank"
                  className="font-bold text-red-100 hover:text-red-50"
                >
                  Reglamento del Prode
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-mundial-red px-4 py-3 font-black text-mundial-dark transition hover:bg-mundial-redLight disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {isSubmitting ? "Enviando verificación..." : "Enviar verificación"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/login"
              className="font-bold text-red-100 hover:text-red-50"
            >
              Ingresar
            </Link>
          </p>

          <div className="mt-5 flex justify-center gap-3 text-xs">
            <Link
              to="/reglamento"
              className="font-bold text-red-100 hover:text-red-50"
            >
              Reglamento
            </Link>

            <span className="text-slate-500">•</span>

            <Link
              to="/terminos"
              className="font-bold text-slate-200 hover:text-white"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}