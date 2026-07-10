import { Link } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header className="bg-teal-500 text-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-lg font-bold tracking-wide sm:text-xl"
        >
          <span aria-hidden="true" className="text-2xl">
            🌊
          </span>
          Escuela de Natación
        </Link>
      </div>
    </header>
  );
}
