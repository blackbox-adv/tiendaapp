/**
 * Importador de Excel (Fase 1) — funciones PURAS de parsing y preparación.
 *
 * Filosofía acordada con el dueño:
 *  - El Excel del emprendedor es EL JEFE: se sube tal cual, con sus columnas
 *    de más. Kyllari solo lee las columnas mapeadas; el resto se ignora.
 *  - El archivo nunca se modifica: Kyllari solo lo LEE (Excel -> Kyllari).
 *  - Re-import: cada producto se encuentra por su CÓDIGO (SKU) si el Excel
 *    lo tiene, o por su nombre normalizado si no. "Gana el último que sube".
 */

import * as XLSX from 'xlsx';

/** Máximo de filas por archivo (protección del servidor). */
export const MAX_ROWS = 5000;
/** Máximo de peso del archivo (bytes). */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

const FIELD_KEYS = ['name', 'price', 'stock', 'code', 'description', 'category'] as const;
export type ImportField = (typeof FIELD_KEYS)[number];

/** Metadatos de una columna detectada en el Excel del usuario. */
export interface SheetColumn {
  /** Letra de la columna (A, B, ... AA) para mostrar en la UI. */
  letter: string;
  /** Texto del encabezado (tal cual lo escribió el dueño). */
  header: string;
  /** Primeros valores de ejemplo de esa columna (para que reconozca cuál es). */
  samples: string[];
}

export interface ParsedWorkbook {
  fileName: string;
  /** Nombres de las hojas del archivo. */
  sheetNames: string[];
  /** Encabezados + ejemplos de la hoja seleccionada. */
  headers: SheetColumn[];
  /** Filas de la hoja seleccionada (arrays de celdas en texto), SIN la fila de encabezados. */
  rows: string[][];
  /** Índice (0-based) de la fila que contiene los encabezados. */
  headerRowIndex: number;
}

export interface MappingConfig {
  sheetName?: string;
  name: string;            // requerido
  price: string;           // requerido
  stock?: string;
  code?: string;
  description?: string;
  category?: string;
}

export interface ParsedRow {
  rowNumber: number;       // número de fila real del Excel (1-based, para errores)
  name: string;
  price: number | null;
  stockRaw: string | null; // texto original de la celda de stock (null = columna no mapeada)
  code: string | null;
  description: string;
  category: string;
}

export interface ExtractResult {
  rows: ParsedRow[];
  errors: { row: number; message: string }[];
}

/** Convierte índice de columna a letra (0 -> A, 25 -> Z, 26 -> AA). */
export function columnLetter(index: number): string {
  let s = '';
  let n = index;
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

/** Clave de emparejamiento: minúsculas, sin espacios dobles, sin extremos. */
export function normalizeKey(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Limpia precios como los escribe un emprendedor peruano:
 * "S/ 25.90", "S/25,9", "PEN 1,234.56", "25.90 ", "1.234,56" -> número.
 * Devuelve null si no se puede interpretar (la fila se reporta, no explota).
 */
export function parsePriceCell(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim();
  if (!s) return null;
  // Quitar espacios (incluye NBSP) y símbolos de moneda de la región
  s = s
    .replace(/[\s\u00A0]/g, '')
    .replace(/(S\/\.?|PEN|USD|MXN|COP|CLP|ARS|BOB|\$)/gi, '');
  if (!/\d/.test(s)) return null;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    // El último separador que aparece es el decimal
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56 -> 1234.56
    } else {
      s = s.replace(/,/g, ''); // 1,234.56 -> 1234.56
    }
  } else if (hasComma) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      s = s.replace(',', '.'); // 24,9 / 24,90 -> decimal
    } else {
      s = s.replace(/,/g, ''); // 1,234,567 -> miles
    }
  }
  s = s.replace(/[^0-9.\-]/g, '');
  const n = Number(s);
  if (!isFinite(n) || n < 0 || n > 999999) return null;
  return Math.round(n * 100) / 100;
}

/**
 * Stock: "8", " 8 ", "8 un.", "ilimitado" (-> -1), "" (-> null = no tocar).
 * Devuelve null si la celda está vacía (no se toca el stock actual).
 */
export function parseStockCell(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (/^(ilimitad|ilimitada|infinit|sin\s*limite|sin\s*stock\s*control)/.test(s)) return -1;
  const m = s.match(/-?\d+/);
  if (!m) return null; // "sin stock"? -> texto sin número: no tocar
  const n = parseInt(m[0], 10);
  if (isNaN(n) || n < 0) return 0;
  return Math.min(n, 999999);
}

/**
 * Lee el archivo (xlsx/xls/csv) y detecta encabezados + ejemplos.
 * Asume que la primera fila con contenido "parecido a encabezados"
 * (>= 2 celdas con texto) es la fila de títulos; las anteriores se saltan
 * (muchos excels llevan un título del negocio arriba).
 */
export function parseWorkbook(buffer: Buffer, fileName: string, sheetName?: string): ParsedWorkbook {
  const wb = XLSX.read(buffer, { type: 'buffer', codepage: 65001 });
  if (!wb.SheetNames.length) {
    throw new Error('El archivo no tiene hojas legibles.');
  }
  const active = sheetName && wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0];
  const sheet = wb.Sheets[active];
  if (!sheet) throw new Error(`No se encontró la hoja "${active}".`);

  const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  }) as unknown as string[][];

  // Buscar fila de encabezados dentro de las primeras 10 filas
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(matrix.length, 10); i++) {
    const filled = (matrix[i] || []).filter((c) => String(c ?? '').trim() !== '');
    if (filled.length >= 2) {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex === -1) {
    throw new Error('No se encontró una fila de títulos. La primera fila de tu Excel debe tener los nombres de las columnas (ej. "Nombre", "PVP", "Stock").');
  }

  const headerRow = matrix[headerRowIndex] || [];
  const bodyRows = matrix.slice(headerRowIndex + 1);

  // Encabezados únicos (si el dueño repite un título, se numera)
  const seen = new Map<string, number>();
  const headers: SheetColumn[] = headerRow.map((cell, idx) => {
    let label = String(cell ?? '').trim();
    if (!label) label = `Columna ${columnLetter(idx)}`;
    const count = seen.get(label) ?? 0;
    seen.set(label, count + 1);
    if (count > 0) label = `${label} (${count + 1})`;
    return { letter: columnLetter(idx), header: label, samples: [] };
  });

  // Ejemplos: primeros 3 valores no vacíos por columna
  const sampleCount = new Array(headers.length).fill(0);
  for (const row of bodyRows) {
    let any = false;
    for (let c = 0; c < headers.length; c++) {
      const v = String(row?.[c] ?? '').trim();
      if (v) any = true;
      if (v && sampleCount[c] < 3) {
        headers[c].samples.push(v.length > 24 ? `${v.slice(0, 24)}…` : v);
        sampleCount[c]++;
      }
    }
    if (any && sampleCount.every((n) => n >= 3)) break;
  }

  // Recortar columnas completamente vacías al final (sucede mucho)
  while (headers.length > 1) {
    const last = headers[headers.length - 1];
    const idx = headers.length - 1;
    const hasData = bodyRows.some((r) => String(r?.[idx] ?? '').trim() !== '');
    if (!hasData && last.samples.length === 0 && !last.header) headers.pop();
    else break;
  }

  const dataRows = bodyRows.filter((r) => (r || []).some((c) => String(c ?? '').trim() !== ''));
  if (dataRows.length > MAX_ROWS) {
    throw new Error(`El archivo tiene ${dataRows.length} filas. El límite es ${MAX_ROWS}. Divide el archivo en partes.`);
  }

  return {
    fileName,
    sheetNames: wb.SheetNames,
    headers,
    rows: dataRows.map((r) => headerRow.map((_, c) => String(r?.[c] ?? '')).map((v) => v.trim())),
    headerRowIndex,
  };
}

function findHeaderIndex(headers: SheetColumn[], wanted: string): number {
  if (!wanted) return -1;
  return headers.findIndex((h) => h.header === wanted);
}

/** Convierte las filas crudas + mapeo en filas listas para sincronizar. */
export function extractRows(wb: ParsedWorkbook, mapping: MappingConfig): ExtractResult {
  const iName = findHeaderIndex(wb.headers, mapping.name);
  const iPrice = findHeaderIndex(wb.headers, mapping.price);
  const iStock = mapping.stock ? findHeaderIndex(wb.headers, mapping.stock) : -1;
  const iCode = mapping.code ? findHeaderIndex(wb.headers, mapping.code) : -1;
  const iDesc = mapping.description ? findHeaderIndex(wb.headers, mapping.description) : -1;
  const iCat = mapping.category ? findHeaderIndex(wb.headers, mapping.category) : -1;

  if (iName === -1) {
    return { rows: [], errors: [{ row: 0, message: `No se encontró la columna "${mapping.name}" en este archivo. Quizá cambió de nombre: revisa el mapeo.` }] };
  }
  if (iPrice === -1) {
    return { rows: [], errors: [{ row: 0, message: `No se encontró la columna "${mapping.price}" en este archivo. Quizá cambió de nombre: revisa el mapeo.` }] };
  }

  const rows: ParsedRow[] = [];
  const errors: { row: number; message: string }[] = [];

  wb.rows.forEach((cells, i) => {
    const rowNumber = wb.headerRowIndex + 2 + i; // 1-based + encabezados
    const name = (cells[iName] ?? '').trim();
    const priceRaw = (cells[iPrice] ?? '').trim();
    const code = iCode >= 0 ? (cells[iCode] ?? '').trim() : null;

    // Fila totalmente vacía en las columnas que importan -> se omite en silencio
    if (!name && !priceRaw && !(code ?? '') && iStock >= 0 && !(cells[iStock] ?? '').trim()) return;
    if (!name && !priceRaw) return;

    if (!name) {
      errors.push({ row: rowNumber, message: 'Sin nombre de producto. Fila omitida.' });
      return;
    }
    const price = parsePriceCell(priceRaw);
    if (price === null) {
      errors.push({ row: rowNumber, message: `Precio no válido: "${priceRaw}". Fila omitida.` });
      return;
    }
    if (price === 0) {
      errors.push({ row: rowNumber, message: 'Precio 0. Fila omitida (los productos no pueden costar S/ 0).' });
      return;
    }

    rows.push({
      rowNumber,
      name,
      price,
      stockRaw: iStock >= 0 ? (cells[iStock] ?? '').trim() : null,
      code: code && code !== '' ? code : null,
      description: iDesc >= 0 ? (cells[iDesc] ?? '').trim() : '',
      category: iCat >= 0 ? (cells[iCat] ?? '').trim() : '',
    });
  });

  return { rows, errors };
}

/** Clave única de sincronización de una fila: código si hay, si no nombre normalizado. */
export function syncKeyOf(row: ParsedRow): string {
  return row.code ? row.code.trim() : normalizeKey(row.name);
}

export interface SyncOp {
  kind: 'create' | 'update';
  row: ParsedRow;
  key: string;
  productId?: string; // para update
  warnings?: string[];
}

/**
 * Plan de sincronización en memoria (sin tocar BD).
 * - Empareja por externalCode (código del Excel o nombre normalizado).
 * - Los productos creados a mano (sin externalCode) se ADOPTAN si el
 *   nombre coincide: así el primer import no duplica el catálogo actual.
 * - Devuelve también las claves vistas, para calcular "ausentes".
 */
export function buildSyncPlan(
  parsed: ParsedRow[],
  existing: { id: string; name: string; externalCode: string | null }[],
): { ops: SyncOp[]; seenKeys: Set<string>; duplicateWarnings: { row: number; message: string }[] } {
  const byCode = new Map<string, { id: string; name: string; externalCode: string | null }>();
  const byLegacyName = new Map<string, { id: string; name: string; externalCode: string | null }>();
  for (const p of existing) {
    if (p.externalCode) byCode.set(p.externalCode, p);
    else byLegacyName.set(normalizeKey(p.name), p);
  }

  const ops: SyncOp[] = [];
  const seenKeys = new Set<string>();
  const duplicateWarnings: { row: number; message: string }[] = [];

  for (const row of parsed) {
    const key = syncKeyOf(row);
    let target = byCode.get(key) ?? byLegacyName.get(normalizeKey(row.name)) ?? null;

    if (seenKeys.has(key)) {
      // Fila repetida en el mismo archivo: se aplica otra vez (gana la última)
      duplicateWarnings.push({ row: row.rowNumber, message: `Fila duplicada (${key}). Se aplicó la última versión.` });
    }
    seenKeys.add(key);

    if (target) {
      ops.push({ kind: 'update', row, key, productId: target.id });
    } else {
      ops.push({ kind: 'create', row, key });
    }
  }

  return { ops, seenKeys, duplicateWarnings };
}
