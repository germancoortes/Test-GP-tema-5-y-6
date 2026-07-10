import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export function AdminLayout() {
  const { signOut, session } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-teal-50">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="font-display text-lg font-bold">
              🏊 Panel de instructores
            </p>
            <p className="text-xs text-teal-100/70">{session?.user.email}</p>
          </div>
          <nav className="flex items-center gap-4 text-sm font-bold">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive ? 'text-sun-400' : 'text-white hover:text-sun-400'
              }
            >
              Sesiones
            </NavLink>
            <Button variant="ghost" onClick={handleLogout} className="!py-2">
              Salir
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
