import React, { useState, useEffect } from 'react';
import { Table, Pagination, StatusBadge, Button, Modal, Card } from '../../components/ui';
import { kasirService } from '../../services';
import type { Pembayaran, PaginatedResponse } from '../../types';
import { CreditCard, Printer, Eye, FileSpreadsheet, Banknote, Building2, Smartphone, Heart } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

export const PembayaranKasir: React.FC = () => {
    const [data, setData] = useState<PaginatedResponse<Pembayaran> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    // Modal
    const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isBayarOpen, setIsBayarOpen] = useState(false);
    const [metodeBayar, setMetodeBayar] = useState('tunai');
    const [jumlahBayar, setJumlahBayar] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, [currentPage, statusFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = { page: currentPage.toString() };
            if (statusFilter) params.status = statusFilter;
            const response = await kasirService.getPembayaran(params);
            setData(response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProsesBayar = async () => {
        if (!selectedPembayaran) return;
        
        // Validasi jumlah bayar untuk metode tunai
        if (metodeBayar === 'tunai' && jumlahBayar < selectedPembayaran.total_biaya) {
            alert('Jumlah bayar tidak mencukupi!');
            return;
        }
        
        setIsProcessing(true);
        try {
            await kasirService.prosesBayar(selectedPembayaran.id, { metode: metodeBayar });
            alert('Pembayaran berhasil diproses!');
            setIsBayarOpen(false);
            setJumlahBayar(0);
            setMetodeBayar('tunai');
            loadData();
        } catch (error) {
            console.error(error);
            alert('Gagal memproses pembayaran.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintInvoice = (item: Pembayaran) => {
        const bodyData = [
            ['Biaya Konsultasi', `Rp ${(item.biaya_konsultasi || 0).toLocaleString('id-ID')}`],
            ['Biaya Tindakan', `Rp ${(item.biaya_tindakan || 0).toLocaleString('id-ID')}`],
            ['Biaya Obat', `Rp ${(item.biaya_obat || 0).toLocaleString('id-ID')}`],
            ['', ''],
            ['TOTAL', `Rp ${(item.total_biaya || 0).toLocaleString('id-ID')}`]
        ];

        exportToPDF(
            `INVOICE: ${item.invoice_number}`,
            ['Deskripsi', 'Jumlah'],
            bodyData,
            `Invoice_${item.invoice_number}`
        );
    };

    const handleExportExcel = () => {
        if (!data?.results) return;
        const exportData = data.results.map(p => ({
            Invoice: p.invoice_number,
            Pasien: p.janji_temu?.pasien?.user?.first_name,
            Dokter: p.janji_temu?.dokter?.nama,
            Total: p.total_biaya,
            Status: p.status,
            Tanggal: new Date(p.created_at).toLocaleDateString()
        }));
        exportToExcel(exportData, 'Laporan_Pembayaran');
    };

    const columns = [
        { key: 'invoice', header: 'Invoice', render: (it: Pembayaran) => it.invoice_number },
        {
            key: 'pasien',
            header: 'Pasien',
            render: (it: Pembayaran) => (
                <div>
                    <p className="font-medium">{it.janji_temu?.pasien?.user?.first_name}</p>
                    <p className="text-xs text-slate-500">{it.janji_temu?.pasien?.no_rm}</p>
                </div>
            )
        },
        { key: 'tanggal', header: 'Tanggal', render: (it: Pembayaran) => new Date(it.created_at).toLocaleDateString() },
        {
            key: 'total',
            header: 'Total',
            render: (it: Pembayaran) => (
                <span className="font-bold text-slate-700">Rp {it.total_biaya.toLocaleString()}</span>
            )
        },
        { key: 'status', header: 'Status', render: (it: Pembayaran) => <StatusBadge status={it.status} /> },
        {
            key: 'aksi',
            header: 'Aksi',
            render: (it: Pembayaran) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => { setSelectedPembayaran(it); setIsDetailOpen(true); }}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                        title="Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {it.status === 'pending' && (
                        <button
                            onClick={() => { setSelectedPembayaran(it); setIsBayarOpen(true); }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Proses Bayar"
                        >
                            <CreditCard className="w-4 h-4" />
                        </button>
                    )}
                    {it.status === 'lunas' && (
                        <button
                            onClick={() => handlePrintInvoice(it)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded"
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pembayaran Kasir</h1>
                    <p className="text-slate-500 mt-1">Kelola transaksi pembayaran pasien</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="border p-2 rounded-lg"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="lunas">Lunas</option>
                    </select>
                    <Button variant="outline" icon={<FileSpreadsheet className="w-4 h-4" />} onClick={handleExportExcel}>
                        Excel
                    </Button>
                </div>
            </div>

            <Table columns={columns} data={data?.results || []} isLoading={isLoading} />

            {data && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(data.count / 10)}
                    totalItems={data.count}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Modal Proses Bayar */}
            <Modal
                isOpen={isBayarOpen}
                onClose={() => {
                    setIsBayarOpen(false);
                    setJumlahBayar(0);
                    setMetodeBayar('tunai');
                }}
                title="Proses Pembayaran"
                size="md"
            >
                {selectedPembayaran && (
                    <div className="space-y-6">
                        {/* Info Pasien */}
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Pasien</p>
                                    <p className="font-medium text-slate-800">
                                        {selectedPembayaran.janji_temu?.pasien?.user?.first_name || '-'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {selectedPembayaran.janji_temu?.pasien?.no_rm || '-'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Invoice</p>
                                    <p className="font-mono text-sm font-medium">{selectedPembayaran.invoice_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Tagihan */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                            <p className="text-sm text-emerald-700 font-medium mb-1">Total Tagihan</p>
                            <p className="text-4xl font-bold text-emerald-600">
                                Rp {selectedPembayaran.total_biaya.toLocaleString('id-ID')}
                            </p>
                            <div className="mt-3 pt-3 border-t border-emerald-200 text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-emerald-700">Konsultasi</span>
                                    <span className="font-medium">Rp {(selectedPembayaran.biaya_konsultasi || 0).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-emerald-700">Tindakan</span>
                                    <span className="font-medium">Rp {(selectedPembayaran.biaya_tindakan || 0).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-emerald-700">Obat</span>
                                    <span className="font-medium">Rp {(selectedPembayaran.biaya_obat || 0).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Metode Pembayaran */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Metode Pembayaran</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'tunai', label: 'Tunai', Icon: Banknote },
                                    { value: 'transfer', label: 'Transfer', Icon: Building2 },
                                    { value: 'qris', label: 'QRIS', Icon: Smartphone },
                                    { value: 'asuransi', label: 'Asuransi', Icon: Heart }
                                ].map(m => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => {
                                            setMetodeBayar(m.value);
                                            // Auto-fill jumlah bayar untuk non-tunai
                                            if (m.value !== 'tunai') {
                                                setJumlahBayar(selectedPembayaran.total_biaya);
                                            }
                                        }}
                                        className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-2 ${
                                            metodeBayar === m.value 
                                                ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' 
                                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <m.Icon className="w-6 h-6" />
                                        <div className="font-medium text-sm">{m.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Jumlah Bayar (hanya untuk tunai) */}
                        {metodeBayar === 'tunai' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Jumlah Bayar
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            value={jumlahBayar || ''}
                                            onChange={(e) => setJumlahBayar(Number(e.target.value))}
                                            placeholder="0"
                                            className="w-full pl-12 pr-4 py-3 text-lg font-semibold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                            min={0}
                                        />
                                    </div>
                                    {/* Quick Amount Buttons */}
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {[
                                            selectedPembayaran.total_biaya,
                                            Math.ceil(selectedPembayaran.total_biaya / 50000) * 50000,
                                            Math.ceil(selectedPembayaran.total_biaya / 100000) * 100000,
                                            Math.ceil(selectedPembayaran.total_biaya / 100000) * 100000 + 100000
                                        ].map((amount, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setJumlahBayar(amount)}
                                                className="px-2 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                            >
                                                {amount.toLocaleString('id-ID')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Kembalian */}
                                {jumlahBayar > 0 && (
                                    <div className={`p-4 rounded-xl border-2 ${
                                        jumlahBayar >= selectedPembayaran.total_biaya
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <p className={`text-sm font-medium mb-1 ${
                                            jumlahBayar >= selectedPembayaran.total_biaya
                                                ? 'text-blue-700'
                                                : 'text-red-700'
                                        }`}>
                                            {jumlahBayar >= selectedPembayaran.total_biaya ? 'Kembalian' : 'Kurang Bayar'}
                                        </p>
                                        <p className={`text-3xl font-bold ${
                                            jumlahBayar >= selectedPembayaran.total_biaya
                                                ? 'text-blue-600'
                                                : 'text-red-600'
                                        }`}>
                                            Rp {Math.abs(jumlahBayar - selectedPembayaran.total_biaya).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info untuk non-tunai */}
                        {metodeBayar !== 'tunai' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">ℹ️ Info:</span> Pastikan pembayaran sudah diterima sebelum memproses transaksi.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsBayarOpen(false);
                                    setJumlahBayar(0);
                                    setMetodeBayar('tunai');
                                }}
                                disabled={isProcessing}
                            >
                                Batal
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleProsesBayar}
                                isLoading={isProcessing}
                                disabled={metodeBayar === 'tunai' && jumlahBayar < selectedPembayaran.total_biaya}
                                icon={<CreditCard className="w-4 h-4" />}
                            >
                                {metodeBayar === 'tunai' && jumlahBayar >= selectedPembayaran.total_biaya
                                    ? `Bayar & Kembalian Rp ${(jumlahBayar - selectedPembayaran.total_biaya).toLocaleString('id-ID')}`
                                    : 'Proses Pembayaran'
                                }
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Detail Invoice"
                size="lg"
            >
                {selectedPembayaran && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">No. Invoice</p>
                                    <p className="font-mono text-lg font-bold text-slate-800">{selectedPembayaran.invoice_number}</p>
                                </div>
                                <StatusBadge status={selectedPembayaran.status} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sky-200">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Pasien</p>
                                    <p className="font-medium">{selectedPembayaran.janji_temu?.pasien?.user?.first_name || '-'}</p>
                                    <p className="text-sm text-slate-500">{selectedPembayaran.janji_temu?.pasien?.no_rm || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Dokter</p>
                                    <p className="font-medium">{selectedPembayaran.janji_temu?.dokter?.nama || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-slate-700">Rincian Biaya</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="p-3 text-left">Deskripsi</th>
                                            <th className="p-3 text-right">Biaya</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="p-3">Biaya Konsultasi</td>
                                            <td className="p-3 text-right font-medium">
                                                Rp {(selectedPembayaran.biaya_konsultasi || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-3">Biaya Tindakan</td>
                                            <td className="p-3 text-right font-medium">
                                                Rp {(selectedPembayaran.biaya_tindakan || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-3">Biaya Obat</td>
                                            <td className="p-3 text-right font-medium">
                                                Rp {(selectedPembayaran.biaya_obat || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-emerald-50">
                                        <tr>
                                            <td className="p-3 font-bold text-emerald-800">TOTAL</td>
                                            <td className="p-3 text-right font-bold text-emerald-600 text-lg">
                                                Rp {(selectedPembayaran.total_biaya || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tanggal Dibuat</span>
                                <span className="font-medium text-slate-800">
                                    {new Date(selectedPembayaran.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
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
                            {selectedPembayaran.metode && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Metode Pembayaran</span>
                                    <span className="font-medium text-slate-800 uppercase">
                                        {selectedPembayaran.metode_display || selectedPembayaran.metode}
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

                        {selectedPembayaran.status === 'lunas' && (
                            <div className="flex gap-2 pt-4 border-t border-slate-200">
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => handlePrintInvoice(selectedPembayaran)}
                                    icon={<Printer className="w-4 h-4" />}
                                >
                                    Cetak Invoice
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
