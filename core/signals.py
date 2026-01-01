"""
Django Signals untuk Auto-Calculation dan Audit Trail
"""
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import (
    RekamMedis, DetailResep, Pembayaran, JanjiTemu, 
    Resep, AuditLog, Notifikasi, Obat
)


# ============================================
# PHASE 1: AUTO-CALCULATE PEMBAYARAN
# ============================================

@receiver(post_save, sender=RekamMedis)
def update_pembayaran_on_rekam_medis(sender, instance, created, **kwargs):
    """Update pembayaran saat rekam medis dibuat/diupdate"""
    try:
        if instance.janji_temu and hasattr(instance.janji_temu, 'pembayaran'):
            pembayaran = instance.janji_temu.pembayaran
            pembayaran.calculate_total()
            pembayaran.save()
    except Pembayaran.DoesNotExist:
        pass


@receiver(post_save, sender=DetailResep)
def update_pembayaran_on_detail_resep(sender, instance, created, **kwargs):
    """Update pembayaran saat detail resep ditambah/diupdate"""
    try:
        pembayaran = instance.resep.rekam_medis.janji_temu.pembayaran
        pembayaran.calculate_total()
        pembayaran.save()
    except (Pembayaran.DoesNotExist, AttributeError):
        pass


@receiver(post_delete, sender=DetailResep)
def update_pembayaran_on_detail_resep_delete(sender, instance, **kwargs):
    """Update pembayaran saat detail resep dihapus"""
    try:
        pembayaran = instance.resep.rekam_medis.janji_temu.pembayaran
        pembayaran.calculate_total()
        pembayaran.save()
    except (Pembayaran.DoesNotExist, AttributeError):
        pass


# ============================================
# PHASE 1: AUTO-REDUCE STOK OBAT
# ============================================

@receiver(post_save, sender=Resep)
def reduce_stok_on_resep_delivered(sender, instance, created, **kwargs):
    """Kurangi stok obat saat resep status delivered"""
    if not created and instance.status == 'delivered':
        for detail in instance.detail_resep.all():
            obat = detail.obat
            obat.stok -= detail.jumlah
            obat.save()


# ============================================
# PHASE 2: AUDIT TRAIL
# ============================================

def get_client_ip(request):
    """Get client IP from request"""
    if hasattr(request, 'META'):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    return None


def log_audit(user, action, model_name, object_id, object_str, changes=None, request=None):
    """Log audit trail"""
    ip_address = None
    user_agent = ''
    
    if request:
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '') if hasattr(request, 'META') else ''
    
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        object_str=object_str,
        changes=changes or {},
        ip_address=ip_address,
        user_agent=user_agent
    )


@receiver(post_save, sender=RekamMedis)
def audit_rekam_medis(sender, instance, created, **kwargs):
    """Audit log untuk rekam medis"""
    action = 'create' if created else 'update'
    log_audit(
        user=instance.dokter.user,
        action=action,
        model_name='RekamMedis',
        object_id=instance.id,
        object_str=str(instance),
        changes={
            'diagnosa': instance.diagnosa,
            'anamnesa': instance.anamnesa,
        }
    )


@receiver(post_save, sender=Pembayaran)
def audit_pembayaran(sender, instance, created, **kwargs):
    """Audit log untuk pembayaran"""
    action = 'create' if created else 'update'
    log_audit(
        user=instance.processed_by.user if instance.processed_by else None,
        action=action,
        model_name='Pembayaran',
        object_id=instance.id,
        object_str=str(instance),
        changes={
            'status': instance.status,
            'total_biaya': str(instance.total_biaya),
        }
    )


# ============================================
# PHASE 2: NOTIFIKASI SYSTEM
# ============================================

def send_notification(user, tipe, judul, pesan, data=None):
    """Send notification to user"""
    Notifikasi.objects.create(
        user=user,
        tipe=tipe,
        judul=judul,
        pesan=pesan,
        data=data or {}
    )


@receiver(post_save, sender=JanjiTemu)
def notify_janji_temu(sender, instance, created, **kwargs):
    """Notify pasien saat janji temu dikonfirmasi"""
    if not created and instance.status == 'confirmed':
        send_notification(
            user=instance.pasien.user,
            tipe='janji_temu',
            judul='Janji Temu Dikonfirmasi',
            pesan=f'Janji temu Anda dengan Dr. {instance.dokter.user.get_full_name()} '
                  f'pada {instance.tanggal} pukul {instance.waktu} telah dikonfirmasi. '
                  f'Nomor antrian: {instance.nomor_antrian}',
            data={'janji_temu_id': instance.id}
        )


@receiver(post_save, sender=Resep)
def notify_resep_ready(sender, instance, created, **kwargs):
    """Notify pasien saat resep siap diambil"""
    if not created and instance.status == 'delivered':
        send_notification(
            user=instance.rekam_medis.pasien.user,
            tipe='resep',
            judul='Resep Siap Diambil',
            pesan=f'Resep Anda sudah siap dan dapat diambil di apotek.',
            data={'resep_id': instance.id}
        )


@receiver(post_save, sender=Pembayaran)
def notify_pembayaran_lunas(sender, instance, created, **kwargs):
    """Notify pasien saat pembayaran lunas"""
    if not created and instance.status == 'lunas':
        send_notification(
            user=instance.janji_temu.pasien.user,
            tipe='pembayaran',
            judul='Pembayaran Berhasil',
            pesan=f'Pembayaran Anda sebesar Rp {instance.total_biaya:,.0f} telah berhasil. '
                  f'Invoice: {instance.invoice_number}',
            data={'pembayaran_id': instance.id}
        )


@receiver(post_save, sender=Obat)
def notify_stok_menipis(sender, instance, created, **kwargs):
    """Notify apoteker saat stok menipis"""
    if not created and instance.stok < 10 and instance.stok > 0:
        # Notify semua apoteker
        from .models import Apoteker
        apotekers = Apoteker.objects.all()
        for apoteker in apotekers:
            send_notification(
                user=apoteker.user,
                tipe='stok',
                judul='Stok Obat Menipis',
                pesan=f'Stok {instance.nama} tinggal {instance.stok} {instance.satuan}. '
                      f'Segera lakukan pemesanan.',
                data={'obat_id': instance.id}
            )
