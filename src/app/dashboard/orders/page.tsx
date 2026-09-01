'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ShoppingCart,
  RefreshCw,
  Loader2,
  MessageCircle,
  Check,
  X,
  Package,
  Phone,
  StickyNote,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────

interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface StoreOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalAmount: number | string;
  items: OrderItem[];
  whatsappMessage: string | null;
  notes: string | null;
  createdAt: string;
}

interface StoreData {
  id: string;
  slug: string;
  name: string;
  whatsappNumber: string | null;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmado', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

const FILTERS: { id: string; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'confirmed', label: 'Confirmados' },
  { id: 'cancelled', label: 'Cancelados' },
];

function formatMoney(v: number | string): string {
  return Number(v).toFixed(2);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

// ── Page ─────────────────────────────────────────────────

export default function OrdersPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('todos');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('tiendapp_token');
      const headers = (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>;

      const userRes = await fetch('/api/user', { headers });
      if (!userRes.ok) {
        setError('Error al cargar los datos');
        return;
      }
      const userData = await userRes.json();
      const storeData = (userData?.stores?.[0]?.store ?? userData?.stores?.[0]) as StoreData | undefined;
      if (!storeData?.id) {
        setError('No tienes una tienda activa');
        return;
      }
      setStore(storeData);

      const ordersRes = await fetch(`/api/orders?storeId=${storeData.id}`, { headers });
      if (!ordersRes.ok) {
        const errData = await ordersRes.json().catch(() => ({}));
        setError(errData.error || 'Error al cargar los pedidos');
        return;
      }
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.data ?? []);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (orderId: string, status: 'confirmed' | 'cancelled') => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('tiendapp_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        toast.success(
          status === 'confirmed' ? 'Pedido confirmado' : 'Pedido cancelado'
        );
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Error al actualizar el pedido');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setUpdating(null);
    }
  };

  const whatsappReply = (order: StoreOrder) => {
    const phone = sanitizePhone(order.customerPhone);
    const msg =
      `Hola ${order.customerName}! Te escribo de ${store?.name ?? 'la tienda'} sobre tu pedido ${order.orderNumber} (S/ ${formatMoney(order.totalAmount)}). ` +
      (order.status === 'confirmed'
        ? '¡Tu pedido está confirmado! '
        : '¿Cómo quieres coordinar el pago y la entrega? ');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // ── Render states ──

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
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const filtered =
    filter === 'todos' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length === 0
              ? 'Los pedidos de tu tienda aparecerán aquí'
              : `${orders.length} pedido${orders.length > 1 ? 's' : ''} en total${pendingCount > 0 ? ` · ${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}` : ''}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.id === 'todos'
                ? orders.length
                : orders.filter((o) => o.status === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Aún no tienes pedidos</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Cuando un cliente confirme un pedido con sus datos de entrega o te escriba por
            WhatsApp, lo verás aquí para gestionarlo.
          </p>
          {store?.slug && (
            <Link
              href={`/store/${store.slug}`}
              target="_blank"
              className="text-violet-600 text-sm hover:underline"
            >
              Ver mi tienda
            </Link>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No hay pedidos con este estado.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const meta = STATUS_META[order.status] ?? STATUS_META.pending;
            return (
              <Card key={order.id} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {order.orderNumber}
                      </p>
                      <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge className={`${meta.className} border-0`}>{meta.label}</Badge>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="font-medium text-gray-800">{order.customerName}</span>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </span>
                    {order.customerEmail && (
                      <span className="text-xs text-gray-400">{order.customerEmail}</span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div
                          key={`${order.id}-${idx}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="inline-flex items-center gap-1.5 text-gray-700">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            {item.name} x{item.quantity}
                          </span>
                          <span className="text-gray-600">
                            S/ {formatMoney(item.price * item.quantity)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">Sin detalle de productos</p>
                    )}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                      <span className="text-sm font-medium text-gray-900">Total</span>
                      <span className="text-sm font-bold text-gray-900">
                        S/ {formatMoney(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <p className="text-xs text-gray-500 inline-flex items-start gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      {order.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <a href={whatsappReply(order)} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Responder por WhatsApp
                      </Button>
                    </a>
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1"
                          disabled={updating === order.id}
                          onClick={() => updateStatus(order.id, 'confirmed')}
                        >
                          {updating === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50 gap-1"
                          disabled={updating === order.id}
                          onClick={() => updateStatus(order.id, 'cancelled')}
                        >
                          {updating === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
