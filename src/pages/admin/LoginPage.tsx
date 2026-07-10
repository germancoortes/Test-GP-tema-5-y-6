import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export function LoginPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    const from = (location.state as { from?: string })?.from ?? '/admin';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/admin', { replace: true });
    } catch {
      setError('Email o contraseña incorrectos.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-teal-500 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <span className="text-4xl" aria-hidden="true">
            🏊
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-navy-900">
            Acceso instructores
          </h1>
          <p className="text-sm text-navy-900/70">
            Escuela de Natación · La Loma de Santi Petri
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block font-bold">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 focus:border-teal-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block font-bold">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 focus:border-teal-500"
            />
          </div>
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Entrar
          </Button>
        </form>

        <Link
          to="/"
          className="mt-6 block text-center text-sm font-bold text-teal-600"
        >
          ← Volver a la web pública
        </Link>
      </div>
    </div>
  );
}
