import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { createGroup } from "../api/prodeGroups";

export function CreateGroupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const group = await createGroup({
        name: form.name,
        description: form.description || undefined,
      });

      navigate(`/grupos/${group.id}`);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo crear el grupo",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        to="/grupos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver a mis grupos
      </Link>

      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
          Nuevo grupo
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Crear grupo de Prode
        </h1>

        <p className="mt-2 text-slate-400">
          Al crear el grupo se genera automáticamente un código de invitación.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl"
        >
          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Nombre del grupo
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ej: Los Pibes del Mundial"
                minLength={3}
                maxLength={160}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Descripción
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Ej: Prode entre amigos para el Mundial 2026."
                rows={6}
                maxLength={2000}
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creando grupo..." : "Crear grupo"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Users size={30} />
          </div>

          <h2 className="text-2xl font-black">
            ¿Qué pasa después?
          </h2>

          <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
            <li>
              <span className="font-bold text-white">1.</span> Se crea el grupo.
            </li>
            <li>
              <span className="font-bold text-white">2.</span> El sistema genera
              un código único.
            </li>
            <li>
              <span className="font-bold text-white">3.</span> Compartís el
              código con los participantes.
            </li>
            <li>
              <span className="font-bold text-white">4.</span> El ranking se
              calculará cuando existan partidos y predicciones.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}