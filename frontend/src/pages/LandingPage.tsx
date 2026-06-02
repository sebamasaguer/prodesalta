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
    <div className="min-h-screen bg-mundial-light text-mundial-text">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-mundial-hero">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent" />
          <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-mundial-sky/20 blur-3xl" />
          <div className="absolute -right-20 top-24 h-80 w-80 rounded-full bg-mundial-gold/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-mundial-green/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.03fr_0.97fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-mundial-line bg-white px-4 py-2 text-sm font-black text-mundial-navy shadow-mundial">
                <Sparkles size={16} className="text-mundial-gold" />
                Prode online · Mundial FIFA 2026
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-mundial-navy sm:text-5xl lg:text-7xl">
                Jugá el Prode del Mundial solo o con tu grupo.
              </h1>

              <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-mundial-muted sm:text-lg">
                Creá tu cuenta y empezá a cargar predicciones en modo
                individual, sin necesidad de crear grupo. Si querés competir con
                otras personas, también podés crear grupos, invitar
                participantes y seguir rankings privados en tiempo real.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-red px-6 py-4 text-base font-black text-white shadow-mundialRed transition hover:bg-mundial-redLight"
                >
                  Crear cuenta
                  <ArrowRight size={20} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-mundial-navy px-6 py-4 text-base font-black text-white shadow-mundialDark transition hover:bg-mundial-blue"
                >
                  Ingresar
                </Link>

                <Link
                  to="/reglamento"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-mundial-gold bg-mundial-gold px-6 py-4 text-base font-black text-mundial-navy shadow-mundialGold transition hover:bg-mundial-goldSoft"
                >
                  Ver reglamento
                  <FileText size={20} />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm font-black text-mundial-navy">
                <Link to="/reglamento" className="hover:text-mundial-blue">
                  Reglamento del Prode
                </Link>

                <span className="text-mundial-muted">•</span>

                <Link to="/terminos" className="hover:text-mundial-blue">
                  Términos y condiciones
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm font-black text-mundial-navy sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-2xl border border-mundial-line bg-white px-3 py-2 shadow-sm">
                  <CheckCircle2 className="text-mundial-green" size={18} />
                  Modo individual
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-mundial-line bg-white px-3 py-2 shadow-sm">
                  <CheckCircle2 className="text-mundial-blue" size={18} />
                  Grupos privados
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-mundial-line bg-white px-3 py-2 shadow-sm">
                  <CheckCircle2 className="text-mundial-red" size={18} />
                  Ranking automático
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-mundial-blue/20 via-mundial-gold/25 to-mundial-green/20 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white bg-white/80 p-3 shadow-mundial backdrop-blur sm:p-4">
                <div className="overflow-hidden rounded-[1.5rem] border border-mundial-line bg-white text-mundial-text shadow-mundial">
                  <div className="bg-mundial-stadium p-5 text-white">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-mundial-gold">
                          Modalidad disponible
                        </p>
                        <h2 className="text-xl font-black sm:text-2xl">
                          Individual o por grupo
                        </h2>
                      </div>

                      <div className="rounded-2xl bg-white px-3 py-2 text-xs font-black text-mundial-navy shadow-lg sm:text-sm">
                        MUNDIAL 2026
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
                        <p className="text-sm font-bold text-white/75">
                          Próximo partido
                        </p>
                        <p className="mt-2 text-lg font-black sm:text-xl">
                          Argentina vs Francia
                        </p>
                        <p className="mt-1 text-sm font-black text-mundial-gold">
                          Cierra en 2h 15m
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
                        <p className="text-sm font-bold text-white/75">Tu predicción</p>
                        <p className="mt-2 text-3xl font-black text-mundial-gold">2 - 1</p>
                        <p className="mt-1 text-sm font-semibold text-white/70">
                          Editable hasta el cierre
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-mundial-green/20 bg-mundial-greenSoft p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-mundial-green text-white">
                          <User size={22} />
                        </div>

                        <p className="text-sm font-bold text-mundial-muted">Modo individual</p>
                        <p className="mt-1 text-lg font-black text-mundial-navy">
                          Jugá solo con tu usuario
                        </p>
                      </div>

                      <div className="rounded-2xl border border-mundial-blue/20 bg-mundial-blueSoft p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-mundial-blue text-white">
                          <Users size={22} />
                        </div>

                        <p className="text-sm font-bold text-mundial-muted">Modo grupo</p>
                        <p className="mt-1 text-lg font-black text-mundial-navy">
                          Invitá y competí
                        </p>
                      </div>
                    </div>

                    <div
                      id="ranking"
                      className="rounded-2xl border border-mundial-navy/10 bg-mundial-navy p-4 text-white shadow-mundialDark"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-black">Ranking del grupo</h3>
                        <span className="rounded-full bg-mundial-green px-3 py-1 text-xs font-black text-white">
                          En vivo
                        </span>
                      </div>

                      <div className="space-y-3">
                        {demoRanking.map((item) => (
                          <div
                            key={item.pos}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mundial-gold font-black text-mundial-navy">
                                {item.pos}
                              </div>

                              <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs text-white/70">
                                  Exactos: {item.exact}
                                </p>
                              </div>
                            </div>

                            <p className="text-lg font-black text-mundial-gold">
                              {item.points} pts
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-mundial-redSoft p-4">
                        <p className="text-sm font-bold text-mundial-muted">Exacto</p>
                        <p className="text-2xl font-black text-mundial-red">
                          5 pts
                        </p>
                      </div>

                      <div className="rounded-2xl bg-mundial-greenSoft p-4">
                        <p className="text-sm font-bold text-mundial-muted">Ganador</p>
                        <p className="text-2xl font-black text-mundial-green">
                          3 pts
                        </p>
                      </div>

                      <div className="rounded-2xl bg-mundial-goldSoft p-4">
                        <p className="text-sm font-bold text-mundial-muted">Diferencia</p>
                        <p className="text-2xl font-black text-mundial-navy">
                          2 pts
                        </p>
                      </div>
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
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-mundial-green">
              Cómo funciona
            </p>

            <h2 className="text-3xl font-black tracking-tight text-mundial-navy sm:text-4xl">
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
            ].map(([number, title, description], index) => {
              const tone = index === 0 ? "bg-mundial-blue" : index === 1 ? "bg-mundial-green" : index === 2 ? "bg-mundial-red" : "bg-mundial-gold text-mundial-navy";

              return (
                <div
                  key={number}
                  className="rounded-3xl border border-mundial-line bg-white p-6 shadow-mundial"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-white ${tone}`}>
                    {number}
                  </div>

                  <h3 className="text-xl font-black text-mundial-navy">{title}</h3>

                  <p className="mt-3 text-sm font-semibold leading-6 text-mundial-muted">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="modalidades"
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-mundial-green/20 bg-white p-6 shadow-mundial md:p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-mundial-green text-white">
                <User size={30} />
              </div>

              <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-green">
                Modo individual
              </p>

              <h2 className="mt-2 text-3xl font-black text-mundial-navy">
                No necesitás crear grupo para jugar.
              </h2>

              <p className="mt-3 text-sm font-semibold leading-6 text-mundial-muted">
                Apenas creás tu cuenta, el sistema te permite cargar
                predicciones en modo individual. Vas a poder ver tus puntos, tus
                estadísticas y tu posición en rankings generales.
              </p>

              <Link
                to="/registro"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 font-black text-white shadow-mundialGreen hover:bg-mundial-greenLight"
              >
                Empezar individual
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="rounded-[2rem] border border-mundial-blue/20 bg-mundial-navy p-6 text-white shadow-mundialDark md:p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-mundial-gold text-mundial-navy">
                <Users size={30} />
              </div>

              <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-gold">
                Modo grupo
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Creá grupos privados y competí con otros.
              </h2>

              <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
                Podés crear un grupo, compartir el código de invitación y tener
                un ranking exclusivo para tus participantes. Ideal para amigos,
                instituciones, empresas o comunidades.
              </p>

              <Link
                to="/registro"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-red px-5 py-3 font-black text-white shadow-mundialRed hover:bg-mundial-redLight"
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
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClass = index % 4 === 0 ? "bg-mundial-green" : index % 4 === 1 ? "bg-mundial-blue" : index % 4 === 2 ? "bg-mundial-red" : "bg-mundial-gold text-mundial-navy";

              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-mundial-line bg-white p-6 shadow-mundial transition hover:-translate-y-1"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${colorClass} text-white`}>
                    <Icon size={24} />
                  </div>

                  <h3 className="text-xl font-black text-mundial-navy">{feature.title}</h3>

                  <p className="mt-3 text-sm font-semibold leading-6 text-mundial-muted">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/20 bg-mundial-stadium p-6 text-white shadow-mundialDark md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-gold">
                  Reglamento público
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Consultá las reglas antes de registrarte.
                </h2>

                <p className="mt-3 text-sm font-semibold leading-6 text-white/80">
                  El reglamento está disponible sin iniciar sesión. Allí se
                  explica cómo se cargan las predicciones, cómo se cierran los
                  partidos, cómo se calculan los puntos y cómo se ordenan los
                  rankings individuales, grupales y generales.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Link
                  to="/reglamento"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-gold px-5 py-3 font-black text-mundial-navy shadow-mundialGold hover:bg-mundial-goldSoft"
                >
                  Ver reglamento
                  <FileText size={18} />
                </Link>

                <Link
                  to="/terminos"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-black text-white hover:bg-white/20"
                >
                  Términos y condiciones
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-mundial-line bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <h2 className="text-3xl font-black text-mundial-navy">
                Listo para empezar el Mundial.
              </h2>

              <p className="mt-2 font-semibold text-mundial-muted">
                Creá tu cuenta, aceptá los términos y empezá a competir en modo
                individual o con tu grupo.
              </p>
            </div>

            <Link
              to="/registro"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-green px-6 py-4 text-base font-black text-white shadow-mundialGreen transition hover:bg-mundial-greenLight"
            >
              Crear cuenta
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 pb-10 text-sm font-bold sm:px-6 lg:px-8">
            <Link to="/reglamento" className="text-mundial-blue hover:text-mundial-red">
              Reglamento
            </Link>

            <span className="text-mundial-muted">•</span>

            <Link to="/terminos" className="text-mundial-navy hover:text-mundial-red">
              Términos y condiciones
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
