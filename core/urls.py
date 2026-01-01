from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # Auth
    RegisterView, LoginView, ProfileView,
    # Admin
    UserViewSet, LayananTindakanViewSet,
    LaporanOverviewView, RevenueChartView,
    # Dokter
    DokterJanjiTemuViewSet, RekamMedisViewSet,
    DokterJadwalView, DokterPasienListView,
    # Resepsionis
    PasienViewSet, ResepsionisJanjiTemuViewSet, AntrianView,
    # Pasien
    CreateBookingView, PasienJanjiTemuListView, PasienRekamMedisListView,
    DokterJadwalPublicView, JanjiTemuCancelView, PasienPembayaranListView,
    # Apoteker
    ObatViewSet, ResepViewSet, ApotekerStatsView,
    # Kasir
    PembayaranViewSet, LaporanKeuanganView, KasirStatsView,
    # PHASE 2: Audit, Stok, Notifikasi
    AuditLogViewSet, StokAdjustmentViewSet, NotifikasiViewSet,
    # PHASE 3: Cicilan, Payment Gateway, QR Code
    CicilanViewSet, PaymentGatewayViewSet, PaymentTransactionViewSet, InvoiceQRCodeViewSet,
)

router = DefaultRouter()

# Admin routes
router.register(r'users', UserViewSet, basename='users')
router.register(r'layanan-tindakan', LayananTindakanViewSet, basename='layanan-tindakan')

# Dokter routes
router.register(r'dokter/janji-temu', DokterJanjiTemuViewSet, basename='dokter-janji-temu')
router.register(r'rekam-medis', RekamMedisViewSet, basename='rekam-medis')

# Resepsionis routes
router.register(r'pasien', PasienViewSet, basename='pasien')
router.register(r'janji-temu', ResepsionisJanjiTemuViewSet, basename='janji-temu')

# Apoteker routes
router.register(r'obat', ObatViewSet, basename='obat')
router.register(r'resep', ResepViewSet, basename='resep')

# Kasir routes
router.register(r'pembayaran', PembayaranViewSet, basename='pembayaran')

# PHASE 2: Audit, Stok, Notifikasi routes
router.register(r'audit-log', AuditLogViewSet, basename='audit-log')
router.register(r'stok-adjustment', StokAdjustmentViewSet, basename='stok-adjustment')
router.register(r'notifikasi', NotifikasiViewSet, basename='notifikasi')

# PHASE 3: Cicilan, Payment Gateway, QR Code routes
router.register(r'cicilan', CicilanViewSet, basename='cicilan')
router.register(r'payment-gateway', PaymentGatewayViewSet, basename='payment-gateway')
router.register(r'payment-transaction', PaymentTransactionViewSet, basename='payment-transaction')
router.register(r'invoice-qr', InvoiceQRCodeViewSet, basename='invoice-qr')

urlpatterns = [
    # 1. Auth routes (PRIORITY - must be before router)
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', ProfileView.as_view(), name='profile'),
    
    # 2. Pasien specific routes (PRIORITY - must be before router)
    path('booking/create/', CreateBookingView.as_view(), name='booking-create'),
    path('pasien/riwayat-janji/', PasienJanjiTemuListView.as_view(), name='janji-temu-riwayat'),
    path('rekam-medis/saya/', PasienRekamMedisListView.as_view(), name='rekam-medis-saya'),
    path('pembayaran/riwayat/', PasienPembayaranListView.as_view(), name='pembayaran-riwayat'),
    path('dokter/jadwal/', DokterJadwalPublicView.as_view(), name='dokter-jadwal-public'),
    path('janji-temu/<int:pk>/cancel/', JanjiTemuCancelView.as_view(), name='janji-temu-cancel'),
    
    # 3. Dokter specific routes (must be before router)
    path('dokter/jadwal-saya/', DokterJadwalView.as_view(), name='dokter-jadwal-saya'),
    path('dokter/pasien-saya/', DokterPasienListView.as_view(), name='dokter-pasien-saya'),
    
    # 4. Admin routes
    path('laporan/overview/', LaporanOverviewView.as_view(), name='laporan-overview'),
    path('laporan/revenue-chart/', RevenueChartView.as_view(), name='revenue-chart'),
    
    # 5. Apoteker routes
    path('apoteker/stats/', ApotekerStatsView.as_view(), name='apoteker-stats'),
    
    # 6. Kasir routes
    path('kasir/stats/', KasirStatsView.as_view(), name='kasir-stats'),
    path('laporan/keuangan/', LaporanKeuanganView.as_view(), name='laporan-keuangan'),
    
    # 7. Resepsionis routes
    path('antrian/', AntrianView.as_view(), name='antrian'),
    
    # 8. Router URLs (LAST - catch-all for viewsets)
    path('', include(router.urls)),
]
