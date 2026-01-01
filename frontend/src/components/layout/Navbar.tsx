import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const roleLabels: Record<string, string> = {
    admin: 'Admin Klinik',
    dokter: 'Dokter',
    pasien: 'Pasien',
    resepsionis: 'Resepsionis',
    apoteker: 'Apoteker',
    kasir: 'Kasir',
};

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get breadcrumb from path
    const getBreadcrumb = () => {
        const path = location.pathname;
        const segments = path.split('/').filter(Boolean);

        return segments.map((segment, index) => {
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            return {
                label,
                isLast: index === segments.length - 1,
            };
        });
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
                {getBreadcrumb().map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span className="text-slate-400">/</span>}
                        <span
                            className={`
                ${item.isLast ? 'text-slate-800 font-medium' : 'text-slate-500'}
              `}
                        >
                            {item.label}
                        </span>
                    </React.Fragment>
                ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* Profile Dropdown */}
                <div ref={dropdownRef} className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white font-medium">
                            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-medium text-slate-800">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-slate-500">{roleLabels[user?.role || 'pasien']}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <p className="text-sm font-medium text-slate-800">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                            </div>

                            <div className="py-1">
                                <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                    <User className="w-4 h-4" />
                                    Profile Saya
                                </Link>
                                <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                    <Settings className="w-4 h-4" />
                                    Pengaturan
                                </Link>
                            </div>

                            <div className="border-t border-slate-100 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
