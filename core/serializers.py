from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    CustomUser, Dokter, Pasien, Resepsionis, Apoteker, Kasir,
    LayananTindakan, JanjiTemu, RekamMedis, Obat, Resep, DetailResep, Pembayaran
)


# ==================== USER SERIALIZERS ====================

class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer untuk CustomUser"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 
                  'role', 'phone', 'address', 'foto_profile', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class CustomUserAdminSerializer(serializers.ModelSerializer):
    """Serializer untuk CustomUser (Admin view - with password info)"""
    full_name = serializers.SerializerMethodField()
    password_hint = serializers.SerializerMethodField()
    profile_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 
                  'role', 'phone', 'address', 'foto_profile', 'is_active', 'date_joined',
                  'password_hint', 'profile_detail']
        read_only_fields = ['id', 'date_joined', 'password_hint', 'profile_detail']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username
    
    def get_password_hint(self, obj):
        """Show password hint for admin"""
        # Hanya tampilkan jika request dari admin
        request = self.context.get('request')
        if request and request.user.role == 'admin':
            return obj.password_hint if obj.password_hint else "Password tidak tersimpan (gunakan reset_password)"
        return None
    
    def get_profile_detail(self, obj):
        """Include profile detail with biaya_konsultasi for dokter"""
        if obj.role == 'dokter' and hasattr(obj, 'dokter_profile'):
            return {
                'id': obj.dokter_profile.id,
                'spesialisasi': obj.dokter_profile.spesialisasi,
                'spesialisasi_display': obj.dokter_profile.get_spesialisasi_display(),
                'no_str': obj.dokter_profile.no_str,
                'biaya_konsultasi': float(obj.dokter_profile.biaya_konsultasi),
                'status_aktif': obj.dokter_profile.status_aktif,
            }
        elif obj.role == 'pasien' and hasattr(obj, 'pasien_profile'):
            return {
                'id': obj.pasien_profile.id,
                'no_rm': obj.pasien_profile.no_rm,
                'tanggal_lahir': obj.pasien_profile.tanggal_lahir,
                'golongan_darah': obj.pasien_profile.golongan_darah,
            }
        elif obj.role == 'resepsionis' and hasattr(obj, 'resepsionis_profile'):
            return {
                'id': obj.resepsionis_profile.id,
                'shift': obj.resepsionis_profile.shift,
                'shift_display': obj.resepsionis_profile.get_shift_display(),
            }
        elif obj.role == 'apoteker' and hasattr(obj, 'apoteker_profile'):
            return {
                'id': obj.apoteker_profile.id,
                'no_sipa': obj.apoteker_profile.no_sipa,
            }
        elif obj.role == 'kasir' and hasattr(obj, 'kasir_profile'):
            return {
                'id': obj.kasir_profile.id,
            }
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer untuk registrasi pasien baru"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    tanggal_lahir = serializers.DateField(required=False)
    golongan_darah = serializers.CharField(required=False, allow_blank=True)
    alergi = serializers.CharField(required=False, allow_blank=True)
    kontak_darurat = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name',
                  'phone', 'address', 'tanggal_lahir', 'golongan_darah', 'alergi', 'kontak_darurat']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Password tidak cocok'})
        return attrs
    
    def create(self, validated_data):
        # Extract pasien fields
        tanggal_lahir = validated_data.pop('tanggal_lahir', None)
        golongan_darah = validated_data.pop('golongan_darah', None)
        alergi = validated_data.pop('alergi', None)
        kontak_darurat = validated_data.pop('kontak_darurat', None)
        validated_data.pop('password2')
        
        # Create user with role pasien
        user = CustomUser.objects.create_user(
            role='pasien',
            **validated_data
        )
        
        # Create pasien profile
        Pasien.objects.create(
            user=user,
            tanggal_lahir=tanggal_lahir,
            golongan_darah=golongan_darah,
            alergi=alergi,
            kontak_darurat=kontak_darurat
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer untuk login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Username atau password salah')
        if not user.is_active:
            raise serializers.ValidationError('Akun tidak aktif')
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer untuk profile user lengkap"""
    profile_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'phone', 'address', 'foto_profile', 'profile_detail']
    
    def get_profile_detail(self, obj):
        if obj.role == 'dokter' and hasattr(obj, 'dokter_profile'):
            return DokterSerializer(obj.dokter_profile).data
        elif obj.role == 'pasien' and hasattr(obj, 'pasien_profile'):
            return PasienSerializer(obj.pasien_profile).data
        elif obj.role == 'resepsionis' and hasattr(obj, 'resepsionis_profile'):
            return ResepsionisSerializer(obj.resepsionis_profile).data
        elif obj.role == 'apoteker' and hasattr(obj, 'apoteker_profile'):
            return ApotekerSerializer(obj.apoteker_profile).data
        elif obj.role == 'kasir' and hasattr(obj, 'kasir_profile'):
            return KasirSerializer(obj.kasir_profile).data
        return None


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer untuk admin membuat user baru"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    # Dokter fields
    spesialisasi = serializers.CharField(required=False)
    no_str = serializers.CharField(required=False)
    biaya_konsultasi = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    
    # Pasien fields
    tanggal_lahir = serializers.DateField(required=False)
    golongan_darah = serializers.CharField(required=False, allow_blank=True)
    alergi = serializers.CharField(required=False, allow_blank=True)
    kontak_darurat = serializers.CharField(required=False, allow_blank=True)
    
    # Resepsionis fields
    shift = serializers.CharField(required=False)
    
    # Apoteker fields
    no_sipa = serializers.CharField(required=False)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role',
                  'phone', 'address', 'spesialisasi', 'no_str', 'biaya_konsultasi',
                  'tanggal_lahir', 'golongan_darah', 'alergi', 'kontak_darurat',
                  'shift', 'no_sipa']
    
    def create(self, validated_data):
        # Extract role-specific fields
        role = validated_data.get('role')
        
        # Dokter fields
        spesialisasi = validated_data.pop('spesialisasi', None)
        no_str = validated_data.pop('no_str', None)
        biaya_konsultasi = validated_data.pop('biaya_konsultasi', 100000)
        
        # Pasien fields
        tanggal_lahir = validated_data.pop('tanggal_lahir', None)
        golongan_darah = validated_data.pop('golongan_darah', None)
        alergi = validated_data.pop('alergi', None)
        kontak_darurat = validated_data.pop('kontak_darurat', None)
        
        # Resepsionis fields
        shift = validated_data.pop('shift', 'pagi')
        
        # Apoteker fields
        no_sipa = validated_data.pop('no_sipa', None)
        
        # Save plain password to password_hint before hashing
        plain_password = validated_data.get('password')
        
        # Create user
        user = CustomUser.objects.create_user(**validated_data)
        
        # Save password hint for admin
        user.password_hint = plain_password
        user.save()
        
        # Create role-specific profile
        if role == 'dokter':
            Dokter.objects.create(
                user=user,
                spesialisasi=spesialisasi or 'umum',
                no_str=no_str or f'STR-{user.pk}',
                biaya_konsultasi=biaya_konsultasi
            )
        elif role == 'pasien':
            Pasien.objects.create(
                user=user,
                tanggal_lahir=tanggal_lahir,
                golongan_darah=golongan_darah,
                alergi=alergi,
                kontak_darurat=kontak_darurat
            )
        elif role == 'resepsionis':
            Resepsionis.objects.create(user=user, shift=shift)
        elif role == 'apoteker':
            Apoteker.objects.create(user=user, no_sipa=no_sipa or f'SIPA-{user.pk}')
        elif role == 'kasir':
            Kasir.objects.create(user=user)
        
        return user


# ==================== PROFILE SERIALIZERS ====================

class DokterSerializer(serializers.ModelSerializer):
    """Serializer untuk Dokter"""
    user = CustomUserSerializer(read_only=True)
    spesialisasi_display = serializers.CharField(source='get_spesialisasi_display', read_only=True)
    
    class Meta:
        model = Dokter
        fields = ['id', 'user', 'spesialisasi', 'spesialisasi_display', 'no_str', 
                  'jadwal_praktik', 'biaya_konsultasi', 'status_aktif', 'created_at']


class DokterPublicSerializer(serializers.ModelSerializer):
    """Serializer untuk Dokter (public view)"""
    nama = serializers.SerializerMethodField()
    foto = serializers.SerializerMethodField()
    spesialisasi_display = serializers.CharField(source='get_spesialisasi_display', read_only=True)
    
    class Meta:
        model = Dokter
        fields = ['id', 'nama', 'foto', 'spesialisasi', 'spesialisasi_display', 
                  'jadwal_praktik', 'biaya_konsultasi', 'status_aktif']
    
    def get_nama(self, obj):
        return f"Dr. {obj.user.get_full_name()}"
    
    def get_foto(self, obj):
        if obj.user.foto_profile:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.foto_profile.url)
        return None


class PasienSerializer(serializers.ModelSerializer):
    """Serializer untuk Pasien"""
    user = CustomUserSerializer(read_only=True)
    golongan_darah_display = serializers.CharField(source='get_golongan_darah_display', read_only=True)
    
    class Meta:
        model = Pasien
        fields = ['id', 'user', 'no_rm', 'tanggal_lahir', 'golongan_darah', 
                  'golongan_darah_display', 'alergi', 'kontak_darurat', 'created_at']
        read_only_fields = ['no_rm']


class ResepsionisSerializer(serializers.ModelSerializer):
    """Serializer untuk Resepsionis"""
    user = CustomUserSerializer(read_only=True)
    shift_display = serializers.CharField(source='get_shift_display', read_only=True)
    
    class Meta:
        model = Resepsionis
        fields = ['id', 'user', 'shift', 'shift_display', 'tanggal_mulai_kerja', 'created_at']


class ApotekerSerializer(serializers.ModelSerializer):
    """Serializer untuk Apoteker"""
    user = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = Apoteker
        fields = ['id', 'user', 'no_sipa', 'tanggal_mulai_kerja', 'created_at']


class KasirSerializer(serializers.ModelSerializer):
    """Serializer untuk Kasir"""
    user = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = Kasir
        fields = ['id', 'user', 'tanggal_mulai_kerja', 'created_at']


# ==================== LAYANAN TINDAKAN SERIALIZERS ====================

class LayananTindakanSerializer(serializers.ModelSerializer):
    """Serializer untuk Layanan Tindakan"""
    kategori_display = serializers.CharField(source='get_kategori_display', read_only=True)
    
    class Meta:
        model = LayananTindakan
        fields = ['id', 'nama_tindakan', 'biaya', 'kategori', 'kategori_display', 
                  'deskripsi', 'is_active', 'created_at']


# ==================== OBAT SERIALIZERS ====================

class ObatSerializer(serializers.ModelSerializer):
    """Serializer untuk Obat"""
    kategori_display = serializers.CharField(source='get_kategori_display', read_only=True)
    satuan_display = serializers.CharField(source='get_satuan_display', read_only=True)
    status_stok = serializers.ReadOnlyField()
    
    class Meta:
        model = Obat
        fields = ['id', 'nama', 'kategori', 'kategori_display', 'stok', 'satuan', 
                  'satuan_display', 'harga_jual', 'harga_beli', 'expired_date', 
                  'supplier', 'deskripsi', 'is_active', 'status_stok', 'created_at']


# ==================== JANJI TEMU SERIALIZERS ====================

class JanjiTemuSerializer(serializers.ModelSerializer):
    """Serializer untuk Janji Temu"""
    pasien = PasienSerializer(read_only=True)
    dokter = DokterPublicSerializer(read_only=True)
    pasien_id = serializers.PrimaryKeyRelatedField(
        queryset=Pasien.objects.all(), source='pasien', write_only=True
    )
    dokter_id = serializers.PrimaryKeyRelatedField(
        queryset=Dokter.objects.all(), source='dokter', write_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    has_rekam_medis = serializers.SerializerMethodField()
    has_pembayaran = serializers.SerializerMethodField()
    
    class Meta:
        model = JanjiTemu
        fields = ['id', 'pasien', 'pasien_id', 'dokter', 'dokter_id', 'tanggal', 
                  'waktu', 'keluhan', 'status', 'status_display', 'nomor_antrian', 
                  'catatan', 'has_rekam_medis', 'has_pembayaran', 'created_at']
        read_only_fields = ['nomor_antrian']
    
    def get_has_rekam_medis(self, obj):
        return hasattr(obj, 'rekam_medis')
    
    def get_has_pembayaran(self, obj):
        return hasattr(obj, 'pembayaran')


class JanjiTemuBookingSerializer(serializers.ModelSerializer):
    """Serializer untuk booking janji temu (pasien)"""
    dokter_id = serializers.PrimaryKeyRelatedField(
        queryset=Dokter.objects.filter(status_aktif=True), source='dokter'
    )
    
    class Meta:
        model = JanjiTemu
        fields = ['dokter_id', 'tanggal', 'waktu', 'keluhan']
    
    def validate(self, data):
        dokter = data.get('dokter')
        tanggal = data.get('tanggal')
        waktu = data.get('waktu')
        
        if not dokter or not tanggal or not waktu:
            return data
            
        # Get day of week in Indonesian
        days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
        day_name = days[tanggal.weekday()]
        
        jadwal = dokter.jadwal_praktik or {}
        if day_name not in jadwal:
            raise serializers.ValidationError(
                f"Dokter {dokter.user.get_full_name()} tidak praktik pada hari {day_name.capitalize()}."
            )
            
        shift = jadwal[day_name]
        mulai = shift.get('mulai')
        selesai = shift.get('selesai')
        
        if mulai and selesai:
            waktu_str = waktu.strftime('%H:%M')
            if waktu_str < mulai or waktu_str > selesai:
                raise serializers.ValidationError(
                    f"Jam praktik Dokter {dokter.user.get_full_name()} pada hari {day_name.capitalize()} adalah {mulai} - {selesai}."
                )
                
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        
        # Manual Role Check
        if not hasattr(request.user, 'pasien_profile'):
            raise serializers.ValidationError("Akun ini tidak terdaftar sebagai Pasien. Silakan login sebagai Pasien.")
            
        pasien = request.user.pasien_profile
        validated_data['pasien'] = pasien
        
        # Check if already booked same doctor same date (Optional but good)
        existing = JanjiTemu.objects.filter(
            pasien=pasien, 
            dokter=validated_data['dokter'],
            tanggal=validated_data['tanggal']
        ).exists()
        
        if existing:
             raise serializers.ValidationError("Anda sudah memiliki janji dengan dokter ini di tanggal tersebut.")

        return super().create(validated_data)


# ==================== REKAM MEDIS SERIALIZERS ====================

class RekamMedisSerializer(serializers.ModelSerializer):
    """Serializer untuk Rekam Medis"""
    pasien = PasienSerializer(read_only=True)
    dokter = DokterPublicSerializer(read_only=True)
    janji_temu = JanjiTemuSerializer(read_only=True)
    tindakan = LayananTindakanSerializer(many=True, read_only=True)
    tindakan_ids = serializers.PrimaryKeyRelatedField(
        queryset=LayananTindakan.objects.all(), many=True, source='tindakan', write_only=True, required=False
    )
    resep_list = serializers.SerializerMethodField()
    
    class Meta:
        model = RekamMedis
        fields = ['id', 'pasien', 'dokter', 'janji_temu', 'diagnosa', 'anamnesa',
                  'pemeriksaan_fisik', 'tindakan', 'tindakan_ids', 'catatan', 
                  'resep_list', 'tanggal_periksa', 'created_at']
    
    def get_resep_list(self, obj):
        return ResepSerializer(obj.resep.all(), many=True).data


class RekamMedisCreateSerializer(serializers.ModelSerializer):
    """Serializer untuk create Rekam Medis (dokter)"""
    janji_temu_id = serializers.PrimaryKeyRelatedField(
        queryset=JanjiTemu.objects.filter(status='confirmed'), source='janji_temu'
    )
    tindakan_ids = serializers.PrimaryKeyRelatedField(
        queryset=LayananTindakan.objects.all(), many=True, source='tindakan', required=False
    )
    obat_list = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)
    
    class Meta:
        model = RekamMedis
        fields = ['janji_temu_id', 'diagnosa', 'anamnesa', 'pemeriksaan_fisik', 
                  'tindakan_ids', 'catatan', 'obat_list']
    
    def create(self, validated_data):
        obat_list = validated_data.pop('obat_list', [])
        tindakan = validated_data.pop('tindakan', [])
        
        request = self.context.get('request')
        dokter = request.user.dokter_profile
        janji_temu = validated_data['janji_temu']
        
        # Create rekam medis
        rekam_medis = RekamMedis.objects.create(
            dokter=dokter,
            pasien=janji_temu.pasien,
            **validated_data
        )
        
        # Add tindakan
        rekam_medis.tindakan.set(tindakan)
        
        # Create resep if obat_list provided
        if obat_list:
            resep = Resep.objects.create(rekam_medis=rekam_medis)
            for obat_data in obat_list:
                obat = Obat.objects.get(pk=obat_data['obat_id'])
                DetailResep.objects.create(
                    resep=resep,
                    obat=obat,
                    jumlah=obat_data.get('jumlah', 1),
                    aturan_pakai=obat_data.get('aturan_pakai', ''),
                    harga_satuan=obat.harga_jual
                )
        
        # Update janji temu status
        janji_temu.status = 'completed'
        janji_temu.save()
        
        # Create pembayaran
        pembayaran = Pembayaran.objects.create(janji_temu=janji_temu)
        pembayaran.calculate_total()
        pembayaran.save()
        
        return rekam_medis


# ==================== RESEP SERIALIZERS ====================

class DetailResepSerializer(serializers.ModelSerializer):
    """Serializer untuk Detail Resep"""
    obat = ObatSerializer(read_only=True)
    obat_id = serializers.PrimaryKeyRelatedField(
        queryset=Obat.objects.all(), source='obat', write_only=True
    )
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = DetailResep
        fields = ['id', 'obat', 'obat_id', 'jumlah', 'aturan_pakai', 'harga_satuan', 'subtotal']
    
    # PHASE 1: Validasi stok dan expired date
    def validate(self, data):
        obat = data.get('obat')
        jumlah = data.get('jumlah', 1)
        
        if not obat:
            return data
        
        # Check stok
        if jumlah > obat.stok:
            raise serializers.ValidationError({
                'jumlah': f'Stok {obat.nama} tidak cukup. Tersedia: {obat.stok} {obat.satuan}'
            })
        
        # Check expired
        from django.utils import timezone
        if obat.expired_date and obat.expired_date <= timezone.now().date():
            raise serializers.ValidationError({
                'obat': f'{obat.nama} sudah kadaluarsa pada {obat.expired_date}'
            })
        
        # Warning jika stok menipis (tidak error, hanya warning di response)
        if obat.stok < 10:
            # Bisa ditambahkan ke context atau response
            pass
        
        return data


class ResepSerializer(serializers.ModelSerializer):
    """Serializer untuk Resep"""
    detail_resep = DetailResepSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_harga = serializers.ReadOnlyField()
    pasien_nama = serializers.SerializerMethodField()
    dokter_nama = serializers.SerializerMethodField()
    
    class Meta:
        model = Resep
        fields = ['id', 'rekam_medis', 'tanggal_resep', 'status', 'status_display',
                  'catatan_apoteker', 'processed_by', 'processed_at', 'detail_resep',
                  'total_harga', 'pasien_nama', 'dokter_nama', 'created_at']
    
    def get_pasien_nama(self, obj):
        return obj.rekam_medis.pasien.user.get_full_name()
    
    def get_dokter_nama(self, obj):
        return f"Dr. {obj.rekam_medis.dokter.user.get_full_name()}"


class ResepProcessSerializer(serializers.ModelSerializer):
    """Serializer untuk proses resep (apoteker)"""
    class Meta:
        model = Resep
        fields = ['status', 'catatan_apoteker']
    
    def update(self, instance, validated_data):
        from django.utils import timezone
        
        request = self.context.get('request')
        instance.status = validated_data.get('status', instance.status)
        instance.catatan_apoteker = validated_data.get('catatan_apoteker', instance.catatan_apoteker)
        
        if instance.status == 'delivered':
            instance.processed_by = request.user.apoteker_profile
            instance.processed_at = timezone.now()
            
            # Kurangi stok obat
            for detail in instance.detail_resep.all():
                obat = detail.obat
                obat.stok -= detail.jumlah
                obat.save()
        
        instance.save()
        return instance


# ==================== PEMBAYARAN SERIALIZERS ====================

class PembayaranSerializer(serializers.ModelSerializer):
    """Serializer untuk Pembayaran"""
    janji_temu = JanjiTemuSerializer(read_only=True)
    metode_display = serializers.CharField(source='get_metode_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    processed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Pembayaran
        fields = ['id', 'janji_temu', 'metode', 'metode_display', 'total_biaya',
                  'biaya_konsultasi', 'biaya_obat', 'biaya_tindakan', 'tanggal_bayar',
                  'status', 'status_display', 'invoice_number', 'catatan', 
                  'processed_by', 'processed_by_name', 'created_at']
    
    def get_processed_by_name(self, obj):
        if obj.processed_by:
            return obj.processed_by.user.get_full_name()
        return None


class PembayaranProcessSerializer(serializers.ModelSerializer):
    """Serializer untuk proses pembayaran (kasir)"""
    class Meta:
        model = Pembayaran
        fields = ['metode', 'catatan']
    
    def update(self, instance, validated_data):
        from django.utils import timezone
        
        request = self.context.get('request')
        instance.metode = validated_data.get('metode', instance.metode)
        instance.catatan = validated_data.get('catatan', instance.catatan)
        instance.status = 'lunas'
        instance.tanggal_bayar = timezone.now()
        instance.processed_by = request.user.kasir_profile
        instance.save()
        return instance


# ==================== LAPORAN SERIALIZERS ====================

class LaporanOverviewSerializer(serializers.Serializer):
    """Serializer untuk laporan overview (admin)"""
    total_pasien = serializers.IntegerField()
    total_dokter = serializers.IntegerField()
    janji_hari_ini = serializers.IntegerField()
    revenue_bulan_ini = serializers.DecimalField(max_digits=15, decimal_places=2)
    pasien_baru_bulan_ini = serializers.IntegerField()
    pembayaran_pending = serializers.IntegerField()


class LaporanKeuanganSerializer(serializers.Serializer):
    """Serializer untuk laporan keuangan"""
    tanggal = serializers.DateField()
    total_transaksi = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    tunai = serializers.DecimalField(max_digits=15, decimal_places=2)
    transfer = serializers.DecimalField(max_digits=15, decimal_places=2)
    asuransi = serializers.DecimalField(max_digits=15, decimal_places=2)
    qris = serializers.DecimalField(max_digits=15, decimal_places=2)



# ==================== PHASE 2: AUDIT TRAIL SERIALIZERS ====================

from .models import AuditLog, StokAdjustment, Notifikasi, Cicilan, PaymentGateway, PaymentTransaction, InvoiceQRCode


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer untuk Audit Log"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_name', 'action', 'action_display', 'model_name',
                  'object_id', 'object_str', 'changes', 'ip_address', 'user_agent', 'timestamp']
        read_only_fields = ['timestamp']


# ==================== PHASE 2: STOK ADJUSTMENT SERIALIZERS ====================

class StokAdjustmentSerializer(serializers.ModelSerializer):
    """Serializer untuk Stok Adjustment"""
    obat_nama = serializers.CharField(source='obat.nama', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', 
        read_only=True
    )
    reason_display = serializers.CharField(
        source='get_reason_display', 
        read_only=True
    )
    
    class Meta:
        model = StokAdjustment
        fields = [
            'id', 'obat', 'obat_nama', 'jumlah', 'reason', 'reason_display',
            'catatan', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']


# ==================== PHASE 2: NOTIFIKASI SERIALIZERS ====================

class NotifikasiSerializer(serializers.ModelSerializer):
    """Serializer untuk Notifikasi"""
    tipe_display = serializers.CharField(source='get_tipe_display', read_only=True)
    
    class Meta:
        model = Notifikasi
        fields = ['id', 'user', 'tipe', 'tipe_display', 'judul', 'pesan', 
                  'data', 'is_read', 'created_at']
        read_only_fields = ['created_at']


# ==================== PHASE 3: CICILAN SERIALIZERS ====================

class CicilanSerializer(serializers.ModelSerializer):
    """Serializer untuk Cicilan"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Cicilan
        fields = ['id', 'pembayaran', 'nomor_cicilan', 'jumlah', 'tanggal_jatuh_tempo',
                  'tanggal_bayar', 'status', 'status_display', 'is_overdue', 'catatan',
                  'created_at']


class CicilanCreateSerializer(serializers.Serializer):
    """Serializer untuk create cicilan"""
    pembayaran_id = serializers.IntegerField()
    jumlah_cicilan = serializers.IntegerField(min_value=2, max_value=12)
    tanggal_mulai = serializers.DateField()
    
    def create(self, validated_data):
        from datetime import timedelta
        pembayaran = Pembayaran.objects.get(pk=validated_data['pembayaran_id'])
        jumlah_cicilan = validated_data['jumlah_cicilan']
        tanggal_mulai = validated_data['tanggal_mulai']
        
        # Calculate jumlah per cicilan
        jumlah_per_cicilan = pembayaran.total_biaya / jumlah_cicilan
        
        # Create cicilan
        cicilan_list = []
        for i in range(jumlah_cicilan):
            tanggal_jatuh_tempo = tanggal_mulai + timedelta(days=30 * i)
            cicilan = Cicilan.objects.create(
                pembayaran=pembayaran,
                nomor_cicilan=i + 1,
                jumlah=jumlah_per_cicilan,
                tanggal_jatuh_tempo=tanggal_jatuh_tempo
            )
            cicilan_list.append(cicilan)
        
        return cicilan_list


# ==================== PHASE 3: PAYMENT GATEWAY SERIALIZERS ====================

class PaymentGatewaySerializer(serializers.ModelSerializer):
    """Serializer untuk Payment Gateway"""
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    
    class Meta:
        model = PaymentGateway
        fields = ['id', 'provider', 'provider_display', 'is_active', 'config', 'created_at']


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Serializer untuk Payment Transaction"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    gateway_name = serializers.CharField(source='gateway.get_provider_display', read_only=True)
    
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'pembayaran', 'gateway', 'gateway_name', 'transaction_id',
                  'amount', 'status', 'status_display', 'payment_proof', 'response_data',
                  'created_at']
        read_only_fields = ['transaction_id', 'created_at']


class PaymentTransactionCreateSerializer(serializers.Serializer):
    """Serializer untuk create payment transaction"""
    pembayaran_id = serializers.IntegerField()
    gateway_id = serializers.IntegerField()
    payment_proof = serializers.ImageField(required=False)
    
    def create(self, validated_data):
        pembayaran = Pembayaran.objects.get(pk=validated_data['pembayaran_id'])
        gateway = PaymentGateway.objects.get(pk=validated_data['gateway_id'])
        
        transaction = PaymentTransaction.objects.create(
            pembayaran=pembayaran,
            gateway=gateway,
            amount=pembayaran.total_biaya,
            payment_proof=validated_data.get('payment_proof'),
            status='pending'
        )
        
        return transaction


# ==================== PHASE 3: INVOICE QR CODE SERIALIZERS ====================

class InvoiceQRCodeSerializer(serializers.ModelSerializer):
    """Serializer untuk Invoice QR Code"""
    invoice_number = serializers.CharField(source='pembayaran.invoice_number', read_only=True)
    
    class Meta:
        model = InvoiceQRCode
        fields = ['id', 'pembayaran', 'invoice_number', 'qr_image', 'qr_data', 'created_at']
        read_only_fields = ['created_at']


# ==================== REKAM MEDIS UPDATE WITH DURATION ====================

class RekamMedisSerializer(serializers.ModelSerializer):
    """Serializer untuk Rekam Medis (Updated with duration)"""
    pasien = PasienSerializer(read_only=True)
    dokter = DokterPublicSerializer(read_only=True)
    janji_temu = JanjiTemuSerializer(read_only=True)
    tindakan = LayananTindakanSerializer(many=True, read_only=True)
    tindakan_ids = serializers.PrimaryKeyRelatedField(
        queryset=LayananTindakan.objects.all(), many=True, source='tindakan', write_only=True, required=False
    )
    resep_list = serializers.SerializerMethodField()
    durasi_menit = serializers.ReadOnlyField()  # PHASE 2: Duration
    
    class Meta:
        model = RekamMedis
        fields = ['id', 'pasien', 'dokter', 'janji_temu', 'diagnosa', 'anamnesa',
                  'pemeriksaan_fisik', 'tindakan', 'tindakan_ids', 'catatan', 
                  'resep_list', 'waktu_mulai', 'waktu_selesai', 'durasi_menit',
                  'tanggal_periksa', 'created_at']
    
    def get_resep_list(self, obj):
        return ResepSerializer(obj.resep.all(), many=True).data


# ==================== OBAT UPDATE WITH EXPIRED INFO ====================

class ObatSerializer(serializers.ModelSerializer):
    """Serializer untuk Obat (Updated with expired info)"""
    kategori_display = serializers.CharField(source='get_kategori_display', read_only=True)
    satuan_display = serializers.CharField(source='get_satuan_display', read_only=True)
    status_stok = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()  # PHASE 1
    days_until_expired = serializers.ReadOnlyField()  # PHASE 1
    
    class Meta:
        model = Obat
        fields = ['id', 'nama', 'kategori', 'kategori_display', 'stok', 'satuan', 
                  'satuan_display', 'harga_jual', 'harga_beli', 'expired_date', 
                  'supplier', 'deskripsi', 'is_active', 'status_stok', 
                  'is_expired', 'days_until_expired', 'created_at']
