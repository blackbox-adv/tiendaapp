'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Palette,
  Store,
  Gem,
  Minus,
  Eye,
  Check,
  Lock,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const templates = [
  {
    id: 'moderna',
    name: 'Moderna',
    desc: 'Diseño limpio y elegante',
    color: 'from-violet-500 to-purple-700',
    icon: Sparkles,
    plan: 'free',
    demoSlug: 'demo-moderna',
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    desc: 'Llena de color y energía',
    color: 'from-rose-500 to-orange-500',
    icon: Palette,
    plan: 'pro',
    demoSlug: 'demo-vibrante',
  },
  {
    id: 'clasica',
    name: 'Clásica',
    desc: 'Atemporal y sofisticada',
    color: 'from-amber-600 to-amber-900',
    icon: Store,
    plan: 'pro',
    demoSlug: 'demo-clasica',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    desc: 'Elegancia premium',
    color: 'from-zinc-800 to-zinc-950',
    icon: Gem,
    plan: 'premium',
    demoSlug: 'demo-luxury',
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    desc: 'Menos es más',
    color: 'from-stone-400 to-stone-700',
    icon: Minus,
    plan: 'premium',
    demoSlug: 'demo-minimalist',
  },
];

const planLabels: Record<string, { text: string; color: string }> = {
  free: { text: 'Gratis', color: 'bg-green-100 text-green-700' },
  pro: { text: 'Pro', color: 'bg-violet-100 text-violet-700' },
  premium: { text: 'Premium', color: 'bg-amber-100 text-amber-700' },
};

interface StoreData {
  id: string;
  slug: string;
  template: string;
}

export default function TemplatePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  const fetchStore = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user');
      if (!res.ok) {
        setError('Error al cargar datos');
        return;
      }
      const data = await res.json();
      const storeData = data.stores?.[0]?.store;
      if (storeData) {
        setStore(storeData);
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const handleChangeTemplate = async () => {
    if (!selectedTemplate || !store) return;
    setChanging(true);
    try {
      const res = await fetch(`/api/stores/${store.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: selectedTemplate }),
      });

      if (res.ok) {
        setStore((prev) => prev ? { ...prev, template: selectedTemplate } : null);
        setConfirmOpen(false);
      }
    } catch {
      // ignore
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={fetchStore}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Palette className="w-12 h-12 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">No tienes tienda</h2>
        <Link href="/onboarding">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            Crear tienda
          </Button>
        </Link>
      </div>
    );
  }

  const userPlan = session?.user?.plan || 'free';

  const canUseTemplate = (templatePlan: string) => {
    if (templatePlan === 'free') return true;
    if (templatePlan === 'pro' && (userPlan === 'pro' || userPlan === 'premium')) return true;
    if (templatePlan === 'premium' && userPlan === 'premium') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plantillas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Elige el diseño que mejor represente tu marca
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => {
          const Icon = tmpl.icon;
          const planInfo = planLabels[tmpl.plan];
          const isCurrent = store.template === tmpl.id;
          const isRestricted = !canUseTemplate(tmpl.plan);

          return (
            <Card
              key={tmpl.id}
              className={`relative border-0 shadow-sm hover:shadow-md transition-shadow ${
                isCurrent ? 'ring-2 ring-violet-600' : ''
              }`}
            >
              <div className={`h-32 bg-gradient-to-br ${tmpl.color} relative rounded-t-lg`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-white/60" />
                </div>
                {isCurrent && (
                  <Badge className="absolute top-2 right-2 bg-white text-violet-700">
                    <Check className="w-3 h-3 mr-1" />
                    Actual
                  </Badge>
                )}
                {isRestricted && (
                  <div className="absolute top-2 left-2">
                    <Lock className="w-4 h-4 text-white/80" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{tmpl.name}</h3>
                  <Badge className={planInfo.color} variant="secondary">
                    {planInfo.text}
                  </Badge>
                </div>
                <p className="text-gray-500 text-sm mb-3">{tmpl.desc}</p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/demo/${tmpl.demoSlug}`}
                    target="_blank"
                    className="text-violet-600 text-xs hover:underline inline-flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Ver vista previa
                  </Link>
                  {!isCurrent && (
                    <Button
                      size="sm"
                      variant={isRestricted ? 'outline' : 'default'}
                      className={`ml-auto ${
                        !isRestricted ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''
                      }`}
                      disabled={isRestricted}
                      onClick={() => {
                        setSelectedTemplate(tmpl.id);
                        setConfirmOpen(true);
                      }}
                    >
                      {isRestricted ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Actualizar plan
                        </>
                      ) : (
                        'Usar'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar plantilla</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de cambiar la plantilla de tu tienda? Los productos y categorías se mantendrán, pero el diseño cambiará.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleChangeTemplate}
              disabled={changing}
            >
              {changing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Confirmar cambio'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
