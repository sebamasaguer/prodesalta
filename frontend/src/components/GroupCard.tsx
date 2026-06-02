import { Link } from "react-router-dom";
import { Copy, Crown, Users } from "lucide-react";
import type { ProdeGroup } from "../types/prodeGroup";

interface GroupCardProps {
  group: ProdeGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  async function copyInviteCode() {
    await navigator.clipboard.writeText(group.invite_code);
    alert(`Código copiado: ${group.invite_code}`);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-2xl font-black">{group.name}</h3>

            {group.my_role === "OWNER" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
                <Crown size={14} />
                Dueño
              </span>
            )}
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-slate-400">
            {group.description || "Grupo de Prode Mundial sin descripción."}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Participantes
          </p>

          <div className="mt-2 flex items-center gap-2">
            <Users className="text-emerald-300" size={20} />
            <p className="text-2xl font-black">{group.members_count}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Código
          </p>

          <button
            onClick={copyInviteCode}
            className="mt-2 flex items-center gap-2 text-left text-xl font-black text-yellow-300 hover:text-yellow-200"
          >
            {group.invite_code}
            <Copy size={16} />
          </button>
        </div>
      </div>

      <Link
        to={`/grupos/${group.id}`}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 hover:bg-emerald-300"
      >
        Ver grupo
      </Link>
    </div>
  );
}