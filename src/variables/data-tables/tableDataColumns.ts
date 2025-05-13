type RowObj = {
  produk: string;
  kategori: string;
  harga: number;
  stok: number;
  total_sewa: number;
  status: string;
  specs?: string; };

const tableDataColumns: RowObj[] = [
  {
    produk: 'Kebaya Pengantin Aceh',
    kategori: 'Kebaya',
    harga: 200000,
    stok: 245,
    total_sewa: 15,
    status: 'Aktif',
  },
  {
    produk: 'Kebaya Pengantin Jateng',
    kategori: 'Kebaya',
    harga: 300000,
    stok: 27,
    total_sewa: 5,
    status: 'Nonaktif',

  },
  {
    produk: 'Tuxedo Black White',
    kategori: 'Tuxedo',
    harga: 400000,
    stok: 8,
    total_sewa: 15,
    status: 'Disewa',

  },
  {
    produk: 'Baju Adat Anak Papua',
    kategori: 'Baju Adat',
    harga: 250000,
    stok: 127,
    total_sewa: 6,
    status: 'Aktif',

  },
];

export default tableDataColumns;
