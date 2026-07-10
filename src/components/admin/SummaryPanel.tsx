import { format, getISOWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SwimSessionWithCount } from '../../types/database';
import { capitalize } from '../../lib/dates';

interface Group {
  label: string;
  total: number;
  sessions: number;
}

function groupBy(
  sessions: SwimSessionWithCount[],
  keyFn: (s: SwimSessionWithCount) => string,
  labelFn: (s: SwimSessionWithCount) => string,
): Group[] {
  const map = new Map<string, Group>();
  for (const s of sessions) {
    const key = keyFn(s);
    const existing = map.get(key);
    if (existing) {
      existing.total += s.booked_count;
      existing.sessions += 1;
    } else {
      map.set(key, {
        label: labelFn(s),
        total: s.booked_count,
        sessions: 1,
      });
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, group]) => group);
}

export function SummaryPanel({
  sessions,
}: {
  sessions: SwimSessionWithCount[];
}) {
  const byMonth = groupBy(
    sessions,
    (s) => s.date.slice(0, 7),
    (s) => capitalize(format(parseISO(s.date), 'MMMM yyyy', { locale: es })),
  );

  const byWeek = groupBy(
    sessions,
    (s) => `${parseISO(s.date).getFullYear()}-W${getISOWeek(parseISO(s.date))}`,
    (s) => `Semana ${getISOWeek(parseISO(s.date))} · ${parseISO(s.date).getFullYear()}`,
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border-2 border-teal-100 bg-white p-4">
        <h3 className="mb-3 font-display text-lg font-bold text-navy-900">
          Niños inscritos por mes
        </h3>
        <ul className="space-y-2 text-sm">
          {byMonth.map((g) => (
            <li key={g.label} className="flex justify-between">
              <span>{g.label}</span>
              <span className="font-bold text-teal-600">
                {g.total} niños · {g.sessions} clases
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border-2 border-teal-100 bg-white p-4">
        <h3 className="mb-3 font-display text-lg font-bold text-navy-900">
          Niños inscritos por semana
        </h3>
        <ul className="space-y-2 text-sm">
          {byWeek.map((g) => (
            <li key={g.label} className="flex justify-between">
              <span>{g.label}</span>
              <span className="font-bold text-teal-600">
                {g.total} niños · {g.sessions} clases
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
