import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, Clock } from 'lucide-react';
import { StatCard, Card, CardHeader, StatusBadge } from '../../components/ui';
import { dokterService } from '../../services';
import type { JanjiTemu, PaginatedResponse } from '../../types';

export const DokterDashboard: React.FC = () => {
    const [janjiTemu, setJanjiTemu] = useState<PaginatedResponse<JanjiTemu> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await dokterService.getJanjiTemu({ tanggal: today });
            setJanjiTemu(data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pendingCount = janjiTemu?.results.filter(j => j.status === 'pending').length || 0;
    const confirmedCount = janjiTemu?.results.filter(j => j.status === 'confirmed').length || 0;
    const completedCount = janjiTemu?.results.filter(j => j.status === 'completed').length || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Dokter</h1>
                <p className="text-slate-500 mt-1">Selamat datang, lihat jadwal dan pasien Anda</p>
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
                    title="Sedang Berlangsung"
                    value={confirmedCount}
                    icon={<Users className="w-6 h-6" />}
                    color="teal"
                />
                <StatCard
                    title="Selesai Hari Ini"
                    value={completedCount}
                    icon={<FileText className="w-6 h-6" />}
                    color="green"
                />
            </div>

            <Card>
                <CardHeader title="Janji Temu Hari Ini" subtitle="Daftar pasien yang perlu ditangani" />
                {isLoading ? (
                    <div className="animate-pulse space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-100 rounded-lg" />
                        ))}
                    </div>
                ) : janjiTemu?.results.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Tidak ada janji temu hari ini
                    </div>
                ) : (
                    <div className="space-y-3">
                        {janjiTemu?.results.slice(0, 5).map((janji) => (
                            <div
                                key={janji.id}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold">
                                        {janji.nomor_antrian}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {janji.pasien.user.first_name} {janji.pasien.user.last_name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {janji.pasien.no_rm} • {janji.waktu}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge status={janji.status} />
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
