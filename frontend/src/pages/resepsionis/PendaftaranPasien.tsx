import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Card, CardHeader } from '../../components/ui';
import { UserPlus, Save } from 'lucide-react';
import { resepsionisService } from '../../services';

const schema = yup.object({
    username: yup.string().required('Username wajib diisi'),
    email: yup.string().email('Email tidak valid').required('Email wajib diisi'),
    password: yup.string().min(6, 'Password minimal 6 karakter').required('Password wajib diisi'),
    first_name: yup.string().required('Nama depan wajib diisi'),
    last_name: yup.string().required('Nama belakang wajib diisi'),
    phone: yup.string().required('No. Telepon wajib diisi'),
    address: yup.string().required('Alamat wajib diisi'),
    tanggal_lahir: yup.string().required('Tanggal lahir wajib diisi'),
    jenis_kelamin: yup.string().oneOf(['L', 'P']).required('Pilih jenis kelamin'),
}).required();

export const PendaftaranPasien: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            console.log('=== SUBMIT PASIEN DATA ===');
            console.log('Form data:', data);
            
            await resepsionisService.createPasien(data);
            alert('Pasien berhasil didaftarkan!');
            reset();
        } catch (error: any) {
            console.error('=== REGISTRATION ERROR ===');
            console.error('Error:', error);
            console.error('Response:', error.response);
            console.error('Response data:', error.response?.data);
            
            let errorMessage = 'Gagal mendaftar pasien.';
            
            if (error.response?.data) {
                const data = error.response.data;
                
                // Handle validation errors
                if (data.errors) {
                    const errorMessages = Object.entries(data.errors)
                        .map(([field, messages]: [string, any]) => {
                            const msgArray = Array.isArray(messages) ? messages : [messages];
                            return `${field}: ${msgArray.join(', ')}`;
                        })
                        .join('\n');
                    errorMessage = `Validasi gagal:\n${errorMessages}`;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else if (typeof data === 'string') {
                    errorMessage = data;
                }
            }
            
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Pendaftaran Pasien Baru</h1>
                <p className="text-slate-500 mt-1">Daftarkan akun untuk pasien yang belum terdaftar</p>
            </div>

            <Card>
                <CardHeader title="Formulir Data Diri" subtitle="Lengkapi data pasien berikut" />
                <div className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nama Depan"
                                {...register('first_name')}
                                error={errors.first_name?.message}
                                placeholder="Contoh: Budi"
                            />
                            <Input
                                label="Nama Belakang"
                                {...register('last_name')}
                                error={errors.last_name?.message}
                                placeholder="Contoh: Santoso"
                            />
                            <Input
                                label="Username"
                                {...register('username')}
                                error={errors.username?.message}
                                placeholder="username_unik"
                            />
                            <Input
                                label="Email"
                                type="email"
                                {...register('email')}
                                error={errors.email?.message}
                                placeholder="email@contoh.com"
                            />
                            <Input
                                label="Password"
                                type="password"
                                {...register('password')}
                                error={errors.password?.message}
                                placeholder="******"
                            />
                            <Input
                                label="Nomor Telepon"
                                {...register('phone')}
                                error={errors.phone?.message}
                                placeholder="08123456789"
                            />
                            <Input
                                label="Tanggal Lahir"
                                type="date"
                                {...register('tanggal_lahir')}
                                error={errors.tanggal_lahir?.message}
                            />
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-700">
                                    Jenis Kelamin
                                </label>
                                <select
                                    {...register('jenis_kelamin')}
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                >
                                    <option value="">Pilih...</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                                {errors.jenis_kelamin && (
                                    <p className="text-sm text-red-500">{errors.jenis_kelamin.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700">
                                Alamat Lengkap
                            </label>
                            <textarea
                                {...register('address')}
                                rows={3}
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="Jl. Contoh No. 123..."
                            />
                            {errors.address && (
                                <p className="text-sm text-red-500">{errors.address.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <Button type="submit" isLoading={isLoading} icon={<Save className="w-4 h-4" />}>
                                Simpan Data Pasien
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
};
