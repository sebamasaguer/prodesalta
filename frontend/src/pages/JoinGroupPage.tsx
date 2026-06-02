import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { joinGroup } from "../api/prodeGroups";

export function JoinGroupPage() {
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const group = await joinGroup({
        invite_code: inviteCode.trim().toUpperCase(),
      });

      navigate(`/grupos/${group.id}`);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo ingresar al grupo",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        to="/grupos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver a mis grupos
      </Link>

      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-mundial-red text-mundial-dark">
            <KeyRound size={34} />
          </div>

          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-100">
            Código de invitación
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Unirme a un grupo
          </h1>

          <p className="mt-3 text-slate-300">
            Ingresá el código que te compartió el organizador del grupo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl"
        >
          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 text-sm font-semibold text-red-100">
              {errorMessage}
            </div>
          )}

          <label className="mb-2 block text-sm font-bold text-slate-200">
            Código del grupo
          </label>

          <input
            type="text"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            placeholder="Ej: ARG2026"
            minLength={4}
            maxLength={20}
            className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-4 text-center text-2xl font-black uppercase tracking-[0.25em] text-red-100 outline-none focus:border-mundial-red"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded-2xl bg-mundial-red px-5 py-4 font-black text-mundial-dark hover:bg-mundial-redLight disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Ingresando..." : "Unirme al grupo"}
          </button>
        </form>
      </div>
    </div>
  );
}