import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Trophy, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmailUser } = useAuth();

  const hasStartedVerification = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verificando tu correo...");

  useEffect(() => {
    if (hasStartedVerification.current) {
      return;
    }

    hasStartedVerification.current = true;

    async function verify() {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Falta el token de verificación.");
        return;
      }

      try {
        await verifyEmailUser({ token });
        setStatus("success");
        setMessage("Correo verificado. Tu cuenta fue creada correctamente.");
        setTimeout(() => navigate("/dashboard"), 1800);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error?.response?.data?.detail ||
            "No se pudo verificar el correo. El enlace puede estar vencido.",
        );
      }
    }

    verify();
  }, [navigate, searchParams, verifyEmailUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mundial-dark px-4 py-6 text-white sm:py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
        <Link
          to="/"
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-mundial-gold text-mundial-navy"
        >
          <Trophy size={32} />
        </Link>

        {status === "loading" && (
          <Loader2 className="mx-auto mb-4 animate-spin text-mundial-gold" size={42} />
        )}

        {status === "success" && (
          <CheckCircle2 className="mx-auto mb-4 text-mundial-green" size={46} />
        )}

        {status === "error" && (
          <XCircle className="mx-auto mb-4 text-mundial-red" size={46} />
        )}

        <h1 className="text-3xl font-black">Verificación de correo</h1>

        <p className="mt-3 text-sm leading-6 text-slate-200">{message}</p>

        {status === "success" && (
          <p className="mt-3 text-xs font-semibold text-slate-300">
            Te estamos llevando al panel principal.
          </p>
        )}

        {status === "error" && (
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/registro"
              className="rounded-2xl bg-mundial-green px-4 py-3 font-black text-mundial-dark transition hover:bg-mundial-greenLight"
            >
              Registrarme nuevamente
            </Link>

            <Link
              to="/login"
              className="rounded-2xl border border-white/10 px-4 py-3 font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Ir al login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
