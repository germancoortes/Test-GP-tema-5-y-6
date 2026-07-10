import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  deleteBooking,
  fetchBookingsForSession,
  fetchSessionById,
} from '../../lib/api';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { bookingsToCsv, downloadCsv } from '../../lib/csv';
import { capitalize, formatSessionDate, formatTimeRange } from '../../lib/dates';
import type { Booking } from '../../types/database';

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    data: session,
    loading: loadingSession,
    error: sessionError,
  } = useAsyncData(() => fetchSessionById(sessionId!), [sessionId]);

  const {
    data: bookings,
    loading: loadingBookings,
    error: bookingsError,
    reload,
  } = useAsyncData(() => fetchBookingsForSession(sessionId!), [sessionId]);

  const [pendingDelete, setPendingDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteBooking(pendingDelete.id);
      setPendingDelete(null);
      reload();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'No se pudo eliminar la reserva.',
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    if (!bookings || bookings.length === 0) return;
    const csv = bookingsToCsv(bookings);
    const dateLabel = session?.date ?? sessionId;
    downloadCsv(`inscritos-${dateLabel}.csv`, csv);
  }

  const loading = loadingSession || loadingBookings;
  const error = sessionError || bookingsError;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin" className="font-bold text-teal-600">
        ← Volver a sesiones
      </Link>

      {loading && <Spinner label="Cargando inscritos…" />}
      {!loading && error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && session && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900">
              {capitalize(formatSessionDate(session.date))}
            </h1>
            <p className="text-navy-900/70">
              {formatTimeRange(session.start_time, session.end_time)} ·{' '}
              {session.booked_count}/{session.capacity} plazas ocupadas
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={!bookings || bookings.length === 0}
          >
            ⬇️ Exportar CSV
          </Button>
        </div>
      )}

      {!loading && !error && bookings && bookings.length === 0 && (
        <EmptyState icon="🧒" title="Todavía no hay inscritos en esta sesión">
          En cuanto una familia reserve, aparecerá aquí.
        </EmptyState>
      )}

      {!loading && !error && bookings && bookings.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border-2 border-teal-100 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-teal-50 text-navy-900">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Niño/a
                </th>
                <th scope="col" className="px-4 py-3">
                  Edad
                </th>
                <th scope="col" className="px-4 py-3">
                  Adulto responsable
                </th>
                <th scope="col" className="px-4 py-3">
                  Teléfono
                </th>
                <th scope="col" className="px-4 py-3">
                  Email
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-teal-50">
                  <td className="px-4 py-3 font-semibold">{b.child_name}</td>
                  <td className="px-4 py-3">{b.child_age}</td>
                  <td className="px-4 py-3">{b.guardian_name}</td>
                  <td className="px-4 py-3">{b.phone}</td>
                  <td className="px-4 py-3">{b.email ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="danger"
                      className="!px-3 !py-1.5 text-xs"
                      onClick={() => setPendingDelete(b)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-navy-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-booking-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2
              id="delete-booking-title"
              className="mb-2 font-display text-lg font-bold text-navy-900"
            >
              Eliminar reserva
            </h2>
            <p className="mb-4 text-navy-900/80">
              ¿Seguro que quieres eliminar la reserva de{' '}
              <strong>{pendingDelete.child_name}</strong>? La plaza quedará
              libre.
            </p>
            {actionError && (
              <div className="mb-3">
                <Alert variant="error">{actionError}</Alert>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="danger" loading={deleting} onClick={handleDelete}>
                Sí, eliminar
              </Button>
              <Button
                variant="ghost"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
