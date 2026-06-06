import { Link } from "react-router-dom";
import { Copy, Crown, Share2, Users } from "lucide-react";
import type { ProdeGroup } from "../types/prodeGroup";

interface GroupCardProps {
  group: ProdeGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  async function copyInviteCode() {
    await navigator.clipboard.writeText(group.invite_code);
    alert(`Código copiado: ${group.invite_code}`);
  }

  function shareOnWhatsApp() {
    const message = `¡Unite al Prode 2026! 🏆⚽\nUsá el código *${group.invite_code}* del grupo *${group.name}* en prode2026.saltia.com.ar y hacé tus predicciones!`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-2xl font-black">{group.name}</h3>

            {group.my_role === "OWNER" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mundial-red/10 px-3 py-1 text-xs font-black text-red-100">
                <Crown size={14} />
                Dueño
              </span>
            )}
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-slate-300">
            {group.description || "Grupo de Prode Mundial sin descripción."}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Participantes
          </p>

          <div className="mt-2 flex items-center gap-2">
            <Users className="text-mundial-greenSoft" size={20} />
            <p className="text-2xl font-black">{group.members_count}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Código
          </p>

          <button
            onClick={copyInviteCode}
            className="mt-2 flex items-center gap-2 text-left text-xl font-black text-red-100 hover:text-red-50"
          >
            {group.invite_code}
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          to={`/grupos/${group.id}`}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-mundial-green px-4 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight"
        >
          Ver grupo
        </Link>

        <button
          onClick={shareOnWhatsApp}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 font-black text-[#25D366] hover:bg-[#25D366]/20"
        >
          <Share2 size={16} />
          Compartir por WhatsApp
        </button>
      </div>
    </div>
  );
}