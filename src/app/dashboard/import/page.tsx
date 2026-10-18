'use client';

import { ExcelImport } from '@/components/dashboard/ExcelImport';

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar desde Excel</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sube el Excel que ya usas y tu tienda se actualiza sola. Tu archivo nunca se modifica.
        </p>
      </div>
      <ExcelImport />
    </div>
  );
}
