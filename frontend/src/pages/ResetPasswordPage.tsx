import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { resetPassword } from "../api/auth";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mundial-dark px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-mundial-red/30 bg-mundial-red/10 p-8 text-center">
          <p className="text-lg font-black text-red-100">Enlace inválido</p>
          <p className="mt-2 text-sm text-slate-300">
            El enlace de recuperación no es válido o ya fue usado.
          </p>
          <Link
            to="/recuperar-contrasena"
            className="mt-6 block rounded-2xl bg-mundial-green px-4 py-3 font-black text-mundial-dark transition hover:bg-mundial-greenLight"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({ token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo restablecer la contraseña",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mundial-dark px-4 py-6 text-white sm:py-10">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver al inicio de sesión
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

            <h1 className="text-3xl font-black">Nueva contraseña</h1>
            <p className="mt-2 text-sm text-slate-300">
              Ingresá tu nueva contraseña para recuperar el acceso.
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-5 text-center">
              <CheckCircle size={32} className="text-mundial-green" />
              <p className="text-sm font-semibold text-slate-100">
                ¡Contraseña actualizada! Redirigiendo al panel...
              </p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-5 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 text-sm font-semibold text-red-100">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetí la nueva contraseña"
                    className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-mundial-green px-4 py-3 font-black text-mundial-dark transition hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Guardando..." : "Establecer contraseña"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
