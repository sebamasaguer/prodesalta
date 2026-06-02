import { useEffect, useMemo, useState } from "react";
import { Flag, RefreshCw, Save, Search, Trophy, X } from "lucide-react";
import { getMyPersonalGroup, listMyGroups } from "../api/prodeGroups";
import {
  listGroupMatchesWithPredictions,
  savePrediction,
} from "../api/predictions";
import type { ProdeGroup } from "../types/prodeGroup";
import type { MatchPredictionStatus } from "../types/prediction";
import {
  formatDateTime,
  phaseLabel,
  statusClass,
  statusLabel,
} from "../utils/fixtureLabels";
import {
  awayCode,
  awayFlag,
  awayName,
  homeCode,
  homeFlag,
  homeName,
} from "../utils/matchDisplay";

type PredictionDraft = Record<
  number,
  {
    home: string;
    away: string;
  }
>;

const phaseOptions = [
  { value: "", label: "Todas las fases" },
  { value: "GROUP_STAGE", label: "Fase de grupos" },
  { value: "ROUND_OF_32", label: "16avos" },
  { value: "ROUND_OF_16", label: "Octavos" },
  { value: "QUARTER_FINAL", label: "Cuartos" },
  { value: "SEMI_FINAL", label: "Semifinales" },
  { value: "THIRD_PLACE", label: "Tercer puesto" },
  { value: "FINAL", label: "Final" },
];

const groupOptions = [
  "",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "SCHEDULED", label: "Programados" },
  { value: "LIVE", label: "En vivo" },
  { value: "CLOSED", label: "Cerrados" },
  { value: "FINISHED", label: "Finalizados" },
  { value: "CANCELLED", label: "Cancelados" },
];

const predictionStatusOptions = [
  { value: "", label: "Todas las predicciones" },
  { value: "pending", label: "Pendientes" },
  { value: "saved", label: "Cargadas" },
  { value: "closed", label: "Cerradas" },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchDateInputValue(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function PredictionTeamBox({
  name,
  code,
  flagUrl,
}: {
  name: string;
  code: string;
  flagUrl: string | null;
}) {
  return (
    <div className="flex min-h-[92px] flex-1 items-center gap-4 rounded-2xl bg-mundial-dark/70 px-4 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={`Bandera de ${name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <Flag className="text-slate-400" size={24} />
        )}
      </div>

      <div className="min-w-0 flex-1 text-center">
        <h3 className="break-words text-xl font-black leading-tight text-white">
          {name}
        </h3>

        {code && (
          <p className="mt-1 text-sm font-bold text-slate-300">
            {code}
          </p>
        )}
      </div>
    </div>
  );
}

export function PredictionsPage() {
  const [groups, setGroups] = useState<ProdeGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [items, setItems] = useState<MatchPredictionStatus[]>([]);
  const [drafts, setDrafts] = useState<PredictionDraft>({});

  const [searchText, setSearchText] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPredictionStatus, setSelectedPredictionStatus] = useState("");

  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedGroupData = useMemo(() => {
    return groups.find((group) => group.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const filteredItems = useMemo(() => {
    const search = normalizeText(searchText);

    return items.filter((item) => {
      const match = item.match;

      const searchableText = normalizeText(
        [
          homeName(match),
          awayName(match),
          homeCode(match),
          awayCode(match),
          match.home_placeholder || "",
          match.away_placeholder || "",
          match.tournament?.name || "",
          match.world_group || "",
          match.phase,
          match.status,
        ].join(" "),
      );

      if (search && !searchableText.includes(search)) {
        return false;
      }

      if (selectedPhase && match.phase !== selectedPhase) {
        return false;
      }

      if (selectedGroup && match.world_group !== selectedGroup) {
        return false;
      }

      if (selectedStatus && match.status !== selectedStatus) {
        return false;
      }

      if (
        selectedDate &&
        matchDateInputValue(match.match_datetime) !== selectedDate
      ) {
        return false;
      }

      const isClosed =
        item.can_predict === false ||
        item.prediction?.is_locked === true ||
        match.status === "FINISHED" ||
        match.status === "CLOSED" ||
        match.status === "CANCELLED";

      if (selectedPredictionStatus === "pending") {
        return !item.prediction && !isClosed;
      }

      if (selectedPredictionStatus === "saved") {
        return Boolean(item.prediction);
      }

      if (selectedPredictionStatus === "closed") {
        return isClosed;
      }

      return true;
    });
  }, [
    items,
    searchText,
    selectedPhase,
    selectedGroup,
    selectedStatus,
    selectedDate,
    selectedPredictionStatus,
  ]);

  const hasActiveFilters =
    searchText ||
    selectedPhase ||
    selectedGroup ||
    selectedStatus ||
    selectedDate ||
    selectedPredictionStatus;

  async function loadGroups() {
    setIsLoadingGroups(true);
    setErrorMessage("");

    try {
      const personalGroup = await getMyPersonalGroup();
      const normalGroups = await listMyGroups();

      const mergedGroups = [
        personalGroup,
        ...normalGroups.filter((group) => group.id !== personalGroup.id),
      ];

      setGroups(mergedGroups);

      if (mergedGroups.length > 0) {
        setSelectedGroupId((current) => current || mergedGroups[0].id);
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudieron cargar los grupos",
      );
    } finally {
      setIsLoadingGroups(false);
    }
  }

  async function loadMatchesForGroup(groupId: number) {
    setIsLoadingMatches(true);
    setErrorMessage("");

    try {
      const data = await listGroupMatchesWithPredictions(groupId);
      setItems(data);

      const nextDrafts: PredictionDraft = {};

      for (const item of data) {
        nextDrafts[item.match.id] = {
          home:
            item.prediction?.home_score_predicted !== undefined &&
            item.prediction?.home_score_predicted !== null
              ? String(item.prediction.home_score_predicted)
              : "",
          away:
            item.prediction?.away_score_predicted !== undefined &&
            item.prediction?.away_score_predicted !== null
              ? String(item.prediction.away_score_predicted)
              : "",
        };
      }

      setDrafts(nextDrafts);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail ||
          "No se pudieron cargar los partidos del grupo",
      );
    } finally {
      setIsLoadingMatches(false);
    }
  }

  function updateDraft(matchId: number, field: "home" | "away", value: string) {
    setDrafts((current) => ({
      ...current,
      [matchId]: {
        home: current[matchId]?.home || "",
        away: current[matchId]?.away || "",
        [field]: value,
      },
    }));
  }

  function clearFilters() {
    setSearchText("");
    setSelectedPhase("");
    setSelectedGroup("");
    setSelectedStatus("");
    setSelectedDate("");
    setSelectedPredictionStatus("");
  }

  async function handleSavePrediction(item: MatchPredictionStatus) {
    if (!selectedGroupId) return;

    const draft = drafts[item.match.id];

    if (!draft || draft.home === "" || draft.away === "") {
      setErrorMessage("Tenés que cargar ambos resultados");
      return;
    }

    const homeScore = Number(draft.home);
    const awayScore = Number(draft.away);

    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      setErrorMessage("Los goles deben ser números enteros positivos");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await savePrediction({
        group_id: selectedGroupId,
        match_id: item.match.id,
        home_score_predicted: homeScore,
        away_score_predicted: awayScore,
      });

      setSuccessMessage("Predicción guardada correctamente");
      await loadMatchesForGroup(selectedGroupId);

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo guardar la predicción",
      );
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadMatchesForGroup(selectedGroupId);
    }
  }, [selectedGroupId]);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
            Pronósticos
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Mis predicciones
          </h1>

          <p className="mt-2 text-slate-300">
            Cargá tus resultados por partido antes del cierre de predicción.
            Podés jugar en modo individual o dentro de un grupo.
          </p>
        </div>

        <button
          onClick={() => selectedGroupId && loadMatchesForGroup(selectedGroupId)}
          disabled={!selectedGroupId || isLoadingMatches}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 font-semibold text-red-100">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-3 font-semibold text-mundial-greenSoft">
          {successMessage}
        </div>
      )}

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <label className="mb-2 block text-sm font-bold text-slate-200">
          Modalidad de predicción
        </label>

        {isLoadingGroups ? (
          <p className="text-slate-300">Cargando modalidades...</p>
        ) : groups.length === 0 ? (
          <p className="text-slate-300">
            No tenés modalidades disponibles.
          </p>
        ) : (
          <>
            <select
              value={selectedGroupId || ""}
              onChange={(event) => setSelectedGroupId(Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green md:max-w-md"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.is_personal
                    ? "Individual"
                    : `${group.name} · ${group.invite_code}`}
                </option>
              ))}
            </select>

            {selectedGroupData && (
              <p className="mt-3 text-sm text-slate-300">
                Modalidad seleccionada:{" "}
                <span className="font-bold text-red-100">
                  {selectedGroupData.is_personal
                    ? "Individual"
                    : selectedGroupData.name}
                </span>
              </p>
            )}
          </>
        )}
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-black">Filtros</h2>

            <p className="mt-1 text-sm text-slate-300">
              Mostrando {filteredItems.length} de {items.length} partidos.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-mundial-red/20 bg-mundial-red/10 px-4 py-2 text-sm font-bold text-red-100 hover:bg-mundial-red/20"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Buscar
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 focus-within:border-mundial-green">
              <Search size={18} className="text-slate-400" />

              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Argentina, México, Final..."
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Fase
            </label>

            <select
              value={selectedPhase}
              onChange={(event) => setSelectedPhase(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
            >
              {phaseOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Grupo
            </label>

            <select
              value={selectedGroup}
              onChange={(event) => setSelectedGroup(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
            >
              {groupOptions.map((group) => (
                <option key={group || "all"} value={group}>
                  {group ? `Grupo ${group}` : "Todos los grupos"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Estado partido
            </label>

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Predicción
            </label>

            <select
              value={selectedPredictionStatus}
              onChange={(event) =>
                setSelectedPredictionStatus(event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
            >
              {predictionStatusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Fecha
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
            />
          </div>
        </div>
      </div>

      {isLoadingMatches ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-200">
          Cargando partidos...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-mundial-red/10 text-red-100">
            <Trophy size={34} />
          </div>

          <h2 className="text-2xl font-black">
            No hay partidos para esos filtros
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Probá limpiar los filtros o cambiar la búsqueda.
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredItems.map((item) => {
            const draft = drafts[item.match.id] || {
              home: "",
              away: "",
            };

            const hasPrediction = Boolean(item.prediction);
            const disabled = !item.can_predict;

            return (
              <div
                key={item.match.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
                      {phaseLabel(item.match.phase)}
                      {item.match.world_group
                        ? ` · Grupo ${item.match.world_group}`
                        : ""}
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {item.match.tournament?.name || "Mundial 2026"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(
                      item.match.status,
                    )}`}
                  >
                    {statusLabel(item.match.status)}
                  </span>
                </div>

                <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                  <PredictionTeamBox
                    name={homeName(item.match)}
                    code={homeCode(item.match)}
                    flagUrl={homeFlag(item.match)}
                  />

                  <div className="text-center text-xl font-black text-slate-400">
                    VS
                  </div>

                  <PredictionTeamBox
                    name={awayName(item.match)}
                    code={awayCode(item.match)}
                    flagUrl={awayFlag(item.match)}
                  />
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                  <div className="rounded-2xl bg-mundial-dark/60 px-4 py-3">
                    Partido: {formatDateTime(item.match.match_datetime)}
                  </div>

                  <div className="rounded-2xl bg-mundial-dark/60 px-4 py-3">
                    Cierre: {formatDateTime(item.match.prediction_deadline)}
                  </div>
                </div>

                {item.match.status === "FINISHED" &&
                  item.match.home_score !== null &&
                  item.match.away_score !== null && (
                    <div className="mt-5 rounded-2xl border border-mundial-red/20 bg-mundial-red/10 px-4 py-3 text-center">
                      <p className="text-sm font-bold text-red-50">
                        Resultado final
                      </p>

                      <p className="mt-1 text-3xl font-black text-red-100">
                        {item.match.home_score} - {item.match.away_score}
                      </p>
                    </div>
                  )}

                <div className="mt-5 rounded-2xl border border-white/10 bg-mundial-dark/60 p-4">
                  <p className="mb-3 text-sm font-bold text-slate-200">
                    Tu predicción
                  </p>

                  <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                    <input
                      type="number"
                      min={0}
                      value={draft.home}
                      disabled={disabled}
                      onChange={(event) =>
                        updateDraft(item.match.id, "home", event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-center text-2xl font-black outline-none focus:border-mundial-green disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <span className="text-center text-xl font-black text-slate-400">
                      -
                    </span>

                    <input
                      type="number"
                      min={0}
                      value={draft.away}
                      disabled={disabled}
                      onChange={(event) =>
                        updateDraft(item.match.id, "away", event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-center text-2xl font-black outline-none focus:border-mundial-green disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {item.lock_reason && (
                    <p className="mt-3 rounded-xl bg-mundial-red/10 px-3 py-2 text-sm font-semibold text-red-100">
                      {item.lock_reason}
                    </p>
                  )}

                  {hasPrediction && (
                    <p className="mt-3 text-sm text-slate-300">
                      Predicción guardada. Puntos actuales:{" "}
                      <span className="font-black text-red-100">
                        {item.prediction?.points}
                      </span>
                    </p>
                  )}

                  <button
                    disabled={disabled}
                    onClick={() => handleSavePrediction(item)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={18} />
                    {hasPrediction
                      ? "Actualizar predicción"
                      : "Guardar predicción"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}