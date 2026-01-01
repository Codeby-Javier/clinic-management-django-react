from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Permission untuk Admin"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsDokter(BasePermission):
    """Permission untuk Dokter"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'dokter'


class IsPasien(BasePermission):
    """Permission untuk Pasien"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'pasien'


class IsResepsionis(BasePermission):
    """Permission untuk Resepsionis"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'resepsionis'


class IsApoteker(BasePermission):
    """Permission untuk Apoteker"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'apoteker'


class IsKasir(BasePermission):
    """Permission untuk Kasir"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'kasir'


class IsAdminOrReadOnly(BasePermission):
    """Permission untuk Admin full access, lainnya read only"""
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrDokter(BasePermission):
    """Permission untuk Admin atau Dokter"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'dokter']


class IsAdminOrResepsionis(BasePermission):
    """Permission untuk Admin atau Resepsionis"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'resepsionis']


class IsStaff(BasePermission):
    """Permission untuk semua staff (bukan pasien)"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'dokter', 'resepsionis', 'apoteker', 'kasir']
