from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Sum, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import timedelta

from .models import (
    CustomUser, Dokter, Pasien, Resepsionis, Apoteker, Kasir,
    LayananTindakan, JanjiTemu, RekamMedis, Obat, Resep, DetailResep, Pembayaran,
    StokAdjustment
)
from .serializers import (
    CustomUserSerializer, CustomUserAdminSerializer, UserRegistrationSerializer, LoginSerializer, UserProfileSerializer,
    AdminUserCreateSerializer, DokterSerializer, DokterPublicSerializer, PasienSerializer,
    ResepsionisSerializer, ApotekerSerializer, KasirSerializer, LayananTindakanSerializer,
    ObatSerializer, JanjiTemuSerializer, JanjiTemuBookingSerializer, RekamMedisSerializer,
    RekamMedisCreateSerializer, ResepSerializer, ResepProcessSerializer, DetailResepSerializer,
    PembayaranSerializer, PembayaranProcessSerializer, LaporanOverviewSerializer,
    StokAdjustmentSerializer
)
from .permissions import (
    IsAdmin, IsDokter, IsPasien, IsResepsionis, IsApoteker, IsKasir,
    IsAdminOrReadOnly
)


# ==================== AUTH VIEWS ====================

class RegisterView(generics.CreateAPIView):
    """View untuk registrasi pasien baru"""
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Registrasi berhasil',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """View untuk login"""
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login berhasil',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class ProfileView(generics.RetrieveUpdateAPIView):
    """View untuk melihat dan update profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


# ==================== ADMIN VIEWS ====================

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet untuk kelola users (admin)"""
    queryset = CustomUser.objects.exclude(role='admin').order_by('-date_joined')
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['date_joined', 'username']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        # Admin bisa lihat lebih detail
        if self.request.user.role == 'admin':
            return CustomUserAdminSerializer
        return CustomUserSerializer
    
    def update(self, request, *args, **kwargs):
        """Custom update untuk handle biaya_konsultasi dokter"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        print("=== UPDATE USER DEBUG ===")
        print(f"User: {instance.username} (Role: {instance.role})")
        print(f"Request data: {request.data}")
        
        # Handle biaya_konsultasi untuk dokter
        biaya_updated = False
        if 'biaya_konsultasi' in request.data and instance.role == 'dokter':
            if hasattr(instance, 'dokter_profile'):
                dokter_profile = instance.dokter_profile
                old_biaya = dokter_profile.biaya_konsultasi
                new_biaya = request.data['biaya_konsultasi']
                dokter_profile.biaya_konsultasi = new_biaya
                dokter_profile.save()
                
                print(f"Updated biaya_konsultasi: {old_biaya} -> {new_biaya}")
                biaya_updated = True
        
        # Jika hanya update biaya_konsultasi, return response langsung
        if biaya_updated and len(request.data) == 1:
            print("Only biaya_konsultasi updated, returning success")
            # Refresh instance untuk get updated data
            instance.refresh_from_db()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        # Jika ada field lain yang perlu diupdate
        # Remove biaya_konsultasi dari data untuk avoid serializer error
        data = {k: v for k, v in request.data.items() if k != 'biaya_konsultasi'}
        
        if data:  # Jika masih ada data lain
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            print("Other fields updated")
            return Response(serializer.data)
        
        # Jika tidak ada data untuk update
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Partial update (PATCH)"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'status': 'success', 'is_active': user.is_active})
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset password user (admin only)"""
        user = self.get_object()
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response({'error': 'new_password required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate password
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({
                'error': 'Password tidak valid',
                'details': list(e.messages)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        # Save password hint for admin
        user.password_hint = new_password
        user.save()
        
        return Response({
            'status': 'success',
            'message': f'Password untuk {user.username} berhasil direset'
        })
    
    @action(detail=True, methods=['get'])
    def transaction_history(self, request, pk=None):
        """Get ringkasan riwayat transaksi user"""
        user = self.get_object()
        
        history = {
            'user': CustomUserSerializer(user).data,
            'summary': {},
            'recent_transactions': {}
        }
        
        # Jika pasien
        if hasattr(user, 'pasien_profile'):
            pasien = user.pasien_profile
            janji_temu = JanjiTemu.objects.filter(pasien=pasien)
            rekam_medis = RekamMedis.objects.filter(pasien=pasien)
            pembayaran = Pembayaran.objects.filter(janji_temu__pasien=pasien)
            
            history['summary'] = {
                'total_janji_temu': janji_temu.count(),
                'total_rekam_medis': rekam_medis.count(),
                'total_pembayaran': pembayaran.filter(status='lunas').count(),
                'total_biaya': pembayaran.filter(status='lunas').aggregate(
                    total=Sum('total_biaya')
                )['total'] or 0,
                'pembayaran_pending': pembayaran.filter(status='pending').count(),
            }
            
            history['recent_transactions'] = {
                'janji_temu': JanjiTemuSerializer(
                    janji_temu.order_by('-created_at')[:5], many=True
                ).data,
                'rekam_medis': RekamMedisSerializer(
                    rekam_medis.order_by('-tanggal_periksa')[:5], many=True
                ).data,
                'pembayaran': PembayaranSerializer(
                    pembayaran.order_by('-created_at')[:5], many=True
                ).data,
            }
        
        # Jika dokter
        elif hasattr(user, 'dokter_profile'):
            dokter = user.dokter_profile
            janji_temu = JanjiTemu.objects.filter(dokter=dokter)
            rekam_medis = RekamMedis.objects.filter(dokter=dokter)
            
            history['summary'] = {
                'total_janji_temu': janji_temu.count(),
                'total_rekam_medis': rekam_medis.count(),
                'total_pasien': janji_temu.values('pasien').distinct().count(),
            }
            
            history['recent_transactions'] = {
                'janji_temu': JanjiTemuSerializer(
                    janji_temu.order_by('-created_at')[:5], many=True
                ).data,
                'rekam_medis': RekamMedisSerializer(
                    rekam_medis.order_by('-tanggal_periksa')[:5], many=True
                ).data,
            }
        
        # Jika apoteker
        elif hasattr(user, 'apoteker_profile'):
            apoteker = user.apoteker_profile
            resep = Resep.objects.filter(processed_by=apoteker)
            stok_adj = StokAdjustment.objects.filter(created_by=user)
            
            history['summary'] = {
                'total_resep_processed': resep.count(),
                'total_stok_adjustment': stok_adj.count(),
            }
            
            history['recent_transactions'] = {
                'resep': ResepSerializer(
                    resep.order_by('-processed_at')[:5], many=True
                ).data,
                'stok_adjustment': StokAdjustmentSerializer(
                    stok_adj.order_by('-created_at')[:5], many=True
                ).data,
            }
        
        # Jika kasir
        elif hasattr(user, 'kasir_profile'):
            kasir = user.kasir_profile
            pembayaran = Pembayaran.objects.filter(processed_by=kasir)
            
            history['summary'] = {
                'total_pembayaran_processed': pembayaran.count(),
                'total_revenue': pembayaran.filter(status='lunas').aggregate(
                    total=Sum('total_biaya')
                )['total'] or 0,
            }
            
            history['recent_transactions'] = {
                'pembayaran': PembayaranSerializer(
                    pembayaran.order_by('-tanggal_bayar')[:5], many=True
                ).data,
            }
        
        return Response(history)


class LayananTindakanViewSet(viewsets.ModelViewSet):
    """ViewSet untuk Layanan Tindakan"""
    queryset = LayananTindakan.objects.filter(is_active=True).order_by('nama_tindakan')
    serializer_class = LayananTindakanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['kategori', 'is_active']
    search_fields = ['nama_tindakan']
    
    def get_permissions(self):
        """
        Dokter & Resepsionis: read-only
        Admin: full access (CRUD)
        """
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdmin()]


class LaporanOverviewView(generics.GenericAPIView):
    """View untuk laporan overview (admin)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request, *args, **kwargs):
        today = timezone.now().date()
        first_day_of_month = today.replace(day=1)
        
        total_pasien = Pasien.objects.count()
        total_dokter = Dokter.objects.filter(status_aktif=True).count()
        janji_hari_ini = JanjiTemu.objects.filter(tanggal=today).count()
        
        revenue_bulan_ini = Pembayaran.objects.filter(
            status='lunas',
            tanggal_bayar__date__gte=first_day_of_month
        ).aggregate(total=Sum('total_biaya'))['total'] or 0
        
        pasien_baru_bulan_ini = Pasien.objects.filter(
            created_at__date__gte=first_day_of_month
        ).count()
        
        pembayaran_pending = Pembayaran.objects.filter(status='pending').count()
        
        data = {
            'total_pasien': total_pasien,
            'total_dokter': total_dokter,
            'janji_hari_ini': janji_hari_ini,
            'revenue_bulan_ini': revenue_bulan_ini,
            'pasien_baru_bulan_ini': pasien_baru_bulan_ini,
            'pembayaran_pending': pembayaran_pending,
        }
        
        return Response(LaporanOverviewSerializer(data).data)


class RevenueChartView(generics.GenericAPIView):
    """View untuk chart revenue 7 hari terakhir"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request, *args, **kwargs):
        today = timezone.now().date()
        data = []
        
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            revenue = Pembayaran.objects.filter(
                status='lunas',
                tanggal_bayar__date=date
            ).aggregate(total=Sum('total_biaya'))['total'] or 0
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'day': date.strftime('%a'),
                'revenue': float(revenue)
            })
        
        return Response(data)


# ==================== DOKTER VIEWS ====================

class DokterJadwalView(generics.RetrieveUpdateAPIView):
    """View untuk kelola jadwal dokter sendiri"""
    serializer_class = DokterSerializer
    permission_classes = [IsAuthenticated, IsDokter]
    
    def get_object(self):
        return self.request.user.dokter_profile
    
    def update(self, request, *args, **kwargs):
        dokter = self.get_object()
        jadwal = request.data.get('jadwal_praktik', {})
        dokter.jadwal_praktik = jadwal
        dokter.save()
        return Response(DokterSerializer(dokter).data)


class DokterPasienListView(generics.ListAPIView):
    """View untuk daftar pasien dokter"""
    serializer_class = PasienSerializer
    permission_classes = [IsAuthenticated, IsDokter]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'no_rm']
    
    def get_queryset(self):
        dokter = self.request.user.dokter_profile
        tanggal = self.request.query_params.get('tanggal')
        
        queryset = Pasien.objects.filter(
            janji_temu__dokter=dokter
        ).distinct()
        
        if tanggal:
            queryset = queryset.filter(janji_temu__tanggal=tanggal)
        
        return queryset


class DokterJanjiTemuViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet untuk janji temu dokter"""
    serializer_class = JanjiTemuSerializer
    permission_classes = [IsAuthenticated, IsDokter]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'tanggal']
    ordering_fields = ['tanggal', 'waktu']
    
    def get_queryset(self):
        dokter = self.request.user.dokter_profile
        return JanjiTemu.objects.filter(dokter=dokter)
    
    @action(detail=True, methods=['post'])
    def mulai_konsultasi(self, request, pk=None):
        """Mulai konsultasi (update status ke confirmed)"""
        janji = self.get_object()
        if janji.status == 'pending':
            janji.status = 'confirmed'
            janji.save()
        return Response(JanjiTemuSerializer(janji).data)


class RekamMedisViewSet(viewsets.ModelViewSet):
    """ViewSet untuk Rekam Medis"""
    permission_classes = [IsAuthenticated, IsDokter]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['pasien', 'dokter']
    search_fields = ['pasien__user__first_name', 'pasien__no_rm', 'diagnosa']
    ordering_fields = ['tanggal_periksa']
    
    def get_queryset(self):
        dokter = self.request.user.dokter_profile
        return RekamMedis.objects.filter(dokter=dokter)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RekamMedisCreateSerializer
        return RekamMedisSerializer


# ==================== PASIEN VIEWS ====================

class DokterJadwalPublicView(generics.ListAPIView):
    """View untuk lihat jadwal semua dokter (public)"""
    queryset = Dokter.objects.filter(status_aktif=True)
    serializer_class = DokterPublicSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['spesialisasi']
    search_fields = ['user__first_name', 'user__last_name']


class CreateBookingView(generics.CreateAPIView):
    """View untuk booking janji temu (pasien) - Renamed for clarity"""
    serializer_class = JanjiTemuBookingSerializer
    permission_classes = [IsAuthenticated]


class PasienJanjiTemuListView(generics.ListAPIView):
    """View untuk riwayat janji temu pasien"""
    serializer_class = JanjiTemuSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['tanggal', 'created_at']
    
    def get_queryset(self):
        # Support both pasien role and other roles viewing their appointments
        user = self.request.user
        if hasattr(user, 'pasien_profile'):
            return JanjiTemu.objects.filter(pasien=user.pasien_profile).order_by('-created_at')
        return JanjiTemu.objects.none()


class PasienRekamMedisListView(generics.ListAPIView):
    """View untuk rekam medis pasien sendiri"""
    serializer_class = RekamMedisSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pasien_profile'):
            return RekamMedis.objects.filter(pasien=user.pasien_profile).order_by('-tanggal_periksa')
        return RekamMedis.objects.none()


class PasienPembayaranListView(generics.ListAPIView):
    """View untuk riwayat pembayaran pasien"""
    serializer_class = PembayaranSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pasien_profile'):
            return Pembayaran.objects.filter(janji_temu__pasien=user.pasien_profile).order_by('-created_at')
        return Pembayaran.objects.none()


class JanjiTemuCancelView(generics.UpdateAPIView):
    """View untuk cancel janji temu (pasien)"""
    serializer_class = JanjiTemuSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Allow any authenticated user with pasien_profile to cancel their appointments
        user = self.request.user
        if hasattr(user, 'pasien_profile'):
            return JanjiTemu.objects.filter(
                pasien=user.pasien_profile, 
                status__in=['pending', 'confirmed']
            )
        return JanjiTemu.objects.none()
    
    def update(self, request, *args, **kwargs):
        janji = self.get_object()
        janji.status = 'cancelled'
        janji.catatan = request.data.get('catatan', 'Dibatalkan oleh pasien')
        janji.save()
        return Response(JanjiTemuSerializer(janji).data)


# ==================== RESEPSIONIS VIEWS ====================

class PasienViewSet(viewsets.ModelViewSet):
    """ViewSet untuk kelola pasien (resepsionis)"""
    queryset = Pasien.objects.all().order_by('-created_at')
    serializer_class = PasienSerializer
    permission_classes = [IsAuthenticated, IsResepsionis]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'no_rm', 'user__phone']
    
    def create(self, request, *args, **kwargs):
        """Registrasi pasien baru oleh resepsionis"""
        try:
            user_data = {
                'username': request.data.get('username'),
                'email': request.data.get('email'),
                'password': request.data.get('password', '123456'),
                'password2': request.data.get('password', '123456'),
                'first_name': request.data.get('first_name'),
                'last_name': request.data.get('last_name', ''),
                'phone': request.data.get('phone'),
                'address': request.data.get('address'),
                'tanggal_lahir': request.data.get('tanggal_lahir'),
                'golongan_darah': request.data.get('golongan_darah', ''),
                'alergi': request.data.get('alergi', ''),
                'kontak_darurat': request.data.get('kontak_darurat', ''),
            }
            
            print("=== CREATE PASIEN DEBUG ===")
            print("Request data:", request.data)
            print("User data:", user_data)
            
            serializer = UserRegistrationSerializer(data=user_data)
            if not serializer.is_valid():
                print("Validation errors:", serializer.errors)
                return Response({
                    'detail': 'Validasi gagal',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            
            return Response({
                'message': 'Pasien berhasil didaftarkan',
                'pasien': PasienSerializer(user.pasien_profile).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print("=== CREATE PASIEN ERROR ===")
            print("Error:", str(e))
            import traceback
            traceback.print_exc()
            return Response({
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ResepsionisJanjiTemuViewSet(viewsets.ModelViewSet):
    """ViewSet untuk kelola janji temu (resepsionis)"""
    serializer_class = JanjiTemuSerializer
    permission_classes = [IsAuthenticated, IsResepsionis]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'dokter', 'tanggal']
    search_fields = ['pasien__user__first_name', 'pasien__no_rm']
    ordering_fields = ['tanggal', 'waktu', 'nomor_antrian']
    
    def get_queryset(self):
        return JanjiTemu.objects.all()
    
    @action(detail=True, methods=['post'])
    def konfirmasi(self, request, pk=None):
        """Konfirmasi janji temu"""
        janji = self.get_object()
        if janji.status == 'pending':
            janji.status = 'confirmed'
            janji.save()
        return Response(JanjiTemuSerializer(janji).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject janji temu"""
        janji = self.get_object()
        if janji.status == 'pending':
            janji.status = 'cancelled'
            janji.catatan = request.data.get('catatan', 'Dibatalkan oleh resepsionis')
            janji.save()
        return Response(JanjiTemuSerializer(janji).data)


class AntrianView(generics.ListAPIView):
    """View untuk antrian per dokter"""
    serializer_class = JanjiTemuSerializer
    permission_classes = [IsAuthenticated, IsResepsionis]
    
    def get_queryset(self):
        today = timezone.now().date()
        dokter_id = self.request.query_params.get('dokter_id')
        
        queryset = JanjiTemu.objects.filter(
            tanggal=today,
            status__in=['confirmed', 'pending']
        ).order_by('nomor_antrian')
        
        if dokter_id:
            queryset = queryset.filter(dokter_id=dokter_id)
        
        return queryset


# ==================== APOTEKER VIEWS ====================

class ObatViewSet(viewsets.ModelViewSet):
    """ViewSet untuk kelola obat"""
    queryset = Obat.objects.all().order_by('nama')
    serializer_class = ObatSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['kategori', 'is_active']
    search_fields = ['nama', 'supplier']
    ordering_fields = ['nama', 'stok', 'harga_jual']
    
    def get_permissions(self):
        """
        Dokter: read-only (untuk resep)
        Apoteker: full access (CRUD)
        """
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsApoteker()]
    
    @action(detail=False, methods=['get'])
    def stok_menipis(self, request):
        """Obat dengan stok < 10"""
        obat = Obat.objects.filter(stok__lt=10, is_active=True)
        return Response(ObatSerializer(obat, many=True).data)


class ResepViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet untuk resep (apoteker)"""
    serializer_class = ResepSerializer
    permission_classes = [IsAuthenticated, IsApoteker]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['tanggal_resep']
    
    def get_queryset(self):
        return Resep.objects.all()
    
    @action(detail=True, methods=['post'])
    def proses(self, request, pk=None):
        """Proses resep"""
        resep = self.get_object()
        serializer = ResepProcessSerializer(resep, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ResepSerializer(resep).data)


class ApotekerStatsView(generics.GenericAPIView):
    """View untuk statistik apoteker"""
    permission_classes = [IsAuthenticated, IsApoteker]
    
    def get(self, request, *args, **kwargs):
        today = timezone.now().date()
        
        resep_pending = Resep.objects.filter(status='pending').count()
        obat_menipis = Obat.objects.filter(stok__lt=10, is_active=True).count()
        resep_hari_ini = Resep.objects.filter(
            processed_at__date=today,
            status='delivered'
        ).count()
        
        return Response({
            'resep_pending': resep_pending,
            'obat_menipis': obat_menipis,
            'resep_hari_ini': resep_hari_ini
        })


# ==================== KASIR VIEWS ====================

class PembayaranViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet untuk pembayaran (kasir)"""
    serializer_class = PembayaranSerializer
    permission_classes = [IsAuthenticated, IsKasir]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'metode']
    ordering_fields = ['created_at', 'tanggal_bayar']
    
    def get_queryset(self):
        return Pembayaran.objects.all()
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Pembayaran pending"""
        pembayaran = Pembayaran.objects.filter(status='pending')
        return Response(PembayaranSerializer(pembayaran, many=True).data)
    
    @action(detail=True, methods=['post'])
    def bayar(self, request, pk=None):
        """Proses pembayaran"""
        pembayaran = self.get_object()
        serializer = PembayaranProcessSerializer(pembayaran, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PembayaranSerializer(pembayaran).data)
    
    @action(detail=True, methods=['get'])
    def invoice(self, request, pk=None):
        """Get invoice detail"""
        pembayaran = self.get_object()
        return Response(PembayaranSerializer(pembayaran).data)


class LaporanKeuanganView(generics.GenericAPIView):
    """View untuk laporan keuangan"""
    permission_classes = [IsAuthenticated, IsKasir]
    
    def get(self, request, *args, **kwargs):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = Pembayaran.objects.filter(status='lunas')
        
        if start_date:
            queryset = queryset.filter(tanggal_bayar__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(tanggal_bayar__date__lte=end_date)
        
        # Aggregate by date
        from django.db.models.functions import TruncDate
        
        data = queryset.annotate(
            date=TruncDate('tanggal_bayar')
        ).values('date').annotate(
            total_transaksi=Count('id'),
            total_revenue=Sum('total_biaya'),
        ).order_by('-date')
        
        return Response(list(data))


class KasirStatsView(generics.GenericAPIView):
    """View untuk statistik kasir"""
    permission_classes = [IsAuthenticated, IsKasir]
    
    def get(self, request, *args, **kwargs):
        today = timezone.now().date()
        first_day_of_month = today.replace(day=1)
        
        pembayaran_hari_ini = Pembayaran.objects.filter(
            tanggal_bayar__date=today,
            status='lunas'
        ).count()
        
        pending = Pembayaran.objects.filter(status='pending').count()
        
        revenue_bulan_ini = Pembayaran.objects.filter(
            status='lunas',
            tanggal_bayar__date__gte=first_day_of_month
        ).aggregate(total=Sum('total_biaya'))['total'] or 0
        
        revenue_hari_ini = Pembayaran.objects.filter(
            status='lunas',
            tanggal_bayar__date=today
        ).aggregate(total=Sum('total_biaya'))['total'] or 0
        
        return Response({
            'pembayaran_hari_ini': pembayaran_hari_ini,
            'pending': pending,
            'revenue_bulan_ini': float(revenue_bulan_ini),
            'revenue_hari_ini': float(revenue_hari_ini)
        })



# ==================== PHASE 2: AUDIT TRAIL VIEWS ====================

from .models import AuditLog, StokAdjustment, Notifikasi
from .serializers import AuditLogSerializer, StokAdjustmentSerializer, NotifikasiSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet untuk Audit Log (admin only)"""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['user', 'action', 'model_name']
    ordering_fields = ['timestamp']


# ==================== PHASE 2: STOK ADJUSTMENT VIEWS ====================

class StokAdjustmentViewSet(viewsets.ModelViewSet):
    """ViewSet untuk Stok Adjustment (apoteker)"""
    queryset = StokAdjustment.objects.all()
    serializer_class = StokAdjustmentSerializer
    permission_classes = [IsAuthenticated, IsApoteker]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['obat', 'reason']
    ordering_fields = ['created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ==================== PHASE 2: NOTIFIKASI VIEWS ====================

class NotifikasiViewSet(viewsets.ModelViewSet):
    """ViewSet untuk Notifikasi"""
    serializer_class = NotifikasiSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['tipe', 'is_read']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """User hanya bisa lihat notifikasi sendiri"""
        return Notifikasi.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notifikasi as read"""
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response(NotifikasiSerializer(notif).data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifikasi as read"""
        Notifikasi.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'success', 'message': 'Semua notifikasi ditandai sudah dibaca'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notifikasi count"""
        count = Notifikasi.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})


# ==================== PHASE 2: REKAM MEDIS DURATION TRACKING ====================

class RekamMedisViewSet(viewsets.ModelViewSet):
    """ViewSet untuk Rekam Medis (Updated with duration tracking)"""
    permission_classes = [IsAuthenticated, IsDokter]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['pasien', 'dokter']
    search_fields = ['pasien__user__first_name', 'pasien__no_rm', 'diagnosa']
    ordering_fields = ['tanggal_periksa']
    
    def get_queryset(self):
        dokter = self.request.user.dokter_profile
        return RekamMedis.objects.filter(dokter=dokter)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RekamMedisCreateSerializer
        return RekamMedisSerializer
    
    @action(detail=True, methods=['post'])
    def mulai_konsultasi(self, request, pk=None):
        """Mulai tracking konsultasi"""
        rekam_medis = self.get_object()
        rekam_medis.waktu_mulai = timezone.now()
        rekam_medis.save()
        return Response(RekamMedisSerializer(rekam_medis).data)
    
    @action(detail=True, methods=['post'])
    def selesai_konsultasi(self, request, pk=None):
        """Selesai tracking konsultasi"""
        rekam_medis = self.get_object()
        rekam_medis.waktu_selesai = timezone.now()
        rekam_medis.save()
        return Response(RekamMedisSerializer(rekam_medis).data)


# ==================== PHASE 1: OBAT EXPIRED VALIDATION ====================

class ObatViewSet(viewsets.ModelViewSet):
    """ViewSet untuk kelola obat (Updated with expired validation)"""
    queryset = Obat.objects.all().order_by('nama')
    serializer_class = ObatSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['kategori', 'is_active']
    search_fields = ['nama', 'supplier']
    ordering_fields = ['nama', 'stok', 'harga_jual']
    
    def get_permissions(self):
        """
        Dokter: read-only (untuk resep)
        Apoteker: full access (CRUD)
        Admin: full access (CRUD)
        """
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        # Admin atau Apoteker bisa CRUD
        if self.request.user.role in ['admin', 'apoteker']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsApoteker()]
    
    @action(detail=False, methods=['get'])
    def stok_menipis(self, request):
        """Obat dengan stok < 10"""
        obat = Obat.objects.filter(stok__lt=10, is_active=True)
        return Response(ObatSerializer(obat, many=True).data)
    
    @action(detail=False, methods=['get'])
    def expired_soon(self, request):
        """Obat yang akan expired dalam 30 hari"""
        today = timezone.now().date()
        thirty_days_later = today + timedelta(days=30)
        
        obat = Obat.objects.filter(
            expired_date__lte=thirty_days_later,
            expired_date__gt=today,
            is_active=True
        ).order_by('expired_date')
        
        return Response(ObatSerializer(obat, many=True).data)
    
    @action(detail=False, methods=['get'])
    def already_expired(self, request):
        """Obat yang sudah kadaluarsa"""
        today = timezone.now().date()
        obat = Obat.objects.filter(
            expired_date__lt=today,
            is_active=True
        )
        
        return Response(ObatSerializer(obat, many=True).data)


# ==================== PHASE 3: CICILAN VIEWS ====================

from .models import Cicilan, PaymentGateway, PaymentTransaction, InvoiceQRCode
from .serializers import (
    CicilanSerializer, CicilanCreateSerializer, PaymentGatewaySerializer,
    PaymentTransactionSerializer, PaymentTransactionCreateSerializer, InvoiceQRCodeSerializer
)


class CicilanViewSet(viewsets.ModelViewSet):
    """ViewSet untuk Cicilan"""
    serializer_class = CicilanSerializer
    permission_classes = [IsAuthenticated, IsKasir]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['pembayaran', 'status']
    ordering_fields = ['nomor_cicilan', 'tanggal_jatuh_tempo']
    
    def get_queryset(self):
        return Cicilan.objects.all()
    
    @action(detail=False, methods=['post'])
    def create_cicilan(self, request):
        """Create cicilan untuk pembayaran"""
        serializer = CicilanCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cicilan_list = serializer.save()
        return Response(CicilanSerializer(cicilan_list, many=True).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def bayar_cicilan(self, request, pk=None):
        """Bayar cicilan"""
        cicilan = self.get_object()
        cicilan.status = 'lunas'
        cicilan.tanggal_bayar = timezone.now().date()
        cicilan.save()
        return Response(CicilanSerializer(cicilan).data)


# ==================== PHASE 3: PAYMENT GATEWAY VIEWS ====================

class PaymentGatewayViewSet(viewsets.ModelViewSet):
    """ViewSet untuk Payment Gateway (admin)"""
    queryset = PaymentGateway.objects.all()
    serializer_class = PaymentGatewaySerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class PaymentTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet untuk Payment Transaction"""
    serializer_class = PaymentTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['pembayaran', 'gateway', 'status']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """Kasir bisa lihat semua, pasien hanya milik sendiri"""
        user = self.request.user
        if user.role == 'kasir':
            return PaymentTransaction.objects.all()
        elif hasattr(user, 'pasien_profile'):
            return PaymentTransaction.objects.filter(pembayaran__janji_temu__pasien=user.pasien_profile)
        return PaymentTransaction.objects.none()
    
    @action(detail=False, methods=['post'])
    def create_transaction(self, request):
        """Create payment transaction"""
        serializer = PaymentTransactionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()
        return Response(PaymentTransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify payment transaction (kasir)"""
        if request.user.role != 'kasir':
            return Response({'error': 'Only kasir can verify'}, status=status.HTTP_403_FORBIDDEN)
        
        transaction = self.get_object()
        transaction.status = 'success'
        transaction.save()
        
        # Update pembayaran
        pembayaran = transaction.pembayaran
        pembayaran.status = 'lunas'
        pembayaran.tanggal_bayar = timezone.now()
        pembayaran.processed_by = request.user.kasir_profile
        pembayaran.save()
        
        return Response(PaymentTransactionSerializer(transaction).data)


# ==================== PHASE 3: INVOICE QR CODE VIEWS ====================

class InvoiceQRCodeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet untuk Invoice QR Code"""
    serializer_class = InvoiceQRCodeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Kasir bisa lihat semua, pasien hanya milik sendiri"""
        user = self.request.user
        if user.role == 'kasir':
            return InvoiceQRCode.objects.all()
        elif hasattr(user, 'pasien_profile'):
            return InvoiceQRCode.objects.filter(pembayaran__janji_temu__pasien=user.pasien_profile)
        return InvoiceQRCode.objects.none()
    
    @action(detail=False, methods=['post'])
    def generate_qr(self, request):
        """Generate QR code untuk invoice"""
        pembayaran_id = request.data.get('pembayaran_id')
        
        try:
            pembayaran = Pembayaran.objects.get(pk=pembayaran_id)
        except Pembayaran.DoesNotExist:
            return Response({'error': 'Pembayaran not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if QR already exists
        if hasattr(pembayaran, 'qr_code'):
            return Response(InvoiceQRCodeSerializer(pembayaran.qr_code).data)
        
        # Generate QR data
        qr_data = f"INV:{pembayaran.invoice_number}|TOTAL:{pembayaran.total_biaya}|PASIEN:{pembayaran.janji_temu.pasien.no_rm}"
        
        # Create QR code (without actual image generation for now)
        qr_code = InvoiceQRCode.objects.create(
            pembayaran=pembayaran,
            qr_data=qr_data
        )
        
        return Response(InvoiceQRCodeSerializer(qr_code).data, status=status.HTTP_201_CREATED)
