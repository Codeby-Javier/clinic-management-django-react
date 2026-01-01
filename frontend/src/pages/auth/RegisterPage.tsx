import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Stethoscope, Eye, EyeOff, Loader2, User, Mail, Lock, Phone, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { RegisterData } from '../../types';

const schema = yup.object({
    username: yup.string().required('Username wajib diisi').min(3, 'Minimal 3 karakter'),
    email: yup.string().email('Format email tidak valid').required('Email wajib diisi'),
    password: yup.string().required('Password wajib diisi').min(6, 'Minimal 6 karakter'),
    password2: yup.string().oneOf([yup.ref('password')], 'Password tidak cocok').required('Konfirmasi password wajib diisi'),
    first_name: yup.string().required('Nama depan wajib diisi'),
    last_name: yup.string(),
    phone: yup.string(),
    address: yup.string(),
    tanggal_lahir: yup.string(),
    golongan_darah: yup.string(),
});

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterData>({
        resolver: yupResolver(schema) as never,
    });

    const onSubmit = async (data: RegisterData) => {
        setIsLoading(true);
        setError('');

        try {
            await registerUser(data);
            navigate('/pasien', { replace: true });
        } catch (err: unknown) {
            const error = err as { response?: { data?: Record<string, string[]> } };
            const errorData = error.response?.data;
            if (errorData) {
                const firstError = Object.values(errorData)[0];
                setError(Array.isArray(firstError) ? firstError[0] : 'Registrasi gagal');
            } else {
                setError('Registrasi gagal. Silakan coba lagi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 py-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30">
                            <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Daftar Akun Baru</h1>
                        <p className="text-white/60 mt-1">Registrasi sebagai Pasien</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Username *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="text"
                                        {...register('username')}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                        placeholder="Username"
                                    />
                                </div>
                                {errors.username && (
                                    <p className="mt-1.5 text-sm text-red-400">{errors.username.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                        placeholder="Email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Nama Depan *
                                </label>
                                <input
                                    type="text"
                                    {...register('first_name')}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                    placeholder="Nama depan"
                                />
                                {errors.first_name && (
                                    <p className="mt-1.5 text-sm text-red-400">{errors.first_name.message}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Nama Belakang
                                </label>
                                <input
                                    type="text"
                                    {...register('last_name')}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                    placeholder="Nama belakang"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Konfirmasi Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password2')}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                        placeholder="Konfirmasi password"
                                    />
                                </div>
                                {errors.password2 && (
                                    <p className="mt-1.5 text-sm text-red-400">{errors.password2.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    No. Telepon
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                            </div>

                            {/* Tanggal Lahir */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Tanggal Lahir
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="date"
                                        {...register('tanggal_lahir')}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Golongan Darah */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Golongan Darah
                                </label>
                                <select
                                    {...register('golongan_darah')}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                >
                                    <option value="" className="bg-slate-800">Pilih golongan darah</option>
                                    <option value="A+" className="bg-slate-800">A+</option>
                                    <option value="A-" className="bg-slate-800">A-</option>
                                    <option value="B+" className="bg-slate-800">B+</option>
                                    <option value="B-" className="bg-slate-800">B-</option>
                                    <option value="AB+" className="bg-slate-800">AB+</option>
                                    <option value="AB-" className="bg-slate-800">AB-</option>
                                    <option value="O+" className="bg-slate-800">O+</option>
                                    <option value="O-" className="bg-slate-800">O-</option>
                                </select>
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Alamat
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3 w-5 h-5 text-white/40" />
                                    <textarea
                                        {...register('address')}
                                        rows={2}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all resize-none"
                                        placeholder="Alamat lengkap"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-sky-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Daftar Sekarang'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-white/60">
                        Sudah punya akun?{' '}
                        <Link
                            to="/login"
                            className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
                        >
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
