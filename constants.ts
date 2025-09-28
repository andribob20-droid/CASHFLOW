
import { Student, Payment, Transaction, PaymentStatus, TransactionType, SumberDana } from './types';

export const ADMIN_USER = 'pku19';
export const ADMIN_PASS = 'pku.mui';
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', nim: '19001', name: 'Budi Santoso', angkatan: 'PKU 19', created_at: new Date('2023-01-10T10:00:00Z').toISOString() },
  { id: 's2', nim: '19002', name: 'Citra Lestari', angkatan: 'PKU 19', created_at: new Date('2023-01-10T10:01:00Z').toISOString() },
  { id: 's3', nim: '19003', name: 'Dewi Anggraini', angkatan: 'PKU 19', created_at: new Date('2023-01-10T10:02:00Z').toISOString() },
  { id: 's4', nim: '19004', name: 'Eko Prasetyo', angkatan: 'PKU 19', created_at: new Date('2023-01-10T10:03:00Z').toISOString() },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', student_id: 's1', periode_bulan: '2024-07-01', tanggal: new Date('2024-07-01T09:00:00Z').toISOString(), jumlah: 100000, metode: 'Transfer Bank', bukti_url: 'https://picsum.photos/300/400', status: PaymentStatus.Valid, verified_by: 'pku19', created_at: new Date('2024-07-01T09:00:00Z').toISOString() },
  { id: 'p2', student_id: 's2', periode_bulan: '2024-07-01', tanggal: new Date('2024-07-02T11:00:00Z').toISOString(), jumlah: 100000, metode: 'Transfer Bank', bukti_url: 'https://picsum.photos/300/400', status: PaymentStatus.Valid, verified_by: 'pku19', created_at: new Date('2024-07-02T11:00:00Z').toISOString() },
  { id: 'p3', student_id: 's3', periode_bulan: '2024-07-01', tanggal: new Date('2024-07-03T14:00:00Z').toISOString(), jumlah: 100000, metode: 'GoPay', bukti_url: 'https://picsum.photos/300/400', status: PaymentStatus.Pending, verified_by: null, created_at: new Date('2024-07-03T14:00:00Z').toISOString() },
  { id: 'p4', student_id: 's1', periode_bulan: '2024-08-01', tanggal: new Date('2024-08-01T09:30:00Z').toISOString(), jumlah: 100000, metode: 'Transfer Bank', bukti_url: 'https://picsum.photos/300/400', status: PaymentStatus.Pending, verified_by: null, created_at: new Date('2024-08-01T09:30:00Z').toISOString() },
  { id: 'p5', student_id: 's4', periode_bulan: '2024-08-01', tanggal: new Date('2024-08-02T16:00:00Z').toISOString(), jumlah: 100000, metode: 'OVO', bukti_url: 'https://picsum.photos/300/400', status: PaymentStatus.Rejected, verified_by: 'pku19', created_at: new Date('2024-08-02T16:00:00Z').toISOString() },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', tanggal: new Date('2024-07-01T09:05:00Z').toISOString(), tipe: TransactionType.Pemasukan, kategori: 'Iuran Wajib', sumber_dana: SumberDana.Kas, deskripsi: 'Pembayaran iuran dari Budi Santoso', jumlah: 100000, ref_payment: 'p1', nota_url: null, created_by: 'pku19', created_at: new Date('2024-07-01T09:05:00Z').toISOString() },
  { id: 't2', tanggal: new Date('2024-07-02T11:05:00Z').toISOString(), tipe: TransactionType.Pemasukan, kategori: 'Iuran Wajib', sumber_dana: SumberDana.Kas, deskripsi: 'Pembayaran iuran dari Citra Lestari', jumlah: 100000, ref_payment: 'p2', nota_url: null, created_by: 'pku19', created_at: new Date('2024-07-02T11:05:00Z').toISOString() },
  { id: 't3', tanggal: new Date('2024-07-15T13:00:00Z').toISOString(), tipe: TransactionType.Pengeluaran, kategori: 'Konsumsi Rapat', sumber_dana: SumberDana.Kas, deskripsi: 'Beli snack untuk rapat angkatan', jumlah: 50000, ref_payment: null, nota_url: null, created_by: 'pku19', created_at: new Date('2024-07-15T13:00:00Z').toISOString() },
  { id: 't4', tanggal: new Date('2024-07-20T18:00:00Z').toISOString(), tipe: TransactionType.Pengeluaran, kategori: 'ATK', sumber_dana: SumberDana.Kas, deskripsi: 'Fotokopi materi kuliah', jumlah: 25000, ref_payment: null, nota_url: null, created_by: 'pku19', created_at: new Date('2024-07-20T18:00:00Z').toISOString() },
  { id: 't5', tanggal: new Date('2024-07-25T10:00:00Z').toISOString(), tipe: TransactionType.Pemasukan, kategori: 'Donasi', sumber_dana: SumberDana.InfakDonasi, deskripsi: 'Donasi dari Hamba Allah', jumlah: 200000, ref_payment: null, nota_url: null, created_by: 'pku19', created_at: new Date('2024-07-25T10:00:00Z').toISOString() },
];
