import { Outlet } from 'react-router-dom';
import { SiteHeader } from '../components/public/SiteHeader';
import { SiteFooter } from '../components/public/SiteFooter';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
