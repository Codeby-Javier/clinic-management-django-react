import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CreditCard, Clock, TrendingUp, Receipt, Download, FileSpreadsheet } from 'lucide-react';
import { StatCard, Card, CardHeader, StatusBadge, Button } from '../../components/ui';
import { kasirService } from '../../services';
import type { KasirStats, Pembayaran } from '../../types';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const KasirDashboard: React.FC = () => {
    const [stats, setStats] = useState<KasirStats | null>(null);
    const [pendingList, setPendingList] = useState<Pembayaran[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, pendingData] = await Promise.all([
                kasirService.getStats(),
                kasirService.getPembayaranPending(),
            ]);
            setStats(statsData);
            setPendingList(pendingData);
        } catch (error) {
            console.error('Failed to load data:', error);
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


    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname.includes('/laporan')) return ['Laporan Transaksi', 'Analisis pendapatan klinik'];
        if (location.pathname.includes('/pembayaran')) return ['Pembayaran', 'Proses pembayaran pasien'];
        return ['Dashboard Kasir', 'Kelola pembayaran dan laporan keuangan'];
    };

    const [title, subtitle] = getPageTitle();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                    <p className="text-slate-500 mt-1">{subtitle}</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        icon={<FileSpreadsheet className="w-4 h-4" />}
                        onClick={() => {
                            const data = pendingList.map((p: any) => ({
                                Invoice: p.invoice_number,
                                Pasien: p.janji_temu.pasien.user.first_name,
                                Dokter: p.janji_temu.dokter.nama,
                                Total: p.total_biaya,
                                Status: p.status,
                                Tanggal: new Date(p.created_at).toLocaleDateString()
                            }));
                            exportToExcel(data, 'Laporan_Pembayaran');
                        }}
                    >
                        Excel
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => {
                            const data = pendingList.map((p: any) => [
                                p.invoice_number,
                                p.janji_temu.pasien.user.first_name,
                                p.janji_temu.dokter.nama,
                                p.total_biaya.toString(),
                                p.status
                            ]);
                            exportToPDF('Laporan Pembayaran', ['Invoice', 'Pasien', 'Dokter', 'Total', 'Status'], data, 'Laporan_Pembayaran');
                        }}
                    >
                        PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Pembayaran Hari Ini"
                    value={stats?.pembayaran_hari_ini || 0}
                    icon={<CreditCard className="w-6 h-6" />}
                    color="blue"
                />
                <StatCard
                    title="Pending"
                    value={stats?.pending || 0}
                    icon={<Clock className="w-6 h-6" />}
                    color="orange"
                />
                <StatCard
                    title="Revenue Hari Ini"
                    value={formatCurrency(stats?.revenue_hari_ini || 0)}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="green"
                />
                <StatCard
                    title="Revenue Bulan Ini"
                    value={formatCurrency(stats?.revenue_bulan_ini || 0)}
                    icon={<Receipt className="w-6 h-6" />}
                    color="teal"
                />
            </div>

            <Card className="p-6">
                <CardHeader title="Grafik Pendapatan Mingguan" subtitle="Tren pendapatan 7 hari terakhir" />
                <div className="h-80 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                            { name: 'Sen', value: 1500000 },
                            { name: 'Sel', value: 2300000 },
                            { name: 'Rab', value: 1800000 },
                            { name: 'Kam', value: 3200000 },
                            { name: 'Jum', value: 2100000 },
                            { name: 'Sab', value: 4500000 },
                            { name: 'Min', value: 1200000 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `Rp${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value), 'Pendapatan']}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card>
                <CardHeader title="Pembayaran Pending" subtitle="Menunggu proses pembayaran" />
                {isLoading ? (
                    <div className="animate-pulse space-y-3 p-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 bg-slate-100 rounded-lg" />
                        ))}
                    </div>
                ) : pendingList.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Tidak ada pembayaran pending</div>
                ) : (
                    <div className="space-y-3 p-4">
                        {pendingList.slice(0, 6).map((pembayaran) => (
                            <div
                                key={pembayaran.id}
                                className="flex items-center justify-between p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-slate-800">
                                        {pembayaran.janji_temu.pasien.user.first_name} {pembayaran.janji_temu.pasien.user.last_name}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {pembayaran.invoice_number} • {pembayaran.janji_temu.dokter.nama}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-emerald-600">
                                        {formatCurrency(pembayaran.total_biaya)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 justify-end">
                                        <StatusBadge status="pending" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
