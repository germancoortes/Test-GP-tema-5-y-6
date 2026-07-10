import { useState, type FormEvent } from 'react';
import type { SwimSession } from '../../types/database';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export interface SessionFormValues {
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

export function SessionForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
}: {
  initial?: Partial<SwimSession>;
  onSubmit: (values: SessionFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [date, setDate] = useState(initial?.date ?? '');
  const [startTime, setStartTime] = useState(
    initial?.start_time?.slice(0, 5) ?? '11:00',
  );
  const [endTime, setEndTime] = useState(
    initial?.end_time?.slice(0, 5) ?? '12:00',
  );
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 10));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Indica una fecha.');
      return;
    }
    const cap = Number(capacity);
    if (!Number.isInteger(cap) || cap <= 0) {
      setError('El aforo debe ser un número entero mayor que 0.');
      return;
    }
    if (startTime >= endTime) {
      setError('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        date,
        start_time: startTime,
        end_time: endTime,
        capacity: cap,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar la sesión.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border-2 border-teal-200 bg-white p-4"
    >
      {error && <Alert variant="error">{error}</Alert>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="date" className="mb-1 block text-sm font-bold">
            Fecha
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border-2 border-teal-200 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="start_time" className="mb-1 block text-sm font-bold">
            Inicio
          </label>
          <input
            id="start_time"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-xl border-2 border-teal-200 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="mb-1 block text-sm font-bold">
            Fin
          </label>
          <input
            id="end_time"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-xl border-2 border-teal-200 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="capacity" className="mb-1 block text-sm font-bold">
            Aforo
          </label>
          <input
            id="capacity"
            type="number"
            min={1}
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full rounded-xl border-2 border-teal-200 px-3 py-2"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
