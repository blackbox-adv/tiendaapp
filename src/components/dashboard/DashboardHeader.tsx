'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Store,
  Menu,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  QrCode,
  CreditCard,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Productos', icon: Package },
  { href: '/dashboard/categories', label: 'Categorías', icon: Package },
  { href: '/dashboard/template', label: 'Plantillas', icon: Palette },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
  { href: '#', label: 'Código QR', icon: QrCode },
  { href: '#', label: 'Plan', icon: CreditCard },
];

const planLabels: Record<string, { text: string; color: string }> = {
  free: { text: 'Gratis', color: 'bg-green-100 text-green-700' },
  pro: { text: 'Pro', color: 'bg-violet-100 text-violet-700' },
  premium: { text: 'Premium', color: 'bg-amber-100 text-amber-700' },
};

export default function DashboardHeader() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const plan = session?.user?.plan || 'free';
  const planInfo = planLabels[plan] || planLabels.free;

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-violet-700">TiendApp</span>
        </Link>

        <div className="flex items-center gap-3">
          <Badge className={planInfo.color} variant="secondary">
            {planInfo.text}
          </Badge>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-violet-700">TiendApp</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 px-1">
                <p className="text-sm text-gray-500">Hola,</p>
                <p className="font-semibold text-gray-900 truncate">
                  {session?.user?.name || 'Usuario'}
                </p>
              </div>

              <nav className="mt-6 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-6 left-0 right-0 px-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Cerrar sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
