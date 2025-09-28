
export enum PaymentStatus {
  Pending = 'pending',
  Valid = 'valid',
  Rejected = 'rejected',
}

export enum TransactionType {
  Pemasukan = 'pemasukan',
  Pengeluaran = 'pengeluaran',
}

export enum SumberDana {
  Kas = 'kas',
  InfakDonasi = 'infak_donasi',
}


export interface Student {
  id: string;
  nim: string;
  name: string;
  angkatan: string;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  periode_bulan: string; // Format: YYYY-MM-01
  tanggal: string;
  jumlah: number;
  metode: string;
  bukti_url: string;
  status: PaymentStatus;
  verified_by: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  tanggal: string;
  tipe: TransactionType;
  kategori: string;
  sumber_dana: SumberDana;
  deskripsi: string;
  jumlah: number;
  ref_payment: string | null;
  nota_url: string | null;
  created_by: string | null;
  created_at: string;
}
