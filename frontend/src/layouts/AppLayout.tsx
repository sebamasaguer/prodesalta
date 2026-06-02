import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  LogOut,
  Menu,
  Shield,
  Trophy,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    to: "/grupos",
    label: "Mis grupos",
    icon: Users,
  },
  {
    to: "/partidos",
    label: "Partidos",
    icon: CalendarDays,
  },
  {
    to: "/predicciones",
    label: "Mis predicciones",
    icon: Trophy,
  },
  {
    to: "/ranking",
    label: "Ranking",
    icon: Trophy,
  },
  {
    to: "/estadisticas",
    label: "Estadísticas",
    icon: BarChart3,
  },
];

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 font-bold text-mundial-gold"
    : "flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-200 hover:bg-white/10 hover:text-white";
}

export function AppLayout() {
  const { user, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    logoutUser();
    closeMobileMenu();
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          onClick={closeMobileMenu}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mundial-gold text-mundial-navy"
        >
          <Trophy size={27} />
        </Link>

        <div>
          <p className="text-lg font-black leading-none text-white">
            Prode Mundial
          </p>
          <p className="mt-1 text-xs text-slate-300">Panel principal</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={navClass}
            >
              <Icon size={19} />
              {item.label}
            </NavLink>
          );
        })}

        {user?.role === "ADMIN" && (
          <NavLink to="/admin" onClick={closeMobileMenu} className={navClass}>
            <Shield size={19} />
            Administración
          </NavLink>
        )}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mundial-dark text-mundial-gold">
            <UserCircle size={24} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-black text-white">
              {user?.first_name} {user?.last_name}
            </p>

            <p className="truncate text-xs text-slate-300">
              {user?.email}
            </p>

            <p className="mt-1 inline-flex rounded-full bg-mundial-green/10 px-2 py-1 text-xs font-black text-mundial-gold">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mundial-red/15 px-4 py-3 font-black text-red-100 hover:bg-mundial-red/20"
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-mundial-dark text-white">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-white/10 bg-mundial-sidebar px-5 py-6 lg:flex">
        {sidebarContent}
      </aside>

      <header className="safe-top sticky top-0 z-40 border-b border-white/10 bg-mundial-sidebar px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mundial-gold text-mundial-navy">
              <Trophy size={25} />
            </div>

            <div>
              <p className="font-black leading-none">Prode Mundial</p>
              <p className="mt-1 text-xs text-slate-300">Mundial 2026</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeMobileMenu}
            aria-label="Cerrar menú"
          />

          <aside className="safe-bottom safe-top absolute left-0 top-0 flex h-full w-[86vw] max-w-sm flex-col border-r border-white/10 bg-mundial-sidebar px-5 py-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-gold">
                Menú
              </p>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <X size={20} />
              </button>
            </div>

            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}