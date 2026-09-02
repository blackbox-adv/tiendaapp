'use client';

// ============================================================
// Helper para descargar reportes (/api/export) desde el dashboard.
// Lanza PlanRequiredError si el plan actual es Gratis → la UI
// muestra el aviso de upgrade.
// ============================================================

export type ExportType = 'orders' | 'sales';

export class PlanRequiredError extends Error {}

export function getToken(): string {
  try {
    return localStorage.getItem('tiendapp_token') || '';
  } catch {
    return '';
  }
}

export async function downloadExport(
  type: ExportType,
  storeId: string,
  opts?: { status?: string }
): Promise<void> {
  const params = new URLSearchParams({ type, storeId });
  if (opts?.status) params.set('status', opts.status);

  const token = getToken();
  const res = await fetch(`/api/export?${params.toString()}`, {
    headers: (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>,
  });

  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    if (data?.code === 'PLAN_REQUIRED') {
      throw new PlanRequiredError(data.error || 'Esta función está disponible en los planes Pro y Premium.');
    }
    throw new Error(data?.error || 'No tienes permisos para esta acción');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'No se pudo generar el reporte');
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/);
  const filename = match?.[1] ?? `reporte-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
