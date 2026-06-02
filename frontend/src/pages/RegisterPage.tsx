import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
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

    if (!form.accept_terms) {
      setErrorMessage(
        "Debés aceptar los Términos y Condiciones para crear una cuenta",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(form);
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo crear la cuenta",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-6 text-white sm:py-10">
      <div className="w-full max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              to="/"
              title="Volver al inicio"
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 transition hover:bg-yellow-300"
            >
              <Trophy size={28} />
            </Link>

            <h1 className="text-3xl font-black">Crear cuenta</h1>

            <p className="mt-2 text-sm text-slate-400">
              Registrate como jugador y empezá a participar en modo individual
              o en grupos.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Nombre
              </label>

              <input
                type="text"
                value={form.first_name}
                onChange={(event) =>
                  updateField("first_name", event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Apellido
              </label>

              <input
                type="text"
                value={form.last_name}
                onChange={(event) =>
                  updateField("last_name", event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Usuario
              </label>

              <input
                type="text"
                value={form.username}
                onChange={(event) =>
                  updateField("username", event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Contraseña
              </label>

              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                minLength={6}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
                required
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.accept_terms}
                onChange={(event) =>
                  updateField("accept_terms", event.target.checked)
                }
                className="mt-1"
                required
              />

              <span className="text-sm leading-6 text-slate-300">
                Acepto los{" "}
                <Link
                  to="/terminos"
                  target="_blank"
                  className="font-bold text-emerald-300 hover:text-emerald-200"
                >
                  Términos y Condiciones
                </Link>{" "}
                y el{" "}
                <Link
                  to="/reglamento"
                  target="_blank"
                  className="font-bold text-yellow-300 hover:text-yellow-200"
                >
                  Reglamento del Prode
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-yellow-400 px-4 py-3 font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/login"
              className="font-bold text-yellow-300 hover:text-yellow-200"
            >
              Ingresar
            </Link>
          </p>

          <div className="mt-5 flex justify-center gap-3 text-xs">
            <Link
              to="/reglamento"
              className="font-bold text-yellow-300 hover:text-yellow-200"
            >
              Reglamento
            </Link>

            <span className="text-slate-600">•</span>

            <Link
              to="/terminos"
              className="font-bold text-slate-300 hover:text-white"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}