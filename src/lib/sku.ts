/* lib/sku.ts */
type Params = {
  category: string; 
  size: string | null;
  sequence: number; 
};

export const CATEGORY_CODE: Record<string, string> = {
    KEBAYA: 'KB',
    PAKAIAN_ADAT: 'PA',
    GAUN_PENGANTIN: 'GP',
    JARIK: 'JK',
    SELOP: 'SL',
    BESKAP: 'BK',
    SELENDANG: 'SD',
    LAINNYA: 'XX',
};

export function generateSku({ category, size, sequence }: Params) {
  const catCode = CATEGORY_CODE[category] ?? 'XX';
  const sizeCode = (size ?? '').toUpperCase() || 'X';
  const seq = String(sequence).padStart(3, '0');

  return `${catCode}${sizeCode}${seq}`; 
}
