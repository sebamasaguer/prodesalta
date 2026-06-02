import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw, Users } from "lucide-react";
import { listMyGroups } from "../api/prodeGroups";
import { GroupCard } from "../components/GroupCard";
import type { ProdeGroup } from "../types/prodeGroup";

export function GroupsPage() {
  const [groups, setGroups] = useState<ProdeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadGroups() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listMyGroups();
      setGroups(data.filter((group) => !group.is_personal));
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudieron cargar los grupos",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
            Grupos de Prode
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Mis grupos
          </h1>

          <p className="mt-2 text-slate-300">
            Creá grupos, compartí códigos de invitación y competí con tus amigos.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={loadGroups}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>

          <Link
            to="/grupos/unirse"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-5 py-3 font-black text-red-100 hover:bg-mundial-red/20"
          >
            Unirme con código
          </Link>

          <Link
            to="/grupos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight"
          >
            <Plus size={18} />
            Crear grupo
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 font-semibold text-red-100">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-200">
          Cargando grupos...
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-mundial-green/10 text-mundial-greenSoft">
            <Users size={34} />
          </div>

          <h2 className="text-2xl font-black">
            Todavía no tenés grupos
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Podés crear tu propio grupo de Prode o unirte a uno existente usando
            el código de invitación que te comparta el organizador.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/grupos/nuevo"
              className="rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight"
            >
              Crear grupo
            </Link>

            <Link
              to="/grupos/unirse"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white hover:bg-white/10"
            >
              Unirme con código
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}