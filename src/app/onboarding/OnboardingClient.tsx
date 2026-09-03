'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Store,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  Palette,
  Gem,
  Minus,
  Eye,
  Upload,
  Lock,
  ShoppingBasket,
  UtensilsCrossed,
  Shirt,
} from 'lucide-react';
import { RUBROS, getRubro } from '@/lib/rubros';
import { createDemoProducts } from '@/lib/demo-products';

const templates = [
  {
    id: 'moderna',
    name: 'Moderna',
    desc: 'Diseño limpio y elegante',
    color: 'from-violet-500 to-purple-700',
    icon: Sparkles,
    plan: 'free',
    demoSlug: 'moderna',
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    desc: 'Llena de color y energía',
    color: 'from-rose-500 to-orange-500',
    icon: Palette,
    plan: 'pro',
    demoSlug: 'vibrante',
  },
  {
    id: 'clasica',
    name: 'Clásica',
    desc: 'Atemporal y sofisticada',
    color: 'from-amber-600 to-amber-900',
    icon: Store,
    plan: 'pro',
    demoSlug: 'clasica',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    desc: 'Elegancia premium',
    color: 'from-zinc-800 to-zinc-950',
    icon: Gem,
    plan: 'premium',
    demoSlug: 'luxury',
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    desc: 'Menos es más',
    color: 'from-stone-400 to-stone-700',
    icon: Minus,
    plan: 'premium',
    demoSlug: 'minimalist',
  },
  {
    id: 'bodega',
    name: 'Mercadito',
    desc: 'Energía de barrio para bodegas y abarrotes',
    color: 'from-red-600 to-amber-500',
    icon: ShoppingBasket,
    plan: 'premium',
    demoSlug: 'bodega',
  },
  {
    id: 'sabor',
    name: 'Sabores',
    desc: 'Carta digital para restaurantes y pollerías',
    color: 'from-orange-600 to-yellow-500',
    icon: UtensilsCrossed,
    plan: 'premium',
    demoSlug: 'sabor',
  },
  {
    id: 'moda',
    name: 'Pasarela',
    desc: 'Editorial de moda para boutiques y accesorios',
    color: 'from-zinc-900 to-pink-600',
    icon: Shirt,
    plan: 'premium',
    demoSlug: 'moda',
  },
];

const planLabels: Record<string, { text: string; color: string }> = {
  free: { text: 'Gratis', color: 'bg-green-100 text-green-700' },
  pro: { text: 'Pro', color: 'bg-violet-100 text-violet-700' },
  premium: { text: 'Premium', color: 'bg-amber-100 text-amber-700' },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState('moderna');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  // Check en vivo de disponibilidad de slug: 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeEmail, setStoreEmail] = useState(currentUser?.email || '');
  const [storeAddress, setStoreAddress] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedRubro, setSelectedRubro] = useState('');
  const [withDemoProducts, setWithDemoProducts] = useState(true);

  const handleSlugFromName = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStoreSlug(slug);
  };

  // Verificación de disponibilidad de la URL con debounce (GET /api/stores?slug=X:
  // 200 = ocupada, 404 = libre)
  useEffect(() => {
    if (!storeSlug.trim()) {
      setSlugStatus('idle');
      return;
    }
    if (!/^[a-z0-9-]{2,}$/.test(storeSlug)) {
      setSlugStatus('invalid');
      return;
    }
    setSlugStatus('checking');
    let cancelled = false;
    const t = setTimeout(() => {
      fetch(`/api/stores?slug=${encodeURIComponent(storeSlug)}`)
        .then((res) => {
          if (!cancelled) setSlugStatus(res.ok ? 'taken' : 'available');
        })
        .catch(() => {
          if (!cancelled) setSlugStatus('idle');
        });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [storeSlug]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRubroChange = (rubroId: string) => {
    setSelectedRubro(rubroId);
    const preset = getRubro(rubroId);
    // Sugerir descripción solo si el usuario no escribió una
    setStoreDescription((prev) => (prev.trim() ? prev : preset.description));
  };

  const handleCreateStore = async () => {
    setLoading(true);
    setError('');

    try {
      let logoUrl: string | null = null;

      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('folder', 'logo');
        const token = localStorage.getItem('tiendapp_token');
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          logoUrl = uploadData.url;
        } else {
          const uploadError = await uploadRes.json().catch(() => ({}));
          setError(`Error al subir el logo: ${uploadError.error || 'Intenta de nuevo'}`);
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('tiendapp_token');
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>),
        },
        body: JSON.stringify({
          name: storeName,
          slug: storeSlug || undefined,
          description: storeDescription || '',
          template: selectedTemplate,
          whatsappNumber: storeWhatsapp || '',
          logo: logoUrl || '',
          category: selectedRubro || undefined,
          primaryColor: getRubro(selectedRubro).primary,
          secondaryColor: getRubro(selectedRubro).secondary,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear la tienda');
        return;
      }

      // Productos de ejemplo según el rubro (la tienda nunca se ve vacía)
      const createdStoreId = data?.store?.id ?? data?.id;
      if (withDemoProducts && createdStoreId) {
        try {
          await createDemoProducts(createdStoreId, selectedRubro || undefined);
        } catch {
          // No bloquear el onboarding si falla la carga de ejemplos
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedTemplate;
      case 2:
        return storeName.trim().length >= 2 && storeSlug.trim().length >= 2 && slugStatus !== 'checking' && slugStatus !== 'taken' && slugStatus !== 'invalid' && !!selectedRubro;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-violet-700">TiendApp</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Paso {step} de 4</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Choose Template */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Elige tu plantilla
              </h1>
              <p className="text-gray-500 mt-2">
                Selecciona el diseño que mejor represente tu marca
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tmpl) => {
                const Icon = tmpl.icon;
                const planInfo = planLabels[tmpl.plan];
                const isSelected = selectedTemplate === tmpl.id;
                const isRestricted = tmpl.plan !== 'free' && currentUser?.planId === 'free';

                return (
                  <Card
                    key={tmpl.id}
                    className={`relative cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'ring-2 ring-violet-600 shadow-md'
                        : 'border-0 shadow-sm'
                    }`}
                    onClick={() => {
                      if (!isRestricted) {
                        setSelectedTemplate(tmpl.id);
                      }
                    }}
                  >
                    <div className={`h-32 bg-gradient-to-br ${tmpl.color} relative rounded-t-lg`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-12 h-12 text-white/60" />
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-violet-600" />
                        </div>
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
                      <p className="text-gray-500 text-sm">{tmpl.desc}</p>
                      <Link
                        href={`/demo/${tmpl.demoSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-violet-600 text-xs mt-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-3 h-3" />
                        Ver vista previa
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
              Puedes cambiar la plantilla más tarde
            </p>
          </div>
        )}

        {/* Step 2: Store Info */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Información de tu tienda
              </h1>
              <p className="text-gray-500 mt-2">
                Cuéntanos sobre tu negocio
              </p>
            </div>

            <Card className="border-0 shadow-sm max-w-lg mx-auto">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>¿Qué vendes? *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {RUBROS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRubroChange(r.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                          selectedRubro === r.id
                            ? 'border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                            : 'border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{r.emoji}</span>
                        <span className="truncate">{r.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Elegimos los colores de tu tienda según tu rubro (puedes cambiarlos después).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">Nombre de la tienda *</Label>
                  <Input
                    id="storeName"
                    placeholder="Mi Tienda"
                    value={storeName}
                    onChange={(e) => {
                      setStoreName(e.target.value);
                      handleSlugFromName(e.target.value);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeSlug">URL de la tienda *</Label>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-200 rounded-l-md px-3 py-2">
                      tienda.blackboxperu.com/store/
                    </span>
                    <Input
                      id="storeSlug"
                      placeholder="mi-tienda"
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                      className="rounded-l-none"
                    />
                  </div>
                  {slugStatus === 'checking' && (
                    <p className="text-xs text-gray-400">Verificando disponibilidad…</p>
                  )}
                  {slugStatus === 'available' && (
                    <p className="text-xs text-emerald-600">
                      ¡Disponible! Tu tienda estará en esta URL.
                    </p>
                  )}
                  {slugStatus === 'taken' && (
                    <p className="text-xs text-red-500">
                      Esta URL ya está ocupada — elige otra para que tu enlace sea exactamente este.
                    </p>
                  )}
                  {slugStatus === 'invalid' && (
                    <p className="text-xs text-amber-600">
                      Usa solo letras minúsculas, números y guiones (mínimo 2 caracteres).
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Descripción</Label>
                  <Textarea
                    id="storeDescription"
                    placeholder="Describe tu tienda..."
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeWhatsapp">WhatsApp</Label>
                    <Input
                      id="storeWhatsapp"
                      placeholder="+51 999 888 777"
                      value={storeWhatsapp}
                      onChange={(e) => setStoreWhatsapp(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      placeholder="tienda@email.com"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Dirección</Label>
                  <Input
                    id="storeAddress"
                    placeholder="Lima, Perú"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                  />
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-lg bg-violet-50 border border-violet-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withDemoProducts}
                    onChange={(e) => setWithDemoProducts(e.target.checked)}
                    className="mt-0.5 accent-violet-600"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>Cargar productos de ejemplo</strong>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Tu tienda abre con productos de ejemplo del rubro "
                      {getRubro(selectedRubro).name}" con precios de referencia. Edítalos o bórralos cuando quieras.
                    </span>
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Upload Logo */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Logo de tu tienda
              </h1>
              <p className="text-gray-500 mt-2">
                Sube el logo de tu negocio (opcional)
              </p>
            </div>

            <Card className="border-0 shadow-sm max-w-lg mx-auto">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  {logoPreview ? (
                    <div className="relative mb-4">
                      <div className="w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden border-2 border-violet-200">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer mb-4">
                      <div className="w-32 h-32 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-violet-400 hover:bg-violet-50 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-400">Subir logo</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                  )}

                  <p className="text-gray-400 text-sm text-center">
                    Puedes subir el logo después desde la configuración
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                ¡Todo listo!
              </h1>
              <p className="text-gray-500 mt-2">
                Confirma los datos de tu tienda
              </p>
            </div>

            <Card className="border-0 shadow-sm max-w-lg mx-auto">
              <CardHeader>
                <h3 className="font-semibold text-lg">Resumen</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedRubro && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rubro</span>
                    <span className="font-medium">
                      {getRubro(selectedRubro).emoji} {getRubro(selectedRubro).name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plantilla</span>
                  <span className="font-medium capitalize">{selectedTemplate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nombre</span>
                  <span className="font-medium">{storeName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">URL</span>
                  <span className="font-medium text-violet-600">/store/{storeSlug}</span>
                </div>
                {storeDescription && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descripción</span>
                    <span className="font-medium truncate max-w-[200px]">{storeDescription}</span>
                  </div>
                )}
                {storeWhatsapp && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">WhatsApp</span>
                    <span className="font-medium">{storeWhatsapp}</span>
                  </div>
                )}
                {storeEmail && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium">{storeEmail}</span>
                  </div>
                )}
                {storeAddress && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dirección</span>
                    <span className="font-medium">{storeAddress}</span>
                  </div>
                )}
                {logoPreview && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Logo</span>
                    <div className="w-8 h-8 rounded overflow-hidden">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <div className="max-w-lg mx-auto mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 max-w-lg mx-auto">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {step < 4 ? (
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleCreateStore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando tienda...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Crear tienda
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
