import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, Badge, Button, Input } from '../../components/ui';
import { User, Phone, MapPin, Calendar, Activity, Briefcase, CreditCard, Save, X } from 'lucide-react';
import { authService } from '../../services';

export const ProfilePage: React.FC = () => {
    const { user, login } = useAuth(); // Re-login to update context if needed, or create a refreshUser method
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    if (!user) return null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatedUser = await authService.updateProfile(formData);
            // Update context state manually would be best, but reloading page is a simple fallback
            // In a pro app, useAuth should expose a setUser.
            // For now, let's assume updateProfile works and alert success.
            alert('Profil berhasil diperbaharui! Silakan muat ulang halaman untuk melihat perubahan.');
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Gagal memperbarui profil.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderDetailItem = (icon: React.ReactNode, label: string, value: string | undefined, fieldName?: keyof typeof formData) => {
        if (isEditing && fieldName) {
            return (
                <div className="flex items-start gap-3 p-2 bg-white border border-sky-200 rounded-lg shadow-sm">
                    <div className="text-sky-500 mt-2">{icon}</div>
                    <div className="w-full">
                        <p className="text-xs text-sky-600 font-medium mb-1">{label}</p>
                        <input
                            type="text"
                            value={formData[fieldName]}
                            onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
                            className="w-full text-sm font-medium text-slate-800 border-b border-sky-200 focus:border-sky-500 focus:outline-none py-1"
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="text-slate-400 mt-0.5">{icon}</div>
                <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="font-medium text-slate-800">{value || '-'}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
                    <p className="text-slate-500 mt-1">Informasi akun dan data pribadi</p>
                </div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isLoading}>
                            <X className="w-4 h-4 mr-2" /> Batal
                        </Button>
                        <Button onClick={handleSave} isLoading={isLoading}>
                            <Save className="w-4 h-4 mr-2" /> Simpan
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profil</Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Profile Card */}
                <Card className="md:col-span-1 h-fit">
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-white shadow-lg">
                            <span className="text-3xl font-bold text-sky-600">
                                {user.first_name?.charAt(0) || user.username.charAt(0)}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {user.first_name} {user.last_name}
                        </h2>
                        <p className="text-slate-500 mb-2">@{user.username}</p>
                        <Badge variant={
                            user.role === 'admin' ? 'danger' :
                                user.role === 'dokter' ? 'primary' :
                                    user.role === 'pasien' ? 'success' : 'warning'
                        }>
                            {user.role.toUpperCase()}
                        </Badge>

                        <div className="w-full mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-xs text-slate-500">Bergabung</p>
                                <p className="font-medium text-slate-800">
                                    {new Date(user.date_joined).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500">Status</p>
                                <span className="text-emerald-600 font-medium">Aktif</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader title="Informasi Detail" subtitle={isEditing ? "Silakan ubah data dibawah ini" : "Data lengkap akun Anda"} />
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderDetailItem(<User className="w-5 h-5" />, 'Nama Depan', user.first_name, 'first_name')}
                            {renderDetailItem(<User className="w-5 h-5" />, 'Nama Belakang', user.last_name, 'last_name')}
                            {renderDetailItem(<Briefcase className="w-5 h-5" />, 'Email', user.email, 'email')}
                            {renderDetailItem(<Phone className="w-5 h-5" />, 'No. Telepon', user.phone, 'phone')}
                            <div className="md:col-span-2">
                                {renderDetailItem(<MapPin className="w-5 h-5" />, 'Alamat', user.address, 'address')}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                Informasi Khusus Role
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* DOKTER */}
                                {user.role === 'dokter' && (
                                    <>
                                        {renderDetailItem(<Briefcase className="w-5 h-5" />, 'Spesialisasi', (user.profile_detail as any)?.spesialisasi_display)}
                                        {renderDetailItem(<CreditCard className="w-5 h-5" />, 'No. STR', (user.profile_detail as any)?.no_str)}
                                        {renderDetailItem(<CreditCard className="w-5 h-5" />, 'Biaya Konsultasi', `Rp ${(user.profile_detail as any)?.biaya_konsultasi?.toLocaleString()}`)}
                                    </>
                                )}

                                {/* PASIEN */}
                                {user.role === 'pasien' && (
                                    <>
                                        {renderDetailItem(<CreditCard className="w-5 h-5" />, 'No. Rekam Medis', (user.profile_detail as any)?.no_rm)}
                                        {renderDetailItem(<Calendar className="w-5 h-5" />, 'Tanggal Lahir', (user.profile_detail as any)?.tanggal_lahir)}
                                        {renderDetailItem(<Activity className="w-5 h-5" />, 'Golongan Darah', (user.profile_detail as any)?.golongan_darah_display)}
                                        {renderDetailItem(<Activity className="w-5 h-5" />, 'Alergi', (user.profile_detail as any)?.alergi)}
                                    </>
                                )}

                                {/* RESEPSIONIS */}
                                {user.role === 'resepsionis' && (
                                    <>
                                        {renderDetailItem(<Briefcase className="w-5 h-5" />, 'Shift', (user.profile_detail as any)?.shift_display)}
                                    </>
                                )}

                                {/* APOTEKER */}
                                {user.role === 'apoteker' && (
                                    <>
                                        {renderDetailItem(<Briefcase className="w-5 h-5" />, 'No. SIPA', (user.profile_detail as any)?.no_sipa)}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
