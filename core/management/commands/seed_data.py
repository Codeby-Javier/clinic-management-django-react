from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, time, timedelta
from decimal import Decimal

from core.models import (
    CustomUser, Dokter, Pasien, Resepsionis, Apoteker, Kasir,
    LayananTindakan, JanjiTemu, RekamMedis, Obat, Resep, DetailResep, Pembayaran
)


class Command(BaseCommand):
    help = 'Seed database dengan data dummy untuk testing'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Memulai seeding database...')
        
        # Clear existing data (optional)
        self.stdout.write('🗑️  Membersihkan data lama...')
        Pembayaran.objects.all().delete()
        DetailResep.objects.all().delete()
        Resep.objects.all().delete()
        RekamMedis.objects.all().delete()
        JanjiTemu.objects.all().delete()
        Obat.objects.all().delete()
        LayananTindakan.objects.all().delete()
        Kasir.objects.all().delete()
        Apoteker.objects.all().delete()
        Resepsionis.objects.all().delete()
        Pasien.objects.all().delete()
        Dokter.objects.all().delete()
        CustomUser.objects.exclude(is_superuser=True).delete()
        
        # ========== CREATE USERS & PROFILES ==========
        self.stdout.write('👥 Membuat users...')
        
        # Admin (skip if exists)
        admin_user, _ = CustomUser.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@kliniksehat.com',
                'first_name': 'Admin',
                'last_name': 'Klinik',
                'role': 'admin',
                'phone': '081234567890',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if not admin_user.check_password('admin123'):
            admin_user.set_password('admin123')
            admin_user.save()
        
        # Dokter 1 - Umum
        dokter1_user = CustomUser.objects.create_user(
            username='dr.ahmad',
            email='dr.ahmad@kliniksehat.com',
            password='dokter123',
            first_name='Ahmad',
            last_name='Fauzi',
            role='dokter',
            phone='081234567891',
            address='Jl. Dokter No. 1, Jakarta'
        )
        dokter1 = Dokter.objects.create(
            user=dokter1_user,
            spesialisasi='umum',
            no_str='STR-2024-001',
            biaya_konsultasi=Decimal('100000'),
            jadwal_praktik={
                'senin': {'mulai': '08:00', 'selesai': '14:00'},
                'selasa': {'mulai': '08:00', 'selesai': '14:00'},
                'rabu': {'mulai': '08:00', 'selesai': '14:00'},
                'kamis': {'mulai': '08:00', 'selesai': '14:00'},
                'jumat': {'mulai': '08:00', 'selesai': '12:00'},
                'sabtu': {'mulai': '09:00', 'selesai': '13:00'},
            }
        )
        
        # Dokter 2 - Gigi
        dokter2_user = CustomUser.objects.create_user(
            username='dr.siti',
            email='dr.siti@kliniksehat.com',
            password='dokter123',
            first_name='Siti',
            last_name='Rahayu',
            role='dokter',
            phone='081234567892',
            address='Jl. Dokter No. 2, Jakarta'
        )
        dokter2 = Dokter.objects.create(
            user=dokter2_user,
            spesialisasi='gigi',
            no_str='STR-2024-002',
            biaya_konsultasi=Decimal('150000'),
            jadwal_praktik={
                'senin': {'mulai': '14:00', 'selesai': '20:00'},
                'selasa': {'mulai': '14:00', 'selesai': '20:00'},
                'rabu': {'mulai': '14:00', 'selesai': '20:00'},
                'kamis': {'mulai': '14:00', 'selesai': '20:00'},
                'sabtu': {'mulai': '10:00', 'selesai': '16:00'},
            }
        )
        
        # Dokter 3 - Anak
        dokter3_user = CustomUser.objects.create_user(
            username='dr.budi',
            email='dr.budi@kliniksehat.com',
            password='dokter123',
            first_name='Budi',
            last_name='Santoso',
            role='dokter',
            phone='081234567893',
            address='Jl. Dokter No. 3, Jakarta'
        )
        dokter3 = Dokter.objects.create(
            user=dokter3_user,
            spesialisasi='anak',
            no_str='STR-2024-003',
            biaya_konsultasi=Decimal('125000'),
            jadwal_praktik={
                'senin': {'mulai': '09:00', 'selesai': '15:00'},
                'rabu': {'mulai': '09:00', 'selesai': '15:00'},
                'jumat': {'mulai': '09:00', 'selesai': '15:00'},
            }
        )
        
        # Pasien 1-5
        pasien_data = [
            {'username': 'pasien1', 'first_name': 'Andi', 'last_name': 'Wijaya', 'tanggal_lahir': date(1990, 5, 15), 'golongan_darah': 'A+', 'phone': '081111111111'},
            {'username': 'pasien2', 'first_name': 'Rina', 'last_name': 'Susanti', 'tanggal_lahir': date(1985, 8, 22), 'golongan_darah': 'B+', 'phone': '081222222222'},
            {'username': 'pasien3', 'first_name': 'Dedi', 'last_name': 'Prasetyo', 'tanggal_lahir': date(1995, 3, 10), 'golongan_darah': 'O+', 'phone': '081333333333'},
            {'username': 'pasien4', 'first_name': 'Maya', 'last_name': 'Dewi', 'tanggal_lahir': date(2000, 12, 5), 'golongan_darah': 'AB+', 'phone': '081444444444'},
            {'username': 'pasien5', 'first_name': 'Rudi', 'last_name': 'Hartono', 'tanggal_lahir': date(1978, 7, 30), 'golongan_darah': 'A-', 'phone': '081555555555'},
        ]
        
        pasien_list = []
        for i, data in enumerate(pasien_data, 1):
            user = CustomUser.objects.create_user(
                username=data['username'],
                email=f"{data['username']}@gmail.com",
                password='pasien123',
                first_name=data['first_name'],
                last_name=data['last_name'],
                role='pasien',
                phone=data['phone'],
                address=f"Jl. Pasien No. {i}, Jakarta"
            )
            pasien = Pasien.objects.create(
                user=user,
                tanggal_lahir=data['tanggal_lahir'],
                golongan_darah=data['golongan_darah'],
                alergi='Tidak ada' if i % 2 == 0 else 'Amoxicillin',
                kontak_darurat=f"08{i}999999999"
            )
            pasien_list.append(pasien)
        
        # Resepsionis
        resepsionis_user = CustomUser.objects.create_user(
            username='resepsionis1',
            email='resepsionis@kliniksehat.com',
            password='resepsionis123',
            first_name='Dewi',
            last_name='Lestari',
            role='resepsionis',
            phone='081666666666',
            address='Jl. Staff No. 1, Jakarta'
        )
        Resepsionis.objects.create(
            user=resepsionis_user,
            shift='pagi',
            tanggal_mulai_kerja=date(2023, 1, 15)
        )
        
        # Apoteker
        apoteker_user = CustomUser.objects.create_user(
            username='apoteker1',
            email='apoteker@kliniksehat.com',
            password='apoteker123',
            first_name='Eko',
            last_name='Prasetyo',
            role='apoteker',
            phone='081777777777',
            address='Jl. Staff No. 2, Jakarta'
        )
        apoteker = Apoteker.objects.create(
            user=apoteker_user,
            no_sipa='SIPA-2024-001',
            tanggal_mulai_kerja=date(2022, 6, 1)
        )
        
        # Kasir
        kasir_user = CustomUser.objects.create_user(
            username='kasir1',
            email='kasir@kliniksehat.com',
            password='kasir123',
            first_name='Fitri',
            last_name='Handayani',
            role='kasir',
            phone='081888888888',
            address='Jl. Staff No. 3, Jakarta'
        )
        kasir = Kasir.objects.create(
            user=kasir_user,
            tanggal_mulai_kerja=date(2023, 3, 1)
        )
        
        # ========== LAYANAN TINDAKAN ==========
        self.stdout.write('💉 Membuat layanan tindakan...')
        
        layanan_data = [
            {'nama': 'Pemeriksaan Umum', 'biaya': 50000, 'kategori': 'pemeriksaan'},
            {'nama': 'Pemeriksaan Gigi', 'biaya': 75000, 'kategori': 'pemeriksaan'},
            {'nama': 'Cabut Gigi', 'biaya': 200000, 'kategori': 'tindakan'},
            {'nama': 'Tambal Gigi', 'biaya': 150000, 'kategori': 'tindakan'},
            {'nama': 'Scaling Gigi', 'biaya': 300000, 'kategori': 'tindakan'},
            {'nama': 'Rontgen Gigi', 'biaya': 100000, 'kategori': 'radiologi'},
            {'nama': 'Tes Darah Lengkap', 'biaya': 250000, 'kategori': 'laboratorium'},
            {'nama': 'Tes Urine', 'biaya': 75000, 'kategori': 'laboratorium'},
            {'nama': 'Injeksi Vitamin', 'biaya': 100000, 'kategori': 'tindakan'},
            {'nama': 'Nebulizer', 'biaya': 80000, 'kategori': 'tindakan'},
        ]
        
        layanan_list = []
        for data in layanan_data:
            layanan = LayananTindakan.objects.create(
                nama_tindakan=data['nama'],
                biaya=Decimal(str(data['biaya'])),
                kategori=data['kategori']
            )
            layanan_list.append(layanan)
        
        # ========== OBAT ==========
        self.stdout.write('💊 Membuat obat...')
        
        obat_data = [
            {'nama': 'Paracetamol 500mg', 'kategori': 'tablet', 'stok': 100, 'harga_jual': 2500, 'harga_beli': 1500, 'supplier': 'PT Kimia Farma'},
            {'nama': 'Amoxicillin 500mg', 'kategori': 'kapsul', 'stok': 50, 'harga_jual': 5000, 'harga_beli': 3000, 'supplier': 'PT Sanbe Farma'},
            {'nama': 'Vitamin C 1000mg', 'kategori': 'tablet', 'stok': 200, 'harga_jual': 3000, 'harga_beli': 2000, 'supplier': 'PT Kalbe Farma'},
            {'nama': 'Ibuprofen 400mg', 'kategori': 'tablet', 'stok': 75, 'harga_jual': 3500, 'harga_beli': 2200, 'supplier': 'PT Dexa Medica'},
            {'nama': 'Omeprazole 20mg', 'kategori': 'kapsul', 'stok': 60, 'harga_jual': 8000, 'harga_beli': 5500, 'supplier': 'PT Novell Pharma'},
            {'nama': 'Cetirizine 10mg', 'kategori': 'tablet', 'stok': 8, 'harga_jual': 4000, 'harga_beli': 2500, 'supplier': 'PT Kimia Farma'},
            {'nama': 'Salbutamol Sirup', 'kategori': 'sirup', 'stok': 30, 'harga_jual': 25000, 'harga_beli': 18000, 'supplier': 'PT Sanbe Farma'},
            {'nama': 'Betadine 30ml', 'kategori': 'lainnya', 'stok': 5, 'harga_jual': 20000, 'harga_beli': 15000, 'supplier': 'PT Mahakam Beta'},
            {'nama': 'Antasida Sirup', 'kategori': 'sirup', 'stok': 40, 'harga_jual': 18000, 'harga_beli': 12000, 'supplier': 'PT Kalbe Farma'},
            {'nama': 'Dexamethasone 0.5mg', 'kategori': 'tablet', 'stok': 3, 'harga_jual': 2000, 'harga_beli': 1200, 'supplier': 'PT Dexa Medica'},
        ]
        
        obat_list = []
        for data in obat_data:
            obat = Obat.objects.create(
                nama=data['nama'],
                kategori=data['kategori'],
                stok=data['stok'],
                satuan='tablet' if data['kategori'] in ['tablet', 'kapsul'] else 'botol',
                harga_jual=Decimal(str(data['harga_jual'])),
                harga_beli=Decimal(str(data['harga_beli'])),
                expired_date=date.today() + timedelta(days=365),
                supplier=data['supplier']
            )
            obat_list.append(obat)
        
        # ========== JANJI TEMU ==========
        self.stdout.write('📅 Membuat janji temu...')
        
        today = timezone.now().date()
        
        # Janji 1 - Pending (hari ini)
        janji1 = JanjiTemu.objects.create(
            pasien=pasien_list[0],
            dokter=dokter1,
            tanggal=today,
            waktu=time(9, 0),
            keluhan='Demam dan batuk sudah 3 hari',
            status='pending'
        )
        
        # Janji 2 - Confirmed (hari ini)
        janji2 = JanjiTemu.objects.create(
            pasien=pasien_list[1],
            dokter=dokter1,
            tanggal=today,
            waktu=time(10, 0),
            keluhan='Sakit kepala berulang',
            status='confirmed'
        )
        
        # Janji 3 - Completed (kemarin) - dengan rekam medis
        janji3 = JanjiTemu.objects.create(
            pasien=pasien_list[2],
            dokter=dokter1,
            tanggal=today - timedelta(days=1),
            waktu=time(11, 0),
            keluhan='Nyeri perut bagian kanan',
            status='completed'
        )
        
        # Janji 4 - Pending (besok) untuk dokter gigi
        janji4 = JanjiTemu.objects.create(
            pasien=pasien_list[3],
            dokter=dokter2,
            tanggal=today + timedelta(days=1),
            waktu=time(14, 30),
            keluhan='Gigi berlubang terasa nyeri',
            status='pending'
        )
        
        # Janji 5 - Completed (2 hari lalu)
        janji5 = JanjiTemu.objects.create(
            pasien=pasien_list[4],
            dokter=dokter2,
            tanggal=today - timedelta(days=2),
            waktu=time(15, 0),
            keluhan='Kontrol setelah cabut gigi',
            status='completed'
        )
        
        # ========== REKAM MEDIS ==========
        self.stdout.write('📋 Membuat rekam medis...')
        
        # Rekam Medis untuk Janji 3
        rekam1 = RekamMedis.objects.create(
            pasien=pasien_list[2],
            dokter=dokter1,
            janji_temu=janji3,
            diagnosa='Gastritis akut',
            anamnesa='Pasien mengeluh nyeri perut bagian kanan atas sejak 2 hari lalu. Nyeri memberat setelah makan. Mual (+), muntah (-)',
            pemeriksaan_fisik='TD: 120/80 mmHg, Nadi: 80x/menit, Suhu: 36.5°C. Abdomen: nyeri tekan epigastrium (+)',
            catatan='Pasien disarankan untuk diet lunak dan hindari makanan pedas/asam'
        )
        rekam1.tindakan.add(layanan_list[0])  # Pemeriksaan Umum
        
        # Buat resep untuk rekam medis 1
        resep1 = Resep.objects.create(
            rekam_medis=rekam1,
            status='delivered',
            catatan_apoteker='Sudah diberikan',
            processed_by=apoteker,
            processed_at=timezone.now() - timedelta(days=1)
        )
        DetailResep.objects.create(resep=resep1, obat=obat_list[4], jumlah=10, aturan_pakai='2x1 sebelum makan', harga_satuan=obat_list[4].harga_jual)
        DetailResep.objects.create(resep=resep1, obat=obat_list[8], jumlah=1, aturan_pakai='3x1 sendok makan setelah makan', harga_satuan=obat_list[8].harga_jual)
        
        # Pembayaran untuk Janji 3 (Lunas)
        pembayaran1 = Pembayaran.objects.create(
            janji_temu=janji3,
            metode='tunai',
            status='lunas',
            tanggal_bayar=timezone.now() - timedelta(days=1),
            processed_by=kasir
        )
        pembayaran1.calculate_total()
        pembayaran1.save()
        
        # Rekam Medis untuk Janji 5
        rekam2 = RekamMedis.objects.create(
            pasien=pasien_list[4],
            dokter=dokter2,
            janji_temu=janji5,
            diagnosa='Post ekstraksi gigi molar 1 kanan bawah - penyembuhan baik',
            anamnesa='Kontrol setelah cabut gigi 1 minggu lalu. Tidak ada nyeri, tidak ada bengkak.',
            pemeriksaan_fisik='Luka bekas ekstraksi menutup dengan baik, tidak ada tanda infeksi',
            catatan='Sudah boleh makan normal, tetap jaga kebersihan mulut'
        )
        rekam2.tindakan.add(layanan_list[1])  # Pemeriksaan Gigi
        
        # Buat resep untuk rekam medis 2
        resep2 = Resep.objects.create(
            rekam_medis=rekam2,
            status='pending',
            catatan_apoteker=''
        )
        DetailResep.objects.create(resep=resep2, obat=obat_list[0], jumlah=10, aturan_pakai='3x1 setelah makan bila nyeri', harga_satuan=obat_list[0].harga_jual)
        
        # Pembayaran untuk Janji 5 (Pending)
        pembayaran2 = Pembayaran.objects.create(
            janji_temu=janji5,
            metode='transfer',
            status='pending'
        )
        pembayaran2.calculate_total()
        pembayaran2.save()
        
        # ========== SUMMARY ==========
        self.stdout.write(self.style.SUCCESS('\n✅ Seeding berhasil!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'👤 Users: {CustomUser.objects.count()}')
        self.stdout.write(f'   - Admin: admin / admin123')
        self.stdout.write(f'   - Dokter: dr.ahmad, dr.siti, dr.budi / dokter123')
        self.stdout.write(f'   - Pasien: pasien1-5 / pasien123')
        self.stdout.write(f'   - Resepsionis: resepsionis1 / resepsionis123')
        self.stdout.write(f'   - Apoteker: apoteker1 / apoteker123')
        self.stdout.write(f'   - Kasir: kasir1 / kasir123')
        self.stdout.write(f'🩺 Dokter: {Dokter.objects.count()}')
        self.stdout.write(f'🧑‍⚕️ Pasien: {Pasien.objects.count()}')
        self.stdout.write(f'💊 Obat: {Obat.objects.count()}')
        self.stdout.write(f'💉 Layanan: {LayananTindakan.objects.count()}')
        self.stdout.write(f'📅 Janji Temu: {JanjiTemu.objects.count()}')
        self.stdout.write(f'📋 Rekam Medis: {RekamMedis.objects.count()}')
        self.stdout.write(f'📝 Resep: {Resep.objects.count()}')
        self.stdout.write(f'💳 Pembayaran: {Pembayaran.objects.count()}')
        self.stdout.write('=' * 50)
