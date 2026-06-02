import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await loginUser({
        username_or_email: usernameOrEmail,
        password,
      });

      navigate("/dashboard");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo iniciar sesión",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-6 text-white sm:py-10">
      <div className="w-full max-w-md">
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
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 transition hover:bg-emerald-300"
            >
              <Trophy size={28} />
            </Link>

            <h1 className="text-3xl font-black">Ingresar</h1>

            <p className="mt-2 text-sm text-slate-400">
              Entrá a tu cuenta para cargar predicciones y ver tu ranking.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Email o usuario
              </label>

              <input
                type="text"
                value={usernameOrEmail}
                onChange={(event) => setUsernameOrEmail(event.target.value)}
                placeholder="admin o usuario@correo.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            ¿No tenés cuenta?{" "}
            <Link
              to="/registro"
              className="font-bold text-emerald-300 hover:text-emerald-200"
            >
              Crear cuenta
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