export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-mundial-line/80 bg-white/90 backdrop-blur-xl">
      <div className="h-1.5 bg-mundial-stripe" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-4">
          <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded-3xl border border-mundial-line bg-white p-2 shadow-mundial sm:h-28 sm:w-44">
            <img
              src="/logochico.png"
              alt="Prode Mundial"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <p className="text-xl font-black tracking-tight text-mundial-navy">
              Prode Mundial
            </p>
            <p className="text-sm font-bold text-mundial-muted">
              Mundial 2026 · Predicciones y ranking
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-black text-mundial-navy md:flex">
          <a href="#como-funciona" className="transition hover:text-mundial-blue">
            Cómo funciona
          </a>
          <a href="#funciones" className="transition hover:text-mundial-blue">
            Funciones
          </a>
          <a href="#ranking" className="transition hover:text-mundial-blue">
            Ranking
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-black text-mundial-navy transition hover:bg-mundial-blueSoft sm:inline-flex"
          >
            Ingresar
          </a>

          <a
            href="/registro"
            className="rounded-xl bg-mundial-green px-4 py-2 text-sm font-black text-white shadow-mundialGreen transition hover:bg-mundial-greenLight"
          >
            Crear cuenta
          </a>
        </div>
      </div>
    </header>
  );
}