# MyWallet — Kişisel Aile Bütçe Takip Uygulaması

Aile üyelerinin gelir, gider ve harcamalarını takip etmenize olanak tanıyan, Go (Fiber) backend ve React (Vite) frontend teknolojileriyle geliştirilmiş modern bir kişisel finans uygulaması.

## 🚀 Özellikler

- 👥 Ev Sakini Yönetimi — aile üyelerini ekle, düzenle, sil
- 💰 Gelir / Gider takibi — kişi bazında kayıt
- 📊 Analiz paneli — gün/hafta/ay/yıl bazında üye harcamaları
- 🔐 JWT tabanlı kimlik doğrulama
- 🌙 Karanlık / Aydınlık tema desteği

## 📋 Gereksinimler

| Araç | Sürüm |
|------|-------|
| Go   | ≥ 1.21 |
| Node | ≥ 18 |
| MySQL| ≥ 8.0 |

## ⚙️ Kurulum

### 1. Projeyi klonla

```bash
git clone https://github.com/KULLANICI_ADI/myWallet.git
cd myWallet
```

### 2. Backend `.env` Dosyasını Oluştur

```bash
cp server/.env.example server/.env
```

`server/.env` dosyasını açıp aşağıdaki değerleri doldur:

```env
APP_NAME=My-Wallet-API v1.0.0
HTTP_PORT=5000
DB_DSN=kullanici:sifre@tcp(127.0.0.1:3306)/mywallet_db?charset=utf8mb4&parseTime=True&loc=Local
APP_ENV=DEV
SECRET_KEY=gizli_anahtar_buraya_cok_uzun_ve_rastgele_bir_deger_koy

# İlk başlangıçta admin hesabı oluşturmak için (opsiyonel)
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=GucluBirSifre123!
SEED_ADMIN_NAME=Admin
SEED_ADMIN_SURNAME=User
```

### 3. Veritabanı Oluştur

```sql
CREATE DATABASE mywallet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Backend'i Çalıştır

```bash
cd server
go mod tidy
go run main.go
```

İlk çalışmada tablolar otomatik oluşturulur. `SEED_ADMIN_*` değişkenleri tanımlandıysa admin hesabı oluşturulur.

### 5. Frontend'i Çalıştır

```bash
cd client
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

## 🔒 Güvenlik Notları

- `.env` dosyası git tarafından izlenmez, asla commit etme
- `SECRET_KEY` için en az 32 karakter rastgele bir değer kullan
- Production'da `APP_ENV=PROD` yap ve CORS `AllowOrigins`'i kendi domain'inle değiştir
- `SEED_ADMIN_*` değişkenleri sadece ilk kurulumda kullanılır

## 🌐 Production'a Alma

```env
APP_ENV=PROD
CORS_ORIGINS=https://senin-domain.com
```

## 📁 Proje Yapısı

```
myWallet/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/   # Sayfa bileşenleri
│       ├── components/
│       └── store/   # Redux RTK Query
└── server/          # Go + Fiber backend
    ├── config/      # Konfigürasyon & DB bağlantısı
    ├── handlers/    # HTTP handler'lar
    ├── models/      # GORM modelleri
    ├── routes/      # Route tanımları
    ├── middlewares/ # JWT middleware
    └── utils/       # Yardımcı fonksiyonlar
```
