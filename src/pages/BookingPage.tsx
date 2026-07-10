import { Link, useParams } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchSessionById } from '../lib/api';
import { Spinner } from '../components/common/Spinner';
import { Alert } from '../components/common/Alert';
import { BookingForm } from '../components/public/BookingForm';
import { CapacityBar } from '../components/public/CapacityBar';
import { capitalize, formatSessionDate, formatTimeRange } from '../lib/dates';

export function BookingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    data: session,
    loading,
    error,
  } = useAsyncData(() => fetchSessionById(sessionId!), [sessionId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link to="/" className="mb-6 inline-block font-bold text-teal-600">
        ← Volver a las clases
      </Link>

      <h1 className="mb-6 font-display text-3xl font-bold text-navy-900">
        Reservar plaza
      </h1>

      {loading && <Spinner label="Cargando datos de la clase…" />}

      {!loading && error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && !session && (
        <Alert variant="warning" title="Clase no encontrada">
          Esta sesión ya no existe o el enlace no es correcto.
        </Alert>
      )}

      {!loading && !error && session && (
        <>
          <div className="mb-6 rounded-3xl border-2 border-teal-100 bg-white p-5">
            <p className="font-display text-xl font-bold text-navy-900">
              {capitalize(formatSessionDate(session.date))}
            </p>
            <p className="text-navy-900/70">
              🕒 {formatTimeRange(session.start_time, session.end_time)}
            </p>
            <div className="mt-3">
              <CapacityBar
                booked={session.booked_count}
                capacity={session.capacity}
              />
            </div>
          </div>

          <BookingForm session={session} />
        </>
      )}
    </div>
  );
}
