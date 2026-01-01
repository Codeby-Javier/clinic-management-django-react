import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Stethoscope, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../types';

const schema = yup.object({
    username: yup.string().required('Username wajib diisi'),
    password: yup.string().required('Password wajib diisi'),
});

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: LoginCredentials) => {
        setIsLoading(true);
        setError('');

        try {
            await login(data);

            // Get user role and redirect
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            navigate(`/${user.role}`, { replace: true });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            setError(error.response?.data?.detail || 'Login gagal. Periksa username dan password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30">
                            <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Klinik Sejahtera Sehat</h2>
                        <p className="text-slate-500 mt-1">Portal Layanan Kesehatan Terpadu</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    {...register('username')}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                    placeholder="Masukkan username"
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1.5 text-sm text-red-400">{errors.username.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                                    placeholder="Masukkan password"
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
                                'Masuk'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-6 text-center text-white/60">
                        Belum punya akun?{' '}
                        <Link
                            to="/register"
                            className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
                        >
                            Daftar sekarang
                        </Link>
                    </p>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-white/40 text-center mb-2">Demo Login:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
                            <div>Admin: admin / admin123</div>
                            <div>Dokter: dr.ahmad / password123</div>
                            <div>Pasien: jono / pasien123</div>
                            <div>Resepsionis: resepsionis1 / resepsionis123</div>
                            <div>Apoteker: apoteker1 / apoteker123</div>
                            <div>Kasir: kasir1 / kasir123</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
