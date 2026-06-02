import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export function TermsPage() {
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mundial-green text-mundial-dark">
              <FileText size={30} />
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
                Legal
              </p>
              <h1 className="text-3xl font-black">
                Términos y Condiciones de Uso
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Última actualización: 2026
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-7 text-slate-200">
            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                1. Objeto de la plataforma
              </h2>
              <p>
                Prode Mundial es una plataforma digital de entretenimiento que
                permite participar en grupos de pronósticos deportivos vinculados
                al Mundial 2026. Los usuarios pueden crear grupos, unirse
                mediante códigos de invitación, cargar predicciones, consultar
                resultados, rankings y estadísticas.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                2. Naturaleza del servicio
              </h2>
              <p>
                La plataforma tiene fines recreativos, sociales y estadísticos.
                No constituye una plataforma de apuestas, juego de azar,
                intermediación financiera ni sistema de premios monetarios
                garantizados.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                3. Registro de usuarios
              </h2>
              <p>
                Para utilizar funcionalidades privadas, el usuario deberá crear
                una cuenta con datos veraces y actualizados. El usuario es
                responsable de mantener la confidencialidad de sus credenciales.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                4. Aceptación de términos
              </h2>
              <p>
                Al crear una cuenta, el usuario deberá aceptar expresamente estos
                términos. La plataforma podrá registrar la fecha, hora y versión
                de los términos aceptados.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                5. Predicciones y puntajes
              </h2>
              <p>
                Las predicciones deberán cargarse antes del cierre establecido
                para cada partido. Una vez vencido el plazo o cerrado el partido,
                el usuario no podrá crear ni modificar su pronóstico.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                6. Resultados oficiales
              </h2>
              <p>
                Los resultados serán cargados por usuarios con permisos
                administrativos. En caso de errores, el administrador podrá
                corregir resultados y recalcular puntajes.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                7. Conducta del usuario
              </h2>
              <p>
                El usuario se compromete a utilizar la plataforma de manera
                lícita, respetuosa y responsable. Queda prohibido intentar
                manipular resultados, acceder a cuentas ajenas o usar la
                plataforma para actividades no autorizadas.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                8. Disponibilidad
              </h2>
              <p>
                La plataforma podrá encontrarse temporalmente fuera de servicio
                por mantenimiento, actualizaciones, fallas técnicas o causas
                externas.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                9. Protección de datos
              </h2>
              <p>
                Los datos serán utilizados para autenticación, participación en
                grupos, cálculo de rankings, estadísticas y funcionamiento general
                del sistema.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-black text-white">
                10. Modificaciones
              </h2>
              <p>
                El administrador podrá modificar estos términos cuando lo
                considere necesario. El uso continuado del sistema implicará la
                aceptación de las condiciones vigentes.
              </p>
            </section>
          </div>

          <div className="mt-8 rounded-2xl border border-mundial-red/20 bg-mundial-red/10 p-4 text-sm font-semibold text-red-50">
            Al registrarse, el usuario declara haber leído y aceptado estos
            Términos y Condiciones de Uso.
          </div>
        </div>
      </div>
    </div>
  );
}