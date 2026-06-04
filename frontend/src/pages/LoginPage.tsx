import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-mundial-dark px-4 py-6 text-white sm:py-10">
      <div className="w-full max-w-md">
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

            <h1 className="text-3xl font-black">Ingresar</h1>

            <p className="mt-2 text-sm text-slate-300">
              Entrá a tu cuenta para cargar predicciones y ver tu ranking.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 text-sm font-semibold text-red-100">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Email o usuario
              </label>

              <input
                type="text"
                value={usernameOrEmail}
                onChange={(event) => setUsernameOrEmail(event.target.value)}
                placeholder="admin o usuario@correo.com"
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-mundial-green px-4 py-3 font-black text-mundial-dark transition hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            ¿No tenés cuenta?{" "}
            <Link
              to="/registro"
              className="font-bold text-mundial-greenSoft hover:text-mundial-greenSoft"
            >
              Crear cuenta
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