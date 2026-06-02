import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Crown,
  LogOut,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import {
  getGroupDetail,
  leaveGroup,
  removeGroupMember,
} from "../api/prodeGroups";
import { useAuth } from "../context/AuthContext";
import type { ProdeGroupDetail } from "../types/prodeGroup";
import { getGroupRanking } from "../api/rankings";
import { RankingTable } from "../components/RankingTable";
import type { GroupRanking } from "../types/ranking";

export function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<ProdeGroupDetail | null>(null);
  const [ranking, setRanking] = useState<GroupRanking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const numericGroupId = Number(groupId);

  async function loadGroup() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getGroupDetail(numericGroupId);
      setGroup(data);
      const rankingData = await getGroupRanking(numericGroupId);
      setRanking(rankingData);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo cargar el grupo",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function copyInviteCode() {
    if (!group) return;

    await navigator.clipboard.writeText(group.invite_code);
    setActionMessage(`Código copiado: ${group.invite_code}`);

    setTimeout(() => setActionMessage(""), 2500);
  }

  async function handleLeaveGroup() {
    if (!group) return;

    const confirmLeave = confirm(`¿Querés salir del grupo "${group.name}"?`);

    if (!confirmLeave) return;

    try {
      await leaveGroup(group.id);
      navigate("/grupos");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo salir del grupo",
      );
    }
  }

  async function handleRemoveMember(userId: number) {
    if (!group) return;

    const confirmRemove = confirm("¿Querés quitar este participante del grupo?");

    if (!confirmRemove) return;

    try {
      await removeGroupMember(group.id, userId);
      await loadGroup();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo quitar el participante",
      );
    }
  }

  useEffect(() => {
    if (!Number.isFinite(numericGroupId)) {
      navigate("/grupos");
      return;
    }

    loadGroup();
  }, [numericGroupId]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        Cargando grupo...
      </div>
    );
  }

  if (errorMessage && !group) {
    return (
      <div>
        <Link
          to="/grupos"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver a mis grupos
        </Link>

        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 font-semibold text-red-200">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!group) return null;

  const isOwner = group.my_role === "OWNER";

  return (
    <div>
      <Link
        to="/grupos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver a mis grupos
      </Link>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      {actionMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-200">
          {actionMessage}
        </div>
      )}

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight">
                {group.name}
              </h1>

              {isOwner && (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
                  <Crown size={14} />
                  Dueño
                </span>
              )}
            </div>

            <p className="max-w-3xl text-slate-400">
              {group.description || "Grupo de Prode Mundial sin descripción."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={copyInviteCode}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3 font-black text-yellow-300 hover:bg-yellow-400/20"
            >
              <Copy size={18} />
              {group.invite_code}
            </button>

            {!isOwner && (
              <button
                onClick={handleLeaveGroup}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-black text-red-300 hover:bg-red-500/20"
              >
                <LogOut size={18} />
                Salir
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <Users className="mb-4 text-emerald-300" size={30} />
            <p className="text-sm text-slate-400">Participantes</p>
            <p className="mt-2 text-4xl font-black">{group.members_count}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <Trophy className="mb-4 text-yellow-300" size={30} />
            <p className="text-sm text-slate-400">Ranking</p>
            <p className="mt-2 text-4xl font-black">0 pts</p>
            <p className="mt-2 text-xs text-slate-500">
              Se activa con partidos y predicciones.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <Crown className="mb-4 text-yellow-300" size={30} />
            <p className="text-sm text-slate-400">Tu rol</p>
            <p className="mt-2 text-3xl font-black">{group.my_role}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Participantes</h2>
            <p className="mt-1 text-sm text-slate-400">
              Usuarios que pertenecen a este grupo.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-4">Usuario</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Rol grupo</th>
                <th className="px-4 py-4">Rol sistema</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {group.members.map((member) => {
                const isCurrentUser = member.user_id === user?.id;
                const isMemberOwner = member.role_in_group === "OWNER";

                return (
                  <tr key={member.id} className="bg-white/[0.02]">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-bold">
                          {member.user.first_name} {member.user.last_name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-emerald-300">
                              vos
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-500">
                          @{member.user.username}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-300">
                      {member.user.email}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          isMemberOwner
                            ? "rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300"
                            : "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300"
                        }
                      >
                        {member.role_in_group}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-300">
                      {member.user.role}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {isOwner && !isMemberOwner && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                          Quitar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          En el próximo bloque se vincularán los grupos con partidos,
          predicciones y ranking.
        </p>
      </div>
      <div className="mt-8">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
            Ranking
          </p>
          <h2 className="mt-2 text-2xl font-black">
            Ranking del grupo
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Posiciones según puntos acumulados por predicciones.
          </p>
        </div>

        <RankingTable entries={ranking?.entries || []} />
      </div>
    </div>
  );
}