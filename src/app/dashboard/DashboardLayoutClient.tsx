'use client';

import { useEffect } from 'react';
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

  // Sync Zustand store from API on mount (if not already syncing)
  useEffect(() => {
    const token = localStorage.getItem('tiendapp_token');
    if (token && !currentUser) {
      syncFromAPI();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    router.push('/auth/login');
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
