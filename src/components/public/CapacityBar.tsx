export function CapacityBar({
  booked,
  capacity,
}: {
  booked: number;
  capacity: number;
}) {
  const pct = Math.min(100, Math.round((booked / capacity) * 100));
  const isFull = booked >= capacity;
  const isAlmostFull = !isFull && pct >= 70;

  const barColor = isFull
    ? 'bg-red-500'
    : isAlmostFull
      ? 'bg-sun-500'
      : 'bg-teal-500';

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold text-navy-900">
        <span>
          {booked}/{capacity} plazas
        </span>
        <span>{isFull ? 'Completo' : `${capacity - booked} libres`}</span>
      </div>
      <div
        className="mt-1 h-3 w-full overflow-hidden rounded-full bg-teal-100"
        role="progressbar"
        aria-valuenow={booked}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-label={`${booked} de ${capacity} plazas ocupadas`}
      >
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
