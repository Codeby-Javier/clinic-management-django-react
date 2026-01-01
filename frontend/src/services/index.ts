import api from './api';
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User,
    Dokter,
    Pasien,
    JanjiTemu,
    JanjiTemuBooking,
    RekamMedis,
    RekamMedisCreate,
    LayananTindakan,
    Obat,
    Resep,
    Pembayaran,
    LaporanOverview,
    RevenueChart,
    ApotekerStats,
    KasirStats,
    PaginatedResponse,
} from '../types';

// ==================== AUTH ====================
export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post('/auth/login/', credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register/', data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get('/auth/me/');
        return response.data;
    },

    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.patch('/auth/me/', data);
        return response.data;
    },
};

// ==================== ADMIN ====================
export const adminService = {
    // Users
    getUsers: async (params?: Record<string, string>): Promise<PaginatedResponse<User>> => {
        const response = await api.get('/users/', { params });
        return response.data;
    },

    getUser: async (id: number): Promise<User> => {
        const response = await api.get(`/users/${id}/`);
        return response.data;
    },

    createUser: async (data: Record<string, unknown>): Promise<User> => {
        const response = await api.post('/users/', data);
        return response.data;
    },

    updateUser: async (id: number, data: Partial<User>): Promise<User> => {
        const response = await api.patch(`/users/${id}/`, data);
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/users/${id}/`);
    },

    toggleUserActive: async (id: number): Promise<{ status: string; is_active: boolean }> => {
        const response = await api.post(`/users/${id}/toggle_active/`);
        return response.data;
    },

    resetUserPassword: async (id: number, newPassword: string): Promise<{ status: string; message: string }> => {
        try {
            console.log('=== API CALL: Reset Password ===');
            console.log('User ID:', id);
            console.log('Password length:', newPassword.length);
            console.log('API URL:', `/users/${id}/reset_password/`);
            
            const response = await api.post(`/users/${id}/reset_password/`, { 
                new_password: newPassword 
            });
            
            console.log('=== API RESPONSE: Success ===');
            console.log('Status:', response.status);
            console.log('Data:', response.data);
            
            return response.data;
        } catch (error: any) {
            console.error('=== API ERROR: Reset Password ===');
            console.error('Error object:', error);
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    getUserTransactionHistory: async (id: number): Promise<any> => {
        const response = await api.get(`/users/${id}/transaction_history/`);
        return response.data;
    },

    // Layanan
    getLayanan: async (params?: Record<string, string>): Promise<PaginatedResponse<LayananTindakan>> => {
        const response = await api.get('/layanan-tindakan/', { params });
        return response.data;
    },

    createLayanan: async (data: Partial<LayananTindakan>): Promise<LayananTindakan> => {
        const response = await api.post('/layanan-tindakan/', data);
        return response.data;
    },

    updateLayanan: async (id: number, data: Partial<LayananTindakan>): Promise<LayananTindakan> => {
        const response = await api.patch(`/layanan-tindakan/${id}/`, data);
        return response.data;
    },

    deleteLayanan: async (id: number): Promise<void> => {
        await api.delete(`/layanan-tindakan/${id}/`);
    },

    // Laporan
    getOverview: async (): Promise<LaporanOverview> => {
        const response = await api.get('/laporan/overview/');
        return response.data;
    },

    getRevenueChart: async (): Promise<RevenueChart[]> => {
        const response = await api.get('/laporan/revenue-chart/');
        return response.data;
    },
};

// ==================== DOKTER ====================
export const dokterService = {
    getJadwalSaya: async (): Promise<Dokter> => {
        const response = await api.get('/dokter/jadwal-saya/');
        return response.data;
    },

    updateJadwal: async (jadwal_praktik: Record<string, { mulai: string; selesai: string }>): Promise<Dokter> => {
        const response = await api.patch('/dokter/jadwal-saya/', { jadwal_praktik });
        return response.data;
    },

    getPasienSaya: async (params?: Record<string, string>): Promise<PaginatedResponse<Pasien>> => {
        const response = await api.get('/dokter/pasien-saya/', { params });
        return response.data;
    },

    getJanjiTemu: async (params?: Record<string, string>): Promise<PaginatedResponse<JanjiTemu>> => {
        const response = await api.get('/dokter/janji-temu/', { params });
        return response.data;
    },

    mulaiKonsultasi: async (id: number): Promise<JanjiTemu> => {
        const response = await api.post(`/dokter/janji-temu/${id}/mulai_konsultasi/`);
        return response.data;
    },

    // Rekam Medis
    getRekamMedis: async (params?: Record<string, string>): Promise<PaginatedResponse<RekamMedis>> => {
        const response = await api.get('/rekam-medis/', { params });
        return response.data;
    },

    getRekamMedisDetail: async (id: number): Promise<RekamMedis> => {
        const response = await api.get(`/rekam-medis/${id}/`);
        return response.data;
    },

    createRekamMedis: async (data: RekamMedisCreate): Promise<RekamMedis> => {
        const response = await api.post('/rekam-medis/', data);
        return response.data;
    },

    updateRekamMedis: async (id: number, data: Partial<RekamMedis>): Promise<RekamMedis> => {
        const response = await api.patch(`/rekam-medis/${id}/`, data);
        return response.data;
    },
};

// ==================== PASIEN ====================
export const pasienService = {
    getDokterJadwal: async (params?: Record<string, string>): Promise<PaginatedResponse<Dokter>> => {
        const response = await api.get('/dokter/jadwal/', { params });
        return response.data;
    },

    bookingJanjiTemu: async (data: JanjiTemuBooking): Promise<JanjiTemu> => {
        const response = await api.post('/booking/create/', data);
        return response.data;
    },

    getRiwayatJanjiTemu: async (params?: Record<string, string>): Promise<JanjiTemu[]> => {
        const response = await api.get('/pasien/riwayat-janji/', { params });
        // Handle both paginated and array response
        if (response.data && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    },

    cancelJanjiTemu: async (id: number): Promise<JanjiTemu> => {
        const response = await api.patch(`/janji-temu/${id}/cancel/`, {});
        return response.data;
    },

    getRekamMedisSaya: async (): Promise<RekamMedis[]> => {
        const response = await api.get('/rekam-medis/saya/');
        // Handle both paginated and array response
        if (response.data && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    },

    getRiwayatPembayaran: async (): Promise<Pembayaran[]> => {
        const response = await api.get('/pembayaran/riwayat/');
        // Handle both paginated and array response
        if (response.data && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    },
};

// ==================== RESEPSIONIS ====================
export const resepsionisService = {
    getPasien: async (params?: Record<string, string>): Promise<PaginatedResponse<Pasien>> => {
        const response = await api.get('/pasien/', { params });
        return response.data;
    },

    createPasien: async (data: Record<string, unknown>): Promise<{ message: string; pasien: Pasien }> => {
        const response = await api.post('/pasien/', data);
        return response.data;
    },

    getJanjiTemu: async (params?: Record<string, string>): Promise<PaginatedResponse<JanjiTemu>> => {
        const response = await api.get('/janji-temu/', { params });
        return response.data;
    },

    konfirmasiJanji: async (id: number): Promise<JanjiTemu> => {
        const response = await api.post(`/janji-temu/${id}/konfirmasi/`);
        return response.data;
    },

    rejectJanji: async (id: number, catatan: string): Promise<JanjiTemu> => {
        const response = await api.post(`/janji-temu/${id}/reject/`, { catatan });
        return response.data;
    },

    getAntrian: async (dokter_id?: number): Promise<JanjiTemu[]> => {
        const params = dokter_id ? { dokter_id: dokter_id.toString() } : {};
        const response = await api.get('/antrian/', { params });
        return response.data;
    },
};

// ==================== APOTEKER ====================
export const apotekerService = {
    getObat: async (params?: Record<string, string>): Promise<Obat[]> => {
        const response = await api.get('/obat/', { params });
        // Backend return array langsung, bukan paginated
        return Array.isArray(response.data) ? response.data : response.data.results || [];
    },

    getObatDetail: async (id: number): Promise<Obat> => {
        const response = await api.get(`/obat/${id}/`);
        return response.data;
    },

    createObat: async (data: any): Promise<Obat> => {
        const response = await api.post('/obat/', data);
        return response.data;
    },

    updateObat: async (id: number, data: any): Promise<Obat> => {
        const response = await api.put(`/obat/${id}/`, data);
        return response.data;
    },

    deleteObat: async (id: number): Promise<void> => {
        await api.delete(`/obat/${id}/`);
    },

    getStokMenipis: async (): Promise<Obat[]> => {
        const response = await api.get('/obat/stok_menipis/');
        return response.data;
    },

    getResep: async (params?: Record<string, string>): Promise<PaginatedResponse<Resep>> => {
        const response = await api.get('/resep/', { params });
        return response.data;
    },

    getResepDetail: async (id: number): Promise<Resep> => {
        const response = await api.get(`/resep/${id}/`);
        return response.data;
    },

    prosesResep: async (id: number, data: { status: string; catatan_apoteker?: string }): Promise<Resep> => {
        const response = await api.post(`/resep/${id}/proses/`, data);
        return response.data;
    },

    getStats: async (): Promise<ApotekerStats> => {
        const response = await api.get('/apoteker/stats/');
        return response.data;
    },
};

// ==================== KASIR ====================
export const kasirService = {
    getPembayaran: async (params?: Record<string, string>): Promise<PaginatedResponse<Pembayaran>> => {
        const response = await api.get('/pembayaran/', { params });
        return response.data;
    },

    getPembayaranPending: async (): Promise<Pembayaran[]> => {
        const response = await api.get('/pembayaran/pending/');
        return response.data;
    },

    getPembayaranDetail: async (id: number): Promise<Pembayaran> => {
        const response = await api.get(`/pembayaran/${id}/`);
        return response.data;
    },

    prosesBayar: async (id: number, data: { metode: string; catatan?: string }): Promise<Pembayaran> => {
        const response = await api.post(`/pembayaran/${id}/bayar/`, data);
        return response.data;
    },

    getInvoice: async (id: number): Promise<Pembayaran> => {
        const response = await api.get(`/pembayaran/${id}/invoice/`);
        return response.data;
    },

    getLaporanKeuangan: async (params?: Record<string, string>): Promise<Record<string, unknown>[]> => {
        const response = await api.get('/laporan/keuangan/', { params });
        return response.data;
    },

    getStats: async (): Promise<KasirStats> => {
        const response = await api.get('/kasir/stats/');
        return response.data;
    },
};
