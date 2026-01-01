import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Pill,
    CreditCard,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Stethoscope,
    Activity,
    ClipboardList,
    Package,
    Receipt,
    UserPlus,
    Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

const menuConfig: Record<string, MenuItem[]> = {
    admin: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
        { icon: <Users className="w-5 h-5" />, label: 'Kelola Users', path: '/admin/users' },
        { icon: <Activity className="w-5 h-5" />, label: 'Layanan Tindakan', path: '/admin/layanan' },
        { icon: <Pill className="w-5 h-5" />, label: 'Kelola Obat', path: '/admin/obat' },
    ],
    dokter: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dokter' },
        { icon: <Calendar className="w-5 h-5" />, label: 'Jadwal Praktik', path: '/dokter/jadwal' },
        { icon: <Users className="w-5 h-5" />, label: 'Daftar Pasien', path: '/dokter/pasien' },
        { icon: <ClipboardList className="w-5 h-5" />, label: 'Janji Temu', path: '/dokter/janji-temu' },
        { icon: <FileText className="w-5 h-5" />, label: 'Rekam Medis', path: '/dokter/rekam-medis' },
    ],
    pasien: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/pasien' },
        { icon: <Calendar className="w-5 h-5" />, label: 'Janji Temu', path: '/pasien/janji-temu' },
        { icon: <ClipboardList className="w-5 h-5" />, label: 'Riwayat', path: '/pasien/riwayat' },
        { icon: <FileText className="w-5 h-5" />, label: 'Rekam Medis Saya', path: '/pasien/rekam-medis' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Riwayat Pembayaran', path: '/pasien/pembayaran' },
    ],
    resepsionis: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/resepsionis' },
        { icon: <UserPlus className="w-5 h-5" />, label: 'Pendaftaran Pasien', path: '/resepsionis/pasien' },
        { icon: <ClipboardList className="w-5 h-5" />, label: 'Janji Temu', path: '/resepsionis/janji-temu' },
        { icon: <Clock className="w-5 h-5" />, label: 'Antrian', path: '/resepsionis/antrian' },
    ],
    apoteker: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/apoteker' },
        { icon: <Receipt className="w-5 h-5" />, label: 'Resep Pending', path: '/apoteker/resep' },
        { icon: <Package className="w-5 h-5" />, label: 'Stok Obat', path: '/apoteker/obat' },
    ],
    kasir: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/kasir' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Pembayaran', path: '/kasir/pembayaran' },
        { icon: <Receipt className="w-5 h-5" />, label: 'Laporan', path: '/kasir/laporan' },
    ],
};

export const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = menuConfig[user?.role || 'pasien'] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            className={`
        fixed left-0 top-0 h-screen bg-white border-r border-slate-200
        flex flex-col transition-all duration-300 z-40
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">Klinik Sejahtera Sehat</h1>
                            <p className="text-xs text-slate-500 -mt-0.5">Sistem Informasi</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.path === `/${user?.role}`}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                            >
                                {item.icon}
                                {!isCollapsed && (
                                    <span className="font-medium text-sm">{item.label}</span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-slate-200 space-y-1">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-slate-600 hover:bg-slate-100 transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-medium text-sm">Collapse</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleLogout}
                    className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-red-600 hover:bg-red-50 transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                </button>
            </div>
        </aside>
    );
};
