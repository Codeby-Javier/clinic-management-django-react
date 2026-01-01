import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download } from 'lucide-react';
import { Table, Pagination, Card, CardHeader, Modal } from '../../components/ui';
import { pasienService } from '../../services';
import type { RekamMedis } from '../../types';
import { exportToPDF } from '../../utils/exportUtils';

export const RekamMedisPasien: React.FC = () => {
    const [rekamMedis, setRekamMedis] = useState<RekamMedis[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRM, setSelectedRM] = useState<RekamMedis | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log('=== Loading Rekam Medis ===');
            const data = await pasienService.getRekamMedisSaya();
            console.log('Rekam Medis data:', data);
            console.log('Is array:', Array.isArray(data));
            console.log('Count:', Array.isArray(data) ? data.length : 0);
            
            // Ensure data is always an array
            const safeData = Array.isArray(data) ? data : [];
            setRekamMedis(safeData);
        } catch (error: any) {
            console.error('=== Error Loading Rekam Medis ===');
            console.error('Error:', error);
            console.error('Response:', error.response);
            console.error('Response data:', error.response?.data);
            
            setError(error.response?.data?.detail || 'Gagal memuat data rekam medis');
            setRekamMedis([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getDokterName = (rm: RekamMedis): string => {
        if (rm.dokter?.nama) return rm.dokter.nama;
        if (rm.dokter?.user) {
            const { first_name, last_name } = rm.dokter.user;
            return `Dr. ${first_name} ${last_name || ''}`.trim();
        }
        return 'Dokter tidak tersedia';
    };

    const handleDownload = (rm: RekamMedis) => {
        const title = `REKAM MEDIS - ${rm.pasien?.no_rm || 'N/A'}`;
        const headers = ['Field', 'Keterangan'];
        const data = [
            ['Tanggal', new Date(rm.tanggal_periksa).toLocaleDateString('id-ID')],
            ['Dokter', getDokterName(rm)],
            ['Anamnesa', rm.anamnesa || '-'],
            ['Diagnosa', rm.diagnosa || '-'],
            ['Pemeriksaan Fisik', rm.pemeriksaan_fisik || '-'],
            ['Catatan', rm.catatan || '-']
        ];
        exportToPDF(title, headers, data, `RM_${rm.pasien?.no_rm || rm.id}_${rm.id}`);
    };

    const columns = [
        { 
            key: 'tanggal', 
            header: 'Tanggal', 
            render: (it: RekamMedis) => new Date(it.tanggal_periksa).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        },
        { 
            key: 'dokter', 
            header: 'Dokter', 
            render: (it: RekamMedis) => getDokterName(it)
        },
        { 
            key: 'diagnosa', 
            header: 'Diagnosa',
            render: (it: RekamMedis) => (
                <span className="max-w-xs truncate block">{it.diagnosa || '-'}</span>
            )
        },
        {
            key: 'aksi',
            header: 'Aksi',
            render: (it: RekamMedis) => (
                <div className="flex gap-2">
                    <button 
                        onClick={() => { setSelectedRM(it); setIsModalOpen(true); }} 
                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDownload(it)} 
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Rekam Medis Saya</h1>
                <p className="text-slate-500 mt-1">Riwayat kesehatan dan hasil pemeriksaan Anda</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <Table 
                columns={columns} 
                data={rekamMedis} 
                isLoading={isLoading}
                emptyMessage="Belum ada rekam medis. Silakan lakukan konsultasi terlebih dahulu."
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Rekam Medis" size="lg">
                {selectedRM && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Dokter</label>
                                <p className="font-medium">{getDokterName(selectedRM)}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Tanggal Periksa</label>
                                <p className="font-medium">
                                    {new Date(selectedRM.tanggal_periksa).toLocaleString('id-ID', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="text-xs text-slate-500 uppercase font-bold">Anamnesa/Keluhan</label>
                                <p className="mt-1">{selectedRM.anamnesa || '-'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="text-xs text-slate-500 uppercase font-bold">Pemeriksaan Fisik</label>
                                <p className="mt-1">{selectedRM.pemeriksaan_fisik || '-'}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl">
                                <label className="text-xs text-emerald-600 uppercase font-bold">Diagnosa</label>
                                <p className="mt-1 font-bold text-emerald-900">{selectedRM.diagnosa || '-'}</p>
                            </div>
                            {selectedRM.tindakan && selectedRM.tindakan.length > 0 && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <label className="text-xs text-slate-500 uppercase font-bold">Tindakan</label>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        {selectedRM.tindakan.map((t: any) => (
                                            <li key={t.id}>{t.nama_tindakan} - Rp {t.biaya?.toLocaleString('id-ID') || 0}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {selectedRM.resep_list && selectedRM.resep_list.length > 0 && (
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <label className="text-xs text-blue-600 uppercase font-bold">Resep Obat</label>
                                    <div className="mt-2 space-y-2">
                                        {selectedRM.resep_list.map((resep: any) => (
                                            <div key={resep.id} className="bg-white p-3 rounded-lg">
                                                {resep.detail_resep?.map((detail: any) => (
                                                    <div key={detail.id} className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium">{detail.obat?.nama || 'Obat'}</p>
                                                            <p className="text-sm text-slate-500">{detail.aturan_pakai}</p>
                                                        </div>
                                                        <span className="text-sm font-medium">{detail.jumlah}x</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="text-xs text-slate-500 uppercase font-bold">Catatan Dokter</label>
                                <p className="mt-1 italic">"{selectedRM.catatan || 'Tidak ada catatan tambahan'}"</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
