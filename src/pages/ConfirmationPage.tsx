import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { cancelBookingByToken, getBookingByToken } from '../lib/api';
import { Spinner } from '../components/common/Spinner';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';
import { capitalize, formatSessionDate, formatTimeRange } from '../lib/dates';

export function ConfirmationPage() {
  const { token } = useParams<{ token: string }>();
  const { data: booking, loading, error } = useAsyncData(
    () => getBookingByToken(token!),
    [token],
  );
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleCancel() {
    if (!token) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const ok = await cancelBookingByToken(token);
      if (ok) setCancelled(true);
      else setCancelError('Esta reserva ya no existe o ya fue cancelada.');
    } catch {
      setCancelError('No hemos podido cancelar la reserva. Inténtalo de nuevo.');
    } finally {
      setCancelling(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link to="/" className="mb-6 inline-block font-bold text-teal-600">
        ← Volver a las clases
      </Link>

      {loading && <Spinner label="Buscando tu reserva…" />}

      {!loading && error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && !booking && !cancelled && (
        <Alert variant="warning" title="Reserva no encontrada">
          Comprueba que el enlace sea correcto. Si crees que es un error,
          contacta con tus instructores.
        </Alert>
      )}

      {cancelled && (
        <Alert variant="success" title="Reserva cancelada">
          La plaza ha quedado libre para otra familia. ¡Gracias por avisar!
        </Alert>
      )}

      {!loading && !error && booking && !cancelled && (
        <div className="rounded-3xl border-2 border-teal-100 bg-white p-6">
          <div className="mb-4 text-center">
            <span className="text-4xl" aria-hidden="true">
              🎉
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold text-navy-900">
              ¡Reserva confirmada!
            </h1>
          </div>

          <dl className="space-y-2 text-navy-900">
            <div className="flex justify-between border-b border-teal-50 pb-2">
              <dt className="font-semibold">Niño/a</dt>
              <dd>
                {booking.child_name} ({booking.child_age} años)
              </dd>
            </div>
            <div className="flex justify-between border-b border-teal-50 pb-2">
              <dt className="font-semibold">Adulto responsable</dt>
              <dd>{booking.guardian_name}</dd>
            </div>
            <div className="flex justify-between border-b border-teal-50 pb-2">
              <dt className="font-semibold">Fecha</dt>
              <dd>{capitalize(formatSessionDate(booking.session_date))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold">Hora</dt>
              <dd>
                {formatTimeRange(
                  booking.session_start_time,
                  booking.session_end_time,
                )}
              </dd>
            </div>
          </dl>

          <Alert variant="info" title="Guarda este enlace">
            Esta página es tu código de reserva. Guárdala (o añádela a
            favoritos) para poder cancelar la plaza si finalmente no podéis
            venir.
          </Alert>

          {cancelError && (
            <div className="mt-4">
              <Alert variant="error">{cancelError}</Alert>
            </div>
          )}

          <div className="mt-6">
            {!confirmOpen ? (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setConfirmOpen(true)}
              >
                Cancelar mi reserva
              </Button>
            ) : (
              <div className="rounded-2xl border-2 border-red-200 p-4">
                <p className="mb-3 font-semibold text-navy-900">
                  ¿Seguro que quieres cancelar la plaza de {booking.child_name}
                  ?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    loading={cancelling}
                    onClick={handleCancel}
                  >
                    Sí, cancelar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmOpen(false)}
                    disabled={cancelling}
                  >
                    Volver
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
