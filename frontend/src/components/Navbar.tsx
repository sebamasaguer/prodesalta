import { Trophy } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Trophy size={24} />
          </div>

          <div>
            <p className="text-lg font-black tracking-tight text-white">
              Prode Mundial
            </p>
            <p className="text-xs text-slate-400">
              Grupos, predicciones y ranking
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <a href="#como-funciona" className="hover:text-white">
            Cómo funciona
          </a>
          <a href="#funciones" className="hover:text-white">
            Funciones
          </a>
          <a href="#ranking" className="hover:text-white">
            Ranking
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 sm:inline-flex"
          >
            Ingresar
          </a>

          <a
            href="/registro"
            className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
          >
            Crear cuenta
          </a>
        </div>
      </div>
    </header>
  );
}