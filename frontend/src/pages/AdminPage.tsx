import { Link } from "react-router-dom";
import {
  CalendarDays,
  FileSpreadsheet,
  Shield,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
          <Shield size={30} />
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
            Administración
          </p>
          <h1 className="text-4xl font-black">Panel administrador</h1>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-slate-300">
          Acceso permitido para usuario{" "}
          <span className="font-bold text-white">{user?.username}</span> con rol{" "}
          <span className="font-bold text-yellow-300">{user?.role}</span>.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <Link
          to="/admin/torneos"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Trophy className="mb-5 text-yellow-300" size={34} />
          <h2 className="text-2xl font-black">Torneos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Crear y administrar torneos.
          </p>
        </Link>

        <Link
          to="/admin/equipos"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Users className="mb-5 text-emerald-300" size={34} />
          <h2 className="text-2xl font-black">Equipos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Cargar selecciones y códigos.
          </p>
        </Link>

        <Link
          to="/admin/fixture"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <CalendarDays className="mb-5 text-emerald-300" size={34} />
          <h2 className="text-2xl font-black">Fixture</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Cargar partidos y resultados.
          </p>
        </Link>

        <Link
          to="/admin/importar-fixture"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <FileSpreadsheet className="mb-5 text-emerald-300" size={34} />
          <h2 className="text-2xl font-black">Importar</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Cargar fixture masivo por Excel.
          </p>
        </Link>

        <Link
          to="/admin/puntajes"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Target className="mb-5 text-yellow-300" size={34} />
          <h2 className="text-2xl font-black">Puntajes</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Configurar reglas de cálculo.
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
      </div>
    </div>
  );
}