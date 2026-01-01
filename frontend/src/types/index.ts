// User Types
export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    role: 'admin' | 'dokter' | 'pasien' | 'resepsionis' | 'apoteker' | 'kasir';
    phone?: string;
    address?: string;
    foto_profile?: string;
    is_active: boolean;
    date_joined?: string;
    password_hint?: string;  // For admin view only
    profile_detail?: DokterProfile | PasienProfile | ResepsionisProfile | ApotekerProfile | KasirProfile;
}

export interface DokterProfile {
    id: number;
    spesialisasi: string;
    spesialisasi_display: string;
    no_str: string;
    jadwal_praktik: JadwalPraktik;
    biaya_konsultasi: number;
    status_aktif: boolean;
}

export interface PasienProfile {
    id: number;
    no_rm: string;
    tanggal_lahir?: string;
    golongan_darah?: string;
    alergi?: string;
    kontak_darurat?: string;
}

export interface ResepsionisProfile {
    id: number;
    shift: string;
    shift_display: string;
    tanggal_mulai_kerja: string;
}

export interface ApotekerProfile {
    id: number;
    no_sipa: string;
    tanggal_mulai_kerja: string;
}

export interface KasirProfile {
    id: number;
    tanggal_mulai_kerja: string;
}

export interface JadwalPraktik {
    [key: string]: {
        mulai: string;
        selesai: string;
    };
}

// Auth Types
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name?: string;
    phone?: string;
    address?: string;
    tanggal_lahir?: string;
    golongan_darah?: string;
    alergi?: string;
    kontak_darurat?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    tokens: {
        access: string;
        refresh: string;
    };
}

// Dokter Types
export interface Dokter {
    id: number;
    user?: User;
    nama?: string;
    foto?: string;
    spesialisasi: string;
    spesialisasi_display: string;
    no_str?: string;
    jadwal_praktik: JadwalPraktik;
    biaya_konsultasi: number;
    status_aktif: boolean;
}

// Pasien Types
export interface Pasien {
    id: number;
    user: User;
    no_rm: string;
    tanggal_lahir?: string;
    golongan_darah?: string;
    golongan_darah_display?: string;
    alergi?: string;
    kontak_darurat?: string;
    created_at: string;
}

// Janji Temu Types
export interface JanjiTemu {
    id: number;
    pasien: Pasien;
    dokter: Dokter;
    tanggal: string;
    waktu: string;
    keluhan: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    status_display: string;
    nomor_antrian: number;
    catatan?: string;
    has_rekam_medis: boolean;
    has_pembayaran: boolean;
    created_at: string;
}

export interface JanjiTemuBooking {
    dokter_id: number;
    tanggal: string;
    waktu: string;
    keluhan: string;
}

// Rekam Medis Types
export interface RekamMedis {
    id: number;
    pasien: Pasien;
    dokter: Dokter;
    janji_temu?: JanjiTemu;
    diagnosa: string;
    anamnesa: string;
    pemeriksaan_fisik?: string;
    tindakan: LayananTindakan[];
    catatan?: string;
    resep_list: Resep[];
    tanggal_periksa: string;
    created_at: string;
}

export interface RekamMedisCreate {
    janji_temu_id: number;
    diagnosa: string;
    anamnesa: string;
    pemeriksaan_fisik?: string;
    tindakan_ids?: number[];
    catatan?: string;
    obat_list?: ObatResep[];
}

// Layanan Tindakan Types
export interface LayananTindakan {
    id: number;
    nama_tindakan: string;
    biaya: number;
    kategori: string;
    kategori_display: string;
    deskripsi?: string;
    is_active: boolean;
    created_at: string;
}

// Obat Types
export interface Obat {
    id: number;
    nama: string;
    kategori: string;
    kategori_display: string;
    stok: number;
    satuan: string;
    satuan_display: string;
    harga_jual: number;
    harga_beli: number;
    expired_date?: string;
    supplier?: string;
    deskripsi?: string;
    is_active: boolean;
    status_stok: 'aman' | 'menipis' | 'habis';
    is_expired: boolean;
    days_until_expired: number | null;
    created_at: string;
}

export interface ObatResep {
    obat_id: number;
    jumlah: number;
    aturan_pakai: string;
}

// Resep Types
export interface DetailResep {
    id: number;
    obat: Obat;
    jumlah: number;
    aturan_pakai: string;
    harga_satuan: number;
    subtotal: number;
}

export interface Resep {
    id: number;
    rekam_medis: number;
    tanggal_resep: string;
    status: 'pending' | 'processed' | 'delivered';
    status_display: string;
    catatan_apoteker?: string;
    processed_by?: number;
    processed_at?: string;
    detail_resep: DetailResep[];
    total_harga: number;
    pasien_nama: string;
    dokter_nama: string;
    created_at: string;
}

// Pembayaran Types
export interface Pembayaran {
    id: number;
    janji_temu: JanjiTemu;
    metode: 'tunai' | 'transfer' | 'asuransi' | 'qris';
    metode_display: string;
    total_biaya: number;
    biaya_konsultasi: number;
    biaya_obat: number;
    biaya_tindakan: number;
    tanggal_bayar?: string;
    status: 'pending' | 'lunas';
    status_display: string;
    invoice_number: string;
    catatan?: string;
    processed_by_name?: string;
    created_at: string;
}

// Laporan Types
export interface LaporanOverview {
    total_pasien: number;
    total_dokter: number;
    janji_hari_ini: number;
    revenue_bulan_ini: number;
    pasien_baru_bulan_ini: number;
    pembayaran_pending: number;
}

export interface RevenueChart {
    date: string;
    day: string;
    revenue: number;
}

// Pagination Types
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Stats Types
export interface DokterStats {
    pasien_hari_ini: number;
    janji_pending: number;
    rekam_medis_bulan_ini: number;
}

export interface ApotekerStats {
    resep_pending: number;
    obat_menipis: number;
    resep_hari_ini: number;
}

export interface KasirStats {
    pembayaran_hari_ini: number;
    pending: number;
    revenue_bulan_ini: number;
    revenue_hari_ini: number;
}
