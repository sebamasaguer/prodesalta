import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { listMatches } from "../api/fixture";
import { MatchCard } from "../components/MatchCard";
import type { Match, MatchPhase, MatchStatus } from "../types/fixture";
import { awayName, homeName } from "../utils/matchDisplay";

const phaseOptions: { value: MatchPhase | ""; label: string }[] = [
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

const statusOptions: { value: MatchStatus | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "SCHEDULED", label: "Programados" },
  { value: "LIVE", label: "En vivo" },
  { value: "CLOSED", label: "Cerrados" },
  { value: "FINISHED", label: "Finalizados" },
  { value: "CANCELLED", label: "Cancelados" },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchDateInputValue(match: Match): string {
  const date = new Date(match.match_datetime);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<MatchPhase | "">("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | "">("");
  const [selectedDate, setSelectedDate] = useState("");

  async function loadMatches() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listMatches();
      setMatches(data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudieron cargar los partidos",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function clearFilters() {
    setSearchText("");
    setSelectedPhase("");
    setSelectedGroup("");
    setSelectedStatus("");
    setSelectedDate("");
  }

  useEffect(() => {
    loadMatches();
  }, []);

  const filteredMatches = useMemo(() => {
    const search = normalizeText(searchText);

    return matches.filter((match) => {
      const home = homeName(match);
      const away = awayName(match);

      const searchableText = normalizeText(
        [
          home,
          away,
          match.home_team?.code || "",
          match.away_team?.code || "",
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

      if (selectedDate && matchDateInputValue(match) !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [matches, searchText, selectedPhase, selectedGroup, selectedStatus, selectedDate]);

  const hasActiveFilters =
    searchText || selectedPhase || selectedGroup || selectedStatus || selectedDate;

  const totalMatches = matches.length;
  const filteredTotal = filteredMatches.length;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
            Fixture
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Partidos
          </h1>

          <p className="mt-2 text-slate-300">
            Fixture completo del Mundial 2026. Filtrá por fase, grupo, estado,
            fecha o país.
          </p>
        </div>

        <button
          onClick={loadMatches}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-black">Filtros</h2>
            <p className="mt-1 text-sm text-slate-300">
              Mostrando {filteredTotal} de {totalMatches} partidos.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-mundial-red/20 bg-mundial-red/10 px-4 py-2 text-sm font-bold text-red-100 hover:bg-mundial-red/20"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Buscar
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 focus-within:border-mundial-green">
              <Search size={18} className="text-slate-400" />

              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Argentina, México, W74, Final..."
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
              onChange={(event) =>
                setSelectedPhase(event.target.value as MatchPhase | "")
              }
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
              Estado
            </label>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as MatchStatus | "")
              }
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

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 font-semibold text-red-100">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-200">
          Cargando partidos...
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-black">
            No hay partidos para esos filtros
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Probá limpiar los filtros o cambiar la búsqueda.
          </p>

          <button
            onClick={clearFilters}
            className="mt-6 rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}