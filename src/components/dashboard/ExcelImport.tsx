'use client';

/**
 * Importador de Excel (Fase 1) — /dashboard/import
 *
 * El flujo acordado con el dueño:
 *  1. La PRIMERA vez: sube su Excel tal cual -> la app le pregunta una sola
 *     vez a qué corresponde cada columna ("¿'PVP' es el precio?") y lo guarda.
 *  2. DE AHI EN ADELANTE: sube el mismo archivo de siempre -> UN click y su
 *     tienda se actualiza (nuevos se crean, precios/stock se actualizan,
 *     ausentes se desactivan o se mantienen, según lo que eligió).
 *  - Las columnas de más de su Excel se IGNORAN: su archivo nunca cambia.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, Loader2,
  RefreshCw, Trash2, ArrowLeft, Sparkles, Info, Crown,
} from 'lucide-react';
import { toast } from 'sonner';

interface HeaderCol { letter: string; header: string; samples: string[] }
interface PreviewData { fileName: string; sheetNames: string[]; headers: HeaderCol[]; totalRows: number }
interface SavedMapping { mapping: Record<string, string>; missingAction: string; lastFileName: string | null; lastImportAt: string | null }
interface ImportResult {
  created: number; updated: number; deactivated: number; keptMissing: number;
  totalRows: number; fileName: string;
  errors: { row: number; message: string }[]; errorCount: number;
  duplicateWarnings: { row: number; message: string }[]; duplicateCount: number;
}

const FIELDS: { key: string; label: string; hint: string; required?: boolean }[] = [
  { key: 'name', label: 'Nombre del producto', hint: 'ej. "Descripción Art."', required: true },
  { key: 'price', label: 'Precio', hint: 'ej. "PVP", "Precio S/"', required: true },
  { key: 'code', label: 'Código / SKU', hint: 'recomendado: actualiza sin duplicar' },
  { key: 'stock', label: 'Stock / Cantidad', hint: 'ej. "Cantidad", "Stock"' },
  { key: 'description', label: 'Descripción', hint: 'opcional' },
  { key: 'category', label: 'Categoría', hint: 'opcional' },
];

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tiendapp_token') : null;
  return (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>;
}

export function ExcelImport() {
  const { currentStore, currentUser, syncFromAPI } = useAppStore();
  const storeId = currentStore?.id;

  // Gating de plan: importador exclusivo Premium (super_admin = 'admin' siempre puede entrar a demostrar)
  const planId = (currentUser?.planId as string) || 'free';
  const planLocked = planId !== 'premium' && currentUser?.role !== 'admin';

  const [phase, setPhase] = useState<'loading' | 'noMapping' | 'mapping' | 'ready' | 'result'>('loading');
  const [saved, setSaved] = useState<SavedMapping | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [sheetName, setSheetName] = useState('');
  const [missingAction, setMissingAction] = useState<'keep' | 'deactivate'>('keep');
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Cargar mapeo guardado al abrir
  useEffect(() => {
    if (!storeId) return;
    (async () => {
      try {
        const res = await fetch(`/api/store-import?storeId=${storeId}`, { headers: authHeaders() });
        const json = await res.json().catch(() => null);
        const data = json?.data ?? json;
        if (res.ok && data) {
          setSaved(data);
          setSel({ name: data.mapping?.name ?? '', price: data.mapping?.price ?? '', code: data.mapping?.code ?? '', stock: data.mapping?.stock ?? '', description: data.mapping?.description ?? '', category: data.mapping?.category ?? '' });
          setMissingAction(data.missingAction === 'deactivate' ? 'deactivate' : 'keep');
          setSheetName(data.mapping?.sheetName ?? '');
          setPhase('ready');
        } else {
          setPhase('noMapping');
        }
      } catch {
        setPhase('noMapping');
      }
    })();
  }, [storeId]);

  const handleFile = useCallback(async (file: File) => {
    if (!storeId) return;
    setPickedFile(file);
    setParsing(true);
    try {
      const fd = new FormData();
      fd.append('storeId', storeId);
      fd.append('file', file);
      if (sheetName) fd.append('sheetName', sheetName);
      const res = await fetch('/api/store-import/preview', { method: 'POST', headers: authHeaders(), body: fd });
      const json = await res.json().catch(() => null);
      const data = json?.data ?? json;
      if (!res.ok) {
        toast.error(data?.message || 'No se pudo leer el archivo');
        setParsing(false);
        return;
      }
      setPreview(data);
      setSheetName((prev) => prev && data.sheetNames.includes(prev) ? prev : data.sheetNames[0] || '');
      // Pre-seleccionar por nombre de columna parecido (ayuda, el dueño confirma)
      const guess: Record<string, string> = { ...sel };
      const find = (kw: string[]) => data.headers.find((h: HeaderCol) => kw.some((k) => h.header.toLowerCase().includes(k)))?.header;
      if (!saved) {
        guess.name = guess.name || find(['nombre', 'descrip', 'producto', 'art']) || '';
        guess.price = guess.price || find(['pvp', 'precio', 'price']) || '';
        guess.code = guess.code || find(['cód', 'cod', 'sku', 'código']) || '';
        guess.stock = guess.stock || find(['stock', 'cant', 'existencia']) || '';
      }
      setSel(guess);
      setPhase('mapping');
    } catch {
      toast.error('Error de conexión');
    } finally {
      setParsing(false);
    }
  }, [storeId, sheetName, sel, saved]);

  const runApply = async (withMapping: boolean) => {
    if (!storeId || !pickedFile) return;
    if (withMapping && (!sel.name || !sel.price)) {
      toast.error('Elige qué columna es el Nombre y cuál el Precio');
      return;
    }
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('storeId', storeId);
      fd.append('file', pickedFile);
      fd.append('missingAction', missingAction);
      fd.append('saveMapping', '1');
      if (sheetName) fd.append('sheetName', sheetName);
      if (withMapping) {
        fd.append('mapping', JSON.stringify({ sheetName, name: sel.name, price: sel.price, code: sel.code || undefined, stock: sel.stock || undefined, description: sel.description || undefined, category: sel.category || undefined }));
      }
      const res = await fetch('/api/store-import/apply', { method: 'POST', headers: authHeaders(), body: fd });
      const json = await res.json().catch(() => null);
      const data = json?.data ?? json;
      if (!res.ok) {
        toast.error(data?.message || 'No se pudo importar');
        setImporting(false);
        return;
      }
      setResult(data as ImportResult);
      setSaved((prev) => prev ?? { mapping: { ...sel }, missingAction, lastFileName: data.fileName, lastImportAt: new Date().toISOString() });
      setPhase('result');
      syncFromAPI();
      toast.success(`Listo: ${data.created} creados, ${data.updated} actualizados`);
    } catch {
      toast.error('Error de conexión');
    } finally {
      setImporting(false);
    }
  };

  const forgetMapping = async () => {
    if (!storeId) return;
    if (!confirm('¿Olvidar el mapeo guardado? La próxima vez te volveremos a preguntar por tus columnas.')) return;
    await fetch(`/api/store-import?storeId=${storeId}`, { method: 'DELETE', headers: authHeaders() });
    setSaved(null);
    setPickedFile(null);
    setPreview(null);
    setPhase('noMapping');
    toast.success('Mapeo olvidado');
  };

  const resetFlow = () => {
    setPickedFile(null);
    setPreview(null);
    setResult(null);
    setPhase(saved ? 'ready' : 'noMapping');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const UploadZone = ({ compact }: { compact?: boolean }) => (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => fileInput.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed text-center transition-colors ${
        compact ? 'p-6' : 'p-10'
      } ${dragOver ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'}`}
    >
      <input
        ref={fileInput}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {parsing ? (
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
      ) : (
        <Upload className={`mx-auto text-violet-500 ${compact ? 'w-6 h-6' : 'w-10 h-10'}`} />
      )}
      <p className={`font-semibold text-gray-900 mt-3 ${compact ? 'text-sm' : ''}`}>
        {parsing ? 'Leyendo tu archivo…' : 'Arrastra tu Excel aquí o haz click para elegirlo'}
      </p>
      {!compact && (
        <p className="text-sm text-gray-500 mt-1">
          Formatos: .xlsx, .xls o .csv · máx. 5 MB y 5,000 filas
        </p>
      )}
    </div>
  );

  // ===== Estado bloqueado por plan =====
  if (planLocked) {
    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6">
        <Card className="border-violet-200 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-600 to-violet-400" />
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Crown className="w-7 h-7" />
            </div>
            <Badge className="bg-violet-600 text-white hover:bg-violet-600">PREMIUM</Badge>
            <h2 className="text-xl font-bold text-[#17142E]">Importador de Excel</h2>
            <p className="text-sm text-[#5D5A7E]">
              Sube el Excel que ya usas en tu negocio y tu tienda se actualiza sola:
              crea los productos nuevos y actualiza precios y stock en 1 click.
            </p>
            <ul className="text-sm text-left text-[#5D5A7E] space-y-2.5 mx-auto max-w-sm">
              <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" /> Tu Excel es el jefe: las columnas de más se ignoran</li>
              <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" /> Mapeo guiado una sola vez, luego es 1 click</li>
              <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" /> Productos ilimitados con el plan Premium</li>
            </ul>
            <Link href="/dashboard/plan" className="block">
              <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                <Sparkles className="w-4 h-4 mr-2" /> Ver planes y actualizar
              </Button>
            </Link>
            <p className="text-xs text-[#5D5A7E]">Disponible en el plan Premium (S/79.99/mes)</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== Estados de pantalla =====
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (phase === 'result' && result) {
    const clean = result.errorCount === 0 && result.duplicateCount === 0;
    return (
      <div className="space-y-6 max-w-2xl">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 mt-4">¡Tu tienda se actualizó!</h2>
            <p className="text-sm text-gray-500 mt-1">{result.fileName}</p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-2xl font-black text-emerald-600">{result.created}</p>
                <p className="text-xs text-emerald-700 font-medium">creados</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-4">
                <p className="text-2xl font-black text-violet-600">{result.updated}</p>
                <p className="text-xs text-violet-700 font-medium">actualizados</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-2xl font-black text-amber-600">{result.deactivated}</p>
                <p className="text-xs text-amber-700 font-medium">desactivados</p>
              </div>
            </div>
            {result.keptMissing > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                {result.keptMissing} producto{result.keptMissing !== 1 ? 's' : ''} de tu Excel anterior no vino en este archivo y se mantuvo activo.
              </p>
            )}
            {!clean && (
              <div className="text-left mt-6 space-y-3">
                {result.duplicateCount > 0 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                    <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> {result.duplicateCount} fila{result.duplicateCount !== 1 ? 's' : ''} duplicada{result.duplicateCount !== 1 ? 's' : ''} en el archivo
                    </p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                      {result.duplicateWarnings.map((w, i) => <li key={i}>Fila {w.row}: {w.message}</li>)}
                    </ul>
                  </div>
                )}
                {result.errorCount > 0 && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                    <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> {result.errorCount} fila{result.errorCount !== 1 ? 's' : ''} con problema se omitieron
                    </p>
                    <ul className="text-xs text-red-700 mt-1 space-y-0.5">
                      {result.errors.map((e, i) => <li key={i}>Fila {e.row}: {e.message}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-center gap-3 mt-8">
              <Button variant="outline" onClick={resetFlow}>
                <Upload className="w-4 h-4 mr-2" /> Subir otro archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === 'mapping' && preview) {
    const colOptions = (value: string, onChange: (v: string) => void, allowEmpty: boolean) => (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        {allowEmpty && <option value="">— No usar —</option>}
        {preview.headers.map((h) => (
          <option key={h.header} value={h.header}>
            {h.letter}: {h.header}{h.samples.length ? `  (${h.samples[0]})` : ''}
          </option>
        ))}
      </select>
    );

    return (
      <div className="space-y-6 max-w-3xl">
        <button onClick={resetFlow} className="text-sm text-gray-500 hover:text-violet-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Elegir otro archivo
        </button>

        <div>
          <h2 className="text-lg font-bold text-gray-900">¿Qué columna es cada cosa?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Solo te lo preguntamos <b>esta primera vez</b>: lo guardamos para que las próximas actualizaciones sean de un click.
            Las columnas que no elijas <b>se ignoran</b> — tu Excel sigue igual que siempre.
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-gray-900">{preview.fileName}</span>
              <Badge className="bg-violet-100 text-violet-700 border-0 text-[11px]">{preview.totalRows} filas</Badge>
              {preview.sheetNames.length > 1 && (
                <select
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-xs text-gray-900"
                >
                  {preview.sheetNames.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-900">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <p className="text-xs text-gray-400 mb-1.5">{f.hint}</p>
                  {colOptions(sel[f.key] ?? '', (v) => setSel((s) => ({ ...s, [f.key]: v })), !f.required)}
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Productos que ya no aparezcan en tu Excel:</p>
              <div className="mt-2 space-y-2">
                <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="missing" checked={missingAction === 'keep'} onChange={() => setMissingAction('keep')} className="mt-0.5 accent-violet-600" />
                  Mantenerlos activos (por si aún los vendes fuera del Excel)
                </label>
                <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="missing" checked={missingAction === 'deactivate'} onChange={() => setMissingAction('deactivate')} className="mt-0.5 accent-violet-600" />
                  Desactivarlos de la tienda (vuelven si aparecen de nuevo en el Excel)
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => runApply(true)}
                disabled={importing || !sel.name || !sel.price}
              >
                {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Importar ahora y guardar mi mapeo
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Si tu Excel cambia de nombre de columna, te avisaremos y lo corriges en 10 segundos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // phase === 'ready' | 'noMapping'
  return (
    <div className="space-y-6 max-w-3xl">
      {phase === 'ready' && saved ? (
        <>
          <Card className="border-0 shadow-sm bg-gradient-to-r from-violet-50 to-white">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <p className="text-sm font-bold text-gray-900">Tu mapeo guardado</p>
                  {FIELDS.filter((f) => sel[f.key]).map((f) => (
                    <Badge key={f.key} className="bg-white text-gray-700 border border-gray-200 text-[11px] font-medium">
                      {f.label.split(' ')[0]} ← {sel[f.key]}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setPickedFile(null); setPhase('noMapping'); }}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Volver a mapear
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={forgetMapping}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Olvidar
                  </Button>
                </div>
              </div>
              {saved.lastImportAt && (
                <p className="text-xs text-gray-400 mt-2">
                  Última importación: {new Date(saved.lastImportAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                  {saved.lastFileName ? ` · ${saved.lastFileName}` : ''}
                </p>
              )}
            </CardContent>
          </Card>
          <p className="text-sm text-gray-500">
            Sube el mismo Excel de siempre (con tus columnas de siempre). Nosotros reconocemos las columnas y actualizamos tu tienda solo.
          </p>
          <UploadZone compact />
        </>
      ) : (
        <>
          <div className="rounded-2xl bg-violet-50 border border-violet-100 p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Sube tu Excel tal como lo usas hoy
            </h3>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Necesita al menos: <b>nombre</b> y <b>precio</b>. Con <b>código/SKU</b> es aún mejor (se actualiza sin duplicar).</li>
              <li>Las columnas de más (proveedor, notas, lo que sea) <b>se ignoran</b> — tu archivo no cambia.</li>
              <li>La primera fila debe tener los títulos de las columnas.</li>
            </ul>
          </div>
          <UploadZone />
        </>
      )}

      {importing && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-violet-600" /> Actualizando tu tienda…
        </div>
      )}
    </div>
  );
}
