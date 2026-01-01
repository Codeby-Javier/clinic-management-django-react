import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button, Table, Pagination, Modal, Input, Select, ConfirmModal, Badge } from '../../components/ui';
import { adminService } from '../../services';
import type { LayananTindakan, PaginatedResponse } from '../../types';

const kategoriOptions = [
    { value: 'pemeriksaan', label: 'Pemeriksaan' },
    { value: 'tindakan', label: 'Tindakan' },
    { value: 'laboratorium', label: 'Laboratorium' },
    { value: 'radiologi', label: 'Radiologi' },
    { value: 'lainnya', label: 'Lainnya' },
];

export const LayananManagement: React.FC = () => {
    const [layanan, setLayanan] = useState<PaginatedResponse<LayananTindakan> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLayanan, setSelectedLayanan] = useState<LayananTindakan | null>(null);
    const [formData, setFormData] = useState({
        nama_tindakan: '',
        biaya: '',
        kategori: 'tindakan',
        deskripsi: '',
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        loadLayanan();
    }, [currentPage]);

    const loadLayanan = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getLayanan({ page: currentPage.toString() });
            setLayanan(data);
        } catch (error) {
            console.error('Failed to load layanan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                biaya: parseFloat(formData.biaya),
            };

            if (isEditMode && selectedLayanan) {
                await adminService.updateLayanan(selectedLayanan.id, payload);
            } else {
                await adminService.createLayanan(payload);
            }

            setIsModalOpen(false);
            resetForm();
            loadLayanan();
        } catch (error) {
            console.error('Failed to save layanan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item: LayananTindakan) => {
        setSelectedLayanan(item);
        setFormData({
            nama_tindakan: item.nama_tindakan,
            biaya: item.biaya.toString(),
            kategori: item.kategori,
            deskripsi: item.deskripsi || '',
            is_active: item.is_active,
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedLayanan) return;
        setIsSubmitting(true);
        try {
            await adminService.deleteLayanan(selectedLayanan.id);
            setIsDeleteModalOpen(false);
            setSelectedLayanan(null);
            loadLayanan();
        } catch (error) {
            console.error('Failed to delete layanan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nama_tindakan: '',
            biaya: '',
            kategori: 'tindakan',
            deskripsi: '',
            is_active: true,
        });
        setIsEditMode(false);
        setSelectedLayanan(null);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const columns = [
        {
            key: 'nama_tindakan',
            header: 'Nama Tindakan',
            render: (item: LayananTindakan) => (
                <span className="font-medium text-slate-800">{item.nama_tindakan}</span>
            ),
        },
        {
            key: 'kategori',
            header: 'Kategori',
            render: (item: LayananTindakan) => (
                <Badge variant="info">{item.kategori_display}</Badge>
            ),
        },
        {
            key: 'biaya',
            header: 'Biaya',
            render: (item: LayananTindakan) => (
                <span className="font-medium text-emerald-600">{formatCurrency(item.biaya)}</span>
            ),
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (item: LayananTindakan) => (
                <Badge variant={item.is_active ? 'success' : 'danger'}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            render: (item: LayananTindakan) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedLayanan(item);
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
                    <h1 className="text-2xl font-bold text-slate-800">Layanan Tindakan</h1>
                    <p className="text-slate-500 mt-1">Manajemen layanan dan tindakan medis</p>
                </div>
                <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                >
                    Tambah Layanan
                </Button>
            </div>

            {/* Table */}
            <Table columns={columns} data={layanan?.results || []} isLoading={isLoading} />

            {/* Pagination */}
            {layanan && layanan.count > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(layanan.count / 10)}
                    totalItems={layanan.count}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={isEditMode ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} isLoading={isSubmitting}>
                            {isEditMode ? 'Simpan Perubahan' : 'Simpan'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Nama Tindakan"
                        value={formData.nama_tindakan}
                        onChange={(e) => setFormData({ ...formData, nama_tindakan: e.target.value })}
                        placeholder="Nama layanan/tindakan"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Biaya (Rp)"
                            type="number"
                            value={formData.biaya}
                            onChange={(e) => setFormData({ ...formData, biaya: e.target.value })}
                            placeholder="100000"
                        />
                        <Select
                            label="Kategori"
                            options={kategoriOptions}
                            value={formData.kategori}
                            onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Deskripsi
                        </label>
                        <textarea
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
                            placeholder="Deskripsi layanan (opsional)"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-700">Aktif</span>
                    </label>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedLayanan(null);
                }}
                onConfirm={handleDelete}
                title="Hapus Layanan"
                message={`Apakah Anda yakin ingin menghapus layanan "${selectedLayanan?.nama_tindakan}"?`}
                confirmText="Hapus"
                isLoading={isSubmitting}
            />
        </div>
    );
};
