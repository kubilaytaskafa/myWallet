# myWallet 💸

> Aile bütçenizi takip edin: gelir ve giderlerinizi hane üyelerine göre kategorize edin, görsel grafiklerle analiz edin.

![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go&logoColor=white)
![Fiber](https://img.shields.io/badge/Fiber-v2.52-00ACD7?logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-F7B731?logo=jsonwebtokens&logoColor=white)

---

## 📸 Screenshots

> _Proje çalıştırıldığında ekran görüntüleri buraya eklenecek._

---

## ✨ Features

- ✅ **JWT tabanlı kimlik doğrulama** — Kayıt, giriş ve oturum yönetimi
- ✅ **Gelir & Gider yönetimi** — Kategori bazlı gelir/gider ekleme, düzenleme ve silme
- ✅ **Hane üyesi takibi** — Her gelir ve gideri bir aile üyesine bağlama (Residents)
- ✅ **Özet dashboard** — Anlık bakiye, gelir/gider toplamları ve son işlemler
- ✅ **Grafiksel analiz** — Chart.js ile zaman bazlı gelir-gider karşılaştırma grafikleri
- ✅ **Üye bazlı analitik** — Her hane üyenin harcama & gelir dağılımı
- ✅ **Admin seed** — İlk açılışta `.env` üzerinden otomatik admin kullanıcı oluşturma
- ✅ **Rate limiting & güvenlik** — Helmet, CORS ve dakikada 100 istek sınırı
- ✅ **Tek komutla geliştirme** — `npm run dev:all` ile client + server eş zamanlı başlatma

---

## 🛠 Tech Stack

| Katman         | Teknoloji                                         |
| -------------- | ------------------------------------------------- |
| **Frontend**   | React 19, Vite 8, React Router v7, Redux Toolkit  |
| **UI**         | React Bootstrap 5, Chart.js, react-chartjs-2      |
| **Backend**    | Go 1.25, Fiber v2                                 |
| **Veritabanı** | MySQL 8.0 (GORM ORM)                              |
| **Auth**       | JWT (golang-jwt/jwt v5) + bcrypt                  |
| **Güvenlik**   | Fiber Helmet, Rate Limiter, CORS                  |
| **Dev Tools**  | concurrently (client + server paralel çalıştırma) |

---

## 📐 Architecture

```
myWallet/
├── client/                  # React + Vite SPA
│   └── src/
│       ├── pages/
│       │   ├── auth/        # Login & Register sayfaları
│       │   ├── dashboard/   # Ana özet ekranı
│       │   ├── incomes/     # Gelir yönetimi
│       │   ├── expenses/    # Gider yönetimi
│       │   ├── residents/   # Hane üyesi yönetimi
│       │   └── analytics/   # Grafiksel analiz ekranı
│       ├── store/           # Redux Toolkit slice'ları
│       ├── components/      # Paylaşılan UI bileşenleri
│       └── hooks/           # Özel React hook'ları
│
└── server/                  # Go + Fiber REST API
    ├── config/              # DB bağlantısı, env yükleme, seed
    ├── handlers/            # HTTP handler'ları (incomes, expenses, stats, users, residents)
    ├── middlewares/         # JWT doğrulama middleware'i
    ├── models/              # GORM modelleri (User, Income, Expense, Resident, ResetToken)
    ├── routes/              # Route tanımları
    ├── utils/               # Yardımcı fonksiyonlar
    └── main.go              # Uygulama giriş noktası
```

```
Browser (React SPA)
      │  HTTP/JSON
      ▼
 Fiber API (:5000)
      │
  ┌───┴────────────────────────┐
  │  Middleware Katmanı         │
  │  Recover → Helmet →        │
  │  Logger → Limiter → CORS   │
  └───┬────────────────────────┘
      │
  ┌───┴───────────────────────────────┐
  │  Route Grupları                    │
  │  /api/auth   /api/incomes          │
  │  /api/expenses  /api/residents     │
  │  /api/stats  /api/users            │
  └───┬───────────────────────────────┘
      │
    GORM
      │
    MySQL
```

---

## 🚀 Kurulum

### Ön Gereksinimler

- [Go 1.21+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/)
- [MySQL 8.0+](https://dev.mysql.com/downloads/)

### 1. Repoyu Klonla

```bash
git clone https://github.com/kubilaytaskafa/myWallet.git
cd myWallet
```

### 2. Veritabanını Oluştur

```sql
CREATE DATABASE mywallet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Ortam Değişkenlerini Ayarla

```bash
cp server/.env.example server/.env
```

`server/.env` dosyasını düzenle:

```env
APP_NAME=My-Wallet-API v1.0.0
HTTP_PORT=5000
APP_ENV=DEV

DB_DSN=kullanici:sifre@tcp(127.0.0.1:3306)/mywallet_db?charset=utf8mb4&parseTime=True&loc=Local

# openssl rand -hex 32
SECRET_KEY=BURAYA_EN_AZ_32_KARAKTER_RASTGELE_BIR_DEGER_KOY

CORS_ORIGINS=http://localhost:5173

# İlk admin hesabı (opsiyonel)
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=GucluBirSifre123!
SEED_ADMIN_NAME=Admin
SEED_ADMIN_SURNAME=User
```

### 4. Bağımlılıkları Yükle

```bash
# Kök (concurrently)
npm install

# Client bağımlılıkları
cd client && npm install && cd ..

# Server bağımlılıkları
cd server && go mod download && cd ..
```

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev:all
```

| Servis      | Adres                 |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## 📡 API Endpoints

| Method | Endpoint                      | Açıklama                 | Auth |
| ------ | ----------------------------- | ------------------------ | ---- |
| POST   | `/api/auth/register`          | Yeni kullanıcı kaydı     | ❌   |
| POST   | `/api/auth/login`             | Giriş ve JWT al          | ❌   |
| GET    | `/api/incomes`                | Gelirleri listele        | ✅   |
| POST   | `/api/incomes`                | Yeni gelir ekle          | ✅   |
| PUT    | `/api/incomes/:id`            | Gelir güncelle           | ✅   |
| DELETE | `/api/incomes/:id`            | Gelir sil                | ✅   |
| GET    | `/api/expenses`               | Giderleri listele        | ✅   |
| POST   | `/api/expenses`               | Yeni gider ekle          | ✅   |
| PUT    | `/api/expenses/:id`           | Gider güncelle           | ✅   |
| DELETE | `/api/expenses/:id`           | Gider sil                | ✅   |
| GET    | `/api/residents`              | Hane üyelerini listele   | ✅   |
| POST   | `/api/residents`              | Yeni üye ekle            | ✅   |
| GET    | `/api/stats/summary`          | Genel özet istatistikler | ✅   |
| GET    | `/api/stats/chart`            | Grafik verisi            | ✅   |
| GET    | `/api/stats/resident-summary` | Üye bazlı analitik       | ✅   |

---

## 📄 Lisans

Bu proje [MIT Lisansı](./LICENSE) ile lisanslanmıştır.
