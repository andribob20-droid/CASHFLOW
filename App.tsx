
import React, { useState, useEffect, useCallback } from 'react';
import { Student, Payment, Transaction, PaymentStatus, TransactionType, SumberDana } from './types';
import { ADMIN_USER, ADMIN_PASS, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES } from './constants';
import Dashboard from './components/Dashboard';
import StudentStatus from './components/StudentStatus';
import AdminPanel from './components/AdminPanel';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

// --- Helper Functions ---

const getErrorMessage = (error: unknown): string => {
    // Check for Supabase PostgrestError-like object
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        const supaError = error as { message: string; details?: string; hint?: string; code?: string };
        
        // Provide user-friendly messages for common errors
        if (supaError.code === '23505') { // unique_violation
            if (supaError.message.includes('students_nim_key')) {
                 return 'NIM ini sudah terdaftar. Harap gunakan NIM yang unik.';
            }
            return 'Terjadi konflik data duplikat. Harap periksa kembali isian Anda.';
        }

        // Return the full message for other database errors
        let fullMessage = supaError.message;
        if (supaError.details) fullMessage += `\nDetails: ${supaError.details}`;
        if (supaError.hint) fullMessage += `\nHint: ${supaError.hint}`;
        return fullMessage;
    }
    // Check for standard Error object
    if (error instanceof Error) {
        return error.message;
    }
    // Check for string error
    if (typeof error === 'string') {
        return error;
    }
    
    // Fallback for unknown errors
    return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi atau periksa konsol untuk detail teknis.';
};


const SupabaseSetupInstructions: React.FC = () => (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-2xl border-t-4 border-yellow-400">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Konfigurasi Supabase Diperlukan</h2>
            <p className="text-gray-600 mb-6">
                Aplikasi ini belum terhubung ke database. Untuk melanjutkan, Anda perlu memasukkan kredensial Supabase Anda.
            </p>
            <ol className="list-decimal list-inside space-y-4 text-left">
                <li>Buka file <code className="bg-gray-200 text-red-600 font-mono p-1 rounded-md text-sm">supabaseClient.ts</code> di editor kode Anda.</li>
                <li>Ganti placeholder <code className="bg-gray-200 text-red-600 font-mono p-1 rounded-md text-sm">'YOUR_SUPABASE_URL'</code> dan <code className="bg-gray-200 text-red-600 font-mono p-1 rounded-md text-sm">'YOUR_SUPABASE_ANON_KEY'</code> dengan URL proyek dan kunci anon publik dari dashboard Supabase Anda.</li>
            </ol>
        </div>
    </div>
);

// --- Auth Modal Component ---
const AdminLoginModal: React.FC<{ onLogin: (user: string) => void; onClose: () => void; }> = ({ onLogin, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockout, setLockout] = useState<Date | null>(null);

    useEffect(() => {
        if (lockout) {
            const timer = setInterval(() => {
                if (new Date() > lockout) {
                    setLockout(null);
                    setAttempts(0);
                    setError('');
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [lockout]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (lockout) return;

        if (username === ADMIN_USER && password === ADMIN_PASS) {
            onLogin(username);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
                setLockout(lockoutUntil);
                setError(`Terlalu banyak percobaan gagal. Coba lagi dalam ${LOCKOUT_DURATION_MINUTES} menit.`);
            } else {
                setError(`Username atau password salah. Sisa percobaan: ${MAX_LOGIN_ATTEMPTS - newAttempts}`);
            }
        }
    };

    if (lockout) {
        const minutesLeft = Math.ceil((lockout.getTime() - new Date().getTime()) / (1000 * 60));
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
                    <h2 className="text-xl font-bold mb-4">Login Diblokir</h2>
                    <p className="text-red-600">{`Anda telah salah memasukkan password sebanyak ${MAX_LOGIN_ATTEMPTS} kali.`}</p>
                    <p className="text-gray-700 mt-2">{`Silakan coba lagi dalam ${minutesLeft} menit.`}</p>
                    <button onClick={onClose} className="mt-6 w-full py-2 px-4 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600">Tutup</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="mb-4 w-full p-2 border rounded-md" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 w-full p-2 border rounded-md" />
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Masuk</button>
                </form>
            </div>
        </div>
    );
};

// --- Snapshot Component ---
const SnapshotView: React.FC<{ month: string; allTransactions: Transaction[] }> = ({ month, allTransactions }) => {
    const [sumberDanaFilter, setSumberDanaFilter] = useState<'semua' | SumberDana>('semua');

    const [year, monthNum] = month.split('-').map(Number);
    
    const monthlyTransactions = allTransactions.filter(t => {
        const date = new Date(t.tanggal);
        return date.getFullYear() === year && date.getMonth() === monthNum - 1;
    });

    const displayedTransactions = monthlyTransactions.filter(t => {
        if (sumberDanaFilter === 'semua') return true;
        return t.sumber_dana === sumberDanaFilter;
    });

    const formatBulan = new Date(year, monthNum - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);

    const summary = displayedTransactions.reduce((acc, t) => {
        if (t.tipe === TransactionType.Pemasukan) acc.pemasukan += t.jumlah;
        else acc.pengeluaran += t.jumlah;
        return acc;
    }, { pemasukan: 0, pengeluaran: 0 });

    const filterNameMap = {
        'semua': 'Semua Dana',
        [SumberDana.Kas]: 'Uang Kas',
        [SumberDana.InfakDonasi]: 'Uang Infak/Donasi',
    };

    const shareToWhatsApp = () => {
        const text = `Ringkasan Keuangan PKU 19 - ${formatBulan} (${filterNameMap[sumberDanaFilter]}):\n\n- Pemasukan: ${formatCurrency(summary.pemasukan)}\n- Pengeluaran: ${formatCurrency(summary.pengeluaran)}\n\nLihat detail: ${window.location.href}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const FilterButton: React.FC<{ filter: 'semua' | SumberDana; label: string }> = ({ filter, label }) => {
        const isActive = sumberDanaFilter === filter;
        return (
            <button
                onClick={() => setSumberDanaFilter(filter)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Snapshot Keuangan: {formatBulan}</h2>
                    <p className="text-gray-500">Ringkasan ini bersifat publik dan hanya untuk dibaca.</p>
                </div>
                <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg self-start sm:self-center">
                    <FilterButton filter="semua" label="Semua" />
                    <FilterButton filter={SumberDana.Kas} label="Kas" />
                    <FilterButton filter={SumberDana.InfakDonasi} label="Infak/Donasi" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-bold text-blue-800">Filter Aktif</h3>
                    <p className="text-xl font-semibold text-blue-900">{filterNameMap[sumberDanaFilter]}</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                    <h3 className="font-bold text-green-800">Total Pemasukan</h3>
                    <p className="text-xl font-semibold text-green-900">{formatCurrency(summary.pemasukan)}</p>
                </div>
                <div className="p-4 border rounded-lg bg-red-50">
                    <h3 className="font-bold text-red-800">Total Pengeluaran</h3>
                    <p className="text-xl font-semibold text-red-900">{formatCurrency(summary.pengeluaran)}</p>
                </div>
            </div>

            <button onClick={shareToWhatsApp} className="mb-6 w-full md:w-auto py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">
                Share ke WhatsApp
            </button>

            <h3 className="text-lg font-semibold text-gray-700 mb-4">Detail Transaksi ({displayedTransactions.length})</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayedTransactions.length > 0 ? displayedTransactions.map(t => (
                            <tr key={t.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
                                <td className="px-4 py-2 text-sm">{t.deskripsi}</td>
                                <td className="px-4 py-2 text-sm">{t.sumber_dana === 'kas' ? 'Kas' : 'Infak/Donasi'}</td>
                                <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-semibold ${t.tipe === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.tipe === 'pemasukan' ? '+' : '-'} {formatCurrency(t.jumlah)}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">Tidak ada transaksi yang cocok dengan filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main App Component ---
function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState({ name: 'dashboard', params: { month: '' }});

  // Data state
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // View logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewName = params.get('view') || 'dashboard';
    const month = params.get('month');
    setView({ name: viewName, params: { month: month || '' } });
  }, []);

  // Data fetch and subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    
    const fetchData = async () => {
        setLoading(true);
        const [studentsRes, paymentsRes, transactionsRes] = await Promise.all([
            supabase.from('students').select('*'),
            supabase.from('payments').select('*'),
            supabase.from('transactions').select('*').order('tanggal', { ascending: false }),
        ]);
        if (studentsRes.data) setStudents(studentsRes.data);
        if (paymentsRes.data) setPayments(paymentsRes.data);
        if (transactionsRes.data) setTransactions(transactionsRes.data);
        setLoading(false);
    };
    fetchData();

    const channels: RealtimeChannel[] = [];
    const tables = ['students', 'payments', 'transactions'];
    
    tables.forEach(table => {
        const channel = supabase.channel(`public:${table}`)
            .on('postgres_changes', { event: '*', schema: 'public', table }, () => fetchData())
            .subscribe();
        channels.push(channel);
    });
    
    return () => { channels.forEach(c => supabase.removeChannel(c)); };
  }, []);
  
  const handleLogin = (user: string) => {
    setIsAdmin(true);
    setCurrentUser(user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
  };

  const handleApprovePayment = useCallback(async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    const student = students.find(s => s.id === payment?.student_id);
    if (!payment || !student || !supabase) return;

    try {
        // 1. Update payment status
        const { error: paymentError } = await supabase.from('payments')
            .update({ status: PaymentStatus.Valid, verified_by: currentUser })
            .eq('id', paymentId);
        if (paymentError) throw paymentError;

        // 2. Create corresponding transaction
        const monthName = new Date(payment.periode_bulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        const newTransaction: Omit<Transaction, 'id' | 'created_at'> = {
            tanggal: payment.tanggal,
            tipe: TransactionType.Pemasukan,
            kategori: 'Iuran Wajib',
            sumber_dana: SumberDana.Kas,
            deskripsi: `Pembayaran ${student.name} bulan ${monthName}`,
            jumlah: payment.jumlah,
            ref_payment: payment.id,
            nota_url: null,
            created_by: currentUser,
        };
        const { error: transError } = await supabase.from('transactions').insert(newTransaction);
        if (transError) throw transError;
        alert('Pembayaran berhasil disetujui.');
    } catch (error) {
        console.error("Error approving payment:", error);
        alert(`Gagal menyetujui pembayaran: ${getErrorMessage(error)}`);
    }
  }, [payments, students, currentUser]);

  const handleRejectPayment = useCallback(async (paymentId: string) => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('payments')
            .update({ status: PaymentStatus.Rejected, verified_by: currentUser })
            .eq('id', paymentId);
        if (error) throw error;
        alert('Pembayaran berhasil ditolak.');
    } catch(e) {
        console.error("Error rejecting payment:", e);
        alert(`Gagal menolak pembayaran: ${getErrorMessage(e)}`);
    }
  }, [currentUser]);

  const handleAddExpense = useCallback(async (expense: Omit<Transaction, 'id' | 'created_at' | 'ref_payment'>) => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('transactions').insert({ ...expense, created_by: currentUser });
        if (error) throw error;
        alert("Pengeluaran berhasil ditambahkan.");
    } catch (error) {
        console.error("Error adding expense: ", error);
        alert(`Gagal menambahkan pengeluaran: ${getErrorMessage(error)}`);
    }
  }, [currentUser]);

  const handleAddStudent = useCallback(async (studentData: Omit<Student, 'id'|'created_at'>) => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('students').insert(studentData);
        if (error) throw error;
    } catch(e) {
        console.error("Error adding student: ", e);
        alert(`Gagal menambah mahasiswa: ${getErrorMessage(e)}`);
    }
  }, []);
  
  const handleUpdateStudent = useCallback(async (updatedStudent: Student) => {
    if (!supabase) return;
    try {
        const { id, ...dataToUpdate } = updatedStudent;
        const { error } = await supabase.from('students').update(dataToUpdate).eq('id', id);
        if (error) throw error;
    } catch (e) {
        console.error("Error updating student: ", e);
         alert(`Gagal update mahasiswa: ${getErrorMessage(e)}`);
    }
  }, []);

  const handleDeleteStudent = useCallback(async (studentId: string) => {
      if (!supabase) return;
      try {
        // First, delete related payments to avoid foreign key constraint errors
        const { error: paymentError } = await supabase.from('payments').delete().eq('student_id', studentId);
        if (paymentError) throw paymentError;

        // Then, delete the student
        const { error: studentError } = await supabase.from('students').delete().eq('id', studentId);
        if (studentError) throw studentError;
        
        alert('Mahasiswa dan semua data pembayaran terkait berhasil dihapus.');
      } catch (e) {
          console.error("Error deleting student: ", e);
          alert(`Gagal menghapus mahasiswa: ${getErrorMessage(e)}`);
      }
  }, []);
  
  const renderContent = () => {
    if (loading) {
        return <div className="text-center py-10"><p className="text-lg text-gray-600">Memuat data...</p></div>;
    }

    if (view.name === 'snapshot' && view.params.month) {
        return <SnapshotView month={view.params.month} allTransactions={transactions} />;
    }
      
    if (isAdmin) {
        return <AdminPanel 
            students={students} 
            payments={payments} 
            transactions={transactions} 
            onAddExpense={handleAddExpense}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
        />;
    }
      
    return (
        <div className="space-y-8">
            <Dashboard transactions={transactions} />
            <StudentStatus students={students} payments={payments} />
        </div>
    );
  }

  if (!isSupabaseConfigured) {
    return <SupabaseSetupInstructions />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {showLogin && <AdminLoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="https://drive.google.com/uc?export=view&id=1vT4d6ytWo9xEwy0fijW7QTxmwwSlW_UL" alt="Logo PKU MUI" className="h-10 w-auto"/>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cash Flow Mahasiswa PKU 19</h1>
            </div>
            <div>
                {isAdmin ? (
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
                        Logout Admin
                    </button>
                ) : (
                    <button onClick={() => setShowLogin(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                        Masuk Admin
                    </button>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm mt-8">
        <p>PKU MUI 19</p>
      </footer>
    </div>
  );
}

export default App;
