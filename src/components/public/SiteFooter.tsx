import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 py-8 text-center text-teal-100">
      <div className="mx-auto max-w-3xl px-4">
        <p className="font-display text-lg font-bold text-white">
          🏊 Escuela de Natación · La Loma de Santi Petri
        </p>
        <p className="mt-1 text-sm">
          Piscina comunitaria · Chiclana de la Frontera
        </p>
        <p className="mt-1 text-sm">Instructores: German y Ainoa</p>
        <Link
          to="/admin/login"
          className="mt-4 inline-block text-xs text-teal-100/60 underline hover:text-teal-100"
        >
          Acceso instructores
        </Link>
      </div>
    </footer>
  );
}
