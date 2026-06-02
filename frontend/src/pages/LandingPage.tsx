import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Shield,
  Sparkles,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";

const features = [
  {
    icon: User,
    title: "Modo individual",
    description:
      "Podés jugar solo con tu usuario, cargar predicciones y competir en ranking individual.",
  },
  {
    icon: Users,
    title: "Grupos privados",
    description:
      "También podés crear grupos para amigos, empresas, colegios, municipios o comunidades.",
  },
  {
    icon: CalendarDays,
    title: "Fixture dinámico",
    description:
      "Fixture completo del Mundial 2026, fechas, fases, partidos y resultados.",
  },
  {
    icon: Trophy,
    title: "Ranking automático",
    description:
      "El sistema calcula puntos y posiciones en tiempo real según las reglas.",
  },
  {
    icon: Shield,
    title: "Roles y seguridad",
    description:
      "Usuarios y administradores con permisos diferenciados para gestionar el sistema.",
  },
];

const demoRanking = [
  { pos: 1, name: "Dante", points: 48, exact: 6 },
  { pos: 2, name: "Lucas", points: 44, exact: 5 },
  { pos: 3, name: "Sofía", points: 39, exact: 4 },
  { pos: 4, name: "Martín", points: 37, exact: 3 },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(250,204,21,0.18),_transparent_32%)]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                <Sparkles size={16} />
                Prode online para el Mundial 2026
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
                Jugá el Prode del Mundial solo o con tu grupo.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Creá tu cuenta y empezá a cargar predicciones en modo
                individual, sin necesidad de crear grupo. Si querés competir con
                otras personas, también podés crear grupos, invitar
                participantes y seguir rankings privados en tiempo real.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-base font-black text-slate-950 shadow-xl shadow-emerald-400/20 transition hover:bg-emerald-300"
                >
                  Crear cuenta
                  <ArrowRight size={20} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-bold text-white transition hover:bg-white/10"
                >
                  Ingresar
                </Link>

                <Link
                  to="/reglamento"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-6 py-4 text-base font-black text-yellow-300 transition hover:bg-yellow-400/20"
                >
                  Ver reglamento
                  <FileText size={20} />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <Link
                  to="/reglamento"
                  className="font-bold text-yellow-300 hover:text-yellow-200"
                >
                  Reglamento del Prode
                </Link>

                <span className="text-slate-600">•</span>

                <Link
                  to="/terminos"
                  className="font-bold text-slate-300 hover:text-white"
                >
                  Términos y condiciones
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  Modo individual
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  Grupos privados
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  Ranking automático
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-emerald-400/20 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
                <div className="rounded-[1.5rem] bg-slate-950 p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">
                        Modalidad disponible
                      </p>
                      <h2 className="text-xl font-black sm:text-2xl">
                        Individual o por grupo
                      </h2>
                    </div>

                    <div className="rounded-2xl bg-yellow-400 px-3 py-2 text-xs font-black text-slate-950 sm:text-sm">
                      MUNDIAL 2026
                    </div>
                  </div>

                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">
                        Próximo partido
                      </p>
                      <p className="mt-2 text-lg font-black sm:text-xl">
                        Argentina vs Francia
                      </p>
                      <p className="mt-1 text-sm text-emerald-300">
                        Cierra en 2h 15m
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Tu predicción</p>
                      <p className="mt-2 text-3xl font-black">2 - 1</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Editable hasta el cierre
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
                        <User size={22} />
                      </div>

                      <p className="text-sm text-slate-400">Modo individual</p>
                      <p className="mt-1 text-lg font-black">
                        Jugá solo con tu usuario
                      </p>
                    </div>

                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-slate-950">
                        <Users size={22} />
                      </div>

                      <p className="text-sm text-slate-400">Modo grupo</p>
                      <p className="mt-1 text-lg font-black">
                        Invitá y competí
                      </p>
                    </div>
                  </div>

                  <div
                    id="ranking"
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-black">Ranking del grupo</h3>
                      <span className="text-sm font-semibold text-emerald-300">
                        En vivo
                      </span>
                    </div>

                    <div className="space-y-3">
                      {demoRanking.map((item) => (
                        <div
                          key={item.pos}
                          className="flex items-center justify-between rounded-xl bg-slate-900/80 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-black">
                              {item.pos}
                            </div>

                            <div>
                              <p className="font-bold">{item.name}</p>
                              <p className="text-xs text-slate-400">
                                Exactos: {item.exact}
                              </p>
                            </div>
                          </div>

                          <p className="text-lg font-black text-yellow-300">
                            {item.points} pts
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-emerald-400/10 p-4">
                      <p className="text-sm text-slate-400">Exacto</p>
                      <p className="text-2xl font-black text-yellow-300">
                        5 pts
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-400/10 p-4">
                      <p className="text-sm text-slate-400">Ganador</p>
                      <p className="text-2xl font-black text-emerald-300">
                        3 pts
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-400/10 p-4">
                      <p className="text-sm text-slate-400">Diferencia</p>
                      <p className="text-2xl font-black text-blue-300">
                        2 pts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
        >
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              Cómo funciona
            </p>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              En cuatro pasos empezás a jugar.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              [
                "1",
                "Registrate",
                "Creá tu usuario y aceptá los términos y el reglamento.",
              ],
              [
                "2",
                "Elegí modalidad",
                "Jugá individualmente o creá/unite a un grupo privado.",
              ],
              [
                "3",
                "Pronosticá",
                "Cargá resultados antes del cierre de cada partido.",
              ],
              [
                "4",
                "Competí",
                "Seguí el ranking individual, grupal y general en tiempo real.",
              ],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-black text-slate-950">
                  {number}
                </div>

                <h3 className="text-xl font-black">{title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="modalidades"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6 md:p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                <User size={30} />
              </div>

              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                Modo individual
              </p>

              <h2 className="mt-2 text-3xl font-black">
                No necesitás crear grupo para jugar.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Apenas creás tu cuenta, el sistema te permite cargar
                predicciones en modo individual. Vas a poder ver tus puntos, tus
                estadísticas y tu posición en rankings generales.
              </p>

              <Link
                to="/registro"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300"
              >
                Empezar individual
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="rounded-[2rem] border border-yellow-400/20 bg-yellow-400/10 p-6 md:p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
                <Users size={30} />
              </div>

              <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
                Modo grupo
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Creá grupos privados y competí con otros.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Podés crear un grupo, compartir el código de invitación y tener
                un ranking exclusivo para tus participantes. Ideal para amigos,
                instituciones, empresas o comunidades.
              </p>

              <Link
                to="/registro"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-slate-950 hover:bg-yellow-300"
              >
                Crear grupo
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section
          id="funciones"
          className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-xl font-black">{feature.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-yellow-400/20 bg-yellow-400/10 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
                  Reglamento público
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Consultá las reglas antes de registrarte.
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  El reglamento está disponible sin iniciar sesión. Allí se
                  explica cómo se cargan las predicciones, cómo se cierran los
                  partidos, cómo se calculan los puntos y cómo se ordenan los
                  rankings individuales, grupales y generales.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Link
                  to="/reglamento"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-slate-950 hover:bg-yellow-300"
                >
                  Ver reglamento
                  <FileText size={18} />
                </Link>

                <Link
                  to="/terminos"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white hover:bg-white/10"
                >
                  Términos y condiciones
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <h2 className="text-3xl font-black">
                Listo para empezar el Mundial.
              </h2>

              <p className="mt-2 text-slate-400">
                Creá tu cuenta, aceptá los términos y empezá a competir en modo
                individual o con tu grupo.
              </p>
            </div>

            <Link
              to="/registro"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-4 text-base font-black text-slate-950 transition hover:bg-yellow-300"
            >
              Crear cuenta
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 pb-10 text-sm sm:px-6 lg:px-8">
            <Link
              to="/reglamento"
              className="font-bold text-yellow-300 hover:text-yellow-200"
            >
              Reglamento
            </Link>

            <span className="text-slate-600">•</span>

            <Link
              to="/terminos"
              className="font-bold text-slate-300 hover:text-white"
            >
              Términos y condiciones
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}