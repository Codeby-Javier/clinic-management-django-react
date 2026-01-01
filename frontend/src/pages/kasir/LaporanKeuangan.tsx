import React, { useState, useEffect } from 'react';
import { Table, Pagination, Card, CardHeader, Button } from '../../components/ui';
import { kasirService } from '../../services';
import { Download, FileSpreadsheet } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export const LaporanKeuangan: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterBulan, setFilterBulan] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        loadData();
    }, [filterBulan]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Note: Service getLaporanKeuangan return array of records
            const response = await kasirService.getLaporanKeuangan({ periode: filterBulan });
            setData(response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { key: 'tanggal', header: 'Tanggal' },
        { key: 'keterangan', header: 'Keterangan' },
        {
            key: 'masuk',
            header: 'Pemasukan',
            render: (it: any) => it.tipe === 'masuk' ? <span className="text-emerald-600 font-medium">Rp {it.jumlah.toLocaleString()}</span> : '-'
        },
        {
            key: 'keluar',
            header: 'Pengeluaran',
            render: (it: any) => it.tipe === 'keluar' ? <span className="text-red-600 font-medium">Rp {it.jumlah.toLocaleString()}</span> : '-'
        },
    ];

    const handleExportExcel = () => {
        exportToExcel(data, `Laporan_Keuangan_${filterBulan}`);
    };

    const handleExportPDF = () => {
        const pdfData = data.map(item => [
            item.tanggal,
            item.keterangan,
            item.tipe === 'masuk' ? `Rp ${item.jumlah.toLocaleString()}` : '-',
            item.tipe === 'keluar' ? `Rp ${item.jumlah.toLocaleString()}` : '-'
        ]);
        exportToPDF('Laporan Keuangan', ['Tanggal', 'Keterangan', 'Pemasukan', 'Pengeluaran'], pdfData, `Laporan_Keuangan_${filterBulan}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h1>
                    <p className="text-slate-500 mt-1">Rekapitulasi pemasukan dan pengeluaran klinik</p>
                </div>
                <div className="flex gap-4">
                    <input
                        type="month"
                        className="border p-2 rounded-lg"
                        value={filterBulan}
                        onChange={(e) => setFilterBulan(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <div className="p-4 border-b border-slate-100 flex justify-end gap-2">
                    <Button variant="outline" icon={<FileSpreadsheet className="w-4 h-4" />} onClick={handleExportExcel}>
                        Excel
                    </Button>
                    <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExportPDF}>
                        PDF
                    </Button>
                </div>
                <div className="p-0">
                    <Table columns={columns} data={data} isLoading={isLoading} />
                </div>
            </Card>
        </div>
    );
};
