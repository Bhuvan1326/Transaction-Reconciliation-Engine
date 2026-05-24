import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

export function DashboardLayout() {
  return (
    <div className="relative min-h-screen bg-surface-950 text-slate-200">
      <div
        className="pointer-events-none fixed inset-0 bg-grid-pattern bg-grid opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -left-32 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-32 bottom-0 h-96 w-96 rounded-full bg-accent-muted/10 blur-3xl"
        aria-hidden
      />

      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Outlet />
      </main>

      <footer className="relative border-t border-white/5 py-6 text-center text-xs text-slate-600">
        Transaction Reconciliation Engine · Production dashboard
      </footer>
    </div>
  );
}
