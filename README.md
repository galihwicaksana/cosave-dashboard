# CoSave - Dual-User Savings Dashboard

**CoSave** adalah aplikasi web manajemen tabungan berbasis kolaboratif dua pengguna (*duo-user*) yang dirancang untuk memantau, mencatat, dan mengelola target finansial bersama secara transparan, akurat, dan *real-time*.

Aplikasi ini berfokus pada integrasi pencatatan tunggal (**SeaBank Indonesia**) dan dioptimalkan secara penuh dengan pendekatan **Mobile-First Responsive Web Design**.

---

## 🌟 Fitur Utama

- **Single Bank Account Integration Context**: Terpusat pada pencatatan rekening utama SeaBank lengkap dengan informasi detail rekening dan fitur *copy-to-clipboard* nomor rekening instan.
- **Dual-User Breakdown & Analytics**: Visualisasi alokasi kontribusi antar pengguna (*User A vs User B*) secara otomatis dalam bentuk persentase dan bilah kemajuan (*progress bar*).
- **Multi-Goal Savings Tracker**: Pengelolaan target tabungan bersama (misal: *Dana Nikah*, *Liburan*, *Emergency Fund*) dengan persentase ketercapaian dinamis.
- **Form Input Transaksi & Quick Amounts**: Pencatatan setoran/penarikan cepat dengan tombol nominal instan (`+50k`, `+100k`, `+500k`, `+1M`), alokasi kategori, dan catatan transaksi.
- **Upload & Automated Image Compression**: Fitur pengunggahan bukti transfer/screenshot yang otomatis dikompresi di sisi *client* sebelum diunggah ke *Storage Bucket* cloud.
- **Full CRUD Capabilities**: Mendukung operasi pembuatan (*Create*), pembacaan (*Read*), pembaruan (*Update*), dan penghapusan (*Delete*) data transaksi serta target tabungan secara sinkron.
- **Automatic Storage Cleanup**: Menghapus file gambar di *Storage Bucket* secara otomatis ketika data catatan transaksi terkait dihapus.
- **Dynamic Light & Dark Theme**: Opsi alih tema tampilan terang dan gelap yang responsif dan tersimpan pada preferensi pengguna.

---

## 🛠️ Teknologi & Stack (Tech Stack)

### **Frontend & Interface**
- **HTML5 & CSS3 (Vanilla)**: Menggunakan CSS Custom Properties (Design Tokens), Flexbox, CSS Grid, serta efek visual *Glassmorphic*.
- **JavaScript (ES6+)**: Logika aplikasi terstruktur tanpa *dependency framework* eksternal tambahan untuk performa tinggi.
- **RemixIcon & Google Fonts**: Ikonografi modern berbasis vektor dan tipografi *Plus Jakarta Sans*.

### **Backend & Cloud Infrastructure**
- **Supabase Database (PostgreSQL)**: Penyimpanan data transaksi dan target finansial berbasis relasional dengan skema *Row Level Security* (RLS).
- **Supabase Storage**: Media penyimpanan awan (*Cloud Storage Bucket*) khusus file gambar bukti transfer.
- **HTML5 Canvas API**: Kompresi gambar *client-side* untuk mengoptimalkan efisiensi penyimpanan dan kecepatan *load* data.

---

## 📁 Struktur Direktori Project

```text
cosave_dashboard/
├── index.html              # Markup utama dan struktur UI aplikasi
├── public/                 # Asset statis (logo, favicon SVG, icon SeaBank)
│   ├── favicon.svg
│   ├── seabank_icon.png
│   └── seabank_icon_white.png
└── src/
    ├── js/
    │   ├── app.js          # Logika UI, event handlers, dan state management
    │   ├── initialData.js  # Struktur data inisialisasi awal
    │   └── supabaseClient.js # Konfigurasi client dan integrasi API Supabase
    └── styles/
        └── main.css        # Core stylesheet dan sistem desain responsif
```

---

## 🚀 Cara Menjalankan Project

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/galihwicaksana/cosave-dashboard.git
   cd cosave-dashboard
   ```

2. **Jalankan HTTP Local Server**:
   Anda dapat menggunakan server lokal mana pun (seperti `serve`, `Live Server` VS Code, atau `http-server`):
   ```bash
   npx serve . -p 3000
   ```

3. **Buka Aplikasi**:
   Akses `http://localhost:3000` di browser perangkat desktop atau mobile Anda.

---

## 📄 Lisensi

Project ini dibuat untuk tujuan manajemen finansial bersama. Lisensi di bawah [MIT License](LICENSE).
