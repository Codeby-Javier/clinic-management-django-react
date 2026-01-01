import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Receipt, Package, AlertTriangle } from 'lucide-react';
import { StatCard, Card, CardHeader, StatusBadge } from '../../components/ui';
import { apotekerService } from '../../services';
import type { ApotekerStats, Obat, Resep, PaginatedResponse } from '../../types';

export const ApotekerDashboard: React.FC = () => {
    const [stats, setStats] = useState<ApotekerStats | null>(null);
    const [resepPending, setResepPending] = useState<PaginatedResponse<Resep> | null>(null);
    const [obatMenipis, setObatMenipis] = useState<Obat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, resepData, obatData] = await Promise.all([
                apotekerService.getStats(),
                apotekerService.getResep({ status: 'pending' }),
                apotekerService.getStokMenipis(),
            ]);
            setStats(statsData);
            setResepPending(resepData);
            setObatMenipis(obatData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname.includes('/resep')) return ['Manajemen Resep', 'Daftar resep yang perlu diproses'];
        if (location.pathname.includes('/obat')) return ['Stok Obat', 'Kelola inventaris obat-obatan'];
        return ['Dashboard Apoteker', 'Kelola resep dan stok obat'];
    };

    const [title, subtitle] = getPageTitle();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                <p className="text-slate-500 mt-1">{subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Resep Pending"
                    value={stats?.resep_pending || 0}
                    icon={<Receipt className="w-6 h-6" />}
                    color="orange"
                />
                <StatCard
                    title="Obat Stok Menipis"
                    value={stats?.obat_menipis || 0}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    color="red"
                />
                <StatCard
                    title="Resep Hari Ini"
                    value={stats?.resep_hari_ini || 0}
                    icon={<Package className="w-6 h-6" />}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Resep Menunggu Proses" subtitle="Segera siapkan obat" />
                    {isLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 rounded-lg" />
                            ))}
                        </div>
                    ) : resepPending?.results.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">Tidak ada resep pending</div>
                    ) : (
                        <div className="space-y-3">
                            {resepPending?.results.slice(0, 5).map((resep) => (
                                <div key={resep.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-slate-800">{resep.pasien_nama}</p>
                                        <p className="text-sm text-slate-500">
                                            {resep.dokter_nama} • {resep.detail_resep.length} item
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status="pending" />
                                        <p className="text-sm text-slate-500 mt-1">
                                            Rp {resep.total_harga.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <CardHeader title="Stok Obat Menipis" subtitle="Perlu restock segera" />
                    {isLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 rounded-lg" />
                            ))}
                        </div>
                    ) : obatMenipis.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">Semua stok aman</div>
                    ) : (
                        <div className="space-y-3">
                            {obatMenipis.slice(0, 5).map((obat) => (
                                <div key={obat.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-slate-800">{obat.nama}</p>
                                        <p className="text-sm text-slate-500">{obat.kategori_display}</p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={obat.status_stok} />
                                        <p className="text-sm text-red-600 font-medium mt-1">
                                            Sisa: {obat.stok} {obat.satuan}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
