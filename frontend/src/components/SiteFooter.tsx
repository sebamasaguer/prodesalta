export function SiteFooter() {
  return (
    <footer className="border-t border-mundial-line bg-mundial-navy">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-7 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
        <p className="text-sm font-semibold text-white/80">
          © {new Date().getFullYear()} Prode Mundial. Todos los derechos reservados.
        </p>

        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-bold text-white/80">
            Desarrollado por
          </span>

          <img
            src="/saltia-logo.png"
            alt="SaltIA"
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>
    </footer>
  );
}