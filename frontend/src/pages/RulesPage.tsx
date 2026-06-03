import { Link } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";

export function RulesPage() {
  return (
    <div className="min-h-screen bg-mundial-dark px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:p-10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mundial-red text-mundial-dark">
              <Trophy size={30} />
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-red-100">
                Prode Mundial
              </p>
              <h1 className="text-3xl font-black">
                Reglamento del Prode Mundial
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Visible sin iniciar sesión
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-7 text-slate-200">
            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                1. Participación
              </h2>
              <p>
                Para participar, el usuario debe registrarse, aceptar los
                Términos y Condiciones y formar parte de al menos un grupo de
                Prode.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                2. Carga de predicciones
              </h2>
              <p>
                Cada participante podrá cargar una predicción por partido dentro
                de cada grupo al que pertenezca. La predicción consiste en
                indicar el resultado estimado del partido.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                3. Cierre de predicciones
              </h2>
              <p>
                Cada partido tiene una fecha y hora de cierre. Una vez vencido
                ese plazo, no se podrán crear ni modificar pronósticos.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                4. Sistema de puntaje estándar
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-mundial-dark/70 p-4">
                  <p className="text-sm text-slate-300">Resultado exacto</p>
                  <p className="text-3xl font-black text-red-100">5 pts</p>
                </div>

                <div className="rounded-2xl bg-mundial-dark/70 p-4">
                  <p className="text-sm text-slate-300">Ganador o empate</p>
                  <p className="text-3xl font-black text-mundial-greenSoft">3 pts</p>
                </div>

                <div className="rounded-2xl bg-mundial-dark/70 p-4">
                  <p className="text-sm text-slate-300">Diferencia de gol</p>
                  <p className="text-3xl font-black text-blue-300">2 pts</p>
                </div>

                <div className="rounded-2xl bg-mundial-dark/70 p-4">
                  <p className="text-sm text-slate-300">Sin acierto</p>
                  <p className="text-3xl font-black">0 pts</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                5. Ejemplo
              </h2>
              <p>
                Resultado oficial: Argentina 2 - 1 Francia.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  Predicción Argentina 2 - 1 Francia: 5 puntos por resultado
                  exacto.
                </li>
                <li>
                  Predicción Argentina 1 - 0 Francia: 3 puntos por acertar
                  ganador.
                </li>
                <li>
                  Predicción Argentina 3 - 2 Francia: 2 puntos por acertar
                  diferencia de gol.
                </li>
                <li>
                  Predicción Argentina 1 - 1 Francia: 0 puntos por no acertar
                  ganador, empate ni diferencia de gol.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                6. Ranking por grupo
              </h2>
              <p>
                Cada grupo tendrá su propio ranking. El ranking se ordenará por
                puntos, resultados exactos, ganadores acertados, diferencias de
                gol y cantidad de predicciones.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                7. Corrección de resultados
              </h2>
              <p>
                Si se detecta un resultado mal cargado, el administrador podrá
                corregirlo y recalcular los puntos.
              </p>
            </section>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/registro"
              className="rounded-2xl bg-mundial-green px-5 py-3 text-center font-black text-mundial-dark hover:bg-mundial-greenLight"
            >
              Crear cuenta
            </Link>

            <Link
              to="/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center font-black text-white hover:bg-white/10"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}