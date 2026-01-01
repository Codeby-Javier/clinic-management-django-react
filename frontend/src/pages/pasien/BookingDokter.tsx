import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search } from 'lucide-react';
import { Button, Card, CardHeader, Input, Textarea } from '../../components/ui';
import { pasienService } from '../../services';
import type { Dokter, PaginatedResponse } from '../../types';

export const BookingDokter: React.FC = () => {
    const [dokterList, setDokterList] = useState<PaginatedResponse<Dokter> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDokter, setSelectedDokter] = useState<Dokter | null>(null);
    const [formData, setFormData] = useState({
        tanggal: '',
        waktu: '',
        keluhan: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadDokter();
    }, []);

    const loadDokter = async () => {
        try {
            const data = await pasienService.getDokterJadwal({});
            setDokterList(data);
        } catch (error) {
            console.error('Failed to load dokter:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDokter) return;

        setIsSubmitting(true);
        try {
            await pasienService.bookingJanjiTemu({
                dokter_id: selectedDokter.id,
                tanggal: formData.tanggal,
                waktu: formData.waktu,
                keluhan: formData.keluhan,
            });
            setSuccess(true);
            setSelectedDokter(null);
            setFormData({ tanggal: '', waktu: '', keluhan: '' });
        } catch (error: any) {
            console.error('Failed to book:', error);
            let msg = 'Gagal membuat janji temu.';

            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data.detail === 'string') {
                    msg = data.detail;
                } else if (Array.isArray(data.detail)) {
                    msg = data.detail.join('\n');
                } else {
                    // Collect field errors
                    const parts = [];
                    for (const key in data) {
                        if (Array.isArray(data[key])) {
                            parts.push(`${key}: ${data[key].join(', ')}`);
                        } else if (typeof data[key] === 'string') {
                            parts.push(`${key}: ${data[key]}`);
                        }
                    }
                    if (parts.length > 0) msg = parts.join('\n');
                }
            }
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const DAY_LABELS: Record<string, string> = {
        senin: 'Sen', selasa: 'Sel', rabu: 'Rab', kamis: 'Kam', jumat: 'Jum', sabtu: 'Sab', minggu: 'Min',
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <Calendar className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Janji Temu Berhasil!</h2>
                <p className="text-slate-500 mb-6">Janji temu Anda sedang menunggu konfirmasi</p>
                <Button onClick={() => setSuccess(false)}>Buat Janji Temu Lagi</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Janji Temu</h1>
                <p className="text-slate-500 mt-1">Silakan lengkapi data untuk jadwal janji temu</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dokter List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari dokter atau spesialisasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        />
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-slate-200 rounded-full" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                                            <div className="h-3 bg-slate-200 rounded w-24" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dokterList?.results
                                .filter((d) =>
                                    d.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    d.spesialisasi_display?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((dokter) => (
                                    <div
                                        key={dokter.id}
                                        onClick={() => setSelectedDokter(dokter)}
                                        className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all ${selectedDokter?.id === dokter.id
                                            ? 'border-sky-500 ring-4 ring-sky-500/20'
                                            : 'border-transparent hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                                                {dokter.nama?.charAt(4) || 'D'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{dokter.nama}</p>
                                                <p className="text-sm text-sky-600">{dokter.spesialisasi_display}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Biaya Konsultasi:</span>
                                            <span className="font-semibold text-emerald-600">
                                                {formatCurrency(dokter.biaya_konsultasi)}
                                            </span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-100">
                                            <p className="text-xs text-slate-500 mb-2">Jadwal Praktik:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(dokter.jadwal_praktik || {}).map(([day, jadwal]) => (
                                                    <span
                                                        key={day}
                                                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                                                    >
                                                        {DAY_LABELS[day]} {jadwal.mulai}-{jadwal.selesai}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Booking Form */}
                <Card className="h-fit sticky top-6">
                    <CardHeader title="Form Booking" subtitle="Lengkapi data janji temu" />
                    {selectedDokter ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="p-4 bg-sky-50 rounded-xl">
                                <p className="text-sm text-slate-500">Dokter yang dipilih:</p>
                                <p className="font-semibold text-slate-800">{selectedDokter.nama}</p>
                                <p className="text-sm text-sky-600">{selectedDokter.spesialisasi_display}</p>
                            </div>

                            <Input
                                label="Tanggal"
                                type="date"
                                value={formData.tanggal}
                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                icon={<Calendar className="w-5 h-5" />}
                            />

                            <Input
                                label="Waktu"
                                type="time"
                                value={formData.waktu}
                                onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                                icon={<Clock className="w-5 h-5" />}
                            />

                            <Textarea
                                label="Keluhan"
                                value={formData.keluhan}
                                onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                                rows={4}
                                placeholder="Jelaskan keluhan Anda..."
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isSubmitting}
                                disabled={!formData.tanggal || !formData.waktu || !formData.keluhan}
                            >
                                Buat Janji Temu
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>Pilih dokter terlebih dahulu</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
