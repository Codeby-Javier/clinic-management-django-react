import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button, Table, Modal, Input, Select, Badge, ConfirmModal } from '../../components/ui';
import { apotekerService } from '../../services';
import type { Obat } from '../../types';

const kategoriOptions = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'kapsul', label: 'Kapsul' },
    { value: 'sirup', label: 'Sirup' },
    { value: 'salep', label: 'Salep' },
    { value: 'injeksi', label: 'Injeksi' },
    { value: 'tetes', label: 'Tetes' },
    { value: 'lainnya', label: 'Lainnya' },
];

const satuanOptions = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'kapsul', label: 'Kapsul' },
    { value: 'botol', label: 'Botol' },
    { value: 'tube', label: 'Tube' },
    { value: 'ampul', label: 'Ampul' },
    { value: 'strip', label: 'Strip' },
    { value: 'box', label: 'Box' },
];

export const ObatManagement: React.FC = () => {
    const [obatList, setObatList] = useState<Obat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedObat, setSelectedObat] = useState<Obat | null>(null);
    const [formData, setFormData] = useState({
        nama: '',
        kategori: 'tablet',
        stok: '0',
        satuan: 'tablet',
        harga_jual: '',
        harga_beli: '',
        expired_date: '',
        supplier: '',
        deskripsi: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadObat();
    }, []);

    const loadObat = async () => {
        setIsLoading(true);
        try {
            const data = await apotekerService.getObat();
            setObatList(data);
        } catch (error) {
            console.error('Failed to load obat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchQuery) {
            loadObat();
            return;
        }
        const filtered = obatList.filter(obat =>
            obat.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (obat.supplier && obat.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setObatList(filtered);
    };

    const handleCreateObat = async () => {
        setIsSubmitting(true);
        try {
            await apotekerService.createObat(formData);
            setIsModalOpen(false);
            resetForm();
            loadObat();
            alert('Obat berhasil ditambahkan!');
        } catch (error: any) {
            console.error('Failed to create obat:', error);
            alert(error.response?.data?.message || 'Gagal menambahkan obat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateObat = async () => {
        if (!selectedObat) return;
        setIsSubmitting(true);
        try {
            await apotekerService.updateObat(selectedObat.id, formData);
            setIsModalOpen(false);
            setIsEditMode(false);
            resetForm();
            loadObat();
            alert('Obat berhasil diupdate!');
        } catch (error: any) {
            console.error('Failed to update obat:', error);
            alert(error.response?.data?.message || 'Gagal mengupdate obat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteObat = async () => {
        if (!selectedObat) return;
        setIsSubmitting(true);
        try {
            await apotekerService.deleteObat(selectedObat.id);
            setIsDeleteModalOpen(false);
            setSelectedObat(null);
            loadObat();
            alert('Obat berhasil dihapus!');
        } catch (error) {
            console.error('Failed to delete obat:', error);
            alert('Gagal menghapus obat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditObat = (obat: Obat) => {
        setSelectedObat(obat);
        setFormData({
            nama: obat.nama,
            kategori: obat.kategori,
            stok: obat.stok.toString(),
            satuan: obat.satuan,
            harga_jual: obat.harga_jual.toString(),
            harga_beli: obat.harga_beli.toString(),
            expired_date: obat.expired_date || '',
            supplier: obat.supplier || '',
            deskripsi: obat.deskripsi || '',
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            nama: '',
            kategori: 'tablet',
            stok: '0',
            satuan: 'tablet',
            harga_jual: '',
            harga_beli: '',
            expired_date: '',
            supplier: '',
            deskripsi: '',
        });
        setSelectedObat(null);
        setIsEditMode(false);
    };

    const getStokBadge = (obat: Obat) => {
        if (obat.stok === 0) {
            return <Badge variant="danger">Habis</Badge>;
        } else if (obat.stok < 10) {
            return <Badge variant="warning">Menipis</Badge>;
        }
        return <Badge variant="success">Aman</Badge>;
    };

    const getExpiredBadge = (obat: Obat) => {
        if (obat.is_expired) {
            return <Badge variant="danger">Kadaluarsa</Badge>;
        } else if (obat.days_until_expired !== null && obat.days_until_expired < 30) {
            return <Badge variant="warning">{obat.days_until_expired} hari</Badge>;
        }
        return null;
    };

    const columns = [
        {
            key: 'nama',
            header: 'Nama Obat',
            render: (obat: Obat) => (
                <div>
                    <p className="font-medium text-slate-800">{obat.nama}</p>
                    <p className="text-sm text-slate-500">{obat.kategori_display}</p>
                </div>
            ),
        },
        {
            key: 'stok',
            header: 'Stok',
            render: (obat: Obat) => (
                <div>
                    <p className="font-medium text-slate-800">
                        {obat.stok} {obat.satuan_display}
                    </p>
                    {getStokBadge(obat)}
                </div>
            ),
        },
        {
            key: 'harga',
            header: 'Harga',
            render: (obat: Obat) => (
                <div>
                    <p className="text-sm text-slate-500">Jual</p>
                    <p className="font-medium text-slate-800">
                        Rp {obat.harga_jual.toLocaleString('id-ID')}
                    </p>
                </div>
            ),
        },
        {
            key: 'expired',
            header: 'Expired',
            render: (obat: Obat) => (
                <div>
                    {obat.expired_date ? (
                        <>
                            <p className="text-sm text-slate-800">
                                {new Date(obat.expired_date).toLocaleDateString('id-ID')}
                            </p>
                            {getExpiredBadge(obat)}
                        </>
                    ) : (
                        <p className="text-sm text-slate-500">-</p>
                    )}
                </div>
            ),
        },
        {
            key: 'supplier',
            header: 'Supplier',
            render: (obat: Obat) => (
                <p className="text-sm text-slate-600">{obat.supplier || '-'}</p>
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            render: (obat: Obat) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEditObat(obat)}
                        className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedObat(obat);
                            setIsDeleteModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Kelola Obat</h1>
                    <p className="text-slate-500 mt-1">Manajemen data obat dan stok</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                    Tambah Obat
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama obat atau supplier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            />
                        </div>
                    </div>
                    <Button variant="secondary" onClick={handleSearch}>
                        Cari
                    </Button>
                </div>
            </div>

            {/* Alerts */}
            {obatList.some(o => o.is_expired || (o.days_until_expired !== null && o.days_until_expired < 30)) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-900">Perhatian!</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Ada obat yang sudah kadaluarsa atau akan kadaluarsa dalam 30 hari.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <Table columns={columns} data={obatList} isLoading={isLoading} />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={isEditMode ? 'Edit Obat' : 'Tambah Obat Baru'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => {
                            setIsModalOpen(false);
                            resetForm();
                        }}>
                            Batal
                        </Button>
                        <Button 
                            onClick={isEditMode ? handleUpdateObat : handleCreateObat} 
                            isLoading={isSubmitting}
                        >
                            {isEditMode ? 'Update' : 'Simpan'}
                        </Button>
                    </>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nama Obat"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Nama obat"
                        required
                    />
                    <Select
                        label="Kategori"
                        options={kategoriOptions}
                        value={formData.kategori}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        required
                    />
                    <Input
                        label="Stok"
                        type="number"
                        value={formData.stok}
                        onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                        placeholder="0"
                        required
                    />
                    <Select
                        label="Satuan"
                        options={satuanOptions}
                        value={formData.satuan}
                        onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                        required
                    />
                    <Input
                        label="Harga Jual"
                        type="number"
                        value={formData.harga_jual}
                        onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                        placeholder="50000"
                        required
                    />
                    <Input
                        label="Harga Beli"
                        type="number"
                        value={formData.harga_beli}
                        onChange={(e) => setFormData({ ...formData, harga_beli: e.target.value })}
                        placeholder="30000"
                        required
                    />
                    <Input
                        label="Tanggal Expired"
                        type="date"
                        value={formData.expired_date}
                        onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })}
                    />
                    <Input
                        label="Supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="PT Pharma"
                    />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                            placeholder="Deskripsi obat..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedObat(null);
                }}
                onConfirm={handleDeleteObat}
                title="Hapus Obat"
                message={`Apakah Anda yakin ingin menghapus obat "${selectedObat?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                isLoading={isSubmitting}
            />
        </div>
    );
};
