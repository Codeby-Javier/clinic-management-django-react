import React, { useState } from 'react';
import { Card, CardHeader, Input, Button } from '../../components/ui';
import { Lock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement change password logic here
        alert('Fitur ubah password akan segera aktif.');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
                <p className="text-slate-500 mt-1">Kelola keamanan akun Anda</p>
            </div>

            <Card>
                <CardHeader title="Ubah Password" subtitle="Amankan akun Anda dengan password kuat" />
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        label="Password Saat Ini"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        icon={<Lock className="w-5 h-5" />}
                    />
                    <Input
                        label="Password Baru"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        icon={<Lock className="w-5 h-5" />}
                    />
                    <Input
                        label="Konfirmasi Password Baru"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        icon={<Lock className="w-5 h-5" />}
                    />
                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Simpan Password</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
