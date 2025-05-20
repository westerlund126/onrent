/* lib/sku.ts */
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
  
  export function skuPrefix(category: string, size: string) {
    const catCode = CATEGORY_CODE[category] ?? 'XX';
    const sizeCode = (size ?? '').toUpperCase() || 'X';
    return `${catCode}${sizeCode}`;        
  }
  
  export function generateSku(prefix: string, seq: number) {
    return `${prefix}${String(seq).padStart(3, '0')}`;   
  }
  