# 🏥 Sistem Informasi Klinik Kesehatan

<div align="center">

[![🇮🇩 Bahasa Indonesia](https://img.shields.io/badge/Language-Bahasa%20Indonesia-blue)](README.id.md)
[![🇬🇧 English](https://img.shields.io/badge/Language-English-red)](README.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Django](https://img.shields.io/badge/django-5.0-green.svg)
![React](https://img.shields.io/badge/react-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)

**Sistem Manajemen Klinik Modern dengan 6 Role User Terintegrasi**

[![📺 Tonton Video Demo](https://img.shields.io/badge/📺_Tonton-Video_Demo-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/playlist?list=PLWJtMJoyxlMCrG9uIvAlY4-4Fbc4HX0JI)

[Fitur](#-fitur-lengkap) • [Instalasi](#-instalasi) • [Demo Credentials](#-demo-credentials) • [Dokumentasi API](#-dokumentasi-api)

</div>

---

## 🎥 Video Preview

**Ingin melihat sistem ini beraksi?** Tonton playlist video review lengkap yang menampilkan semua fitur untuk setiap role pengguna:

[![YouTube Playlist](https://img.shields.io/badge/YouTube-Playlist-red?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/playlist?list=PLWJtMJoyxlMCrG9uIvAlY4-4Fbc4HX0JI)

**Isi Video:**
- 👨‍💼 Dashboard Admin & Manajemen User
- 👨‍⚕️ Dokter: Rekam Medis & Resep
- 🏥 Resepsionis: Pendaftaran Pasien & Antrian
- 💊 Apoteker: Inventori Obat & Proses Resep
- 💰 Kasir: Proses Pembayaran & Generate Invoice
- 🧑‍🦱 Pasien: Booking Janji Temu & Riwayat Medis

---

## 📖 Tentang Projek

Sistem Informasi Klinik Kesehatan adalah aplikasi web full-stack yang dirancang untuk mengelola operasional klinik secara komprehensif. Aplikasi ini mengintegrasikan 6 role pengguna berbeda (Admin, Dokter, Pasien, Resepsionis, Apoteker, dan Kasir) dalam satu platform yang seamless dan user-friendly.

### 🎯 Tujuan Projek

- Digitalisasi proses administrasi klinik
- Mempermudah manajemen rekam medis elektronik
- Mengoptimalkan alur kerja antar departemen
- Meningkatkan efisiensi pelayanan kesehatan
- Menyediakan sistem antrian dan jadwal yang terorganisir
- Memudahkan tracking pembayaran dan laporan keuangan

### ✨ Keunggulan

- **🔐 Role-Based Access Control (RBAC)** - Setiap role memiliki akses dan fitur yang sesuai dengan tugasnya
- **📱 Responsive Design** - Tampilan optimal di desktop, tablet, dan mobile
- **⚡ Real-time Updates** - Data terupdate secara real-time tanpa perlu refresh
- **🎨 Modern UI/UX** - Interface yang clean, intuitif, dan mudah digunakan
- **🔒 Secure Authentication** - JWT-based authentication untuk keamanan maksimal
- **📊 Dashboard Analytics** - Visualisasi data dengan charts dan statistik
- **🧾 Auto Invoice Generation** - Generate invoice otomatis dengan nomor unik
- **💊 Inventory Management** - Manajemen stok obat dengan alert stok menipis
- **📋 Queue System** - Sistem antrian dengan kode unik per dokter
- **🔄 Transaction History** - Tracking lengkap riwayat transaksi

---

## 🚀 Quick Start

### Cara Cepat (Windows)

```bash
# Clone repository
git clone https://github.com/yourusername/klinik-kesehatan.git
cd klinik-kesehatan

# Jalankan aplikasi (otomatis)
START_SERVERS.bat
```

Buka browser: **http://localhost:5173**

### Cara Manual

**Terminal 1 - Backend:**
```bash
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🔐 Demo Credentials

Lihat **[DAFTAR_AKUN_LOGIN.md](DAFTAR_AKUN_LOGIN.md)** untuk daftar lengkap.

| Role | Username | Password | Akses |
|------|----------|----------|-------|
| 👨‍💼 Admin | `admin` | `admin123` | Full system access |
| 👨‍⚕️ Dokter | `dr.ahmad` | `password123` | Rekam medis, resep, jadwal |
| 🏥 Resepsionis | `resepsionis1` | `resepsionis123` | Pendaftaran, antrian |
| 💊 Apoteker | `apoteker1` | `apoteker123` | Stok obat, resep |
| 💰 Kasir | `kasir1` | `kasir123` | Pembayaran, invoice |
| 🧑‍🦱 Pasien | `jono` | `pasien123` | Booking, rekam medis |

---

## 🎯 Fitur Lengkap

### 👨‍💼 Admin
- ✅ Manajemen user (CRUD semua role)
- ✅ Kelola layanan tindakan medis
- ✅ Dashboard overview dengan statistik
- ✅ Laporan revenue dan transaksi
- ✅ Reset password user
- ✅ Edit biaya konsultasi dokter
- ✅ Riwayat transaksi per user
- ✅ Manajemen obat dan stok

### 👨‍⚕️ Dokter
- ✅ Input rekam medis pasien
- ✅ Buat resep obat
- ✅ Atur jadwal praktik per hari
- ✅ Lihat daftar pasien
- ✅ Lihat janji temu hari ini
- ✅ Mulai konsultasi
- ✅ Input tindakan medis
- ✅ Dashboard statistik pasien

### 🧑‍🦱 Pasien
- ✅ Registrasi akun baru
- ✅ Booking janji temu dengan dokter
- ✅ Lihat jadwal dokter tersedia
- ✅ Lihat rekam medis sendiri
- ✅ Lihat resep obat
- ✅ Riwayat pembayaran
- ✅ Cancel janji temu
- ✅ Dashboard riwayat kesehatan

### 🏥 Resepsionis
- ✅ Pendaftaran pasien baru
- ✅ Kelola antrian pasien
- ✅ Konfirmasi janji temu
- ✅ Lihat jadwal dokter
- ✅ Filter janji temu per tanggal
- ✅ Sistem nomor antrian unik per dokter
- ✅ Statistik janji temu (pending, confirmed, completed)

### 💊 Apoteker
- ✅ Kelola stok obat (CRUD)
- ✅ Proses resep dari dokter
- ✅ Alert stok obat menipis
- ✅ Input obat keluar
- ✅ Lihat resep pending
- ✅ Update status resep (processed, delivered)
- ✅ Dashboard statistik resep

### 💰 Kasir
- ✅ Proses pembayaran
- ✅ Generate invoice otomatis
- ✅ Multiple metode pembayaran (Tunai, Transfer, QRIS, Asuransi)
- ✅ Hitung kembalian otomatis
- ✅ Print invoice
- ✅ Laporan keuangan
- ✅ Filter pembayaran (pending, lunas)
- ✅ Dashboard revenue

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Programming Language |
| **Django** | 5.0 | Web Framework |
| **Django REST Framework** | 3.14+ | REST API |
| **Simple JWT** | 5.3+ | Authentication |
| **Django CORS Headers** | 4.3+ | CORS Handling |
| **Django Filter** | 23.5+ | Query Filtering |
| **Pillow** | 10.2+ | Image Processing |
| **SQLite** | 3.x | Database (Development) |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | UI Library |
| **TypeScript** | 5.0+ | Type Safety |
| **Vite** | 5.0+ | Build Tool |
| **TailwindCSS** | 4.0+ | Styling |
| **React Router DOM** | 7.0+ | Routing |
| **React Hook Form** | 7.50+ | Form Management |
| **Yup** | 1.3+ | Validation |
| **Axios** | 1.6+ | HTTP Client |
| **Recharts** | 2.10+ | Data Visualization |
| **Lucide React** | Latest | Icons |
| **jsPDF** | 2.5+ | PDF Generation |

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│                  (React + TypeScript)                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ REST API
┌────────────────────▼────────────────────────────────────┐
│                Django REST Framework                     │
│              (API Layer + Business Logic)                │
├──────────────────────────────────────────────────────────┤
│                   Django ORM                             │
│              (Data Access Layer)                         │
├──────────────────────────────────────────────────────────┤
│                  SQLite Database                         │
│              (Data Storage Layer)                        │
└──────────────────────────────────────────────────────────┘
```

## 📦 Instalasi

### Prerequisites
- **Python** 3.10 atau lebih tinggi
- **Node.js** 18 atau lebih tinggi
- **npm** atau **yarn**
- **Git** (untuk clone repository)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/klinik-kesehatan.git
cd klinik-kesehatan
```

### 2️⃣ Setup Backend (Django)

```bash
# Buat virtual environment (opsional tapi direkomendasikan)
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter Pillow

# Jalankan migrasi database
python manage.py migrate

# Buat superuser (opsional)
python manage.py createsuperuser

# Jalankan server
python manage.py runserver
```

Backend akan berjalan di: **http://localhost:8000**

### 3️⃣ Setup Frontend (React)

Buka terminal baru:

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173**

### 4️⃣ Akses Aplikasi

Buka browser dan akses: **http://localhost:5173**

Login dengan salah satu akun dari [DAFTAR_AKUN_LOGIN.md](DAFTAR_AKUN_LOGIN.md)

---

## 🔧 Konfigurasi

### Environment Variables

Buat file `.env` di root directory (opsional):

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (jika menggunakan PostgreSQL)
DB_NAME=klinik_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend Configuration

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

## 🔐 Demo Credentials

Lihat file **DAFTAR_AKUN_LOGIN.md** untuk daftar lengkap.

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Dokter | dr.ahmad | password123 |
| Dokter | dr.siti | soto1234 |
| Pasien | jono | pasien123 |
| Resepsionis | resepsionis1 | resepsionis123 |
| Apoteker | apoteker1 | apoteker123 |
| Kasir | kasir1 | kasir123 |

---

## 📝 Perintah-Perintah Penting

### Backend (Django)

#### Setup & Instalasi
```bash
# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter Pillow

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac
```

#### Database
```bash
# Buat migrasi baru
python manage.py makemigrations

# Jalankan migrasi
python manage.py migrate

# Reset database
python manage.py flush

# Buat superuser
python manage.py createsuperuser
```

#### Server
```bash
# Jalankan development server
python manage.py runserver

# Jalankan di port tertentu
python manage.py runserver 8080
```

#### Management Commands
```bash
# Django shell
python manage.py shell

# Database shell
python manage.py dbshell

# Collect static files
python manage.py collectstatic

# Cek masalah
python manage.py check

# Custom command
python manage.py clean_transaction_data
```

### Frontend (React + Vite)

#### Setup & Development
```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

#### Package Management
```bash
# Update dependencies
npm update

# Cek outdated packages
npm outdated

# Install package
npm install package-name

# Uninstall package
npm uninstall package-name
```

### Git Commands

```bash
# Clone repository
git clone https://github.com/yourusername/klinik-kesehatan.git

# Status & Add
git status
git add .

# Commit & Push
git commit -m "message"
git push origin main

# Branch
git checkout -b feature/new-feature
git checkout main
git merge feature/new-feature
```

### Database Management

```bash
# Backup database
python manage.py dumpdata > backup.json

# Restore database
python manage.py loaddata backup.json

# SQLite shell
sqlite3 db.sqlite3
```

### Troubleshooting

```bash
# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +

# Clear Node modules
rm -rf node_modules package-lock.json
npm install

# Check versions
python -m django --version
node --version
npm --version
```

---

## 🌐 Dokumentasi API

### Base URL
```
http://localhost:8000/api
```

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register pasien baru |
| POST | `/api/auth/login/` | Login user |
| POST | `/api/auth/refresh/` | Refresh token |
| GET | `/api/auth/me/` | Get current user profile |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/users/` | List/Create users |
| GET/PUT/DELETE | `/api/users/{id}/` | User detail |
| GET/POST | `/api/layanan-tindakan/` | List/Create layanan |
| GET | `/api/laporan/overview/` | Dashboard overview |
| GET | `/api/laporan/revenue-chart/` | Revenue chart data |

### Dokter
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dokter/jadwal-saya/` | Get jadwal dokter |
| PUT | `/api/dokter/jadwal-saya/update/` | Update jadwal |
| GET | `/api/dokter/pasien-saya/` | List pasien dokter |
| GET | `/api/dokter/janji-temu/` | List janji temu |
| POST | `/api/rekam-medis/` | Create rekam medis |

### Pasien
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dokter/jadwal/` | List jadwal dokter |
| POST | `/api/janji-temu/booking/` | Booking janji temu |
| GET | `/api/janji-temu/riwayat/` | Riwayat janji temu |
| GET | `/api/rekam-medis/saya/` | Rekam medis sendiri |
| GET | `/api/pembayaran/riwayat/` | Riwayat pembayaran |

### Resepsionis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/pasien/` | List/Register pasien |
| GET | `/api/janji-temu/` | List janji temu |
| POST | `/api/janji-temu/{id}/konfirmasi/` | Konfirmasi janji |
| GET | `/api/antrian/` | List antrian |

### Apoteker
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/obat/` | List/Create obat |
| GET | `/api/obat/stok_menipis/` | Obat stok menipis |
| GET | `/api/resep/` | List resep |
| POST | `/api/resep/{id}/proses/` | Proses resep |

### Kasir
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pembayaran/` | List pembayaran |
| GET | `/api/pembayaran/pending/` | Pembayaran pending |
| POST | `/api/pembayaran/{id}/bayar/` | Proses pembayaran |
| GET | `/api/kasir/stats/` | Statistik kasir |

## 🎨 Design System

### Colors
- **Primary Blue**: `#0EA5E9`
- **Secondary Teal**: `#14B8A6`
- **Accent Green**: `#10B981`
- **Neutral Gray**: `#64748B`

### Typography
- **Font Family**: Inter
- **Headings**: Semibold/Bold
- **Body**: Regular/Medium

## 📁 Struktur Projek

```
klinik-kesehatan/
├── 📂 core/                          # Django App (Backend)
│   ├── 📂 management/
│   │   └── 📂 commands/
│   │       └── clean_transaction_data.py
│   ├── 📂 migrations/                # Database migrations
│   ├── admin.py                      # Django admin configuration
│   ├── models.py                     # Database models (User, Dokter, Pasien, dll)
│   ├── serializers.py                # DRF serializers
│   ├── views.py                      # API views & business logic
│   ├── urls.py                       # URL routing
│   ├── permissions.py                # Role-based permissions
│   ├── signals.py                    # Django signals
│   └── tests.py                      # Unit tests
│
├── 📂 klinik/                        # Django Project Settings
│   ├── settings.py                   # Project configuration
│   ├── urls.py                       # Main URL configuration
│   ├── wsgi.py                       # WSGI configuration
│   └── asgi.py                       # ASGI configuration
│
├── 📂 frontend/                      # React App (Frontend)
│   ├── 📂 public/                    # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/            # Reusable components
│   │   │   ├── 📂 ui/                # UI components (Button, Modal, Table, dll)
│   │   │   ├── 📂 layout/            # Layout components (Sidebar, Header)
│   │   │   └── ErrorBoundary.tsx    # Error handling
│   │   │
│   │   ├── 📂 pages/                 # Page components
│   │   │   ├── 📂 admin/             # Admin pages
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   ├── ObatManagement.tsx
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── 📂 dokter/            # Dokter pages
│   │   │   │   ├── DokterJanjiTemu.tsx
│   │   │   │   ├── RekamMedis.tsx
│   │   │   │   └── JadwalPraktik.tsx
│   │   │   ├── 📂 pasien/            # Pasien pages
│   │   │   │   ├── PasienDashboard.tsx
│   │   │   │   ├── BookingDokter.tsx
│   │   │   │   ├── RekamMedisPasien.tsx
│   │   │   │   └── PembayaranPasien.tsx
│   │   │   ├── 📂 resepsionis/       # Resepsionis pages
│   │   │   │   ├── ManajemenJanjiTemu.tsx
│   │   │   │   ├── PendaftaranPasien.tsx
│   │   │   │   └── AntrianPasien.tsx
│   │   │   ├── 📂 apoteker/          # Apoteker pages
│   │   │   │   ├── ObatApoteker.tsx
│   │   │   │   └── ResepApoteker.tsx
│   │   │   ├── 📂 kasir/             # Kasir pages
│   │   │   │   └── PembayaranKasir.tsx
│   │   │   ├── 📂 auth/              # Authentication pages
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   └── 📂 common/            # Common pages
│   │   │       └── ProfilePage.tsx
│   │   │
│   │   ├── 📂 contexts/              # React contexts
│   │   │   └── AuthContext.tsx       # Authentication context
│   │   │
│   │   ├── 📂 services/              # API services
│   │   │   ├── api.ts                # Axios configuration
│   │   │   └── index.ts              # API endpoints
│   │   │
│   │   ├── 📂 types/                 # TypeScript types
│   │   │   └── index.ts              # Type definitions
│   │   │
│   │   ├── 📂 utils/                 # Utility functions
│   │   │   └── helpers.ts
│   │   │
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── package.json                  # NPM dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── vite.config.ts                # Vite config
│   └── tailwind.config.js            # TailwindCSS config
│
├── 📂 venv/                          # Python virtual environment
├── db.sqlite3                        # SQLite database
├── manage.py                         # Django management script
├── .env.example                      # Environment variables template
├── START_SERVERS.bat                 # Quick start script (Windows)
├── DAFTAR_AKUN_LOGIN.md             # Login credentials
└── README.md                         # Documentation
```

---

## 🗄️ Database Schema

### Core Models

```
┌─────────────────┐
│   CustomUser    │ (Base User Model)
├─────────────────┤
│ id              │
│ username        │
│ email           │
│ password        │
│ role            │ (admin/dokter/pasien/resepsionis/apoteker/kasir)
│ phone           │
│ address         │
│ is_active       │
│ password_hint   │
└─────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
         │              │              │              │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Dokter  │   │ Pasien  │   │Resepsio │   │Apoteker │   │  Kasir  │   │  Admin  │
    │         │   │         │   │   nis   │   │         │   │         │   │         │
    └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   JanjiTemu      │──────│   RekamMedis     │──────│     Resep        │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ pasien (FK)      │      │ pasien (FK)      │      │ rekam_medis (FK) │
│ dokter (FK)      │      │ dokter (FK)      │      │ status           │
│ tanggal          │      │ janji_temu (FK)  │      │ detail_resep     │
│ waktu            │      │ diagnosa         │      └──────────────────┘
│ status           │      │ tindakan (M2M)   │               │
│ nomor_antrian    │      │ resep            │               │
└──────────────────┘      └──────────────────┘               │
         │                         │                          │
         │                         │                          │
         └─────────────────────────┴──────────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │   Pembayaran    │
                          ├─────────────────┤
                          │ janji_temu (FK) │
                          │ total_biaya     │
                          │ metode          │
                          │ status          │
                          │ invoice_number  │
                          └─────────────────┘

┌──────────────────┐      ┌──────────────────┐
│      Obat        │──────│   DetailResep    │
├──────────────────┤      ├──────────────────┤
│ nama             │      │ resep (FK)       │
│ kategori         │      │ obat (FK)        │
│ stok             │      │ jumlah           │
│ harga_jual       │      │ aturan_pakai     │
│ expired_date     │      └──────────────────┘
└──────────────────┘
```

---

## 🚀 Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output akan ada di folder dist/
```

**Backend:**
```bash
# Collect static files
python manage.py collectstatic

# Gunakan production server seperti Gunicorn
pip install gunicorn
gunicorn klinik.wsgi:application
```

### Deployment Options

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Heroku, DigitalOcean, AWS
- **Database**: PostgreSQL (production), SQLite (development)

---

## 🤝 Kontribusi

Kontribusi selalu welcome! Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📝 License

Projek ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.

---

## 👨‍💻 Author

**Created by [@ibnu.jz](https://instagram.com/ibnu.jz)**

[![Instagram](https://img.shields.io/badge/Instagram-@ibnu.jz-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/ibnu.jz)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Django & Django REST Framework team
- React & Vite team
- TailwindCSS team
- Semua kontributor open source yang membuat projek ini mungkin

---

## 📞 Support

Jika Anda memiliki pertanyaan atau butuh bantuan:

- 📧 Email: your.email@example.com
- 💬 Instagram: [@ibnu.jz](https://instagram.com/ibnu.jz)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/klinik-kesehatan/issues)

---

<div align="center">

**⭐ Jika projek ini membantu, jangan lupa beri star! ⭐**

Made with ❤️ by [@ibnu.jz](https://instagram.com/ibnu.jz)

</div>
