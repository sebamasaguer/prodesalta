import { useState } from "react";
import { CheckCircle, KeyRound, User } from "lucide-react";
import { changePassword } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas nuevas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setSuccessMessage("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo cambiar la contraseña",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    ORGANIZER: "Organizador",
    PLAYER: "Jugador",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Mi perfil</h1>
        <p className="mt-1 text-sm text-slate-400">
          Información de tu cuenta y configuración de seguridad.
        </p>
      </div>

      {/* Datos de la cuenta */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mundial-dark text-mundial-gold">
            <User size={20} />
          </div>
          <h2 className="text-lg font-black text-white">Datos de la cuenta</h2>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <dt className="w-36 font-semibold text-slate-400">Nombre</dt>
            <dd className="font-bold text-white">
              {user?.first_name} {user?.last_name}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <dt className="w-36 font-semibold text-slate-400">Usuario</dt>
            <dd className="font-bold text-white">@{user?.username}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <dt className="w-36 font-semibold text-slate-400">Correo</dt>
            <dd className="font-bold text-white">{user?.email}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <dt className="w-36 font-semibold text-slate-400">Rol</dt>
            <dd>
              <span className="inline-flex rounded-full bg-mundial-green/10 px-2 py-1 text-xs font-black text-mundial-gold">
                {roleLabel[user?.role ?? "PLAYER"] ?? user?.role}
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <dt className="w-36 font-semibold text-slate-400">Email verificado</dt>
            <dd className="font-bold text-white">
              {user?.email_verified_at ? (
                <span className="text-mundial-green">Sí</span>
              ) : (
                <span className="text-red-400">No</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Cambio de contraseña */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mundial-dark text-mundial-gold">
            <KeyRound size={20} />
          </div>
          <h2 className="text-lg font-black text-white">Cambiar contraseña</h2>
        </div>

        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-3">
            <CheckCircle size={18} className="shrink-0 text-mundial-green" />
            <p className="text-sm font-semibold text-slate-100">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 text-sm font-semibold text-red-100">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Tu contraseña actual"
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
              required
            />
          </div>

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
              Confirmar nueva contraseña
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
            {isSubmitting ? "Guardando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
