import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Crown,
  Gift,
  LogOut,
  Plus,
  Save,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import {
  createGroupPrize,
  deleteGroupPrize,
  getGroupDetail,
  leaveGroup,
  removeGroupMember,
} from "../api/prodeGroups";
import { listGroupMemberPredictions } from "../api/predictions";
import { useAuth } from "../context/AuthContext";
import type { GroupPrizePayload, ProdeGroupDetail } from "../types/prodeGroup";
import type { GroupMemberPrediction } from "../types/prediction";
import { getGroupRanking } from "../api/rankings";
import { RankingTable } from "../components/RankingTable";
import type { GroupRanking } from "../types/ranking";
import { formatDateTime, phaseLabel } from "../utils/fixtureLabels";

const emptyPrizeForm: GroupPrizePayload = {
  title: "",
  description: "",
  amount_label: "",
  position_order: 1,
};

export function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<ProdeGroupDetail | null>(null);
  const [ranking, setRanking] = useState<GroupRanking | null>(null);
  const [memberPredictions, setMemberPredictions] = useState<GroupMemberPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPrize, setIsSavingPrize] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [prizeForm, setPrizeForm] = useState<GroupPrizePayload>(emptyPrizeForm);

  const numericGroupId = Number(groupId);

  const isOwner = group?.my_role === "OWNER";

  const predictionsByUser = useMemo(() => {
    return memberPredictions.reduce<Record<string, GroupMemberPrediction[]>>(
      (accumulator, prediction) => {
        const key = prediction.full_name || `@${prediction.username}`;

        if (!accumulator[key]) {
          accumulator[key] = [];
        }

        accumulator[key].push(prediction);
        return accumulator;
      },
      {},
    );
  }, [memberPredictions]);

  const sortedMemberPredictions = useMemo(() => {
    return [...memberPredictions].sort((first, second) => {
      const userComparison = (first.full_name || first.username).localeCompare(
        second.full_name || second.username,
      );

      if (userComparison !== 0) return userComparison;

      return first.match_id - second.match_id;
    });
  }, [memberPredictions]);

  async function loadGroup() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [groupData, rankingData, predictionData] = await Promise.all([
        getGroupDetail(numericGroupId),
        getGroupRanking(numericGroupId),
        listGroupMemberPredictions(numericGroupId),
      ]);

      setGroup(groupData);
      setRanking(rankingData);
      setMemberPredictions(predictionData);
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

  async function handleCreatePrize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!group) return;

    setIsSavingPrize(true);
    setErrorMessage("");

    try {
      await createGroupPrize(group.id, {
        title: prizeForm.title.trim(),
        description: prizeForm.description?.trim() || null,
        amount_label: prizeForm.amount_label?.trim() || null,
        position_order: Number(prizeForm.position_order || 1),
      });

      setPrizeForm(emptyPrizeForm);
      setActionMessage("Premio agregado correctamente.");
      await loadGroup();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo agregar el premio",
      );
    } finally {
      setIsSavingPrize(false);
    }
  }

  async function handleDeletePrize(prizeId: number) {
    if (!group) return;

    const confirmDelete = confirm("¿Querés eliminar este premio?");

    if (!confirmDelete) return;

    try {
      await deleteGroupPrize(group.id, prizeId);
      setActionMessage("Premio eliminado correctamente.");
      await loadGroup();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo eliminar el premio",
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
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver a mis grupos
        </Link>

        <div className="rounded-3xl border border-mundial-red/30 bg-mundial-red/10 p-8 font-semibold text-red-100">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div>
      <Link
        to="/grupos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver a mis grupos
      </Link>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 font-semibold text-red-100">
          {errorMessage}
        </div>
      )}

      {actionMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-3 font-semibold text-mundial-greenSoft">
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
                <span className="inline-flex items-center gap-1 rounded-full bg-mundial-red/10 px-3 py-1 text-xs font-black text-red-100">
                  <Crown size={14} />
                  Administrador del grupo
                </span>
              )}
            </div>

            <p className="max-w-3xl text-slate-300">
              {group.description || "Grupo de Prode Mundial sin descripción."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={copyInviteCode}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-5 py-3 font-black text-red-100 hover:bg-mundial-red/20"
            >
              <Copy size={18} />
              {group.invite_code}
            </button>

            {!isOwner && (
              <button
                onClick={handleLeaveGroup}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-5 py-3 font-black text-red-100 hover:bg-mundial-red/20"
              >
                <LogOut size={18} />
                Salir
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5">
            <Users className="mb-4 text-mundial-greenSoft" size={30} />
            <p className="text-sm text-slate-300">Participantes</p>
            <p className="mt-2 text-4xl font-black">{group.members_count}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5">
            <Gift className="mb-4 text-yellow-200" size={30} />
            <p className="text-sm text-slate-300">Premios</p>
            <p className="mt-2 text-4xl font-black">{group.prizes.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5">
            <Trophy className="mb-4 text-red-100" size={30} />
            <p className="text-sm text-slate-300">Predicciones</p>
            <p className="mt-2 text-4xl font-black">{memberPredictions.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5">
            <Crown className="mb-4 text-red-100" size={30} />
            <p className="text-sm text-slate-300">Tu rol</p>
            <p className="mt-2 text-2xl font-black">{group.my_role}</p>
          </div>
        </div>
      </div>

      <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-200">
              Premios
            </p>
            <h2 className="mt-2 text-2xl font-black">Premios del grupo</h2>
            <p className="mt-1 text-sm text-slate-300">
              Todos los participantes pueden ver los premios. Solo el administrador del grupo puede cargarlos o eliminarlos.
            </p>
          </div>
        </div>

        {isOwner && (
          <form
            onSubmit={handleCreatePrize}
            className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-mundial-dark/50 p-4 lg:grid-cols-[90px_1fr_1fr_1fr_auto]"
          >
            <input
              type="number"
              min={1}
              max={999}
              value={prizeForm.position_order}
              onChange={(event) =>
                setPrizeForm((current) => ({
                  ...current,
                  position_order: Number(event.target.value),
                }))
              }
              className="rounded-xl border border-white/10 bg-mundial-dark px-3 py-3 font-bold text-white outline-none focus:border-mundial-green"
              placeholder="Pos."
            />
            <input
              required
              value={prizeForm.title}
              onChange={(event) =>
                setPrizeForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="rounded-xl border border-white/10 bg-mundial-dark px-3 py-3 font-bold text-white outline-none focus:border-mundial-green"
              placeholder="Ej: 1° premio"
            />
            <input
              value={prizeForm.amount_label || ""}
              onChange={(event) =>
                setPrizeForm((current) => ({
                  ...current,
                  amount_label: event.target.value,
                }))
              }
              className="rounded-xl border border-white/10 bg-mundial-dark px-3 py-3 font-bold text-white outline-none focus:border-mundial-green"
              placeholder="Ej: $50.000 / Camiseta"
            />
            <input
              value={prizeForm.description || ""}
              onChange={(event) =>
                setPrizeForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="rounded-xl border border-white/10 bg-mundial-dark px-3 py-3 font-bold text-white outline-none focus:border-mundial-green"
              placeholder="Detalle opcional"
            />
            <button
              disabled={isSavingPrize}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-mundial-green px-5 py-3 font-black text-white hover:bg-mundial-greenSoft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingPrize ? <Save size={18} /> : <Plus size={18} />}
              Agregar
            </button>
          </form>
        )}

        {group.prizes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-mundial-dark/40 p-6 text-sm text-slate-300">
            Todavía no se cargaron premios para este grupo.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.prizes.map((prize) => (
              <div
                key={prize.id}
                className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-200">
                      Puesto {prize.position_order}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{prize.title}</h3>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => handleDeletePrize(prize.id)}
                      className="rounded-xl bg-mundial-red/10 p-2 text-red-100 hover:bg-mundial-red/20"
                      title="Eliminar premio"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {prize.amount_label && (
                  <p className="mt-3 rounded-xl bg-mundial-green/10 px-3 py-2 text-sm font-black text-mundial-greenSoft">
                    {prize.amount_label}
                  </p>
                )}

                {prize.description && (
                  <p className="mt-3 text-sm text-slate-300">
                    {prize.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-2xl font-black">Participantes registrados</h2>
          <p className="mt-1 text-sm text-slate-300">
            Usuarios que pertenecen a este grupo. Solo existe un administrador por grupo.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-mundial-dark/80 text-xs uppercase tracking-wider text-slate-300">
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
                            <span className="ml-2 text-xs text-mundial-greenSoft">
                              vos
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-400">
                          @{member.user.username}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-200">
                      {member.user.email}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          isMemberOwner
                            ? "rounded-full bg-mundial-red/10 px-3 py-1 text-xs font-black text-red-100"
                            : "rounded-full bg-mundial-green/10 px-3 py-1 text-xs font-black text-mundial-greenSoft"
                        }
                      >
                        {isMemberOwner ? "ADMINISTRADOR" : "PARTICIPANTE"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-200">
                      {member.user.role}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {isOwner && !isMemberOwner && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-mundial-red/10 px-3 py-2 text-sm font-bold text-red-100 hover:bg-mundial-red/20"
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
      </section>

      <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-2xl font-black">Predicciones del grupo</h2>
            <p className="mt-1 text-sm text-slate-300">
              Cada participante puede ver los resultados cargados por los miembros del grupo.
              Se muestra el partido, la predicción, el resultado oficial si ya fue cargado y
              los puntos obtenidos.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Total cargadas
            </p>
            <p className="mt-1 text-2xl font-black text-mundial-greenSoft">
              {memberPredictions.length}
            </p>
          </div>
        </div>

        {memberPredictions.length > 0 && (
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(predictionsByUser).map(([displayName, userPredictions]) => (
              <div
                key={displayName}
                className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-4"
              >
                <p className="truncate text-sm font-black text-white">
                  {displayName}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {userPredictions.length} predicciones cargadas
                </p>
              </div>
            ))}
          </div>
        )}

        {sortedMemberPredictions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-mundial-dark/40 p-6 text-center text-sm text-slate-300">
            Todavía no hay predicciones cargadas en este grupo.
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:hidden">
              {sortedMemberPredictions.map((prediction) => {
                const hasOfficialResult =
                  prediction.actual_home_score !== null &&
                  prediction.actual_home_score !== undefined &&
                  prediction.actual_away_score !== null &&
                  prediction.actual_away_score !== undefined;

                return (
                  <article
                    key={prediction.id}
                    className="rounded-3xl border border-white/10 bg-mundial-dark/60 p-4 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black text-white">
                          {prediction.full_name || prediction.username}
                        </p>
                        <p className="text-sm font-bold text-slate-400">
                          @{prediction.username}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-2xl bg-yellow-400/10 px-3 py-1 text-sm font-black text-yellow-100">
                        {prediction.points ?? 0} pts
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl bg-white/[0.04] p-3">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                          Partido
                        </p>
                        <p className="mt-1 text-base font-black leading-6 text-white">
                          {prediction.home_team_name} vs {prediction.away_team_name}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/[0.04] p-3">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                          Fase
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-100">
                          {prediction.phase ? phaseLabel(prediction.phase as any) : "-"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-mundial-blue/15 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Predicción
                          </p>
                          <p className="mt-2 text-2xl font-black text-white">
                            {prediction.predicted_home_score} - {prediction.predicted_away_score}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white/[0.04] p-3">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Resultado
                          </p>

                          {hasOfficialResult ? (
                            <p className="mt-2 text-2xl font-black text-mundial-greenSoft">
                              {prediction.actual_home_score} - {prediction.actual_away_score}
                            </p>
                          ) : (
                            <span className="mt-2 inline-flex rounded-xl bg-white/5 px-3 py-1 text-sm font-black text-slate-300">
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/[0.04] p-3">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                          Fecha de carga
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-100">
                          {formatDateTime(prediction.created_at)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-white/10 lg:block">
              <div className="max-h-[720px] overflow-auto">
                <table className="w-full min-w-[1080px] border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-mundial-dark text-xs uppercase tracking-wider text-slate-300">
                    <tr>
                      <th className="px-4 py-4">Participante</th>
                      <th className="px-4 py-4">Partido</th>
                      <th className="px-4 py-4">Fase</th>
                      <th className="px-4 py-4">Predicción cargada</th>
                      <th className="px-4 py-4">Resultado oficial</th>
                      <th className="px-4 py-4">Puntos</th>
                      <th className="px-4 py-4">Fecha</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {sortedMemberPredictions.map((prediction) => (
                      <tr key={prediction.id} className="bg-white/[0.02]">
                        <td className="px-4 py-4">
                          <p className="font-bold">
                            {prediction.full_name || prediction.username}
                          </p>
                          <p className="text-sm text-slate-400">
                            @{prediction.username}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-slate-200">
                          {prediction.home_team_name} vs {prediction.away_team_name}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-200">
                          {prediction.phase ? phaseLabel(prediction.phase as any) : "-"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-xl bg-mundial-blue/15 px-3 py-1 text-xl font-black text-white">
                            {prediction.predicted_home_score} - {prediction.predicted_away_score}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {prediction.actual_home_score !== null &&
                          prediction.actual_home_score !== undefined &&
                          prediction.actual_away_score !== null &&
                          prediction.actual_away_score !== undefined ? (
                            <span className="inline-flex rounded-xl bg-mundial-green/15 px-3 py-1 text-lg font-black text-mundial-greenSoft">
                              {prediction.actual_home_score} - {prediction.actual_away_score}
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-black text-slate-300">
                              Pendiente
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex min-w-10 justify-center rounded-xl bg-yellow-400/10 px-3 py-1 font-black text-yellow-100">
                            {prediction.points}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-300">
                          {formatDateTime(prediction.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      <div className="mt-8">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-100">
            Ranking
          </p>
          <h2 className="mt-2 text-2xl font-black">Ranking del grupo</h2>
          <p className="mt-2 text-sm text-slate-300">
            Posiciones según puntos acumulados por predicciones.
          </p>
        </div>

        <RankingTable entries={ranking?.entries || []} />
      </div>
    </div>
  );
}
