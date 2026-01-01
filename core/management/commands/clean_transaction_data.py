"""
Management command untuk membersihkan data transaksi
Tetap pertahankan data master (users, dokter, pasien, obat, layanan)
"""
from django.core.management.base import BaseCommand
from core.models import (
    JanjiTemu, RekamMedis, Resep, DetailResep, Pembayaran,
    AuditLog, StokAdjustment, Notifikasi, Cicilan, 
    PaymentTransaction, InvoiceQRCode
)


class Command(BaseCommand):
    help = 'Bersihkan semua data transaksi, pertahankan data master'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Membersihkan data transaksi...'))
        
        # Count before delete
        janji_count = JanjiTemu.objects.count()
        rekam_count = RekamMedis.objects.count()
        resep_count = Resep.objects.count()
        detail_resep_count = DetailResep.objects.count()
        pembayaran_count = Pembayaran.objects.count()
        audit_count = AuditLog.objects.count()
        stok_adj_count = StokAdjustment.objects.count()
        notif_count = Notifikasi.objects.count()
        cicilan_count = Cicilan.objects.count()
        payment_trx_count = PaymentTransaction.objects.count()
        qr_count = InvoiceQRCode.objects.count()
        
        # Delete transaction data (order matters due to foreign keys)
        InvoiceQRCode.objects.all().delete()
        PaymentTransaction.objects.all().delete()
        Cicilan.objects.all().delete()
        Notifikasi.objects.all().delete()
        StokAdjustment.objects.all().delete()
        AuditLog.objects.all().delete()
        DetailResep.objects.all().delete()
        Resep.objects.all().delete()
        Pembayaran.objects.all().delete()
        RekamMedis.objects.all().delete()
        JanjiTemu.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('✅ Data transaksi berhasil dibersihkan!'))
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Dihapus:'))
        self.stdout.write(f'  - {janji_count} Janji Temu')
        self.stdout.write(f'  - {rekam_count} Rekam Medis')
        self.stdout.write(f'  - {resep_count} Resep')
        self.stdout.write(f'  - {detail_resep_count} Detail Resep')
        self.stdout.write(f'  - {pembayaran_count} Pembayaran')
        self.stdout.write(f'  - {audit_count} Audit Log')
        self.stdout.write(f'  - {stok_adj_count} Stok Adjustment')
        self.stdout.write(f'  - {notif_count} Notifikasi')
        self.stdout.write(f'  - {cicilan_count} Cicilan')
        self.stdout.write(f'  - {payment_trx_count} Payment Transaction')
        self.stdout.write(f'  - {qr_count} Invoice QR Code')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ Data master tetap aman:'))
        self.stdout.write('  - Users (admin, dokter, pasien, dll)')
        self.stdout.write('  - Dokter profiles')
        self.stdout.write('  - Pasien profiles')
        self.stdout.write('  - Obat')
        self.stdout.write('  - Layanan Tindakan')
        self.stdout.write('  - Payment Gateway')
