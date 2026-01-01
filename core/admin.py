from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Dokter, Pasien, Resepsionis, Apoteker, Kasir,
    LayananTindakan, JanjiTemu, RekamMedis, Obat, Resep, DetailResep, Pembayaran
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Info Tambahan', {'fields': ('role', 'phone', 'address', 'foto_profile')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Info Tambahan', {'fields': ('role', 'phone', 'address')}),
    )


@admin.register(Dokter)
class DokterAdmin(admin.ModelAdmin):
    list_display = ['user', 'spesialisasi', 'no_str', 'biaya_konsultasi', 'status_aktif']
    list_filter = ['spesialisasi', 'status_aktif']
    search_fields = ['user__first_name', 'user__last_name', 'no_str']


@admin.register(Pasien)
class PasienAdmin(admin.ModelAdmin):
    list_display = ['no_rm', 'user', 'tanggal_lahir', 'golongan_darah', 'created_at']
    list_filter = ['golongan_darah', 'created_at']
    search_fields = ['no_rm', 'user__first_name', 'user__last_name']
    readonly_fields = ['no_rm']


@admin.register(Resepsionis)
class ResepsionisAdmin(admin.ModelAdmin):
    list_display = ['user', 'shift', 'tanggal_mulai_kerja']
    list_filter = ['shift']


@admin.register(Apoteker)
class ApotekerAdmin(admin.ModelAdmin):
    list_display = ['user', 'no_sipa', 'tanggal_mulai_kerja']
    search_fields = ['user__first_name', 'no_sipa']


@admin.register(Kasir)
class KasirAdmin(admin.ModelAdmin):
    list_display = ['user', 'tanggal_mulai_kerja']


@admin.register(LayananTindakan)
class LayananTindakanAdmin(admin.ModelAdmin):
    list_display = ['nama_tindakan', 'biaya', 'kategori', 'is_active']
    list_filter = ['kategori', 'is_active']
    search_fields = ['nama_tindakan']


@admin.register(JanjiTemu)
class JanjiTemuAdmin(admin.ModelAdmin):
    list_display = ['pasien', 'dokter', 'tanggal', 'waktu', 'status', 'nomor_antrian']
    list_filter = ['status', 'tanggal', 'dokter']
    search_fields = ['pasien__user__first_name', 'pasien__no_rm']
    readonly_fields = ['nomor_antrian']


@admin.register(RekamMedis)
class RekamMedisAdmin(admin.ModelAdmin):
    list_display = ['pasien', 'dokter', 'diagnosa', 'tanggal_periksa']
    list_filter = ['tanggal_periksa', 'dokter']
    search_fields = ['pasien__no_rm', 'diagnosa']


@admin.register(Obat)
class ObatAdmin(admin.ModelAdmin):
    list_display = ['nama', 'kategori', 'stok', 'satuan', 'harga_jual', 'expired_date', 'status_stok']
    list_filter = ['kategori', 'is_active']
    search_fields = ['nama', 'supplier']


class DetailResepInline(admin.TabularInline):
    model = DetailResep
    extra = 1


@admin.register(Resep)
class ResepAdmin(admin.ModelAdmin):
    list_display = ['id', 'rekam_medis', 'status', 'tanggal_resep', 'processed_by']
    list_filter = ['status', 'tanggal_resep']
    inlines = [DetailResepInline]


@admin.register(Pembayaran)
class PembayaranAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'janji_temu', 'total_biaya', 'metode', 'status', 'tanggal_bayar']
    list_filter = ['status', 'metode', 'created_at']
    search_fields = ['invoice_number']
    readonly_fields = ['invoice_number']
