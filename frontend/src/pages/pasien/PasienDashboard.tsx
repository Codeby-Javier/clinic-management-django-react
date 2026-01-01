import React, { useState, useEffect } from 'react';
import { Calendar, FileText, CreditCard, Clock } from 'lucide-react';
import { StatCard, Card, CardHeader, StatusBadge } from '../../components/ui';
import { pasienService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import type { JanjiTemu } from '../../types';

export const PasienDashboard: React.FC = () => {
    const { user } = useAuth();
    const [janjiTemu, setJanjiTemu] = useState<JanjiTemu[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await pasienService.getRiwayatJanjiTemu({});
            // getRiwayatJanjiTemu now returns array
            setJanjiTemu(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load data:', error);
            setJanjiTemu([]);
        } finally {
            setIsLoading(false);
        }
    };

    const activeCount = janjiTemu.filter(j => ['pending', 'confirmed'].includes(j.status)).length;
    const completedCount = janjiTemu.filter(j => j.status === 'completed').length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Halo, {user?.first_name}!
                </h1>
                <p className="text-slate-500 mt-1">Selamat datang di portal pasien KlinikSehat</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Kunjungan"
                    value={janjiTemu.length}
                    icon={<Calendar className="w-6 h-6" />}
                    color="blue"
                />
                <StatCard
                    title="Janji Aktif"
                    value={activeCount}
                    icon={<Clock className="w-6 h-6" />}
                    color="orange"
                />
                <StatCard
                    title="Selesai"
                    value={completedCount}
                    icon={<FileText className="w-6 h-6" />}
                    color="green"
                />
                <StatCard
                    title="No. Rekam Medis"
                    value={(user?.profile_detail as { no_rm?: string })?.no_rm || '-'}
                    icon={<CreditCard className="w-6 h-6" />}
                    color="teal"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader title="Janji Temu Terdekat" subtitle="Jadwal kunjungan Anda" />
                    {isLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 rounded-lg" />
                            ))}
                        </div>
                    ) : janjiTemu.filter(j => ['pending', 'confirmed'].includes(j.status)).length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            Tidak ada janji temu yang aktif
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {janjiTemu
                                .filter(j => ['pending', 'confirmed'].includes(j.status))
                                .slice(0, 3)
                                .map((janji) => (
                                    <div
                                        key={janji.id}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-800">{janji.dokter.nama}</p>
                                            <p className="text-sm text-slate-500">
                                                {janji.tanggal} • {janji.waktu}
                                            </p>
                                        </div>
                                        <StatusBadge status={janji.status} />
                                    </div>
                                ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <CardHeader title="Panduan Cepat" subtitle="Fitur yang tersedia untuk Anda" />
                    <div className="space-y-3">
                        <a
                            href="/pasien/janji-temu"
                            className="flex items-center gap-4 p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors"
                        >
                            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Janji Temu</p>
                                <p className="text-sm text-slate-500">Buat janji temu dengan dokter</p>
                            </div>
                        </a>
                        <a
                            href="/pasien/rekam-medis"
                            className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Rekam Medis</p>
                                <p className="text-sm text-slate-500">Lihat riwayat kesehatan Anda</p>
                            </div>
                        </a>
                        <a
                            href="/pasien/pembayaran"
                            className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                        >
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Riwayat Pembayaran</p>
                                <p className="text-sm text-slate-500">Lihat tagihan dan invoice</p>
                            </div>
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    );
};
