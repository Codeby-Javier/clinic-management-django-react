import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { LayananManagement } from './pages/admin/LayananManagement';
import { ObatManagement } from './pages/admin/ObatManagement';

// Dokter Pages
import { DokterDashboard } from './pages/dokter/DokterDashboard';
import { JadwalPraktik } from './pages/dokter/JadwalPraktik';
import { DokterJanjiTemu } from './pages/dokter/DokterJanjiTemu';

// Pasien Pages
import { PasienDashboard } from './pages/pasien/PasienDashboard';
import { BookingDokter } from './pages/pasien/BookingDokter';
import { RiwayatJanjiTemu } from './pages/pasien/RiwayatJanjiTemu';
import { RekamMedisPasien } from './pages/pasien/RekamMedisPasien';
import { PembayaranPasien } from './pages/pasien/PembayaranPasien';

// Resepsionis Pages
import { ResepsionisDashboard } from './pages/resepsionis/ResepsionisDashboard';
import { PendaftaranPasien } from './pages/resepsionis/PendaftaranPasien';
import { ManajemenJanjiTemu } from './pages/resepsionis/ManajemenJanjiTemu';
import { AntrianPasien } from './pages/resepsionis/AntrianPasien';

// Apoteker Pages
import { ApotekerDashboard } from './pages/apoteker/ApotekerDashboard';
import { ResepApoteker } from './pages/apoteker/ResepApoteker';
import { ObatApoteker } from './pages/apoteker/ObatApoteker';

// Kasir Pages
// Common Pages
import { ProfilePage } from './pages/common/ProfilePage';
import { SettingsPage } from './pages/common/SettingsPage';
import { KasirDashboard } from './pages/kasir/KasirDashboard';
import { PembayaranKasir } from './pages/kasir/PembayaranKasir';
import { LaporanKeuangan } from './pages/kasir/LaporanKeuangan';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="layanan" element={<LayananManagement />} />
            <Route path="obat" element={<ObatManagement />} />
          </Route>

          {/* Dokter Routes */}
          <Route path="/dokter" element={<DashboardLayout allowedRoles={['dokter']} />}>
            <Route index element={<DokterDashboard />} />
            <Route path="jadwal" element={<JadwalPraktik />} />
            <Route path="janji-temu" element={<DokterJanjiTemu />} />
            <Route path="pasien" element={<DokterDashboard />} />
            <Route path="rekam-medis" element={<DokterJanjiTemu />} />
          </Route>

          {/* Pasien Routes */}
          <Route path="/pasien" element={<DashboardLayout allowedRoles={['pasien']} />}>
            <Route index element={<PasienDashboard />} />
            <Route path="janji-temu" element={<BookingDokter />} />
            <Route path="riwayat" element={<RiwayatJanjiTemu />} />
            <Route path="rekam-medis" element={<RekamMedisPasien />} />
            <Route path="pembayaran" element={<PembayaranPasien />} />
          </Route>

          {/* Resepsionis Routes */}
          <Route path="/resepsionis" element={<DashboardLayout allowedRoles={['resepsionis']} />}>
            <Route index element={<ResepsionisDashboard />} />
            <Route path="pasien" element={<PendaftaranPasien />} />
            <Route path="janji-temu" element={<ManajemenJanjiTemu />} />
            <Route path="antrian" element={<AntrianPasien />} />
          </Route>

          {/* Apoteker Routes */}
          <Route path="/apoteker" element={<DashboardLayout allowedRoles={['apoteker']} />}>
            <Route index element={<ApotekerDashboard />} />
            <Route path="resep" element={<ResepApoteker />} />
            <Route path="obat" element={<ObatApoteker />} />
          </Route>

          {/* Kasir Routes */}
          <Route path="/kasir" element={<DashboardLayout allowedRoles={['kasir']} />}>
            <Route index element={<KasirDashboard />} />
            <Route path="pembayaran" element={<PembayaranKasir />} />
            <Route path="laporan" element={<LaporanKeuangan />} />
          </Route>

          {/* Common Authenticated Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
