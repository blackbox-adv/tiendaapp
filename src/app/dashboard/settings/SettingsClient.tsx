'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  RefreshCw,
  Save,
  Store,
  Lock,
  Wallet,
  Upload,
  X,
  Truck,
  CreditCard,
  Plus,
  Trash2,
  Megaphone,
  Ruler,
} from 'lucide-react';

import type { ShippingOption, OtherPayment, SizeGuide, SizeGuideType, SizeGuideRow } from '@/lib/types';
import { SIZE_GUIDE_COLUMNS, SIZE_GUIDE_TYPES, SIZE_GUIDE_TYPE_LABEL } from '@/lib/size-guide';
import { SizeGuideDiagram } from '@/components/store-templates/SizeGuideDiagram';

interface StoreData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  template: string;
  whatsappNumber: string | null;
  yapeNumber: string | null;
  plinNumber: string | null;
  yapeQrUrl: string | null;
  plinQrUrl: string | null;
  logo: string | null;
  otherPayments?: OtherPayment[] | null;
  shippingOptions?: ShippingOption[] | null;
  sizeGuide?: SizeGuide | null;
}

export default function SettingsClient() {
  const { currentUser } = useAppStore();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Métodos de pago de la tienda (para cobrar a sus clientes)
  const [yapeNumber, setYapeNumber] = useState('');
  const [plinNumber, setPlinNumber] = useState('');
  const [yapeQrUrl, setYapeQrUrl] = useState<string | null>(null);
  const [plinQrUrl, setPlinQrUrl] = useState<string | null>(null);
  const [uploadingQr, setUploadingQr] = useState<'yape' | 'plin' | null>(null);

  // Otros métodos de pago del país (LatAm: Mercado Pago, Nequi, Sinpe Móvil, etc.)
  const [otherPayments, setOtherPayments] = useState<OtherPayment[]>([]);

  // Opciones de envío que la tienda ofrece
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  // Guía de tallas (Pro/Premium)
  const [planType, setPlanType] = useState<'free' | 'pro' | 'premium'>('free');
  const [sizeGuideEnabled, setSizeGuideEnabled] = useState(false);
  const [sizeGuideType, setSizeGuideType] = useState<SizeGuideType>('polo');
  const [sizeGuideRows, setSizeGuideRows] = useState<SizeGuideRow[]>([
    { size: 'S', a: '', b: '', c: '' },
    { size: 'M', a: '', b: '', c: '' },
    { size: 'L', a: '', b: '', c: '' },
  ]);
  const [sizeGuideNote, setSizeGuideNote] = useState('');
  // Franja de anuncio (banner de la tienda)
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tiendapp_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchStore = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user', { headers: getAuthHeaders() });
      if (!res.ok) {
        setError('Error al cargar la configuración');
        return;
      }
      const data = await res.json();
      // /api/user devuelve la tienda directamente en stores[0] (no anidada en .store)
      const storeData = data.stores?.[0]?.store ?? data.stores?.[0];
      if (storeData) {
        setStore(storeData);
        setName(storeData.name || '');
        setDescription(storeData.description || '');
        setWhatsapp(storeData.whatsappNumber || '');
        setYapeNumber((storeData as StoreData).yapeNumber || '');
        setPlinNumber((storeData as StoreData).plinNumber || '');
        setYapeQrUrl((storeData as StoreData).yapeQrUrl || null);
        setPlinQrUrl((storeData as StoreData).plinQrUrl || null);
        setOtherPayments(
          Array.isArray((storeData as StoreData).otherPayments)
            ? (storeData as StoreData).otherPayments!.filter((p) => p && p.label)
            : []
        );
        setShippingOptions(
          Array.isArray((storeData as StoreData).shippingOptions)
            ? (storeData as StoreData).shippingOptions!.filter((s) => s && s.label)
            : []
        );
        // Plan del dueño (para gating de la guía de tallas y del envío por adelantado)
        const sub = data.subscriptions?.[0];
        const t = sub?.plan?.type;
        setPlanType(t === 'pro' || t === 'premium' ? t : 'free');
        // Plan Free: limpiar flags "se paga primero" obsoletos (feature Pro/Premium)
        if (t !== 'pro' && t !== 'premium') {
          setShippingOptions((prev) => prev.map((s) => ({ ...s, payFirst: false })));
        }
        // Guía de tallas guardada
        const sg = (storeData as StoreData).sizeGuide;
        if (sg && sg.enabled && Array.isArray(sg.rows) && sg.rows.length > 0) {
          setSizeGuideEnabled(true);
          setSizeGuideType(sg.type || 'polo');
          setSizeGuideRows(sg.rows.map((r: SizeGuideRow) => ({ size: r.size || '', a: r.a || '', b: r.b || '', c: r.c || '' })));
          setSizeGuideNote(sg.note || '');
        }
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch('/api/store-announcement', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAnnouncementText(data.text || '');
        setAnnouncementLink(data.link || '');
      }
    } catch {
      // silencioso: la franja es opcional
    }
  };

  const handleSaveAnnouncement = async () => {
    setSavingAnnouncement(true);
    setAnnouncementError('');
    setAnnouncementSuccess('');
    try {
      const res = await fetch('/api/store-announcement', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ slug: store?.slug, text: announcementText, link: announcementLink }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnnouncementError(data.error || 'Error al guardar el aviso');
        return;
      }
      setAnnouncementSuccess(announcementText.trim() ? 'Aviso guardado. Ya aparece en tu tienda.' : 'Aviso oculto de tu tienda.');
    } catch {
      setAnnouncementError('Error de conexión');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch(`/api/stores/${store?.slug}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          description: description || null,
          whatsappNumber: whatsapp || null,
          yapeNumber: yapeNumber.trim() || null,
          plinNumber: plinNumber.trim() || null,
          yapeQrUrl,
          plinQrUrl,
          otherPayments: otherPayments.filter((p) => p.label.trim()),
          shippingOptions: shippingOptions.filter((s) => s.label.trim()),
          sizeGuide: sizeGuideEnabled
            ? { enabled: true, type: sizeGuideType, rows: sizeGuideRows, note: sizeGuideNote }
            : { enabled: false },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar');
        return;
      }

      setSuccess('Configuración guardada correctamente');
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'yape' | 'plin') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('El QR debe ser una imagen JPG, PNG o WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen del QR no debe superar los 5MB');
      return;
    }

    setUploadingQr(kind);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'payment-qr');

      const token = localStorage.getItem('tiendapp_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error al subir el QR');
        return;
      }
      const data = await res.json();
      if (kind === 'yape') setYapeQrUrl(data.url ?? data.data?.url ?? null);
      else setPlinQrUrl(data.url ?? data.data?.url ?? null);
    } catch {
      setError('Error de conexión al subir el QR');
    } finally {
      setUploadingQr(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Error al cambiar la contraseña');
        return;
      }

      setPasswordSuccess('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError('Error de conexión');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error && !store) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">
          Administra la información de tu tienda
        </p>
      </div>

      {/* Store Settings */}
      {store && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Store className="w-5 h-5 text-violet-600" />
              Información de la tienda
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveStore} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la tienda</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp de pedidos</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="51987654321"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Con código de país, sin espacios ni el signo +. Aquí llegan los pedidos.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mt-4 mb-1">
                  <Wallet className="w-4 h-4 text-violet-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Cobros con Yape / Plin</h4>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Estos datos aparecerán en tu tienda para que tus clientes te paguen. El dinero llega directo a ti.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yapeNumber">Tu número de Yape</Label>
                    <Input
                      id="yapeNumber"
                      type="tel"
                      placeholder="958297236"
                      value={yapeNumber}
                      onChange={(e) => setYapeNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plinNumber">Tu número de Plin</Label>
                    <Input
                      id="plinNumber"
                      type="tel"
                      placeholder="958297236"
                      value={plinNumber}
                      onChange={(e) => setPlinNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {([
                    { kind: 'yape' as const, label: 'QR de Yape', url: yapeQrUrl, setUrl: setYapeQrUrl },
                    { kind: 'plin' as const, label: 'QR de Plin', url: plinQrUrl, setUrl: setPlinQrUrl },
                  ]).map(({ kind, label, url, setUrl }) => (
                    <div key={kind} className="space-y-2">
                      <Label>{label} (opcional)</Label>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {url ? (
                            <img src={url} alt={label} className="w-full h-full object-cover" />
                          ) : uploadingQr === kind ? (
                            <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={`qr-${kind}`}
                            className="text-xs text-violet-600 hover:text-violet-700 cursor-pointer font-medium"
                          >
                            {url ? 'Cambiar imagen' : 'Subir captura del QR'}
                          </label>
                          <input
                            id={`qr-${kind}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => handleQrUpload(e, kind)}
                          />
                          {url && (
                            <button
                              type="button"
                              onClick={() => setUrl(null)}
                              className="text-xs text-gray-400 hover:text-red-500 inline-flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Quitar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Otros métodos de pago (LatAm) */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mt-4 mb-1">
                  <CreditCard className="w-4 h-4 text-violet-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Otros métodos de pago</h4>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  ¿Cobras con Mercado Pago, Nequi, Sinpe Móvil, Daviplata o transferencia? Agrégalos y aparecerán junto a Yape/Plin en tu tienda.
                </p>

                {otherPayments.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Nombre (ej: Mercado Pago)"
                      value={p.label}
                      maxLength={40}
                      onChange={(e) => {
                        const next = [...otherPayments];
                        next[i] = { ...p, label: e.target.value };
                        setOtherPayments(next);
                      }}
                    />
                    <Input
                      placeholder="Alias, número o link de pago"
                      value={p.number}
                      maxLength={80}
                      onChange={(e) => {
                        const next = [...otherPayments];
                        next[i] = { ...p, number: e.target.value };
                        setOtherPayments(next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setOtherPayments(otherPayments.filter((_, j) => j !== i))}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      aria-label={`Quitar ${p.label || 'método de pago'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {otherPayments.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setOtherPayments([...otherPayments, { label: '', number: '' }])}
                    className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar método de pago
                  </button>
                )}
              </div>

              {/* Opciones de envío */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mt-4 mb-1">
                  <Truck className="w-4 h-4 text-violet-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Opciones de envío</h4>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Indica cómo entregas tus productos: delivery, recojo en tienda, envío a otras ciudades... Tus clientes lo verán antes de pedir.
                </p>

                {shippingOptions.map((s, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Zona o método (ej: Delivery centro)"
                        value={s.label}
                        maxLength={60}
                        onChange={(e) => {
                          const next = [...shippingOptions];
                          next[i] = { ...s, label: e.target.value };
                          setShippingOptions(next);
                        }}
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Costo (vacío = gratis)"
                        value={s.price ?? ''}
                        onChange={(e) => {
                          const next = [...shippingOptions];
                          const v = e.target.value === '' ? null : parseFloat(e.target.value);
                          next[i] = { ...s, price: v !== null && isFinite(v) && v > 0 ? v : null };
                          setShippingOptions(next);
                        }}
                        className="sm:w-44"
                      />
                      <Input
                        placeholder="Tiempo (ej: 24 horas)"
                        value={s.time}
                        maxLength={40}
                        onChange={(e) => {
                          const next = [...shippingOptions];
                          next[i] = { ...s, time: e.target.value };
                          setShippingOptions(next);
                        }}
                        className="sm:w-44"
                      />
                      <button
                        type="button"
                        onClick={() => setShippingOptions(shippingOptions.filter((_, j) => j !== i))}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label={`Quitar ${s.label || 'opción de envío'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {(planType === 'pro' || planType === 'premium') && (
                      <label className="mt-1.5 flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!s.payFirst}
                          onChange={(e) => {
                            const next = [...shippingOptions];
                            next[i] = { ...s, payFirst: e.target.checked };
                            setShippingOptions(next);
                          }}
                          className="accent-violet-600 mt-0.5"
                        />
                        <span>
                          <span className="font-medium">El envío se paga primero</span> — el cliente yapea solo el costo de esta zona al confirmar y paga el producto contra entrega (ideal para clientes nuevos)
                        </span>
                      </label>
                    )}
                  </div>
                ))}

                {shippingOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setShippingOptions([...shippingOptions, { label: '', price: null, time: '' }])}
                    className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar opción de envío
                  </button>
                )}

                {shippingOptions.length > 0 && planType !== 'pro' && planType !== 'premium' && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 mt-2">
                    <span className="font-medium">El envío se paga primero</span> (el cliente yapea solo el costo de envío y paga el producto contra entrega) está disponible en los planes <b>Pro y Premium</b>.{' '}
                    <a href="/dashboard/plan" className="underline font-semibold">Ver planes</a>
                  </div>
                )}
              </div>

              {/* Guía de tallas (Pro y Premium) */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mt-4 mb-1 flex-wrap">
                  <Ruler className="w-4 h-4 text-violet-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Guía de tallas</h4>
                  {planType === 'pro' || planType === 'premium' ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">Incluido en tu plan</span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">Pro y Premium</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Nosotros te damos el diagrama estándar de medidas y tú solo llenas tus números. Tus clientes lo verán en cada producto antes de comprar — menos dudas, más ventas.
                </p>

                {planType !== 'pro' && planType !== 'premium' ? (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    La Guía de tallas está disponible en los planes <b>Pro y Premium</b>.{' '}
                    <a href="/dashboard/plan" className="underline font-semibold">Ver planes</a>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sizeGuideEnabled}
                        onChange={(e) => setSizeGuideEnabled(e.target.checked)}
                        className="accent-violet-600 w-4 h-4"
                      />
                      Mostrar guía de tallas en mis productos
                    </label>

                    {sizeGuideEnabled && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1.5">Tipo de prenda (define el diagrama):</p>
                          <div className="flex flex-wrap gap-2">
                            {SIZE_GUIDE_TYPES.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setSizeGuideType(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                  sizeGuideType === t
                                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                {SIZE_GUIDE_TYPE_LABEL[t]}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-700 flex-shrink-0">
                            <SizeGuideDiagram type={sizeGuideType} className="w-40 h-40" />
                          </div>
                          <div className="flex-1 min-w-0 w-full">
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-left text-gray-500">
                                    <th className="py-1.5 pr-2 font-medium">Talla</th>
                                    {SIZE_GUIDE_COLUMNS[sizeGuideType].map((col) => (
                                      <th key={col.key} className="py-1.5 pr-2 font-medium">{col.label}</th>
                                    ))}
                                    <th className="py-1.5" aria-label="Acciones" />
                                  </tr>
                                </thead>
                                <tbody>
                                  {sizeGuideRows.map((row, i) => (
                                    <tr key={i}>
                                      <td className="py-1 pr-2">
                                        <Input
                                          value={row.size}
                                          placeholder="S"
                                          maxLength={10}
                                          onChange={(e) => {
                                            const next = [...sizeGuideRows];
                                            next[i] = { ...row, size: e.target.value };
                                            setSizeGuideRows(next);
                                          }}
                                          className="w-16 h-8 text-xs"
                                        />
                                      </td>
                                      {SIZE_GUIDE_COLUMNS[sizeGuideType].map((col) => (
                                        <td key={col.key} className="py-1 pr-2">
                                          <Input
                                            value={row[col.key] || ''}
                                            placeholder="0"
                                            maxLength={10}
                                            onChange={(e) => {
                                              const next = [...sizeGuideRows];
                                              next[i] = { ...row, [col.key]: e.target.value };
                                              setSizeGuideRows(next);
                                            }}
                                            className="w-20 h-8 text-xs"
                                          />
                                        </td>
                                      ))}
                                      <td className="py-1">
                                        <button
                                          type="button"
                                          onClick={() => setSizeGuideRows(sizeGuideRows.filter((_, j) => j !== i))}
                                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                          aria-label={`Quitar talla ${row.size || i + 1}`}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {sizeGuideRows.length < 12 && (
                              <button
                                type="button"
                                onClick={() => setSizeGuideRows([...sizeGuideRows, { size: '', a: '', b: '', c: '' }])}
                                className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium mt-2"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Agregar talla
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Nota opcional (se muestra bajo la tabla):</p>
                          <Input
                            value={sizeGuideNote}
                            placeholder="Ej: Medidas de la prenda, tolerancia ±2 cm"
                            maxLength={200}
                            onChange={(e) => setSizeGuideNote(e.target.value)}
                            className="text-sm"
                          />
                        </div>

                        <p className="text-xs text-gray-500">
                          Se guarda cuando presiones <b>Guardar cambios</b>. El diagrama con las medidas señaladas aparece junto a tu tabla.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Franja de anuncio (banner) */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-violet-600" />
            Anuncio en tu tienda
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Una franja llamativa en la parte de arriba de tu tienda para promociones, rebajas o avisos.
            Déjalo vacío para ocultarla.
          </p>
          {announcementText.trim() && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Vista previa:</p>
              <div className="bg-amber-400 text-amber-950 text-xs sm:text-sm font-semibold text-center px-4 py-2 rounded-lg">
                {announcementText}{announcementLink ? ' →' : ''}
              </div>
            </div>
          )}
          {announcementError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{announcementError}</div>
          )}
          {announcementSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{announcementSuccess}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="announcementText">Texto del anuncio</Label>
            <Input
              id="announcementText"
              type="text"
              maxLength={90}
              placeholder="Ej: ¡ENVÍO GRATIS en pedidos desde S/50! Solo hoy"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcementLink">Enlace al tocar el anuncio (opcional)</Label>
            <Input
              id="announcementLink"
              type="text"
              placeholder="Ej: wa.me/51987654321 o una página de tu catálogo"
              value={announcementLink}
              onChange={(e) => setAnnouncementLink(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={handleSaveAnnouncement}
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={savingAnnouncement}
          >
            {savingAnnouncement ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Megaphone className="w-4 h-4 mr-2" />
                Guardar anuncio
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-600" />
            Cambiar contraseña
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              disabled={savingPassword}
            >
              {savingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Cambiar contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
