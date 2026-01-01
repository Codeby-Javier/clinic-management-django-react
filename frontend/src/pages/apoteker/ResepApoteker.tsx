import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle, Clock, Eye } from 'lucide-react';
import { Table, StatusBadge, Button, Modal, ConfirmModal } from '../../components/ui';
import { apotekerService } from '../../services';
import type { Resep, PaginatedResponse } from '../../types';

export const ResepApoteker: React.FC = () => {
    const [resepList, setResepList] = useState<PaginatedResponse<Resep> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResep, setSelectedResep] = useState<Resep | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isProsesOpen, setIsProsesOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await apotekerService.getResep({ status: 'pending' });
            setResepList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProses = async () => {
        if (!selectedResep) return;
        setProcessing(true);
        try {
            await apotekerService.prosesResep(selectedResep.id, { status: 'selesai' });
            setIsProsesOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Gagal memproses resep. Pastikan stok obat mencukupi.');
        } finally {
            setProcessing(false);
        }
    };

    const columns = [
        { key: 'pasien', header: 'Pasien', render: (it: Resep) => it.pasien_nama || '-' },
        { key: 'dokter', header: 'Dokter', render: (it: Resep) => it.dokter_nama || '-' },
        { key: 'jumlah', header: 'Jumlah Item', render: (it: Resep) => `${it.detail_resep?.length || 0} item` },
        { key: 'total', header: 'Total', render: (it: Resep) => `Rp ${(it.total_harga || 0).toLocaleString('id-ID')}` },
        { key: 'status', header: 'Status', render: (it: Resep) => <StatusBadge status={it.status} /> },
        {
            key: 'aksi',
            header: 'Aksi',
            render: (it: Resep) => (
                <div className="flex gap-2">
                    <button onClick={() => { setSelectedResep(it); setIsDetailOpen(true); }} className="p-2 hover:bg-slate-100 rounded text-slate-600">
                        <Eye className="w-4 h-4" />
                    </button>
                    {it.status === 'pending' && (
                        <button onClick={() => { setSelectedResep(it); setIsProsesOpen(true); }} className="p-2 hover:bg-emerald-50 rounded text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Manajemen Resep Obat</h1>
                <p className="text-slate-500 mt-1">Proses resep obat dari rekam medis pasien</p>
            </div>

            <Table columns={columns} data={resepList?.results || []} isLoading={isLoading} />

            <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Resep" size="lg">
                {selectedResep && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Pasien</p>
                                <p className="font-medium">{selectedResep.pasien_nama || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Dokter</p>
                                <p className="font-medium">{selectedResep.dokter_nama || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Tanggal Resep</p>
                                <p className="font-medium">
                                    {new Date(selectedResep.tanggal_resep).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                                <StatusBadge status={selectedResep.status} />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl">
                            <h3 className="font-bold text-blue-800 mb-3">Daftar Obat</h3>
                            {selectedResep.detail_resep && selectedResep.detail_resep.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedResep.detail_resep.map((detail: any) => (
                                        <div key={detail.id} className="flex justify-between items-start p-3 bg-white rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">{detail.obat?.nama || detail.obat_nama || '-'}</p>
                                                <p className="text-sm text-slate-500">{detail.aturan_pakai || '-'}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-semibold text-slate-800">{detail.jumlah}x</p>
                                                <p className="text-sm text-emerald-600">
                                                    Rp {((detail.harga_satuan || 0) * (detail.jumlah || 0)).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-4">Tidak ada detail obat</p>
                            )}
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-xl">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-emerald-800">Total Harga</span>
                                <span className="text-xl font-bold text-emerald-600">
                                    Rp {(selectedResep.total_harga || 0).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {selectedResep.catatan_apoteker && (
                            <div className="p-4 bg-amber-50 rounded-xl">
                                <h3 className="text-xs font-bold text-amber-600 uppercase mb-1">Catatan Apoteker</h3>
                                <p className="text-sm">{selectedResep.catatan_apoteker}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <ConfirmModal
                isOpen={isProsesOpen}
                onClose={() => setIsProsesOpen(false)}
                onConfirm={handleProses}
                title="Proses Resep"
                message="Pastikan semua obat sudah disiapkan sesuai resep. Stok obat akan berkurang otomatis."
                isLoading={processing}
                confirmText="Selesaikan & Kurangi Stok"
            />
        </div>
    );
};
