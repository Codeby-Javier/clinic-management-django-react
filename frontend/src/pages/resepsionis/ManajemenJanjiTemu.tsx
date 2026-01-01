import React, { useState, useEffect } from 'react';
import { Table, Pagination, StatusBadge, Button, Modal, ConfirmModal } from '../../components/ui';
import { resepsionisService } from '../../services';
import type { JanjiTemu, PaginatedResponse } from '../../types';
import { CheckCircle, XCircle, Eye, Clock, CheckSquare, ClipboardList } from 'lucide-react';

export const ManajemenJanjiTemu: React.FC = () => {
    const [data, setData] = useState<PaginatedResponse<JanjiTemu> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [tanggalFilter, setTanggalFilter] = useState<string>(new Date().toISOString().split('T')[0]); // Default: hari ini

    // Modal States
    const [selectedJanji, setSelectedJanji] = useState<JanjiTemu | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        loadData();
    }, [currentPage, statusFilter, tanggalFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = { page: currentPage.toString() };
            if (statusFilter) params.status = statusFilter;
            if (tanggalFilter) params.tanggal = tanggalFilter;
            const response = await resepsionisService.getJanjiTemu(params);
            setData(response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper functions untuk quick date filter
    const getToday = () => new Date().toISOString().split('T')[0];
    const getYesterday = () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    };
    const getTomorrow = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };
    
    const formatTanggalLabel = (tanggal: string) => {
        const today = getToday();
        const yesterday = getYesterday();
        const tomorrow = getTomorrow();
        
        if (tanggal === today) return 'Hari Ini';
        if (tanggal === yesterday) return 'Kemarin';
        if (tanggal === tomorrow) return 'Besok';
        
        const date = new Date(tanggal);
        return date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });
    };

    const handleConfirm = async () => {
        if (!selectedJanji) return;
        setActionLoading(true);
        try {
            await resepsionisService.konfirmasiJanji(selectedJanji.id);
            setIsConfirmOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Gagal mengonfirmasi janji temu.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedJanji) return;
        setActionLoading(true);
        try {
            await resepsionisService.rejectJanji(selectedJanji.id, rejectReason);
            setIsRejectOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Gagal menolak janji temu.');
        } finally {
            setActionLoading(false);
        }
    };

    const columns = [
        {
            key: 'antrian',
            header: 'Antrian',
            render: (it: JanjiTemu) => (
                <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <span className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-md min-w-[80px]">
                            {it.nomor_antrian || '-'}
                        </span>
                        <span className="text-xs text-slate-500 mt-1 font-medium">
                            {it.dokter?.nama?.split(' ')[1] || it.dokter?.user?.first_name || ''}
                        </span>
                    </div>
                </div>
            )
        },
        { key: 'tanggal', header: 'Tanggal' },
        { key: 'waktu', header: 'Waktu' },
        {
            key: 'pasien',
            header: 'Pasien',
            render: (it: JanjiTemu) => (
                <div>
                    <p className="font-medium">{it.pasien?.user?.first_name || 'Pasien'} {it.pasien?.user?.last_name}</p>
                    <p className="text-xs text-slate-500">RM: {it.pasien?.no_rm || '-'}</p>
                </div>
            )
        },
        {
            key: 'dokter',
            header: 'Dokter',
            render: (it: JanjiTemu) => (
                <div>
                    <p className="font-medium">{it.dokter?.nama || '-'}</p>
                    <p className="text-xs text-slate-500">{it.dokter?.spesialisasi_display || '-'}</p>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (it: JanjiTemu) => <StatusBadge status={it.status} />
        },
        {
            key: 'aksi',
            header: 'Aksi',
            render: (it: JanjiTemu) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => { setSelectedJanji(it); setIsDetailOpen(true); }}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                        title="Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {it.status === 'pending' && (
                        <>
                            <button
                                onClick={() => { setSelectedJanji(it); setIsConfirmOpen(true); }}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Konfirmasi"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { setSelectedJanji(it); setRejectReason(''); setIsRejectOpen(true); }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Tolak"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Janji Temu</h1>
                    <p className="text-slate-500 mt-1">Konfirmasi atau atur ulang jadwal kedatangan pasien</p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Quick Date Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setTanggalFilter(getYesterday());
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                tanggalFilter === getYesterday()
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Kemarin
                        </button>
                        <button
                            onClick={() => {
                                setTanggalFilter(getToday());
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                tanggalFilter === getToday()
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Hari Ini
                        </button>
                        <button
                            onClick={() => {
                                setTanggalFilter(getTomorrow());
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                tanggalFilter === getTomorrow()
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Besok
                        </button>
                    </div>

                    {/* Custom Date Picker */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Pilih Tanggal:</label>
                        <input
                            type="date"
                            value={tanggalFilter}
                            onChange={(e) => {
                                setTanggalFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Refresh Button */}
                    <Button variant="outline" onClick={loadData}>
                        Refresh
                    </Button>
                </div>

                {/* Current Filter Info */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                        Menampilkan janji temu: <span className="font-semibold text-sky-600">{formatTanggalLabel(tanggalFilter)}</span>
                        {statusFilter && <span className="ml-2">• Status: <span className="font-semibold">{statusFilter}</span></span>}
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-amber-700 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {data?.results.filter(j => j.status === 'pending').length || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-sky-700 font-medium">Confirmed</p>
                            <p className="text-2xl font-bold text-sky-600">
                                {data?.results.filter(j => j.status === 'confirmed').length || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                            <CheckSquare className="w-6 h-6 text-sky-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-emerald-700 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {data?.results.filter(j => j.status === 'completed').length || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-700 font-medium">Total</p>
                            <p className="text-2xl font-bold text-slate-600">
                                {data?.results.length || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-slate-600" />
                        </div>
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                data={data?.results || []}
                isLoading={isLoading}
            />

            {data && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(data.count / 10)}
                    totalItems={data.count}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Modal Konfirmasi */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirm}
                title="Konfirmasi Janji Temu"
                message={`Apakah Anda yakin ingin mengonfirmasi janji temu untuk pasien ${selectedJanji?.pasien?.user?.first_name || 'ini'}?`}
                isLoading={actionLoading}
                confirmText="Konfirmasi"
                variant="warning"
            />

            {/* Modal Tolak */}
            <Modal
                isOpen={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
                title="Tolak Janji Temu"
                size="sm"
                footer={(
                    <>
                        <Button variant="secondary" onClick={() => setIsRejectOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleReject} isLoading={actionLoading}>Tolak</Button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Mohon berikan alasan penolakan untuk diinformasikan kepada pasien.</p>
                    <textarea
                        className="w-full border p-2 rounded"
                        placeholder="Alasan penolakan..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </div>
            </Modal>

            {/* Modal Detail */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Detail Janji Temu"
            >
                {selectedJanji && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-500">Pasien</label>
                                <p className="font-medium">{selectedJanji.pasien?.user?.first_name} {selectedJanji.pasien?.user?.last_name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">No. RM</label>
                                <p className="font-medium">{selectedJanji.pasien?.no_rm || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Dokter</label>
                                <p className="font-medium">{selectedJanji.dokter?.nama || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Spesialisasi</label>
                                <p className="font-medium">{selectedJanji.dokter?.spesialisasi_display || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Jadwal</label>
                                <p className="font-medium">{selectedJanji.tanggal} {selectedJanji.waktu}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500">Antrian</label>
                                <p className="font-medium text-sky-600 font-bold">#{selectedJanji.nomor_antrian}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-slate-500">Keluhan</label>
                            <p className="p-3 bg-slate-50 rounded-lg">{selectedJanji.keluhan || '-'}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
