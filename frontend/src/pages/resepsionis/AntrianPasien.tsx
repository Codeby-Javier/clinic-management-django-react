import React, { useState, useEffect } from 'react';
import { Card, CardHeader, StatusBadge } from '../../components/ui';
import { resepsionisService } from '../../services';
import type { JanjiTemu } from '../../types';
import { Users } from 'lucide-react';

export const AntrianPasien: React.FC = () => {
    const [antrian, setAntrian] = useState<JanjiTemu[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await resepsionisService.getAntrian();
            setAntrian(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load antrian:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Antrian Pasien</h1>
                <p className="text-slate-500 mt-1">Daftar antrian yang sedang berjalan hari ini</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
                    ))
                ) : antrian.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                        <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>Tidak ada antrian aktif saat ini</p>
                    </div>
                ) : (
                    antrian.map((item) => (
                        <Card key={item.id} className="border-l-4 border-l-sky-500 hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col items-center">
                                        <div className="px-4 py-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <span className="text-2xl font-bold text-white tracking-wider">
                                                {item.nomor_antrian || '-'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500 mt-2 font-medium">
                                            {item.dokter?.nama?.split(' ')[1] || ''}
                                        </span>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">
                                        {item.pasien.user.first_name} {item.pasien.user.last_name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">RM: {item.pasien.no_rm}</p>

                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dokter</p>
                                        <p className="font-medium text-slate-700">{item.dokter.nama}</p>
                                        <p className="text-xs text-slate-500">{item.dokter.spesialisasi_display}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
