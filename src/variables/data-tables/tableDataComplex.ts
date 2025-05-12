type RowObj = {
  nama: string;
  status: string;
  tanggal: string;
  progres: number;
};

const tableDataComplex: RowObj[] = [
  {
    nama: 'Annisa',
    progres: 75.5,
    status: 'Aktif',
    tanggal: '12 Jan 2025',
  },
  {
    nama: 'Divara',
    progres: 25.5,
    status: 'Selesai',
    tanggal: '21 Feb 2025',
  },
  {
    nama: 'Intan',
    progres: 90,
    status: 'Aktif',
    tanggal: '13 Mar 2025',
  },
  {
    nama: 'Susan',
    progres: 50.5,
    status: 'Aktif',
    tanggal: '24 Oct 2025',
  },
];
export default tableDataComplex;
