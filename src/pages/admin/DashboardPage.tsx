import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  createSession,
  deleteSession,
  fetchAllSessions,
  updateSession,
} from '../../lib/api';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import {
  SessionForm,
  type SessionFormValues,
} from '../../components/admin/SessionForm';
import { SummaryPanel } from '../../components/admin/SummaryPanel';
import { capitalize, formatSessionDate, formatTimeRange } from '../../lib/dates';
import type { SwimSessionWithCount } from '../../types/database';

export function DashboardPage() {
  const {
    data: sessions,
    loading,
    error,
    reload,
  } = useAsyncData(fetchAllSessions);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SwimSessionWithCount | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCreate(values: SessionFormValues) {
    await createSession(values);
    setShowCreate(false);
    reload();
  }

  async function handleUpdate(id: string, values: SessionFormValues) {
    await updateSession(id, values);
    setEditingId(null);
    reload();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteSession(pendingDelete.id);
      setPendingDelete(null);
      reload();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'No se pudo eliminar la sesión.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-900">
          Sesiones de natación
        </h1>
        <Button onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Cerrar' : '+ Nueva sesión'}
        </Button>
      </div>

      {showCreate && (
        <SessionForm onSubmit={handleCreate} submitLabel="Crear sesión" />
      )}

      {loading && <Spinner label="Cargando sesiones…" />}
      {!loading && error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && sessions && sessions.length > 0 && (
        <SummaryPanel sessions={sessions} />
      )}

      {!loading && !error && (!sessions || sessions.length === 0) && (
        <EmptyState icon="📅" title="Todavía no hay sesiones creadas">
          Crea la primera clase con el botón "+ Nueva sesión".
        </EmptyState>
      )}

      {!loading && !error && sessions && sessions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) =>
            editingId === session.id ? (
              <li key={session.id}>
                <SessionForm
                  initial={session}
                  submitLabel="Guardar cambios"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(values) => handleUpdate(session.id, values)}
                />
              </li>
            ) : (
              <li
                key={session.id}
                className="flex flex-col gap-3 rounded-2xl border-2 border-teal-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display font-bold text-navy-900">
                    {capitalize(formatSessionDate(session.date))}
                  </p>
                  <p className="text-sm text-navy-900/70">
                    {formatTimeRange(session.start_time, session.end_time)} ·{' '}
                    {session.booked_count}/{session.capacity} inscritos
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/admin/sesiones/${session.id}`}>
                    <Button variant="secondary" className="!px-4 !py-2 text-sm">
                      Ver inscritos
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="!px-4 !py-2 text-sm"
                    onClick={() => setEditingId(session.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    className="!px-4 !py-2 text-sm"
                    onClick={() => setPendingDelete(session)}
                  >
                    Eliminar
                  </Button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-navy-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2
              id="delete-dialog-title"
              className="mb-2 font-display text-lg font-bold text-navy-900"
            >
              Eliminar sesión
            </h2>
            <p className="mb-4 text-navy-900/80">
              {pendingDelete.booked_count > 0 ? (
                <>
                  Esta sesión tiene{' '}
                  <strong>{pendingDelete.booked_count} niño/s inscritos</strong>
                  . Al eliminarla se borrarán también sus reservas. ¿Seguro que
                  quieres continuar?
                </>
              ) : (
                '¿Seguro que quieres eliminar esta sesión?'
              )}
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
