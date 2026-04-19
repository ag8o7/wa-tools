# 🚀 WA Tools Pro Indonesia

Platform WhatsApp Automation & Marketing Dashboard SaaS

## ✨ Fitur

- 📱 **Koneksi WhatsApp** via QR Code scan (Baileys)
- 📤 **Kirim Pesan** ke nomor tunggal
- 📢 **Broadcast** ke banyak nomor dengan jeda anti-spam
- 🤖 **Auto Reply** berbasis keyword
- 🔗 **Link Generator** WA + QR Code
- ✨ **AI Chat Assistant** (Bahasa Indonesia)
- 📊 **Analitik** pesan & aktivitas
- 🔐 **Autentikasi** session-based
- 💸 **Monetization Ready** (Free/Premium sistem)

## 📁 Struktur Project

```
wa-tools-pro/
├── backend/
│   ├── server.js              # Entry point Express
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js
│   │   ├── whatsapp.js
│   │   ├── autoreply.js
│   │   ├── broadcast.js
│   │   └── analytics.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── whatsappController.js
│   │   ├── autoReplyController.js
│   │   ├── broadcastController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── db.js              # JSON database helper
│   └── data/                  # Auto-created - stores JSON data
│       └── auth/              # WhatsApp session files
└── frontend/
    ├── index.html             # Login/Register page
    └── pages/
        └── dashboard.html     # Main SPA dashboard
```

## ⚙️ Setup & Instalasi

### Prerequisites
- Node.js v18 atau lebih baru
- npm atau yarn

### 1. Clone / Download Project

```bash
# Masuk ke folder backend
cd wa-tools-pro/backend

# Install dependencies
npm install
```

### 2. Jalankan Server

```bash
# Development (dengan auto-reload)
npm run dev

# Production
npm start
```

Server akan berjalan di: **http://localhost:3000**

### 3. Buka Browser

- **Login/Dashboard**: http://localhost:3000
- **Dashboard langsung**: http://localhost:3000/pages/dashboard.html

### 4. Login

Buat akun baru via form Register, atau gunakan akun demo:
- **Email**: demo@watools.id
- **Password**: demo123

> Note: Akun demo harus dibuat terlebih dahulu karena sistem menggunakan JSON database.

### 5. Hubungkan WhatsApp

1. Klik **"Hubungkan WhatsApp"** di sidebar
2. Scan QR code dengan WhatsApp Anda
3. Status akan berubah menjadi **Terhubung ✓**

---

## 🗄️ Database

Project menggunakan **JSON file** sebagai database sederhana (tidak perlu MongoDB).

File tersimpan di `backend/data/`:
- `users.json` — Data pengguna
- `messages.json` — Log pesan
- `autoreply.json` — Rules auto-reply
- `broadcasts.json` — Riwayat broadcast

Untuk produksi, ganti `db.js` dengan MongoDB/Mongoose.

---

## 🔧 Konfigurasi

Edit `backend/server.js` untuk mengubah:
- `PORT` (default: 3000)
- `SESSION_SECRET` (ganti untuk produksi!)

---

## 📦 Dependencies

| Package | Fungsi |
|---------|--------|
| express | Web framework |
| @whiskeysockets/baileys | WhatsApp Web API |
| express-session | Session management |
| qrcode | Generate QR code |
| @hapi/boom | Error handling |
| cors | Cross-origin support |

---

## 🚀 Deploy ke VPS/Server

```bash
# Install PM2 untuk process management
npm install -g pm2

# Jalankan dengan PM2
pm2 start backend/server.js --name "wa-tools-pro"

# Auto-start saat reboot
pm2 startup
pm2 save
```

---

## 💸 Monetization

Sistem Free/Premium sudah siap:

- **Free**: 100 pesan/bulan, 1 perangkat
- **Premium**: Unlimited, AI, analitik lanjutan

Untuk integrasi payment gateway (Midtrans), tambahkan route `/api/payment` dan update field `plan` di user.

---

## 📞 Dukungan

Dibuat dengan ❤️ untuk bisnis Indonesia.

- **Stack**: Node.js + Express + Baileys + Vanilla JS + TailwindCSS-like
- **WhatsApp API**: @whiskeysockets/baileys (non-official, gunakan sesuai ToS)
