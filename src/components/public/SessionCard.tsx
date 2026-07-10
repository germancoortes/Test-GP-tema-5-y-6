import { Link } from 'react-router-dom';
import type { SwimSessionWithCount } from '../../types/database';
import { capitalize, formatSessionDate, formatTimeRange } from '../../lib/dates';
import { CapacityBar } from './CapacityBar';
import { Button } from '../common/Button';

export function SessionCard({ session }: { session: SwimSessionWithCount }) {
  const isFull = session.booked_count >= session.capacity;

  return (
    <li
      className={`flex flex-col gap-3 rounded-3xl border-2 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
        isFull ? 'border-red-200 opacity-80' : 'border-teal-100'
      }`}
    >
      <div className="flex-1">
        <p className="font-display text-xl font-bold text-navy-900">
          {capitalize(formatSessionDate(session.date))}
        </p>
        <p className="text-navy-900/70">
          🕒 {formatTimeRange(session.start_time, session.end_time)}
        </p>
        <div className="mt-3 max-w-xs">
          <CapacityBar
            booked={session.booked_count}
            capacity={session.capacity}
          />
        </div>
      </div>

      {isFull ? (
        <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-6 py-3 text-center font-bold text-red-700">
          Sesión completa
        </span>
      ) : (
        <Link to={`/reservar/${session.id}`} className="sm:ml-4">
          <Button variant="primary" className="w-full sm:w-auto">
            Reservar plaza
          </Button>
        </Link>
      )}
    </li>
  );
}
