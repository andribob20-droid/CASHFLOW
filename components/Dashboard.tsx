import React from 'react';
import { Transaction, TransactionType, SumberDana } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`mt-2 text-3xl font-bold ${color}`}>{formatCurrency(value)}</p>
  </div>
);

const SumberDanaBadge: React.FC<{sumber: SumberDana}> = ({ sumber }) => {
    const isKas = sumber === SumberDana.Kas;
    const bgColor = isKas ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
    const text = isKas ? 'Kas' : 'Infak Donasi';
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
            {text}
        </span>
    );
}

const RecentTransactions: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">20 Transaksi Terbaru</h3>
        <ul className="divide-y divide-gray-200">
            {transactions.slice(0, 20).map(t => (
                <li key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-2 ${t.tipe === TransactionType.Pemasukan ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                           {t.tipe === TransactionType.Pemasukan ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{t.deskripsi}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <p className="text-xs text-gray-500">{new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <SumberDanaBadge sumber={t.sumber_dana} />
                            </div>
                        </div>
                    </div>
                    <p className={`text-sm font-semibold ${t.tipe === TransactionType.Pemasukan ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.jumlah)}</p>
                </li>
            ))}
        </ul>
    </div>
);

const Dashboard: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalPemasukan = transactions
        .filter(t => t.tipe === TransactionType.Pemasukan)
        .reduce((sum, t) => sum + t.jumlah, 0);

    const totalPengeluaran = transactions
        .filter(t => t.tipe === TransactionType.Pengeluaran)
        .reduce((sum, t) => sum + t.jumlah, 0);
    
    const saldoTotal = totalPemasukan - totalPengeluaran;
    
    const saldoKas = transactions
        .filter(t => t.sumber_dana === SumberDana.Kas)
        .reduce((acc, t) => acc + (t.tipe === TransactionType.Pemasukan ? t.jumlah : -t.jumlah), 0);

    const pemasukanBulanIni = transactions
        .filter(t => t.tipe === TransactionType.Pemasukan && new Date(t.tanggal) >= firstDayOfMonth)
        .reduce((sum, t) => sum + t.jumlah, 0);

    const pengeluaranBulanIni = transactions
        .filter(t => t.tipe === TransactionType.Pengeluaran && new Date(t.tanggal) >= firstDayOfMonth)
        .reduce((sum, t) => sum + t.jumlah, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Saldo (Gabungan)" value={saldoTotal} color="text-blue-600" />
                <StatCard title="Saldo Kas" value={saldoKas} color="text-indigo-600" />
                <StatCard title="Pemasukan Bulan Ini" value={pemasukanBulanIni} color="text-green-600" />
                <StatCard title="Pengeluaran Bulan Ini" value={pengeluaranBulanIni} color="text-red-600" />
            </div>
            <RecentTransactions transactions={transactions} />
        </div>
    );
};

export default Dashboard;