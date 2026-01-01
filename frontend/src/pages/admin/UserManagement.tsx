import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, UserCheck, UserX, Eye, Key, History, Edit2, DollarSign, AlertCircle } from 'lucide-react';
import { Button, Table, Pagination, Modal, Input, Select, Badge, ConfirmModal } from '../../components/ui';
import { adminService } from '../../services';
import type { User, PaginatedResponse } from '../../types';

const roleOptions = [
    { value: '', label: 'Semua Role' },
    { value: 'dokter', label: 'Dokter' },
    { value: 'pasien', label: 'Pasien' },
    { value: 'resepsionis', label: 'Resepsionis' },
    { value: 'apoteker', label: 'Apoteker' },
    { value: 'kasir', label: 'Kasir' },
];

const spesialisasiOptions = [
    { value: 'umum', label: 'Dokter Umum' },
    { value: 'gigi', label: 'Dokter Gigi' },
    { value: 'anak', label: 'Dokter Anak' },
    { value: 'kandungan', label: 'Dokter Kandungan' },
    { value: 'mata', label: 'Dokter Mata' },
];

const shiftOptions = [
    { value: 'pagi', label: 'Pagi (07:00 - 14:00)' },
    { value: 'siang', label: 'Siang (14:00 - 21:00)' },
    { value: 'malam', label: 'Malam (21:00 - 07:00)' },
];

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<PaginatedResponse<User> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isEditBiayaModalOpen, setIsEditBiayaModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userHistory, setUserHistory] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');
    const [editBiayaKonsultasi, setEditBiayaKonsultasi] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'pasien',
        phone: '',
        address: '',
        spesialisasi: 'umum',
        no_str: '',
        biaya_konsultasi: '100000',
        shift: 'pagi',
        no_sipa: '',
        tanggal_lahir: '',
        golongan_darah: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [currentPage, roleFilter]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = {
                page: currentPage.toString(),
            };
            if (roleFilter) params.role = roleFilter;
            if (searchQuery) params.search = searchQuery;

            const data = await adminService.getUsers(params);
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadUsers();
    };

    const handleCreateUser = async () => {
        setIsSubmitting(true);
        try {
            await adminService.createUser(formData);
            setIsModalOpen(false);
            resetForm();
            loadUsers();
            alert('User berhasil ditambahkan!');
        } catch (error: any) {
            console.error('Failed to create user:', error);
            alert(error.response?.data?.message || 'Gagal menambahkan user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (user: User) => {
        try {
            await adminService.toggleUserActive(user.id);
            loadUsers();
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        try {
            await adminService.deleteUser(selectedUser.id);
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            loadUsers();
            alert('User berhasil dihapus!');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Gagal menghapus user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewProfile = async (user: User) => {
        setSelectedUser(user);
        setIsProfileModalOpen(true);
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) {
            alert('User atau password tidak boleh kosong');
            return;
        }
        
        if (newPassword.length < 8) {
            alert('Password minimal 8 karakter');
            return;
        }
        
        setIsSubmitting(true);
        try {
            console.log('=== RESET PASSWORD DEBUG ===');
            console.log('User ID:', selectedUser.id);
            console.log('Username:', selectedUser.username);
            console.log('Password length:', newPassword.length);
            
            const result = await adminService.resetUserPassword(selectedUser.id, newPassword);
            
            console.log('Reset success:', result);
            
            setIsResetPasswordModalOpen(false);
            setNewPassword('');
            setSelectedUser(null);
            
            // Reload users to get updated password_hint
            await loadUsers();
            
            alert('Password berhasil direset!');
        } catch (error: any) {
            console.error('=== RESET PASSWORD ERROR ===');
            console.error('Full error:', error);
            console.error('Response:', error.response);
            console.error('Response data:', error.response?.data);
            
            // Handle validation errors
            if (error.response?.data?.details) {
                const details = error.response.data.details.join('\n');
                alert(`Gagal reset password:\n\n${details}`);
            } else if (error.response?.data?.error) {
                alert(`Gagal reset password:\n\n${error.response.data.error}`);
            } else if (error.response?.data?.message) {
                alert(`Gagal reset password:\n\n${error.response.data.message}`);
            } else if (error.message) {
                alert(`Gagal reset password:\n\n${error.message}`);
            } else {
                alert('Gagal reset password. Cek console untuk detail error.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewHistory = async (user: User) => {
        setSelectedUser(user);
        setIsHistoryModalOpen(true);
        try {
            const history = await adminService.getUserTransactionHistory(user.id);
            setUserHistory(history);
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    };

    const handleEditBiaya = (user: User) => {
        setSelectedUser(user);
        // Get current biaya_konsultasi from profile_detail
        const biaya = (user.profile_detail as any)?.biaya_konsultasi || '100000';
        console.log('=== EDIT BIAYA ===');
        console.log('User:', user);
        console.log('Profile Detail:', user.profile_detail);
        console.log('Current Biaya:', biaya);
        setEditBiayaKonsultasi(biaya.toString());
        setIsEditBiayaModalOpen(true);
    };

    const handleSaveBiaya = async () => {
        if (!selectedUser) return;
        
        setIsSubmitting(true);
        try {
            console.log('=== SAVE BIAYA DEBUG ===');
            console.log('Selected User:', selectedUser);
            console.log('User ID:', selectedUser.id);
            console.log('Edit Biaya Konsultasi:', editBiayaKonsultasi);
            
            // Update hanya field biaya_konsultasi, bukan seluruh profile_detail
            const updateData: any = {};
            if (selectedUser.role === 'dokter') {
                updateData.biaya_konsultasi = parseFloat(editBiayaKonsultasi);
            }
            
            console.log('Update Data:', updateData);
            
            const result = await adminService.updateUser(selectedUser.id, updateData);
            console.log('Update Result:', result);
            console.log('Updated biaya_konsultasi:', result.profile_detail);
            
            // Close modal first
            setIsEditBiayaModalOpen(false);
            setEditBiayaKonsultasi('');
            setSelectedUser(null);
            
            // Reload users to get fresh data
            await loadUsers();
            
            alert('Biaya konsultasi berhasil diupdate!');
        } catch (error: any) {
            console.error('=== SAVE BIAYA ERROR ===');
            console.error('Error:', error);
            console.error('Response:', error.response);
            console.error('Response Data:', error.response?.data);
            alert(error.response?.data?.detail || 'Gagal update biaya konsultasi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            role: 'pasien',
            phone: '',
            address: '',
            spesialisasi: 'umum',
            no_str: '',
            biaya_konsultasi: '100000',
            shift: 'pagi',
            no_sipa: '',
            tanggal_lahir: '',
            golongan_darah: '',
        });
    };

    const columns = [
        {
            key: 'user',
            header: 'User',
            render: (user: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white font-medium">
                        {user.first_name?.charAt(0) || user.username.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium text-slate-800">
                            {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                    </div>
                </div>
            ),
        },
        { key: 'email', header: 'Email' },
        {
            key: 'role',
            header: 'Role',
            render: (user: User) => (
                <Badge variant={user.role === 'dokter' ? 'info' : user.role === 'pasien' ? 'success' : 'default'}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
            ),
        },
        { key: 'phone', header: 'Telepon' },
        {
            key: 'is_active',
            header: 'Status',
            render: (user: User) => (
                <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            render: (user: User) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleViewProfile(user)}
                        className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors"
                        title="Lihat Profil"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {user.role === 'dokter' && (
                        <button
                            onClick={() => handleEditBiaya(user)}
                            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Edit Biaya Konsultasi"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setSelectedUser(user);
                            setIsResetPasswordModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                        title="Reset Password"
                    >
                        <Key className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleViewHistory(user)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                        title="Riwayat Transaksi"
                    >
                        <History className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleToggleActive(user)}
                        className={`p-2 rounded-lg transition-colors ${user.is_active
                                ? 'hover:bg-amber-50 text-amber-600'
                                : 'hover:bg-emerald-50 text-emerald-600'
                            }`}
                        title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Kelola Users</h1>
                    <p className="text-slate-500 mt-1">Manajemen pengguna sistem klinik</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                    Tambah User
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            />
                        </div>
                    </div>
                    <Select
                        options={roleOptions}
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full sm:w-48"
                    />
                    <Button variant="secondary" onClick={handleSearch}>
                        Cari
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Table columns={columns} data={users?.results || []} isLoading={isLoading} />

            {/* Pagination */}
            {users && users.count > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(users.count / 10)}
                    totalItems={users.count}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title="Tambah User Baru"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleCreateUser} isLoading={isSubmitting}>
                            Simpan
                        </Button>
                    </>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Username"
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Password"
                        required
                    />
                    <Select
                        label="Role"
                        options={roleOptions.filter((r) => r.value !== '')}
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                    />
                    <Input
                        label="Nama Depan"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Nama depan"
                        required
                    />
                    <Input
                        label="Nama Belakang"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Nama belakang"
                    />
                    <Input
                        label="No. Telepon"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                    />
                    <Input
                        label="Alamat"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Alamat lengkap"
                    />

                    {/* Conditional fields based on role */}
                    {formData.role === 'dokter' && (
                        <>
                            <Select
                                label="Spesialisasi"
                                options={spesialisasiOptions}
                                value={formData.spesialisasi}
                                onChange={(e) => setFormData({ ...formData, spesialisasi: e.target.value })}
                            />
                            <Input
                                label="No. STR"
                                value={formData.no_str}
                                onChange={(e) => setFormData({ ...formData, no_str: e.target.value })}
                                placeholder="STR-XXXX-XXX"
                            />
                            <Input
                                label="Biaya Konsultasi"
                                type="number"
                                value={formData.biaya_konsultasi}
                                onChange={(e) => setFormData({ ...formData, biaya_konsultasi: e.target.value })}
                                placeholder="100000"
                            />
                        </>
                    )}

                    {formData.role === 'pasien' && (
                        <>
                            <Input
                                label="Tanggal Lahir"
                                type="date"
                                value={formData.tanggal_lahir}
                                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                            />
                            <Select
                                label="Golongan Darah"
                                options={[
                                    { value: '', label: 'Pilih Golongan Darah' },
                                    { value: 'A+', label: 'A+' },
                                    { value: 'A-', label: 'A-' },
                                    { value: 'B+', label: 'B+' },
                                    { value: 'B-', label: 'B-' },
                                    { value: 'AB+', label: 'AB+' },
                                    { value: 'AB-', label: 'AB-' },
                                    { value: 'O+', label: 'O+' },
                                    { value: 'O-', label: 'O-' },
                                ]}
                                value={formData.golongan_darah}
                                onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}
                            />
                        </>
                    )}

                    {formData.role === 'resepsionis' && (
                        <Select
                            label="Shift"
                            options={shiftOptions}
                            value={formData.shift}
                            onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                        />
                    )}

                    {formData.role === 'apoteker' && (
                        <Input
                            label="No. SIPA"
                            value={formData.no_sipa}
                            onChange={(e) => setFormData({ ...formData, no_sipa: e.target.value })}
                            placeholder="SIPA-XXXX-XXX"
                        />
                    )}
                </div>
            </Modal>

            {/* Profile Modal */}
            <Modal
                isOpen={isProfileModalOpen}
                onClose={() => {
                    setIsProfileModalOpen(false);
                    setSelectedUser(null);
                }}
                title="Detail Profil User"
                size="md"
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-2xl font-medium">
                                {selectedUser.first_name?.charAt(0) || selectedUser.username.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {selectedUser.first_name} {selectedUser.last_name}
                                </h3>
                                <p className="text-slate-500">@{selectedUser.username}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="font-medium">{selectedUser.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Role</p>
                                <Badge variant="info">{selectedUser.role}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Telepon</p>
                                <p className="font-medium">{selectedUser.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Status</p>
                                <Badge variant={selectedUser.is_active ? 'success' : 'danger'}>
                                    {selectedUser.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-slate-500">Password</p>
                                <p className="font-medium">{selectedUser.password_hint || 'Tidak tersedia'}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Gunakan tombol "Reset Password" untuk mengubah
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-slate-500">Alamat</p>
                                <p className="font-medium">{selectedUser.address || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-slate-500">Terdaftar Sejak</p>
                                <p className="font-medium">
                                    {selectedUser.date_joined ? new Date(selectedUser.date_joined).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={isResetPasswordModalOpen}
                onClose={() => {
                    setIsResetPasswordModalOpen(false);
                    setSelectedUser(null);
                    setNewPassword('');
                }}
                title="Reset Password"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsResetPasswordModalOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleResetPassword} isLoading={isSubmitting}>
                            Reset Password
                        </Button>
                    </>
                }
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <p className="text-slate-600">
                            Reset password untuk user <strong>{selectedUser.username}</strong>
                        </p>
                        <Input
                            label="Password Baru"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Masukkan password baru"
                            required
                        />
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900 mb-2">Persyaratan Password:</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• Minimal 8 karakter</li>
                                    <li>• Tidak boleh terlalu mirip dengan informasi user</li>
                                    <li>• Tidak boleh password yang terlalu umum</li>
                                    <li>• Tidak boleh hanya angka</li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                Password akan langsung berubah setelah Anda klik "Reset Password"
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Biaya Konsultasi Modal */}
            <Modal
                isOpen={isEditBiayaModalOpen}
                onClose={() => {
                    setIsEditBiayaModalOpen(false);
                    setSelectedUser(null);
                    setEditBiayaKonsultasi('');
                }}
                title="Edit Biaya Konsultasi"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsEditBiayaModalOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleSaveBiaya} isLoading={isSubmitting}>
                            Simpan
                        </Button>
                    </>
                }
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                            <p className="text-sm text-sky-700 mb-1">Dokter</p>
                            <p className="font-bold text-sky-900">
                                {selectedUser.first_name} {selectedUser.last_name}
                            </p>
                            <p className="text-sm text-sky-600">
                                {(selectedUser.profile_detail as any)?.spesialisasi_display || '-'}
                            </p>
                        </div>
                        
                        <Input
                            label="Biaya Konsultasi (Rp)"
                            type="number"
                            value={editBiayaKonsultasi}
                            onChange={(e) => setEditBiayaKonsultasi(e.target.value)}
                            placeholder="100000"
                            required
                        />
                        
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                            <DollarSign className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                Biaya konsultasi ini akan digunakan untuk setiap janji temu dengan dokter ini.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Transaction History Modal */}
            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => {
                    setIsHistoryModalOpen(false);
                    setSelectedUser(null);
                    setUserHistory(null);
                }}
                title="Riwayat Transaksi"
                size="lg"
            >
                {selectedUser && userHistory && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white font-medium">
                                {selectedUser.first_name?.charAt(0) || selectedUser.username.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    {selectedUser.first_name} {selectedUser.last_name}
                                </h3>
                                <p className="text-sm text-slate-500">{selectedUser.role}</p>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(userHistory.summary || {}).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-sm text-slate-500 capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {typeof value === 'number' && key.includes('biaya') 
                                            ? `Rp ${value.toLocaleString('id-ID')}`
                                            : value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Transactions */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800">Transaksi Terakhir</h4>
                            {Object.entries(userHistory.recent_transactions || {}).map(([key, items]: [string, any]) => (
                                items && items.length > 0 && (
                                    <div key={key} className="space-y-2">
                                        <p className="text-sm font-medium text-slate-600 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </p>
                                        <div className="space-y-2">
                                            {items.slice(0, 3).map((item: any, idx: number) => (
                                                <div key={idx} className="bg-slate-50 rounded-lg p-3 text-sm">
                                                    <p className="font-medium text-slate-800">
                                                        {item.diagnosa || item.status || item.invoice_number || `#${item.id}`}
                                                    </p>
                                                    <p className="text-slate-500 text-xs mt-1">
                                                        {new Date(item.created_at || item.tanggal_periksa).toLocaleDateString('id-ID')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}
                {!userHistory && (
                    <div className="text-center py-8">
                        <p className="text-slate-500">Memuat riwayat transaksi...</p>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleDeleteUser}
                title="Hapus User"
                message={`Apakah Anda yakin ingin menghapus user "${selectedUser?.first_name} ${selectedUser?.last_name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                isLoading={isSubmitting}
            />
        </div>
    );
};
