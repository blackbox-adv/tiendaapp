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
} from 'lucide-react';

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
