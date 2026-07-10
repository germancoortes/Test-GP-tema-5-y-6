import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SwimSessionWithCount } from '../../types/database';
import { ApiError, createBooking } from '../../lib/api';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

interface FormErrors {
  child_name?: string;
  guardian_name?: string;
  phone?: string;
  child_age?: string;
  email?: string;
}

export function BookingForm({ session }: { session: SwimSessionWithCount }) {
  const navigate = useNavigate();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isFull = session.booked_count >= session.capacity;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!childName.trim()) next.child_name = 'Indica el nombre del niño/a.';
    if (!guardianName.trim())
      next.guardian_name = 'Indica el nombre del adulto responsable.';
    if (!phone.trim()) next.phone = 'Indica un teléfono de contacto.';
    else if (!/^[+\d][\d\s-]{5,}$/.test(phone.trim()))
      next.phone = 'Introduce un teléfono válido.';

    if (childAge.trim()) {
      const age = Number(childAge);
      if (!Number.isInteger(age) || age < 0 || age > 17) {
        next.child_age = 'La edad debe estar entre 0 y 17 años.';
      }
    } else {
      next.child_age = 'Indica la edad del niño/a.';
    }

    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = 'Introduce un email válido o deja el campo vacío.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const booking = await createBooking({
        session_id: session.id,
        child_name: childName,
        child_age: Number(childAge),
        guardian_name: guardianName,
        phone,
        email: email.trim() || null,
      });
      navigate(`/confirmacion/${booking.cancel_token}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'No hemos podido completar la reserva. Inténtalo de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isFull) {
    return (
      <Alert variant="warning" title="Sesión completa">
        Esta clase ha alcanzado el aforo máximo. Elige otra fecha disponible.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {submitError && <Alert variant="error">{submitError}</Alert>}

      <div>
        <label htmlFor="child_name" className="mb-1 block font-bold">
          Nombre del niño/a <span aria-hidden="true">*</span>
        </label>
        <input
          id="child_name"
          type="text"
          required
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          aria-invalid={Boolean(errors.child_name)}
          aria-describedby={errors.child_name ? 'child_name-error' : undefined}
          className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 focus:border-teal-500"
        />
        {errors.child_name && (
          <p id="child_name-error" className="mt-1 text-sm text-red-700">
            {errors.child_name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="child_age" className="mb-1 block font-bold">
          Edad del niño/a <span aria-hidden="true">*</span>
        </label>
        <input
          id="child_age"
          type="number"
          min={0}
          max={17}
          required
          value={childAge}
          onChange={(e) => setChildAge(e.target.value)}
          aria-invalid={Boolean(errors.child_age)}
          aria-describedby={errors.child_age ? 'child_age-error' : undefined}
          className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 focus:border-teal-500"
        />
        {errors.child_age && (
          <p id="child_age-error" className="mt-1 text-sm text-red-700">
            {errors.child_age}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="guardian_name" className="mb-1 block font-bold">
          Nombre del adulto responsable <span aria-hidden="true">*</span>
        </label>
        <input
          id="guardian_name"
          type="text"
          required
          value={guardianName}
          onChange={(e) => setGuardianName(e.target.value)}
          aria-invalid={Boolean(errors.guardian_name)}
          aria-describedby={
            errors.guardian_name ? 'guardian_name-error' : undefined
          }
          className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 focus:border-teal-500"
        />
        {errors.guardian_name && (
          <p id="guardian_name-error" className="mt-1 text-sm text-red-700">
            {errors.guardian_name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block font-bold">
          Teléfono de contacto <span aria-hidden="true">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 focus:border-teal-500"
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 text-sm text-red-700">
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block font-bold">
          Email <span className="font-normal text-navy-900/60">(opcional)</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 focus:border-teal-500"
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-700">
            {errors.email}
          </p>
        )}
      </div>

      <Button type="submit" loading={submitting} className="mt-2 w-full">
        Confirmar reserva
      </Button>
    </form>
  );
}
