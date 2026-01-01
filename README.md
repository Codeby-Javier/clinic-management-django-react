# 🏥 Clinic Management Information System

<div align="center">

[![🇮🇩 Bahasa Indonesia](https://img.shields.io/badge/Language-Bahasa%20Indonesia-blue)](README.id.md)
[![🇬🇧 English](https://img.shields.io/badge/Language-English-red)](README.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Django](https://img.shields.io/badge/django-6.0-green.svg)
![React](https://img.shields.io/badge/react-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)

**Modern Clinic Management System with 6 Integrated User Roles**

[![📺 Watch Demo Videos](https://img.shields.io/badge/📺_Watch-Demo_Videos-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/playlist?list=PLWJtMJoyxlMCrG9uIvAlY4-4Fbc4HX0JI)

[Features](#-complete-features) • [Installation](#-installation) • [Demo Credentials](#-demo-credentials) • [API Documentation](#-api-documentation)

</div>

---

## 🎥 Video Preview

**Want to see the system in action?** Watch our complete video review playlist showcasing all features for each user role:

[![YouTube Playlist](https://img.shields.io/badge/YouTube-Playlist-red?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/playlist?list=PLWJtMJoyxlMCrG9uIvAlY4-4Fbc4HX0JI)

**Video Contents:**
- 👨‍💼 Admin Dashboard & User Management
- 👨‍⚕️ Doctor: Medical Records & Prescriptions
- 🏥 Receptionist: Patient Registration & Queue
- 💊 Pharmacist: Medicine Inventory & Prescription Processing
- 💰 Cashier: Payment Processing & Invoice Generation
- 🧑‍🦱 Patient: Appointment Booking & Medical History

---

## 📖 About This Project

Clinic Management Information System is a full-stack web application designed to comprehensively manage clinic operations. This application integrates 6 different user roles (Admin, Doctor, Patient, Receptionist, Pharmacist, and Cashier) into one seamless and user-friendly platform.

### 🎯 Project Goals

- Digitize clinic administrative processes
- Simplify electronic medical record management
- Optimize workflow between departments
- Improve healthcare service efficiency
- Provide organized queue and schedule systems
- Facilitate payment tracking and financial reporting

### ✨ Key Features

- **🔐 Role-Based Access Control (RBAC)** - Each role has access and features appropriate to their tasks
- **📱 Responsive Design** - Optimal display on desktop, tablet, and mobile
- **⚡ Real-time Updates** - Data updates in real-time without refresh
- **🎨 Modern UI/UX** - Clean, intuitive, and easy-to-use interface
- **🔒 Secure Authentication** - JWT-based authentication for maximum security
- **📊 Dashboard Analytics** - Data visualization with charts and statistics
- **🧾 Auto Invoice Generation** - Automatic invoice generation with unique numbers
- **💊 Inventory Management** - Medicine stock management with low stock alerts
- **📋 Queue System** - Queue system with unique code per doctor
- **🔄 Transaction History** - Complete transaction history tracking

---

## 🚀 Quick Start

### Quick Way (Windows)

```bash
# Clone repository
git clone https://github.com/yourusername/klinik-kesehatan.git
cd klinik-kesehatan

# Run application (automatic)
START_SERVERS.bat
```

Open browser: **http://localhost:5173**

### Manual Way

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

See **[DAFTAR_AKUN_LOGIN.md](DAFTAR_AKUN_LOGIN.md)** for complete list.

| Role | Username | Password | Access |
|------|----------|----------|--------|
| 👨‍💼 Admin | `admin` | `admin123` | Full system access |
| 👨‍⚕️ Doctor | `dr.ahmad` | `password123` | Medical records, prescriptions, schedule |
| 🏥 Receptionist | `resepsionis1` | `resepsionis123` | Registration, queue |
| 💊 Pharmacist | `apoteker1` | `apoteker123` | Medicine stock, prescriptions |
| 💰 Cashier | `kasir1` | `kasir123` | Payments, invoices |
| 🧑‍🦱 Patient | `jono` | `pasien123` | Booking, medical records |

---

## 🎯 Complete Features

### 👨‍💼 Admin
- ✅ User management (CRUD all roles)
- ✅ Manage medical services
- ✅ Dashboard overview with statistics
- ✅ Revenue and transaction reports
- ✅ Reset user passwords
- ✅ Edit doctor consultation fees
- ✅ Transaction history per user
- ✅ Medicine and stock management

### 👨‍⚕️ Doctor
- ✅ Input patient medical records
- ✅ Create medicine prescriptions
- ✅ Set daily practice schedule
- ✅ View patient list
- ✅ View today's appointments
- ✅ Start consultations
- ✅ Input medical procedures
- ✅ Patient statistics dashboard

### 🧑‍🦱 Patient
- ✅ Register new account
- ✅ Book appointments with doctors
- ✅ View available doctor schedules
- ✅ View own medical records
- ✅ View medicine prescriptions
- ✅ Payment history
- ✅ Cancel appointments
- ✅ Health history dashboard

### 🏥 Receptionist
- ✅ Register new patients
- ✅ Manage patient queue
- ✅ Confirm appointments
- ✅ View doctor schedules
- ✅ Filter appointments by date
- ✅ Unique queue number system per doctor
- ✅ Appointment statistics (pending, confirmed, completed)

### 💊 Pharmacist
- ✅ Manage medicine stock (CRUD)
- ✅ Process prescriptions from doctors
- ✅ Low stock medicine alerts
- ✅ Medicine dispensing
- ✅ View pending prescriptions
- ✅ Update prescription status (processed, delivered)
- ✅ Prescription statistics dashboard

### 💰 Cashier
- ✅ Process payments
- ✅ Generate automatic invoices
- ✅ Multiple payment methods (Cash, Transfer, QRIS, Insurance)
- ✅ Automatic change calculation
- ✅ Print invoices
- ✅ Financial reports
- ✅ Filter payments (pending, paid)
- ✅ Revenue dashboard

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Programming Language |
| **Django** | 6.0 | Web Framework |
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

---

## 📦 Installation

### Prerequisites
- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **npm** or **yarn**
- **Git** (for cloning repository)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/klinik-kesehatan.git
cd klinik-kesehatan
```

### 2️⃣ Backend Setup (Django)

```bash
# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter Pillow

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run server
python manage.py runserver
```

Backend will run at: **http://localhost:8000**

### 3️⃣ Frontend Setup (React)

Open new terminal:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

### 4️⃣ Access Application

Open browser and go to: **http://localhost:5173**

Login with any account from [DAFTAR_AKUN_LOGIN.md](DAFTAR_AKUN_LOGIN.md)

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in root directory (optional):

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (if using PostgreSQL)
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

---

## 📝 Important Commands

### Backend (Django)

#### Setup & Installation
```bash
# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter Pillow

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac
```

#### Database
```bash
# Create new migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Reset database
python manage.py flush

# Create superuser
python manage.py createsuperuser
```

#### Server
```bash
# Run development server
python manage.py runserver

# Run on specific port
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

# Check issues
python manage.py check

# Custom command
python manage.py clean_transaction_data
```

### Frontend (React + Vite)

#### Setup & Development
```bash
# Install dependencies
npm install

# Run dev server
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

# Check outdated packages
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

## 🌐 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new patient |
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/refresh/` | Refresh token |
| GET | `/api/auth/me/` | Get current user profile |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/users/` | List/Create users |
| GET/PUT/DELETE | `/api/users/{id}/` | User detail |
| GET/POST | `/api/layanan-tindakan/` | List/Create services |
| GET | `/api/laporan/overview/` | Dashboard overview |
| GET | `/api/laporan/revenue-chart/` | Revenue chart data |

### Doctor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dokter/jadwal-saya/` | Get doctor schedule |
| PUT | `/api/dokter/jadwal-saya/update/` | Update schedule |
| GET | `/api/dokter/pasien-saya/` | List doctor's patients |
| GET | `/api/dokter/janji-temu/` | List appointments |
| POST | `/api/rekam-medis/` | Create medical record |

### Patient
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dokter/jadwal/` | List doctor schedules |
| POST | `/api/janji-temu/booking/` | Book appointment |
| GET | `/api/janji-temu/riwayat/` | Appointment history |
| GET | `/api/rekam-medis/saya/` | Own medical records |
| GET | `/api/pembayaran/riwayat/` | Payment history |

### Receptionist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/pasien/` | List/Register patients |
| GET | `/api/janji-temu/` | List appointments |
| POST | `/api/janji-temu/{id}/konfirmasi/` | Confirm appointment |
| GET | `/api/antrian/` | List queue |

### Pharmacist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/obat/` | List/Create medicines |
| GET | `/api/obat/stok_menipis/` | Low stock medicines |
| GET | `/api/resep/` | List prescriptions |
| POST | `/api/resep/{id}/proses/` | Process prescription |

### Cashier
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pembayaran/` | List payments |
| GET | `/api/pembayaran/pending/` | Pending payments |
| POST | `/api/pembayaran/{id}/bayar/` | Process payment |
| GET | `/api/kasir/stats/` | Cashier statistics |

---

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

---

## 📁 Project Structure

```
klinik-kesehatan/
├── 📂 core/                          # Django App (Backend)
│   ├── 📂 management/
│   │   └── 📂 commands/
│   │       └── clean_transaction_data.py
│   ├── 📂 migrations/                # Database migrations
│   ├── admin.py                      # Django admin configuration
│   ├── models.py                     # Database models (User, Doctor, Patient, etc)
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
│   │   │   ├── 📂 ui/                # UI components (Button, Modal, Table, etc)
│   │   │   ├── 📂 layout/            # Layout components (Sidebar, Header)
│   │   │   └── ErrorBoundary.tsx    # Error handling
│   │   │
│   │   ├── 📂 pages/                 # Page components
│   │   │   ├── 📂 admin/             # Admin pages
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   ├── ObatManagement.tsx
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── 📂 dokter/            # Doctor pages
│   │   │   │   ├── DokterJanjiTemu.tsx
│   │   │   │   ├── RekamMedis.tsx
│   │   │   │   └── JadwalPraktik.tsx
│   │   │   ├── 📂 pasien/            # Patient pages
│   │   │   │   ├── PasienDashboard.tsx
│   │   │   │   ├── BookingDokter.tsx
│   │   │   │   ├── RekamMedisPasien.tsx
│   │   │   │   └── PembayaranPasien.tsx
│   │   │   ├── 📂 resepsionis/       # Receptionist pages
│   │   │   │   ├── ManajemenJanjiTemu.tsx
│   │   │   │   ├── PendaftaranPasien.tsx
│   │   │   │   └── AntrianPasien.tsx
│   │   │   ├── 📂 apoteker/          # Pharmacist pages
│   │   │   │   ├── ObatApoteker.tsx
│   │   │   │   └── ResepApoteker.tsx
│   │   │   ├── 📂 kasir/             # Cashier pages
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
│ role            │ (admin/doctor/patient/receptionist/pharmacist/cashier)
│ phone           │
│ address         │
│ is_active       │
│ password_hint   │
└─────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
         │              │              │              │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Doctor  │   │ Patient │   │Receptio │   │Pharmaci │   │ Cashier │   │  Admin  │
    │         │   │         │   │   nist  │   │   st    │   │         │   │         │
    └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Appointment    │──────│   MedicalRecord  │──────│   Prescription   │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ patient (FK)     │      │ patient (FK)     │      │ medical_record   │
│ doctor (FK)      │      │ doctor (FK)      │      │ status           │
│ date             │      │ appointment (FK) │      │ prescription_det │
│ time             │      │ diagnosis        │      └──────────────────┘
│ status           │      │ procedures (M2M) │               │
│ queue_number     │      │ prescription     │               │
└──────────────────┘      └──────────────────┘               │
         │                         │                          │
         │                         │                          │
         └─────────────────────────┴──────────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │    Payment      │
                          ├─────────────────┤
                          │ appointment (FK)│
                          │ total_amount    │
                          │ method          │
                          │ status          │
                          │ invoice_number  │
                          └─────────────────┘

┌──────────────────┐      ┌──────────────────┐
│    Medicine      │──────│PrescriptionDetail│
├──────────────────┤      ├──────────────────┤
│ name             │      │ prescription (FK)│
│ category         │      │ medicine (FK)    │
│ stock            │      │ quantity         │
│ price            │      │ usage_rules      │
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
# Output will be in dist/ folder
```

**Backend:**
```bash
# Collect static files
python manage.py collectstatic

# Use production server like Gunicorn
pip install gunicorn
gunicorn klinik.wsgi:application
```

### Deployment Options

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Heroku, DigitalOcean, AWS
- **Database**: PostgreSQL (production), SQLite (development)

---

## 🤝 Contributing

Contributions are always welcome! If you want to contribute:

1. Fork this repository
2. Create new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

---

## 📝 License

This project uses MIT license. See `LICENSE` file for more details.

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
- All open source contributors who made this project possible

---

## 📞 Support

If you have questions or need help:

- 📧 Email: your.email@example.com
- 💬 Instagram: [@ibnu.jz](https://instagram.com/ibnu.jz)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/klinik-kesehatan/issues)

---

<div align="center">

**⭐ If this project helps you, don't forget to give it a star! ⭐**

Made by [@ibnu.jz](https://instagram.com/ibnu.jz)

</div>