'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Loader2 } from 'lucide-react';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isSyncing, syncFromAPI } = useAppStore();
  const router = useRouter();
  // true cuando ya intentamos restaurar la sesión (con o sin token guardado)
  const [authResolved, setAuthResolved] = useState(false);

  // Restore session from localStorage token on mount.
  // ⚠️ Nunca llamar router.push durante el render: en el pase SSR el estado
  // siempre es "sin sesión" (no hay localStorage) y Next inyecta el redirect
  // en el flight payload — el cliente acaba en /auth/login aunque el token
  // sea válido. Decidir el redirect SOLO en un efecto, después de intentar
  // restaurar.
  useEffect(() => {
    const token = localStorage.getItem('tiendapp_token');
    if (currentUser) {
      setAuthResolved(true);
      return;
    }
    if (token) {
      Promise.resolve(syncFromAPI()).finally(() => setAuthResolved(true));
    } else {
      setAuthResolved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect (en efecto, nunca en render) cuando no hay sesión posible
  useEffect(() => {
    if (authResolved && !isSyncing && !currentUser) {
      router.replace('/auth/login');
    }
  }, [authResolved, isSyncing, currentUser, router]);

  // Esperando restauración inicial o sincronización en curso → spinner
  if (!authResolved || isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Sesión confirmada como ausente → renderizar nada mientras el efecto navega
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
