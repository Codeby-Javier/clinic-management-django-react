import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import { Table, Pagination, StatusBadge, Button, Modal, Select } from '../../components/ui';
import { dokterService, adminService } from '../../services';
import type { JanjiTemu, LayananTindakan, Obat, PaginatedResponse } from '../../types';
import { apotekerService } from '../../services';

export const DokterJanjiTemu: React.FC = () => {
    const [janjiTemu, setJanjiTemu] = useState<PaginatedResponse<JanjiTemu> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    // Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRekamMedisModalOpen, setIsRekamMedisModalOpen] = useState(false);
    const [selectedJanji, setSelectedJanji] = useState<JanjiTemu | null>(null);

    // Form state
    const [layananList, setLayananList] = useState<LayananTindakan[]>([]);
    const [obatList, setObatList] = useState<Obat[]>([]);
    const [formData, setFormData] = useState({
        diagnosa: '',
        anamnesa: '',
        pemeriksaan_fisik: '',
        catatan: '',
        tindakan_ids: [] as number[],
        obat_list: [] as { obat_id: number; jumlah: number; aturan_pakai: string }[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
        loadMasterData();
    }, [currentPage, statusFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = { page: currentPage.toString() };
            if (statusFilter) params.status = statusFilter;
            const data = await dokterService.getJanjiTemu(params);
            setJanjiTemu(data);
        } catch (error) {
            console.error('Failed to load janji temu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMasterData = async () => {
        try {
            const [layananData, obatData] = await Promise.all([
                adminService.getLayanan({ page: '1' }),
                apotekerService.getObat(),
            ]);
            setLayananList(layananData.results);
            // apotekerService.getObat() returns array directly, not paginated
            setObatList(Array.isArray(obatData) ? obatData : []);
        } catch (error) {
            console.error('Failed to load master data:', error);
        }
    };

    const handleMulaiKonsultasi = async (janji: JanjiTemu) => {
        try {
            await dokterService.mulaiKonsultasi(janji.id);
            loadData();
        } catch (error) {
            console.error('Failed to start konsultasi:', error);
        }
    };

    const handleSubmitRekamMedis = async () => {
        if (!selectedJanji) return;
        
        // Validasi form
        if (!formData.diagnosa.trim()) {
            alert('Diagnosa wajib diisi!');
            return;
        }
        if (!formData.anamnesa.trim()) {
            alert('Anamnesa wajib diisi!');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await dokterService.createRekamMedis({
                janji_temu_id: selectedJanji.id,
                ...formData,
            });
            alert('Rekam medis berhasil disimpan!');
            setIsRekamMedisModalOpen(false);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Failed to create rekam medis:', error);
            const errorMsg = error.response?.data?.detail || 
                           error.response?.data?.message ||
                           JSON.stringify(error.response?.data) ||
                           'Gagal menyimpan rekam medis. Silakan coba lagi.';
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            diagnosa: '',
            anamnesa: '',
            pemeriksaan_fisik: '',
            catatan: '',
            tindakan_ids: [],
            obat_list: [],
        });
        setSelectedJanji(null);
    };

    const addObat = () => {
        try {
            setFormData({
                ...formData,
                obat_list: [...formData.obat_list, { obat_id: 0, jumlah: 1, aturan_pakai: '' }],
            });
        } catch (error) {
            console.error('Error adding obat:', error);
            alert('Gagal menambah obat. Silakan coba lagi.');
        }
    };

    const columns = [
        {
            key: 'antrian',
            header: 'No.',
            render: (item: JanjiTemu) => (
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold">
                    {item.nomor_antrian}
                </div>
            ),
        },
        {
            key: 'pasien',
            header: 'Pasien',
            render: (item: JanjiTemu) => (
                <div>
                    <p className="font-medium text-slate-800">
                        {item.pasien.user.first_name} {item.pasien.user.last_name}
                    </p>
                    <p className="text-sm text-slate-500">{item.pasien.no_rm}</p>
                </div>
            ),
        },
        { key: 'tanggal', header: 'Tanggal' },
        { key: 'waktu', header: 'Waktu' },
        {
            key: 'keluhan',
            header: 'Keluhan',
            render: (item: JanjiTemu) => (
                <p className="max-w-xs truncate text-slate-600">{item.keluhan}</p>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: JanjiTemu) => <StatusBadge status={item.status} />,
        },
        {
            key: 'actions',
            header: 'Aksi',
            render: (item: JanjiTemu) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setSelectedJanji(item);
                            setIsDetailModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {item.status === 'pending' && (
                        <Button size="sm" onClick={() => handleMulaiKonsultasi(item)}>
                            Konfirmasi
                        </Button>
                    )}
                    {item.status === 'confirmed' && !item.has_rekam_medis && (
                        <Button
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => {
                                setSelectedJanji(item);
                                setFormData({
                                    ...formData,
                                    anamnesa: item.keluhan,
                                });
                                setIsRekamMedisModalOpen(true);
                            }}
                        >
                            Rekam Medis
                        </Button>
                    )}
                </div>
            ),
        },
    ];


    const location = useLocation();
    const isRekamMedisPage = location.pathname.includes('rekam-medis');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    {isRekamMedisPage ? 'Daftar Rekam Medis' : 'Janji Temu'}
                </h1>
                <p className="text-slate-500 mt-1">
                    {isRekamMedisPage
                        ? 'Kelola riwayat pemeriksaan pasien'
                        : 'Daftar janji temu pasien Anda'}
                </p>
            </div>

            <div className="flex gap-4">
                <Select
                    options={[
                        { value: '', label: 'Semua Status' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'confirmed', label: 'Terkonfirmasi' },
                        { value: 'completed', label: 'Selesai' },
                    ]}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-48"
                />
            </div>

            <Table columns={columns} data={janjiTemu?.results || []} isLoading={isLoading} />

            {janjiTemu && janjiTemu.count > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(janjiTemu.count / 10)}
                    totalItems={janjiTemu.count}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Janji Temu"
                size="md"
            >
                {selectedJanji && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Pasien</p>
                                <p className="font-medium">
                                    {selectedJanji.pasien.user.first_name} {selectedJanji.pasien.user.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">No. RM</p>
                                <p className="font-medium">{selectedJanji.pasien.no_rm}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tanggal</p>
                                <p className="font-medium">{selectedJanji.tanggal}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Waktu</p>
                                <p className="font-medium">{selectedJanji.waktu}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Keluhan</p>
                            <p className="font-medium">{selectedJanji.keluhan}</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Rekam Medis Modal */}
            <Modal
                isOpen={isRekamMedisModalOpen}
                onClose={() => {
                    setIsRekamMedisModalOpen(false);
                    resetForm();
                }}
                title="Buat Rekam Medis"
                size="xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsRekamMedisModalOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmitRekamMedis} isLoading={isSubmitting}>
                            Simpan Rekam Medis
                        </Button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Anamnesa / Keluhan</label>
                        <textarea
                            value={formData.anamnesa}
                            onChange={(e) => setFormData({ ...formData, anamnesa: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            placeholder="Keluhan pasien..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Pemeriksaan Fisik</label>
                        <textarea
                            value={formData.pemeriksaan_fisik}
                            onChange={(e) => setFormData({ ...formData, pemeriksaan_fisik: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            placeholder="Hasil pemeriksaan fisik..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Diagnosa</label>
                        <textarea
                            value={formData.diagnosa}
                            onChange={(e) => setFormData({ ...formData, diagnosa: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            placeholder="Diagnosa..."
                        />
                    </div>

                    {/* Tindakan */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tindakan</label>
                        <div className="grid grid-cols-2 gap-2">
                            {layananList.map((layanan) => (
                                <label key={layanan.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.tindakan_ids.includes(layanan.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, tindakan_ids: [...formData.tindakan_ids, layanan.id] });
                                            } else {
                                                setFormData({ ...formData, tindakan_ids: formData.tindakan_ids.filter(id => id !== layanan.id) });
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-sky-500"
                                    />
                                    <span className="text-sm">{layanan.nama_tindakan} - Rp {layanan.biaya.toLocaleString()}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Resep Obat */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">Resep Obat</label>
                            <Button size="sm" variant="outline" onClick={addObat}>
                                + Tambah Obat
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {formData.obat_list.map((obat, index) => (
                                <div key={index} className="flex gap-2 items-center p-3 bg-slate-50 rounded-lg">
                                    <select
                                        value={obat.obat_id}
                                        onChange={(e) => {
                                            const newList = [...formData.obat_list];
                                            newList[index].obat_id = parseInt(e.target.value);
                                            setFormData({ ...formData, obat_list: newList });
                                        }}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                                    >
                                        <option value="0">Pilih Obat</option>
                                        {obatList && obatList.length > 0 ? (
                                            obatList.map((o) => (
                                                <option key={o.id} value={o.id}>{o.nama} (Stok: {o.stok})</option>
                                            ))
                                        ) : (
                                            <option disabled>Loading obat...</option>
                                        )}
                                    </select>
                                    <input
                                        type="number"
                                        value={obat.jumlah}
                                        onChange={(e) => {
                                            const newList = [...formData.obat_list];
                                            newList[index].jumlah = parseInt(e.target.value);
                                            setFormData({ ...formData, obat_list: newList });
                                        }}
                                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg"
                                        placeholder="Jumlah"
                                        min="1"
                                    />
                                    <input
                                        type="text"
                                        value={obat.aturan_pakai}
                                        onChange={(e) => {
                                            const newList = [...formData.obat_list];
                                            newList[index].aturan_pakai = e.target.value;
                                            setFormData({ ...formData, obat_list: newList });
                                        }}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                                        placeholder="Aturan pakai (3x1 setelah makan)"
                                    />
                                    <button
                                        onClick={() => {
                                            const newList = formData.obat_list.filter((_, i) => i !== index);
                                            setFormData({ ...formData, obat_list: newList });
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Catatan</label>
                        <textarea
                            value={formData.catatan}
                            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            placeholder="Catatan tambahan..."
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};
