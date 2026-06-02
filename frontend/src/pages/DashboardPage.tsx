import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  Plus,
  Shield,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { getDashboardStats } from "../api/stats";
import { useAuth } from "../context/AuthContext";
import type { DashboardStats } from "../types/stats";

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setStats(null);
      }
    }

    loadStats();
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Panel principal
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Hola, {user?.first_name}
          </h1>

          <p className="mt-2 text-slate-400">
            Bienvenido al sistema de Prode Mundial. Tu rol actual es{" "}
            <span className="font-bold text-yellow-300">{user?.role}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/grupos/unirse"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
          >
            Unirme a grupo
          </Link>

          <Link
            to="/grupos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300"
          >
            <Plus size={18} />
            Crear grupo
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/grupos"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Users className="mb-5 text-emerald-300" size={34} />
          <p className="text-sm text-slate-400">Grupos creados</p>
          <p className="mt-2 text-4xl font-black">{stats?.groups_count ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">
            Crear, unirse y ver participantes.
          </p>
        </Link>

        <Link
          to="/partidos"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <CalendarDays className="mb-5 text-yellow-300" size={34} />
          <p className="text-sm text-slate-400">Partidos</p>
          <p className="mt-2 text-4xl font-black">{stats?.matches_count ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">
            {stats?.finished_matches_count ?? 0} finalizados.
          </p>
        </Link>

        <Link
          to="/ranking"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Trophy className="mb-5 text-emerald-300" size={34} />
          <p className="text-sm text-slate-400">Puntos otorgados</p>
          <p className="mt-2 text-4xl font-black">
            {stats?.total_points_awarded ?? 0}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Ranking por grupo y general.
          </p>
        </Link>

        <Link
          to={user?.role === "ADMIN" ? "/admin" : "/estadisticas"}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Shield className="mb-5 text-yellow-300" size={34} />
          <p className="text-sm text-slate-400">Rol</p>
          <p className="mt-2 text-3xl font-black">{user?.role}</p>
          <p className="mt-2 text-sm text-slate-500">
            Permisos activos según usuario.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Predicciones
          </p>
          <h2 className="mt-2 text-2xl font-black">
            Cargá tus pronósticos
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Jugá en modo individual o elegí un grupo. Revisá los partidos disponibles
            y guardá tus resultados antes del cierre.
          </p>
        </div>

        <Link
          to="/predicciones"
          className="inline-flex rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300"
        >
          Ir a mis predicciones
        </Link>
      </div>

      {user?.role === "ADMIN" && (
        <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-6">
          <div className="mb-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
              Accesos administrador
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Gestión del Mundial
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Administrá torneos, equipos, fixture, resultados y reglas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <Link
              to="/admin/torneos"
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <Trophy className="mb-3 text-yellow-300" size={26} />
              <p className="text-xl font-black text-yellow-300">Torneos</p>
              <p className="mt-2 text-sm text-slate-400">
                Crear y administrar torneos.
              </p>
            </Link>

            <Link
              to="/admin/equipos"
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <Users className="mb-3 text-emerald-300" size={26} />
              <p className="text-xl font-black text-emerald-300">Equipos</p>
              <p className="mt-2 text-sm text-slate-400">
                Cargar selecciones.
              </p>
            </Link>

            <Link
              to="/admin/fixture"
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <CalendarDays className="mb-3 text-emerald-300" size={26} />
              <p className="text-xl font-black text-emerald-300">Fixture</p>
              <p className="mt-2 text-sm text-slate-400">
                Cargar partidos.
              </p>
            </Link>

            <Link
              to="/admin/importar-fixture"
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <FileSpreadsheet className="mb-3 text-emerald-300" size={26} />
              <p className="text-xl font-black text-emerald-300">Importar</p>
              <p className="mt-2 text-sm text-slate-400">
                Fixture por Excel.
              </p>
            </Link>

            <Link
              to="/admin/puntajes"
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <Target className="mb-3 text-yellow-300" size={26} />
              <p className="text-xl font-black text-yellow-300">Puntajes</p>
              <p className="mt-2 text-sm text-slate-400">
                Reglas del Prode.
              </p>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-black">Estado del sistema</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-950/60 p-5">
            <Users className="mb-3 text-emerald-300" size={24} />
            <p className="text-sm text-slate-400">Usuarios</p>
            <p className="mt-2 text-2xl font-black text-emerald-300">
              {stats?.users_count ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/60 p-5">
            <Target className="mb-3 text-yellow-300" size={24} />
            <p className="text-sm text-slate-400">Predicciones</p>
            <p className="mt-2 text-2xl font-black text-yellow-300">
              {stats?.predictions_count ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/60 p-5">
            <BarChart3 className="mb-3 text-emerald-300" size={24} />
            <p className="text-sm text-slate-400">Promedio puntos</p>
            <p className="mt-2 text-2xl font-black text-emerald-300">
              {stats?.average_points_per_prediction ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/60 p-5">
            <Link
              to="/estadisticas"
              className="font-black text-yellow-300 hover:text-yellow-200"
            >
              Ver estadísticas completas
            </Link>
            <p className="mt-2 text-sm text-slate-400">
              Ranking general y métricas por grupo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}