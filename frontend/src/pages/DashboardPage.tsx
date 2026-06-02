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
          <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
            Panel principal
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Hola, {user?.first_name}
          </h1>

          <p className="mt-2 text-slate-300">
            Bienvenido al sistema de Prode Mundial. Tu rol actual es{" "}
            <span className="font-bold text-red-100">{user?.role}</span>.
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight"
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
          <Users className="mb-5 text-mundial-greenSoft" size={34} />
          <p className="text-sm text-slate-300">Grupos creados</p>
          <p className="mt-2 text-4xl font-black">{stats?.groups_count ?? 0}</p>
          <p className="mt-2 text-sm text-slate-400">
            Crear, unirse y ver participantes.
          </p>
        </Link>

        <Link
          to="/partidos"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <CalendarDays className="mb-5 text-red-100" size={34} />
          <p className="text-sm text-slate-300">Partidos</p>
          <p className="mt-2 text-4xl font-black">{stats?.matches_count ?? 0}</p>
          <p className="mt-2 text-sm text-slate-400">
            {stats?.finished_matches_count ?? 0} finalizados.
          </p>
        </Link>

        <Link
          to="/ranking"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Trophy className="mb-5 text-mundial-greenSoft" size={34} />
          <p className="text-sm text-slate-300">Puntos otorgados</p>
          <p className="mt-2 text-4xl font-black">
            {stats?.total_points_awarded ?? 0}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Ranking por grupo y general.
          </p>
        </Link>

        <Link
          to={user?.role === "ADMIN" ? "/admin" : "/estadisticas"}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Shield className="mb-5 text-red-100" size={34} />
          <p className="text-sm text-slate-300">Rol</p>
          <p className="mt-2 text-3xl font-black">{user?.role}</p>
          <p className="mt-2 text-sm text-slate-400">
            Permisos activos según usuario.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-3xl border border-mundial-green/20 bg-mundial-green/5 p-6">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
            Predicciones
          </p>
          <h2 className="mt-2 text-2xl font-black">
            Cargá tus pronósticos
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Jugá en modo individual o elegí un grupo. Revisá los partidos disponibles
            y guardá tus resultados antes del cierre.
          </p>
        </div>

        <Link
          to="/predicciones"
          className="inline-flex rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight"
        >
          Ir a mis predicciones
        </Link>
      </div>

      {user?.role === "ADMIN" && (
        <div className="mt-8 rounded-3xl border border-mundial-red/20 bg-mundial-red/5 p-6">
          <div className="mb-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-100">
              Accesos administrador
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Gestión del Mundial
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Administrá torneos, equipos, fixture, resultados y reglas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <Link
              to="/admin/torneos"
              className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <Trophy className="mb-3 text-red-100" size={26} />
              <p className="text-xl font-black text-red-100">Torneos</p>
              <p className="mt-2 text-sm text-slate-300">
                Crear y administrar torneos.
              </p>
            </Link>

            <Link
              to="/admin/equipos"
              className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <Users className="mb-3 text-mundial-greenSoft" size={26} />
              <p className="text-xl font-black text-mundial-greenSoft">Equipos</p>
              <p className="mt-2 text-sm text-slate-300">
                Cargar selecciones.
              </p>
            </Link>

            <Link
              to="/admin/fixture"
              className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <CalendarDays className="mb-3 text-mundial-greenSoft" size={26} />
              <p className="text-xl font-black text-mundial-greenSoft">Fixture</p>
              <p className="mt-2 text-sm text-slate-300">
                Cargar partidos.
              </p>
            </Link>

            <Link
              to="/admin/importar-fixture"
              className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <FileSpreadsheet className="mb-3 text-mundial-greenSoft" size={26} />
              <p className="text-xl font-black text-mundial-greenSoft">Importar</p>
              <p className="mt-2 text-sm text-slate-300">
                Fixture por Excel.
              </p>
            </Link>

            <Link
              to="/admin/puntajes"
              className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <Target className="mb-3 text-red-100" size={26} />
              <p className="text-xl font-black text-red-100">Puntajes</p>
              <p className="mt-2 text-sm text-slate-300">
                Reglas del Prode.
              </p>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-black">Estado del sistema</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-mundial-dark/60 p-5">
            <Users className="mb-3 text-mundial-greenSoft" size={24} />
            <p className="text-sm text-slate-300">Usuarios</p>
            <p className="mt-2 text-2xl font-black text-mundial-greenSoft">
              {stats?.users_count ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-mundial-dark/60 p-5">
            <Target className="mb-3 text-red-100" size={24} />
            <p className="text-sm text-slate-300">Predicciones</p>
            <p className="mt-2 text-2xl font-black text-red-100">
              {stats?.predictions_count ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-mundial-dark/60 p-5">
            <BarChart3 className="mb-3 text-mundial-greenSoft" size={24} />
            <p className="text-sm text-slate-300">Promedio puntos</p>
            <p className="mt-2 text-2xl font-black text-mundial-greenSoft">
              {stats?.average_points_per_prediction ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-mundial-dark/60 p-5">
            <Link
              to="/estadisticas"
              className="font-black text-red-100 hover:text-red-50"
            >
              Ver estadísticas completas
            </Link>
            <p className="mt-2 text-sm text-slate-300">
              Ranking general y métricas por grupo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}