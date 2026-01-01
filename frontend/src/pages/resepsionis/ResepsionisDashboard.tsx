import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Calendar, Clock, UserPlus } from 'lucide-react';
import { StatCard, Card, CardHeader, StatusBadge } from '../../components/ui';
import { resepsionisService } from '../../services';
import type { JanjiTemu, PaginatedResponse } from '../../types';

export const ResepsionisDashboard: React.FC = () => {
    const [janjiTemu, setJanjiTemu] = useState<PaginatedResponse<JanjiTemu> | null>(null);
    const [antrian, setAntrian] = useState<JanjiTemu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [janjiData, antrianData] = await Promise.all([
                resepsionisService.getJanjiTemu({ tanggal: today }),
                resepsionisService.getAntrian(),
            ]);
            setJanjiTemu(janjiData);
            setAntrian(antrianData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPageTitle = () => {
        if (location.pathname.includes('/antrian')) return ['Antrian Pasien', 'Pantau antrian yang sedang berjalan'];
        if (location.pathname.includes('/janji-temu')) return ['Janji Temu', 'Kelola jadwal kunjungan pasien'];
        if (location.pathname.includes('/pasien')) return ['Data Pasien', 'Manajemen data pasien klinik'];
        return ['Dashboard Resepsionis', 'Kelola pendaftaran dan aktivitas harian'];
    };

    const [title, subtitle] = getPageTitle();
    const pendingCount = janjiTemu?.results?.filter(j => j.status === 'pending').length || 0;
    const safeAntrian = Array.isArray(antrian) ? antrian : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                <p className="text-slate-500 mt-1">{subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Janji Hari Ini"
                    value={janjiTemu?.count || 0}
                    icon={<Calendar className="w-6 h-6" />}
                    color="blue"
                />
                <StatCard
                    title="Menunggu Konfirmasi"
                    value={pendingCount}
                    icon={<Clock className="w-6 h-6" />}
                    color="orange"
                />
                <StatCard
                    title="Antrian Aktif"
                    value={safeAntrian.length}
                    icon={<Users className="w-6 h-6" />}
                    color="teal"
                />
                <StatCard
                    title="Aksi Cepat"
                    value="Daftar Pasien"
                    icon={<UserPlus className="w-6 h-6" />}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Antrian Hari Ini" subtitle="Pasien yang sedang mengantri" />
                    {isLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 rounded-lg" />
                            ))}
                        </div>
                    ) : safeAntrian.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">Tidak ada antrian</div>
                    ) : (
                        <div className="space-y-3">
                            {safeAntrian.slice(0, 5).map((janji) => (
                                <div key={janji.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold">
                                            {janji.nomor_antrian}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {janji.pasien.user.first_name} {janji.pasien.user.last_name}
                                            </p>
                                            <p className="text-sm text-slate-500">{janji.dokter.nama}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={janji.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <CardHeader title="Janji Pending" subtitle="Menunggu konfirmasi" />
                    {isLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 rounded-lg" />
                            ))}
                        </div>
                    ) : janjiTemu?.results.filter(j => j.status === 'pending').length === 0 ? (
                        <div className="text-center py-8 text-slate-500">Tidak ada janji pending</div>
                    ) : (
                        <div className="space-y-3">
                            {janjiTemu?.results
                                .filter(j => j.status === 'pending')
                                .slice(0, 5)
                                .map((janji) => (
                                    <div key={janji.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {janji.pasien.user.first_name} {janji.pasien.user.last_name}
                                            </p>
                                            <p className="text-sm text-slate-500">{janji.tanggal} • {janji.waktu}</p>
                                        </div>
                                        <StatusBadge status="pending" />
                                    </div>
                                ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
