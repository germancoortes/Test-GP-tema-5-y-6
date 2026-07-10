import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchUpcomingSessions } from '../../lib/api';
import { Spinner } from '../common/Spinner';
import { Alert } from '../common/Alert';
import { EmptyState } from '../common/EmptyState';
import { SessionCard } from './SessionCard';

export function SessionList() {
  const {
    data: sessions,
    loading,
    error,
    reload,
  } = useAsyncData(fetchUpcomingSessions);

  if (loading) return <Spinner label="Cargando próximas clases…" />;

  if (error) {
    return (
      <Alert variant="error" title="No hemos podido cargar las clases">
        <p>{error}</p>
        <button
          onClick={reload}
          className="mt-2 font-bold underline hover:no-underline"
        >
          Reintentar
        </button>
      </Alert>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState icon="📅" title="No hay clases programadas todavía">
        Vuelve a consultar pronto o pregunta a tus instructores German y
        Ainoa.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </ul>
  );
}
