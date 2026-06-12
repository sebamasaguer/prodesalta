import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPassword } from "../api/auth";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await forgotPassword({ email });
      setDevResetUrl(result.dev_reset_url ?? null);
      setSubmitted(true);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo procesar la solicitud",
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

            <h1 className="text-3xl font-black">Recuperar contraseña</h1>
            <p className="mt-2 text-sm text-slate-300">
              Ingresá tu correo y te enviaremos las instrucciones.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-5 text-center">
                <CheckCircle size={32} className="text-mundial-green" />
                <p className="text-sm font-semibold text-slate-100">
                  Si el correo está registrado, te enviaremos las instrucciones
                  para restablecer tu contraseña. Revisá tu bandeja de entrada.
                </p>
              </div>

              {devResetUrl && (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs">
                  <p className="mb-1 font-black text-yellow-300">
                    DESARROLLO — SMTP no configurado
                  </p>
                  <a
                    href={devResetUrl}
                    className="break-all font-semibold text-yellow-200 underline"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}

              <Link
                to="/login"
                className="block w-full rounded-2xl bg-mundial-green px-4 py-3 text-center font-black text-mundial-dark transition hover:bg-mundial-greenLight"
              >
                Volver al inicio de sesión
              </Link>
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
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@correo.com"
                    className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-mundial-green px-4 py-3 font-black text-mundial-dark transition hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
