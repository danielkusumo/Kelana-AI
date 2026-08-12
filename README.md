# KelanaAI

> **Versi:** `v0.2.0`  
> **Tipe Aplikasi:** Console App (Python)  
> **Fokus:** Trip Planner

---

## Deskripsi Proyek

**KelanaAI** adalah aplikasi console sederhana berbasis Python yang dirancang untuk membantu pengguna merencanakan perjalanan. Aplikasi ini menerima input dari pengguna mengenai destinasi, durasi perjalanan, anggaran, mata uang, dan bulan perjalanan, lalu menampilkan ringkasan perjalanan dalam format yang rapi dan terstruktur.

---

## Struktur Proyek

```
kelana-ai/
├── README.md
├── backend/
│   ├── main.py
│   └── services/
│       └── trip_service.py
└── frontend/
    └── .gitkeep
```

---

## Fitur Utama

### v0.2.0 — Modularisasi Arsitektur & Presentation Layer

#### 1. Modularisasi Arsitektur (`backend/services/trip_service.py`)

Logika bisnis perjalanan dipisahkan ke dalam modul tersendiri agar lebih terstruktur dan mudah dipelihara:

| Fungsi | Deskripsi |
|--------|-----------|
| `get_trip_category(budget)` | Menentukan kategori perjalanan berdasarkan anggaran: <br>• `< 1000` → **Backpacker** <br>• `1000 - 3000` → **Standard** <br>• `> 3000` → **Luxury** |
| `get_travel_session(month)` | Menentukan musim perjalanan berdasarkan bulan: <br>• `December` → **Peak Season** <br>• `June` → **Holiday Season** <br>• Lainnya → **Regular Season** |
| `calculate_daily_budget(budget, days)` | Menghitung anggaran harian dengan pembagian `budget / days` |
| `get_recommendations(destination)` | Mengembalikan daftar tempat rekomendasi (tipe data `list`) berdasarkan destinasi menggunakan `dictionary` mapping |
| `format_recommendations(places)` | Mengiterasi daftar tempat dengan `for loop` dan memformatnya menjadi string siap cetak |

#### 2. Implementasi Presentation Layer (`backend/main.py`)

- **Impor Modul:** Mengimpor fungsi logika bisnis dari `services.trip_service`.
- **Interaksi Pengguna (I/O):** Menangani masukan pengguna melalui `input()` dengan validasi:
  - `get_positive_int()` — memastikan input hari adalah angka bulat positif (> 0).
  - `get_non_negative_float()` — memastikan input anggaran adalah angka desimal non-negatif.
- **Output dengan f-strings:** Menampilkan ringkasan perjalanan menggunakan `f-string` dengan format rapi dan informatif.
- **Looping Interaktif:** Menggunakan `while loop` untuk memungkinkan pengguna menambahkan destinasi baru hingga memilih keluar.

---

## Cara Menjalankan

1. Clone repositori ini:
   ```bash
   git clone <repo-url>
   cd kelana-ai
   ```

2. Jalankan aplikasi:
   ```bash
   python backend/main.py
   ```

3. Masukkan data sesuai petunjuk yang diberikan.

---

## Contoh Output

```
========================================
Welcome to KelanaAI - Your Trip Planner!
========================================
Destination  : Bali
Days         : 30
Budget       : 2000
Currency     : USD
Travel Month : Jan

==========================
KelanaAI
==========================
Destination  : Bali
Days         : 30
Budget       : 2000 USD
Category     : Standard
Daily Budget : 66.67 USD/Day
Travel Month : Jan
Season       : Regular Season
Transport    : Train

Recommended Places
- Ubud
- Seminyak
- Nusa Penida
- Uluwatu

Do you want to add more destinations? (y/n): n

Thank you for using KelanaAI. Safe travels!
```

---

## Riwayat Rilis

| Versi | Tag | Deskripsi |
|-------|-----|-----------|
| v0.2.0 | `v0.2.0` | Modularisasi arsitektur dengan pemisahan logika bisnis ke `trip_service.py` dan implementasi presentation layer dengan validasi input & loop interaktif di `main.py` |
| v0.1.0 | `v0.1.0` | Console app dasar dengan fitur input dan output trip summary |
