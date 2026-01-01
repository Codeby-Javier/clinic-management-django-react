import React, { useState, useEffect } from 'react';
import { Eye, XCircle } from 'lucide-react';
import { Table, Pagination, StatusBadge, Button, Modal, ConfirmModal } from '../../components/ui';
import { pasienService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import type { JanjiTemu, PaginatedResponse } from '../../types';

export const RiwayatJanjiTemu: React.FC = () => {
    const { user } = useAuth();
    const [janjiTemu, setJanjiTemu] = useState<PaginatedResponse<JanjiTemu> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedJanji, setSelectedJanji] = useState<JanjiTemu | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        loadData();
    }, [currentPage]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await pasienService.getRiwayatJanjiTemu({ page: currentPage.toString() });

            if (Array.isArray(data)) {
                setJanjiTemu({
                    results: data,
                    count: data.length,
                    next: null,
                    previous: null
                });
            } else if (data && typeof data === 'object' && 'results' in data) {
                setJanjiTemu({
                    results: data.results || [],
                    count: data.count || 0,
                    next: data.next || null,
                    previous: data.previous || null
                });
            } else {
                setJanjiTemu({ results: [], count: 0, next: null, previous: null });
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!selectedJanji) return;
        setIsCancelling(true);
        try {
            await pasienService.cancelJanjiTemu(selectedJanji.id);
            setIsCancelOpen(false);
            setSelectedJanji(null);
            loadData();
        } catch (error) {
            console.error('Failed to cancel:', error);
        } finally {
            setIsCancelling(false);
        }
    };

    const columns = [
        {
            key: 'dokter',
            header: 'Dokter',
            render: (item: JanjiTemu) => (
                <div>
                    <p className="font-medium text-slate-800">{item.dokter?.nama || 'Dokter tidak tersedia'}</p>
                    <p className="text-sm text-slate-500">{item.dokter?.spesialisasi_display || '-'}</p>
                </div>
            ),
        },
        { key: 'tanggal', header: 'Tanggal' },
        { key: 'waktu', header: 'Waktu' },
        {
            key: 'antrian',
            header: 'Antrian',
            render: (item: JanjiTemu) => (
                <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                    #{item.nomor_antrian || '-'}
                </span>
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
                            setIsDetailOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {['pending', 'confirmed'].includes(item.status) && (
                        <button
                            onClick={() => {
                                setSelectedJanji(item);
                                setIsCancelOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                            title="Batalkan"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Riwayat Janji Temu</h1>
                    <p className="text-slate-500 mt-1">Pantau status dan jadwal konsultasi Anda</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData}>Refresh Data</Button>
            </div>

            <Table
                columns={columns}
                data={janjiTemu?.results || []}
                isLoading={isLoading}
                emptyMessage="Belum ada riwayat janji temu. Silakan buat janji temu terlebih dahulu di menu Janji Temu."
            />

            {janjiTemu && janjiTemu.count > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(janjiTemu.count / 10)}
                    totalItems={janjiTemu.count}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />
            )}

            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Detail Janji Temu"
            >
                {selectedJanji && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Dokter</p>
                                <p className="font-medium">{selectedJanji.dokter?.nama || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Spesialisasi</p>
                                <p className="font-medium">{selectedJanji.dokter?.spesialisasi_display || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tanggal</p>
                                <p className="font-medium">{selectedJanji.tanggal}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Waktu</p>
                                <p className="font-medium">{selectedJanji.waktu}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">No. Antrian</p>
                                <p className="font-medium">#{selectedJanji.nomor_antrian || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Status</p>
                                <StatusBadge status={selectedJanji.status} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Keluhan</p>
                            <p className="font-medium">{selectedJanji.keluhan}</p>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                isOpen={isCancelOpen}
                onClose={() => setIsCancelOpen(false)}
                onConfirm={handleCancel}
                title="Batalkan Janji Temu"
                message="Apakah Anda yakin ingin membatalkan janji temu ini?"
                confirmText="Ya, Batalkan"
                isLoading={isCancelling}
                variant="danger"
            />
        </div>
    );
};
