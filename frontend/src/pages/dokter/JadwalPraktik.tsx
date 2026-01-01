import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button, Card, CardHeader } from '../../components/ui';
import { dokterService } from '../../services';
import type { Dokter } from '../../types';

const DAYS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
const DAY_LABELS: Record<string, string> = {
    senin: 'Senin',
    selasa: 'Selasa',
    rabu: 'Rabu',
    kamis: 'Kamis',
    jumat: 'Jumat',
    sabtu: 'Sabtu',
    minggu: 'Minggu',
};

export const JadwalPraktik: React.FC = () => {
    const [dokter, setDokter] = useState<Dokter | null>(null);
    const [jadwal, setJadwal] = useState<Record<string, { mulai: string; selesai: string; aktif: boolean }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadJadwal();
    }, []);

    const loadJadwal = async () => {
        try {
            const data = await dokterService.getJadwalSaya();
            setDokter(data);

            // Initialize jadwal state
            const initialJadwal: Record<string, { mulai: string; selesai: string; aktif: boolean }> = {};
            DAYS.forEach((day) => {
                const dayJadwal = data.jadwal_praktik?.[day];
                initialJadwal[day] = {
                    mulai: dayJadwal?.mulai || '08:00',
                    selesai: dayJadwal?.selesai || '16:00',
                    aktif: !!dayJadwal,
                };
            });
            setJadwal(initialJadwal);
        } catch (error) {
            console.error('Failed to load jadwal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const jadwalToSave: Record<string, { mulai: string; selesai: string }> = {};
            Object.entries(jadwal).forEach(([day, data]) => {
                if (data.aktif) {
                    jadwalToSave[day] = { mulai: data.mulai, selesai: data.selesai };
                }
            });

            await dokterService.updateJadwal(jadwalToSave);
            alert('Jadwal berhasil disimpan!');
        } catch (error) {
            console.error('Failed to save jadwal:', error);
            alert('Gagal menyimpan jadwal');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
                <div className="bg-white rounded-xl p-6 animate-pulse">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-slate-100 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Jadwal Praktik</h1>
                    <p className="text-slate-500 mt-1">Atur jadwal praktik Anda di klinik</p>
                </div>
                <Button icon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={isSaving}>
                    Simpan Jadwal
                </Button>
            </div>

            <Card>
                <CardHeader
                    title="Pengaturan Jadwal"
                    subtitle={`Biaya konsultasi: Rp ${parseFloat(dokter?.biaya_konsultasi || '0').toLocaleString('id-ID')}`}
                />
                <div className="space-y-4">
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className={`flex items-center justify-between p-4 rounded-xl transition-colors ${jadwal[day]?.aktif ? 'bg-sky-50 border border-sky-100' : 'bg-slate-50'
                                }`}
                        >
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={jadwal[day]?.aktif || false}
                                    onChange={(e) =>
                                        setJadwal({
                                            ...jadwal,
                                            [day]: { ...jadwal[day], aktif: e.target.checked },
                                        })
                                    }
                                    className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                                />
                                <span className="font-medium text-slate-800 w-24">{DAY_LABELS[day]}</span>
                            </label>

                            {jadwal[day]?.aktif && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-600">Mulai:</span>
                                        <input
                                            type="time"
                                            value={jadwal[day]?.mulai || '08:00'}
                                            onChange={(e) =>
                                                setJadwal({
                                                    ...jadwal,
                                                    [day]: { ...jadwal[day], mulai: e.target.value },
                                                })
                                            }
                                            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-600">Selesai:</span>
                                        <input
                                            type="time"
                                            value={jadwal[day]?.selesai || '16:00'}
                                            onChange={(e) =>
                                                setJadwal({
                                                    ...jadwal,
                                                    [day]: { ...jadwal[day], selesai: e.target.value },
                                                })
                                            }
                                            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
