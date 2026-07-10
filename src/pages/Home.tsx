import { WaveDivider } from '../components/public/WaveDivider';
import { SessionList } from '../components/public/SessionList';

export function Home() {
  return (
    <div>
      <section className="bg-gradient-to-b from-teal-500 to-teal-600 text-white">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 text-center sm:pt-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-bold">
            🏊‍♀️ Clases de natación infantil
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Escuela de Natación
            <br />
            <span className="text-sun-400">La Loma de Santi Petri</span>
          </h1>
          <p className="mt-4 text-lg text-teal-50">
            Piscina comunitaria · Chiclana de la Frontera
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl">🕚</p>
              <p className="mt-1 font-bold">11:00 - 12:00h</p>
              <p className="text-sm text-teal-50">Horario de clase</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl">💶</p>
              <p className="mt-1 font-bold">9€ / clase</p>
              <p className="text-sm text-teal-50">Clase suelta</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl">🎟️</p>
              <p className="mt-1 font-bold">Bono 5x40€</p>
              <p className="text-sm text-teal-50">Ahorra reservando bono</p>
            </div>
          </div>

          <p className="mt-6 text-teal-50">
            Instructores: <span className="font-bold text-white">German</span>{' '}
            y <span className="font-bold text-white">Ainoa</span> · Máximo 10
            niños/as por sesión
          </p>
        </div>
      </section>

      <WaveDivider />

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="mb-1 text-center font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          Próximas clases disponibles
        </h2>
        <p className="mb-6 text-center text-navy-900/70">
          Elige una fecha y reserva la plaza de tu peque en menos de un
          minuto.
        </p>
        <SessionList />
      </section>
    </div>
  );
}
