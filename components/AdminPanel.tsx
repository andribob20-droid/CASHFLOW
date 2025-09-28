import React, { useState } from 'react';
import { Payment, Student, Transaction, PaymentStatus, TransactionType, SumberDana } from '../types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// --- Sub-components for Admin Panel ---

const AddExpense: React.FC<{ onAddExpense: (expense: Omit<Transaction, 'id' | 'created_at' | 'ref_payment' | 'nota_url'> & { nota_url?: string }) => void; }> = ({ onAddExpense }) => {
    const [formState, setFormState] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        kategori: '',
        sumber_dana: SumberDana.Kas,
        deskripsi: '',
        jumlah: '',
        nota_url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formState.kategori || !formState.deskripsi || !formState.jumlah) {
            alert("Harap isi semua field yang wajib.");
            return;
        }
        onAddExpense({
            tanggal: new Date(formState.tanggal).toISOString(),
            tipe: TransactionType.Pengeluaran,
            kategori: formState.kategori,
            sumber_dana: formState.sumber_dana,
            deskripsi: formState.deskripsi,
            jumlah: Number(formState.jumlah),
            nota_url: formState.nota_url || undefined,
            created_by: null, // Will be set in parent
        });
        setFormState({ tanggal: new Date().toISOString().split('T')[0], kategori: '', sumber_dana: SumberDana.Kas, deskripsi: '', jumlah: '', nota_url: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tambah Pengeluaran</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="date" name="tanggal" value={formState.tanggal} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input type="text" name="kategori" placeholder="Kategori (e.g., Konsumsi)" value={formState.kategori} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <select name="sumber_dana" value={formState.sumber_dana} onChange={handleChange} className="w-full p-2 border rounded-md">
                    <option value={SumberDana.Kas}>Kas</option>
                    <option value={SumberDana.InfakDonasi}>Infak Donasi</option>
                </select>
                <textarea name="deskripsi" placeholder="Deskripsi pengeluaran" value={formState.deskripsi} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input type="number" name="jumlah" placeholder="Jumlah" value={formState.jumlah} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                <input type="text" name="nota_url" placeholder="URL Nota (Opsional)" value={formState.nota_url} onChange={handleChange} className="w-full p-2 border rounded-md" />
                <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Tambah</button>
            </form>
        </div>
    );
};

const StudentFormModal: React.FC<{
    student: Student | null;
    existingNims: string[];
    onSave: (studentData: Omit<Student, 'id' | 'created_at'> | Student) => void;
    onClose: () => void;
}> = ({ student, existingNims, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: student?.name || '',
        nim: student?.nim || '',
        angkatan: student?.angkatan || 'PKU 19',
    });
    const [error, setError] = useState('');
    const isEditing = !!student;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nimsToCheck = isEditing ? existingNims.filter(n => n !== student.nim) : existingNims;
        if (nimsToCheck.includes(formData.nim)) {
            setError('NIM ini sudah digunakan. Harap gunakan NIM yang unik.');
            return;
        }
        setError('');
        onSave(isEditing ? { ...student, ...formData } : formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-md" required/>
                    <input type="text" placeholder="NIM" value={formData.nim} onChange={e => setFormData({...formData, nim: e.target.value})} className="w-full p-2 border rounded-md" required/>
                    <input type="text" placeholder="Angkatan" value={formData.angkatan} onChange={e => setFormData({...formData, angkatan: e.target.value})} className="w-full p-2 border rounded-md" required/>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManageStudents: React.FC<{
    students: Student[];
    onAddStudent: (studentData: Omit<Student, 'id'|'created_at'>) => void;
    onUpdateStudent: (student: Student) => void;
    onDeleteStudent: (studentId: string) => void;
}> = ({ students, onAddStudent, onUpdateStudent, onDeleteStudent }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const handleSave = (studentData: Omit<Student, 'id'|'created_at'> | Student) => {
        if ('id' in studentData) {
            onUpdateStudent(studentData);
        } else {
            onAddStudent(studentData);
        }
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingStudent(null);
        setShowModal(true);
    };

    const handleDelete = (studentId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus mahasiswa ini? Ini akan menghapus semua data pembayaran terkait.")) {
            onDeleteStudent(studentId);
        }
    };

    return (
        <div>
            {showModal && <StudentFormModal student={editingStudent} existingNims={students.map(s => s.nim)} onSave={handleSave} onClose={() => setShowModal(false)} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Manajemen Mahasiswa</h3>
                <button onClick={openAddModal} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                    Tambah Mahasiswa
                </button>
            </div>
            <div className="flow-root mt-6">
                 <ul className="divide-y divide-gray-200">
                    {students.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                        <li key={s.id} className="py-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{s.name}</p>
                                <p className="text-sm text-gray-500">NIM: {s.nim}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => openEditModal(s)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                                <button onClick={() => handleDelete(s.id)} className="text-sm text-red-600 hover:text-red-800">Hapus</button>
                            </div>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    );
};

const MonthlyExport: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const handleExport = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        
        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.tanggal);
            return date.getFullYear() === year && date.getMonth() === month - 1;
        });

        if (monthlyTransactions.length === 0) {
            alert("Tidak ada transaksi di bulan yang dipilih untuk diekspor.");
            return;
        }
        
        const headers = ["id", "tanggal_iso", "tipe", "kategori", "sumber_dana", "deskripsi", "jumlah", "ref_payment", "created_by", "created_at"];
        
        const csvRows = monthlyTransactions.map(t => [
            t.id,
            new Date(t.tanggal).toISOString().split('T')[0],
            t.tipe,
            `"${(t.kategori || '').replace(/"/g, '""')}"`,
            t.sumber_dana,
            `"${(t.deskripsi || '').replace(/"/g, '""')}"`,
            t.jumlah,
            t.ref_payment || '',
            t.created_by || '',
            t.created_at
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
         <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ekspor Bulanan</h3>
            <p className="text-sm text-gray-600 mb-4">Pilih bulan untuk mengekspor data transaksi ke file CSV.</p>
            <div className="flex items-center space-x-4">
                <input 
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2 border rounded-md"
                />
                <button onClick={handleExport} className="py-2 px-6 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800 whitespace-nowrap">Ekspor CSV</button>
            </div>
        </div>
    );
};

const ShareSnapshot: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const handleCopyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?view=snapshot&month=${selectedMonth}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link snapshot berhasil disalin!');
        }, () => {
            alert('Gagal menyalin link.');
        });
    };

    return (
         <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sebar Link Snapshot Bulanan</h3>
            <p className="text-sm text-gray-600 mb-4">Buat link publik untuk ringkasan keuangan bulan tertentu. Link ini dapat dibagikan kepada siapa saja.</p>
            <div className="flex items-center space-x-4">
                <input 
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2 border rounded-md"
                />
                <button onClick={handleCopyLink} className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 whitespace-nowrap">Salin Link</button>
            </div>
        </div>
    );
}

// --- Main Admin Panel Component ---

const AdminPanel: React.FC<{
  students: Student[];
  payments: Payment[];
  transactions: Transaction[];
  onAddExpense: (expense: Omit<Transaction, 'id' | 'created_at' | 'ref_payment'>) => void;
  onAddStudent: (studentData: Omit<Student, 'id'|'created_at'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}> = (props) => {
    const TABS = ['Tambah Pengeluaran', 'Manajemen Mahasiswa', 'Ekspor Bulanan', 'Sebar Snapshot'];
    const [activeTab, setActiveTab] = useState(TABS[0]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Panel</h2>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === 'Tambah Pengeluaran' && <AddExpense onAddExpense={props.onAddExpense} />}
                {activeTab === 'Manajemen Mahasiswa' && <ManageStudents students={props.students} onAddStudent={props.onAddStudent} onUpdateStudent={props.onUpdateStudent} onDeleteStudent={props.onDeleteStudent} />}
                {activeTab === 'Ekspor Bulanan' && <MonthlyExport transactions={props.transactions} />}
                {activeTab === 'Sebar Snapshot' && <ShareSnapshot />}
            </div>
        </div>
    );
};

export default AdminPanel;