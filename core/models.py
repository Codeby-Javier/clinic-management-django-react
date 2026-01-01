from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import uuid


class CustomUser(AbstractUser):
    """Custom User model dengan 6 roles"""
    ROLE_CHOICES = [
        ('admin', 'Admin Klinik'),
        ('dokter', 'Dokter'),
        ('pasien', 'Pasien'),
        ('resepsionis', 'Resepsionis'),
        ('apoteker', 'Apoteker'),
        ('kasir', 'Kasir'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='pasien')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    foto_profile = models.ImageField(upload_to='profiles/', blank=True, null=True)
    # Field untuk menyimpan password hint (hanya untuk admin view)
    password_hint = models.CharField(max_length=255, blank=True, null=True, help_text='Password hint untuk admin')
    
    class Meta:
        db_table = 'custom_user'
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"


class Dokter(models.Model):
    """Model Dokter linked ke User"""
    SPESIALISASI_CHOICES = [
        ('umum', 'Dokter Umum'),
        ('gigi', 'Dokter Gigi'),
        ('anak', 'Dokter Anak'),
        ('kandungan', 'Dokter Kandungan'),
        ('mata', 'Dokter Mata'),
        ('tht', 'Dokter THT'),
        ('kulit', 'Dokter Kulit'),
        ('jantung', 'Dokter Jantung'),
        ('bedah', 'Dokter Bedah'),
        ('saraf', 'Dokter Saraf'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='dokter_profile')
    spesialisasi = models.CharField(max_length=50, choices=SPESIALISASI_CHOICES, default='umum')
    no_str = models.CharField(max_length=50, unique=True, verbose_name='No. STR')
    jadwal_praktik = models.JSONField(default=dict, blank=True)  # {"senin": {"mulai": "08:00", "selesai": "12:00"}, ...}
    biaya_konsultasi = models.DecimalField(max_digits=12, decimal_places=2, default=100000)
    status_aktif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dokter'
        verbose_name_plural = 'Dokter'
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.get_spesialisasi_display()}"


class Pasien(models.Model):
    """Model Pasien linked ke User"""
    GOLONGAN_DARAH_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='pasien_profile')
    no_rm = models.CharField(max_length=20, unique=True, verbose_name='No. Rekam Medis')
    tanggal_lahir = models.DateField(null=True, blank=True)
    golongan_darah = models.CharField(max_length=5, choices=GOLONGAN_DARAH_CHOICES, blank=True, null=True)
    alergi = models.TextField(blank=True, null=True)
    kontak_darurat = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pasien'
        verbose_name_plural = 'Pasien'
    
    def __str__(self):
        return f"{self.no_rm} - {self.user.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.no_rm:
            # Auto-generate no_rm: RM + tahun + 5 digit increment
            year = timezone.now().year
            last_pasien = Pasien.objects.filter(no_rm__startswith=f'RM{year}').order_by('-no_rm').first()
            if last_pasien:
                last_number = int(last_pasien.no_rm[-5:])
                new_number = last_number + 1
            else:
                new_number = 1
            self.no_rm = f'RM{year}{new_number:05d}'
        super().save(*args, **kwargs)


class Resepsionis(models.Model):
    """Model Resepsionis linked ke User"""
    SHIFT_CHOICES = [
        ('pagi', 'Pagi (07:00 - 14:00)'),
        ('siang', 'Siang (14:00 - 21:00)'),
        ('malam', 'Malam (21:00 - 07:00)'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='resepsionis_profile')
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='pagi')
    tanggal_mulai_kerja = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resepsionis'
        verbose_name_plural = 'Resepsionis'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_shift_display()}"


class Apoteker(models.Model):
    """Model Apoteker linked ke User"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='apoteker_profile')
    no_sipa = models.CharField(max_length=50, unique=True, verbose_name='No. SIPA')
    tanggal_mulai_kerja = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'apoteker'
        verbose_name_plural = 'Apoteker'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.no_sipa}"


class Kasir(models.Model):
    """Model Kasir linked ke User"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='kasir_profile')
    tanggal_mulai_kerja = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'kasir'
        verbose_name_plural = 'Kasir'
    
    def __str__(self):
        return self.user.get_full_name()


class LayananTindakan(models.Model):
    """Model Layanan Tindakan"""
    KATEGORI_CHOICES = [
        ('pemeriksaan', 'Pemeriksaan'),
        ('tindakan', 'Tindakan'),
        ('laboratorium', 'Laboratorium'),
        ('radiologi', 'Radiologi'),
        ('lainnya', 'Lainnya'),
    ]
    
    nama_tindakan = models.CharField(max_length=100)
    biaya = models.DecimalField(max_digits=12, decimal_places=2)
    kategori = models.CharField(max_length=50, choices=KATEGORI_CHOICES, default='tindakan')
    deskripsi = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'layanan_tindakan'
        verbose_name_plural = 'Layanan Tindakan'
    
    def __str__(self):
        return f"{self.nama_tindakan} - Rp {self.biaya:,.0f}"


class JanjiTemu(models.Model):
    """Model Janji Temu (Appointment)"""
    STATUS_CHOICES = [
        ('pending', 'Menunggu Konfirmasi'),
        ('confirmed', 'Terkonfirmasi'),
        ('completed', 'Selesai'),
        ('cancelled', 'Dibatalkan'),
    ]
    
    pasien = models.ForeignKey(Pasien, on_delete=models.CASCADE, related_name='janji_temu')
    dokter = models.ForeignKey(Dokter, on_delete=models.CASCADE, related_name='janji_temu')
    tanggal = models.DateField()
    waktu = models.TimeField()
    keluhan = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    nomor_antrian = models.CharField(max_length=20, null=True, blank=True)  # Format: SIT-01, DON-01, etc
    catatan = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'janji_temu'
        verbose_name_plural = 'Janji Temu'
        ordering = ['-tanggal', 'waktu']
    
    def __str__(self):
        return f"{self.pasien.user.get_full_name()} - Dr. {self.dokter.user.get_full_name()} ({self.tanggal})"
    
    def _generate_kode_dokter(self):
        """Generate kode dokter dari 3 huruf pertama nama"""
        nama = self.dokter.user.first_name.upper()
        # Ambil 3 huruf pertama, atau pad dengan X jika kurang
        kode = (nama[:3] + 'XXX')[:3]
        return kode
    
    def save(self, *args, **kwargs):
        if not self.nomor_antrian:
            # Generate kode dokter
            kode_dokter = self._generate_kode_dokter()
            
            # Auto-generate nomor_antrian per dokter per tanggal dengan format KODE-NN
            last_antrian = JanjiTemu.objects.filter(
                dokter=self.dokter,
                tanggal=self.tanggal,
                nomor_antrian__isnull=False
            ).exclude(pk=self.pk).order_by('-nomor_antrian').first()
            
            if last_antrian and last_antrian.nomor_antrian:
                # Extract number from format like "SIT-01"
                try:
                    last_number = int(last_antrian.nomor_antrian.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            
            self.nomor_antrian = f"{kode_dokter}-{new_number:02d}"
        super().save(*args, **kwargs)


class RekamMedis(models.Model):
    """Model Rekam Medis"""
    pasien = models.ForeignKey(Pasien, on_delete=models.CASCADE, related_name='rekam_medis')
    dokter = models.ForeignKey(Dokter, on_delete=models.CASCADE, related_name='rekam_medis')
    janji_temu = models.OneToOneField(JanjiTemu, on_delete=models.SET_NULL, null=True, blank=True, related_name='rekam_medis')
    diagnosa = models.TextField()
    anamnesa = models.TextField(verbose_name='Anamnesa/Keluhan')
    pemeriksaan_fisik = models.TextField(blank=True, null=True)
    tindakan = models.ManyToManyField(LayananTindakan, blank=True, related_name='rekam_medis')
    catatan = models.TextField(blank=True, null=True)
    tanggal_periksa = models.DateTimeField(auto_now_add=True)
    # PHASE 2: Duration tracking
    waktu_mulai = models.DateTimeField(null=True, blank=True)
    waktu_selesai = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rekam_medis'
        verbose_name_plural = 'Rekam Medis'
        ordering = ['-tanggal_periksa']
        # PHASE 1: Unique constraint untuk prevent duplikasi
        constraints = [
            models.UniqueConstraint(
                fields=['janji_temu'],
                condition=models.Q(janji_temu__isnull=False),
                name='unique_rekam_medis_per_janji'
            )
        ]
    
    def __str__(self):
        return f"RM - {self.pasien.user.get_full_name()} ({self.tanggal_periksa.strftime('%Y-%m-%d')})"
    
    # PHASE 2: Duration calculation
    @property
    def durasi_menit(self):
        if self.waktu_mulai and self.waktu_selesai:
            delta = self.waktu_selesai - self.waktu_mulai
            return int(delta.total_seconds() / 60)
        return None
    
    # PHASE 1: Validasi
    def clean(self):
        # Validasi janji_temu harus dari dokter yang sama
        if self.janji_temu and self.janji_temu.dokter != self.dokter:
            raise ValidationError("Dokter tidak sesuai dengan janji temu")
        
        # Validasi janji_temu harus confirmed
        if self.janji_temu and self.janji_temu.status != 'confirmed':
            raise ValidationError("Janji temu harus dalam status 'Terkonfirmasi'")
        
        # Validasi diagnosa tidak kosong
        if not self.diagnosa or not self.diagnosa.strip():
            raise ValidationError("Diagnosa wajib diisi")
        
        # Validasi anamnesa tidak kosong
        if not self.anamnesa or not self.anamnesa.strip():
            raise ValidationError("Anamnesa wajib diisi")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Obat(models.Model):
    """Model Obat"""
    KATEGORI_CHOICES = [
        ('tablet', 'Tablet'),
        ('kapsul', 'Kapsul'),
        ('sirup', 'Sirup'),
        ('salep', 'Salep'),
        ('injeksi', 'Injeksi'),
        ('tetes', 'Tetes'),
        ('lainnya', 'Lainnya'),
    ]
    
    SATUAN_CHOICES = [
        ('tablet', 'Tablet'),
        ('kapsul', 'Kapsul'),
        ('botol', 'Botol'),
        ('tube', 'Tube'),
        ('ampul', 'Ampul'),
        ('strip', 'Strip'),
        ('box', 'Box'),
    ]
    
    nama = models.CharField(max_length=100)
    kategori = models.CharField(max_length=50, choices=KATEGORI_CHOICES, default='tablet')
    stok = models.IntegerField(default=0)
    satuan = models.CharField(max_length=50, choices=SATUAN_CHOICES, default='tablet')
    harga_jual = models.DecimalField(max_digits=12, decimal_places=2)
    harga_beli = models.DecimalField(max_digits=12, decimal_places=2)
    expired_date = models.DateField(null=True, blank=True)
    supplier = models.CharField(max_length=100, blank=True, null=True)
    deskripsi = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'obat'
        verbose_name_plural = 'Obat'
    
    def __str__(self):
        return f"{self.nama} (Stok: {self.stok})"
    
    @property
    def status_stok(self):
        if self.stok <= 0:
            return 'habis'
        elif self.stok < 10:
            return 'menipis'
        return 'aman'
    
    # PHASE 1: Expired date properties
    @property
    def is_expired(self):
        if self.expired_date:
            return self.expired_date <= timezone.now().date()
        return False
    
    @property
    def days_until_expired(self):
        if self.expired_date:
            delta = self.expired_date - timezone.now().date()
            return delta.days
        return None
    
    # PHASE 1: Validasi expired
    def clean(self):
        if self.is_expired:
            raise ValidationError(f"Obat {self.nama} sudah kadaluarsa pada {self.expired_date}")


class Resep(models.Model):
    """Model Resep"""
    STATUS_CHOICES = [
        ('pending', 'Menunggu Proses'),
        ('processed', 'Sedang Diproses'),
        ('delivered', 'Sudah Diserahkan'),
    ]
    
    rekam_medis = models.ForeignKey(RekamMedis, on_delete=models.CASCADE, related_name='resep')
    tanggal_resep = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    catatan_apoteker = models.TextField(blank=True, null=True)
    processed_by = models.ForeignKey(Apoteker, on_delete=models.SET_NULL, null=True, blank=True, related_name='resep_processed')
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resep'
        verbose_name_plural = 'Resep'
        ordering = ['-tanggal_resep']
    
    def __str__(self):
        return f"Resep #{self.pk} - {self.rekam_medis.pasien.user.get_full_name()}"
    
    @property
    def total_harga(self):
        return sum(detail.subtotal for detail in self.detail_resep.all())


class DetailResep(models.Model):
    """Model Detail Resep (Many-to-Many Resep-Obat)"""
    resep = models.ForeignKey(Resep, on_delete=models.CASCADE, related_name='detail_resep')
    obat = models.ForeignKey(Obat, on_delete=models.CASCADE, related_name='detail_resep')
    jumlah = models.IntegerField(default=1)
    aturan_pakai = models.CharField(max_length=200)  # e.g., "3x1 setelah makan"
    harga_satuan = models.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        db_table = 'detail_resep'
        verbose_name_plural = 'Detail Resep'
    
    def __str__(self):
        return f"{self.obat.nama} x {self.jumlah}"
    
    @property
    def subtotal(self):
        return self.jumlah * self.harga_satuan
    
    def save(self, *args, **kwargs):
        if not self.harga_satuan:
            self.harga_satuan = self.obat.harga_jual
        super().save(*args, **kwargs)


class Pembayaran(models.Model):
    """Model Pembayaran"""
    METODE_CHOICES = [
        ('tunai', 'Tunai'),
        ('transfer', 'Transfer Bank'),
        ('asuransi', 'Asuransi'),
        ('qris', 'QRIS'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Belum Lunas'),
        ('lunas', 'Lunas'),
    ]
    
    janji_temu = models.OneToOneField(JanjiTemu, on_delete=models.CASCADE, related_name='pembayaran')
    metode = models.CharField(max_length=20, choices=METODE_CHOICES, default='tunai')
    total_biaya = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    biaya_konsultasi = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    biaya_obat = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    biaya_tindakan = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tanggal_bayar = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    catatan = models.TextField(blank=True, null=True)
    processed_by = models.ForeignKey(Kasir, on_delete=models.SET_NULL, null=True, blank=True, related_name='pembayaran_processed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pembayaran'
        verbose_name_plural = 'Pembayaran'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invoice #{self.invoice_number} - {self.janji_temu.pasien.user.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Auto-generate invoice number: INV-YYYYMMDD-XXXX
            today = timezone.now()
            prefix = f"INV-{today.strftime('%Y%m%d')}"
            last_invoice = Pembayaran.objects.filter(
                invoice_number__startswith=prefix
            ).order_by('-invoice_number').first()
            
            if last_invoice:
                last_number = int(last_invoice.invoice_number[-4:])
                new_number = last_number + 1
            else:
                new_number = 1
            self.invoice_number = f"{prefix}-{new_number:04d}"
        super().save(*args, **kwargs)
    
    def calculate_total(self):
        """Calculate total biaya dari konsultasi + obat + tindakan"""
        # Biaya konsultasi dari dokter
        self.biaya_konsultasi = self.janji_temu.dokter.biaya_konsultasi
        
        # Biaya obat dari resep (jika ada rekam medis)
        self.biaya_obat = 0
        if hasattr(self.janji_temu, 'rekam_medis'):
            rekam_medis = self.janji_temu.rekam_medis
            for resep in rekam_medis.resep.all():
                self.biaya_obat += resep.total_harga
            
            # Biaya tindakan
            self.biaya_tindakan = sum(t.biaya for t in rekam_medis.tindakan.all())
        
        self.total_biaya = self.biaya_konsultasi + self.biaya_obat + self.biaya_tindakan
        return self.total_biaya



# ============================================
# PHASE 2: AUDIT TRAIL SYSTEM
# ============================================

class AuditLog(models.Model):
    """Model Audit Log untuk tracking semua perubahan data"""
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
    ]
    
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.IntegerField()
    object_str = models.CharField(max_length=255)
    changes = models.JSONField(default=dict, blank=True)  # {field: [old, new]}
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_log'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['model_name', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.action} {self.model_name} #{self.object_id}"


# ============================================
# PHASE 2: STOK ADJUSTMENT SYSTEM
# ============================================

class StokAdjustment(models.Model):
    """Model Stok Adjustment untuk tracking perubahan stok manual"""
    REASON_CHOICES = [
        ('opname', 'Opname'),
        ('rusak', 'Rusak'),
        ('kadaluarsa', 'Kadaluarsa'),
        ('koreksi', 'Koreksi'),
        ('lainnya', 'Lainnya'),
    ]
    
    obat = models.ForeignKey(
        Obat, 
        on_delete=models.CASCADE, 
        related_name='stok_adjustments'
    )
    jumlah = models.IntegerField()  # Bisa positif atau negatif
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    catatan = models.TextField(blank=True)
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='stok_adjustments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stok_adjustment'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.obat.nama} {self.jumlah:+d} ({self.get_reason_display()})"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update stok obat
        self.obat.stok += self.jumlah
        self.obat.save()


# ============================================
# PHASE 2: NOTIFIKASI SYSTEM
# ============================================

class Notifikasi(models.Model):
    """Model Notifikasi untuk user"""
    TYPE_CHOICES = [
        ('janji_temu', 'Janji Temu'),
        ('resep', 'Resep'),
        ('pembayaran', 'Pembayaran'),
        ('antrian', 'Antrian'),
        ('rekam_medis', 'Rekam Medis'),
        ('stok', 'Stok Obat'),
        ('system', 'System'),
    ]
    
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='notifikasi'
    )
    tipe = models.CharField(max_length=50, choices=TYPE_CHOICES)
    judul = models.CharField(max_length=255)
    pesan = models.TextField()
    data = models.JSONField(default=dict, blank=True)  # Extra data
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifikasi'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.judul}"


# ============================================
# PHASE 3: CICILAN/INSTALLMENT SYSTEM
# ============================================

class Cicilan(models.Model):
    """Model Cicilan untuk pembayaran bertahap"""
    STATUS_CHOICES = [
        ('pending', 'Belum Dibayar'),
        ('lunas', 'Lunas'),
        ('overdue', 'Terlambat'),
    ]
    
    pembayaran = models.ForeignKey(
        Pembayaran, 
        on_delete=models.CASCADE, 
        related_name='cicilan'
    )
    nomor_cicilan = models.IntegerField()
    jumlah = models.DecimalField(max_digits=12, decimal_places=2)
    tanggal_jatuh_tempo = models.DateField()
    tanggal_bayar = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    catatan = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cicilan'
        ordering = ['nomor_cicilan']
    
    def __str__(self):
        return f"Cicilan #{self.nomor_cicilan} - {self.pembayaran.invoice_number}"
    
    @property
    def is_overdue(self):
        if self.status == 'pending' and self.tanggal_jatuh_tempo < timezone.now().date():
            return True
        return False


# ============================================
# PHASE 3: PAYMENT GATEWAY MOCK SYSTEM
# ============================================

class PaymentGateway(models.Model):
    """Model Payment Gateway Configuration (Mock)"""
    PROVIDER_CHOICES = [
        ('mock_transfer', 'Mock Transfer Bank'),
        ('mock_qris', 'Mock QRIS'),
        ('mock_ewallet', 'Mock E-Wallet'),
        ('mock_cc', 'Mock Credit Card'),
    ]
    
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES, unique=True)
    is_active = models.BooleanField(default=True)
    config = models.JSONField(default=dict, blank=True)  # Configuration data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_gateway'
    
    def __str__(self):
        return f"{self.get_provider_display()}"


class PaymentTransaction(models.Model):
    """Model Payment Transaction untuk tracking pembayaran online"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    pembayaran = models.ForeignKey(
        Pembayaran, 
        on_delete=models.CASCADE, 
        related_name='transactions'
    )
    gateway = models.ForeignKey(
        PaymentGateway, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='transactions'
    )
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_proof = models.ImageField(upload_to='payment_proofs/', null=True, blank=True)
    response_data = models.JSONField(default=dict, blank=True)  # Gateway response
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_transaction'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction_id} - {self.status}"
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            # Auto-generate transaction ID
            import random
            import string
            random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
            self.transaction_id = f"TRX-{timezone.now().strftime('%Y%m%d')}-{random_str}"
        super().save(*args, **kwargs)


# ============================================
# PHASE 3: INVOICE QR CODE
# ============================================

class InvoiceQRCode(models.Model):
    """Model untuk menyimpan QR Code invoice"""
    pembayaran = models.OneToOneField(
        Pembayaran, 
        on_delete=models.CASCADE, 
        related_name='qr_code'
    )
    qr_image = models.ImageField(upload_to='qr_codes/', null=True, blank=True)
    qr_data = models.TextField()  # Data yang di-encode ke QR
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'invoice_qr_code'
    
    def __str__(self):
        return f"QR - {self.pembayaran.invoice_number}"
