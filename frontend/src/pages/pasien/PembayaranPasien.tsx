import React, { useState, useEffect } from 'react';
import { CreditCard, Eye, Printer } from 'lucide-react';
import { Table, StatusBadge, Modal } from '../../components/ui';
import { pasienService } from '../../services';
import type { Pembayaran } from '../../types';
import { exportToPDF } from '../../utils/exportUtils';

export const PembayaranPasien: React.FC = () => {
    const [pembayaran, setPembayaran] = useState<Pembayaran[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log('=== Loading Pembayaran ===');
            const data = await pasienService.getRiwayatPembayaran();
            console.log('Pembayaran data:', data);
            console.log('Is array:', Array.isArray(data));
            console.log('Count:', Array.isArray(data) ? data.length : 0);
            
            // Ensure data is always an array
            const safeData = Array.isArray(data) ? data : [];
            setPembayaran(safeData);
        } catch (error: any) {
            console.error('=== Error Loading Pembayaran ===');
            console.error('Error:', error);
            console.error('Response:', error.response);
            console.error('Response data:', error.response?.data);
            
            setError(error.response?.data?.detail || 'Gagal memuat data pembayaran');
            setPembayaran([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = (item: Pembayaran) => {
        const title = `INVOICE - ${item.invoice_number}`;
        const headers = ['Deskripsi', 'Jumlah'];
        const data = [
            ['Biaya Konsultasi', `Rp ${item.biaya_konsultasi?.toLocaleString('id-ID') || 0}`],
            ['Biaya Tindakan', `Rp ${item.biaya_tindakan?.toLocaleString('id-ID') || 0}`],
            ['Biaya Obat', `Rp ${item.biaya_obat?.toLocaleString('id-ID') || 0}`],
            ['', ''],
            ['TOTAL', `Rp ${item.total_biaya?.toLocaleString('id-ID') || 0}`]
        ];
        exportToPDF(title, headers, data, `Invoice_${item.invoice_number}`);
    };

    const columns = [
        { 
            key: 'invoice', 
            header: 'No. Invoice', 
            render: (it: Pembayaran) => (
                <span className="font-mono text-sm">{it.invoice_number || '-'}</span>
            )
        },
        { 
            key: 'tanggal', 
            header: 'Tanggal', 
            render: (it: Pembayaran) => new Date(it.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        },
        { 
            key: 'total', 
            header: 'Total', 
            render: (it: Pembayaran) => (
                <span className="font-semibold text-emerald-600">
                    Rp {(it.total_biaya || 0).toLocaleString('id-ID')}
                </span>
            )
        },
        { 
            key: 'metode',
            header: 'Metode',
            render: (it: Pembayaran) => (
                <span className="text-sm uppercase text-slate-600">
                    {it.metode_display || it.metode || '-'}
                </span>
            )
        },
        { 
            key: 'status', 
            header: 'Status', 
            render: (it: Pembayaran) => <StatusBadge status={it.status} /> 
        },
        {
            key: 'aksi',
            header: 'Aksi',
            render: (it: Pembayaran) => (
                <div className="flex gap-2">
                    <button 
                        onClick={() => { setSelectedPembayaran(it); setIsModalOpen(true); }} 
                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {it.status === 'lunas' && (
                        <button 
                            onClick={() => handlePrint(it)} 
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Cetak Invoice"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Riwayat Pembayaran</h1>
                <p className="text-slate-500 mt-1">Daftar tagihan dan bukti pembayaran Anda</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <Table 
                columns={columns} 
                data={pembayaran} 
                isLoading={isLoading}
                emptyMessage="Belum ada riwayat pembayaran."
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Pembayaran" size="md">
                {selectedPembayaran && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Pembayaran</p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                        Rp {(selectedPembayaran.total_biaya || 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <StatusBadge status={selectedPembayaran.status} />
                            </div>
                            <div className="pt-4 border-t border-emerald-200">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">No. Invoice</p>
                                <p className="font-mono text-sm font-medium">{selectedPembayaran.invoice_number}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-slate-700">Rincian Biaya</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Biaya Konsultasi</span>
                                    <span className="font-medium">
                                        Rp {(selectedPembayaran.biaya_konsultasi || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Biaya Tindakan</span>
                                    <span className="font-medium">
                                        Rp {(selectedPembayaran.biaya_tindakan || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Biaya Obat</span>
                                    <span className="font-medium">
                                        Rp {(selectedPembayaran.biaya_obat || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Metode Pembayaran</span>
                                <span className="font-medium text-slate-800 uppercase">
                                    {selectedPembayaran.metode_display || selectedPembayaran.metode || '-'}
                                </span>
                            </div>
                            {selectedPembayaran.tanggal_bayar && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Tanggal Bayar</span>
                                    <span className="font-medium text-slate-800">
                                        {new Date(selectedPembayaran.tanggal_bayar).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}
                            {selectedPembayaran.processed_by_name && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Diproses oleh</span>
                                    <span className="font-medium text-slate-800">
                                        {selectedPembayaran.processed_by_name}
                                    </span>
                                </div>
                            )}
                            {selectedPembayaran.catatan && (
                                <div className="pt-3 border-t border-slate-100">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Catatan</p>
                                    <p className="text-sm text-slate-600 italic">{selectedPembayaran.catatan}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs text-center text-slate-400 italic">
                                Terima kasih atas kepercayaan Anda
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
