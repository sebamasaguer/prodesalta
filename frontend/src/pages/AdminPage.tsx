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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mundial-red text-mundial-dark">
          <Shield size={30} />
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-100">
            Administración
          </p>
          <h1 className="text-4xl font-black">Panel administrador</h1>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-slate-200">
          Acceso permitido para usuario{" "}
          <span className="font-bold text-white">{user?.username}</span> con rol{" "}
          <span className="font-bold text-red-100">{user?.role}</span>.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <Link
          to="/admin/usuarios"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Users className="mb-5 text-mundial-gold" size={34} />
          <h2 className="text-2xl font-black">Usuarios</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Administrar roles, estado y verificación.
          </p>
        </Link>

        <Link
          to="/admin/torneos"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Trophy className="mb-5 text-red-100" size={34} />
          <h2 className="text-2xl font-black">Torneos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Crear y administrar torneos.
          </p>
        </Link>

        <Link
          to="/admin/equipos"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Users className="mb-5 text-mundial-greenSoft" size={34} />
          <h2 className="text-2xl font-black">Equipos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Cargar selecciones y códigos.
          </p>
        </Link>

        <Link
          to="/admin/fixture"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <CalendarDays className="mb-5 text-mundial-greenSoft" size={34} />
          <h2 className="text-2xl font-black">Fixture</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Cargar partidos y resultados.
          </p>
        </Link>

        <Link
          to="/admin/importar-fixture"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <FileSpreadsheet className="mb-5 text-mundial-greenSoft" size={34} />
          <h2 className="text-2xl font-black">Importar</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Cargar fixture masivo por Excel.
          </p>
        </Link>

        <Link
          to="/admin/puntajes"
          className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <Target className="mb-5 text-red-100" size={34} />
          <h2 className="text-2xl font-black">Puntajes</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Configurar reglas de cálculo.
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
      </div>
    </div>
  );
}