import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, Calendar, CreditCard, TrendingUp, UserPlus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard, Card, CardHeader } from '../../components/ui';
import { adminService } from '../../services';
import type { LaporanOverview, RevenueChart } from '../../types';

export const AdminDashboard: React.FC = () => {
    const [overview, setOverview] = useState<LaporanOverview | null>(null);
    const [chartData, setChartData] = useState<RevenueChart[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [overviewData, revenueData] = await Promise.all([
                adminService.getOverview(),
                adminService.getRevenueChart(),
            ]);
            setOverview(overviewData);
            setChartData(revenueData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
                            <div className="h-8 bg-slate-200 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Fallback data if API returns empty (for demo purpose)
    const displayData = chartData.length > 0 ? chartData : [
        { day: 'Sen', revenue: 0 },
        { day: 'Sel', revenue: 0 },
        { day: 'Rab', revenue: 0 },
        { day: 'Kam', revenue: 0 },
        { day: 'Jum', revenue: 0 },
        { day: 'Sab', revenue: 0 },
        { day: 'Min', revenue: 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin</h1>
                <p className="text-slate-500 mt-1">Selamat datang di Sistem Informasi Klinik</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Pasien"
                    value={overview?.total_pasien || 0}
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                />
                <StatCard
                    title="Total Dokter"
                    value={overview?.total_dokter || 0}
                    icon={<Stethoscope className="w-6 h-6" />}
                    color="teal"
                />
                <StatCard
                    title="Janji Hari Ini"
                    value={overview?.janji_hari_ini || 0}
                    icon={<Calendar className="w-6 h-6" />}
                    color="green"
                />
                <StatCard
                    title="Revenue Bulan Ini"
                    value={formatCurrency(overview?.revenue_bulan_ini || 0)}
                    icon={<CreditCard className="w-6 h-6" />}
                    color="orange"
                />
            </div>

            {/* Charts & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Revenue 7 Hari Terakhir"
                        subtitle="Pendapatan klinik dalam seminggu"
                    />
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${(value / 1000)}k`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader title="Ringkasan" subtitle="Status sistem saat ini" />
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-sky-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Pasien Baru</p>
                                    <p className="text-xs text-slate-500">Bulan ini</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-sky-600">
                                {overview?.pasien_baru_bulan_ini || 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Pembayaran Pending</p>
                                    <p className="text-xs text-slate-500">Menunggu proses</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-amber-600">
                                {overview?.pembayaran_pending || 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Revenue</p>
                                    <p className="text-xs text-slate-500">Bulan ini</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">
                                {formatCurrency(overview?.revenue_bulan_ini || 0)}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
