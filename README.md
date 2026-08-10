# KelanaAI

> **Versi:** `v0.1.0`  
> **Tipe Aplikasi:** Console App (Python)  
> **Fokus:** Perencanaan Perjalanan (Trip Planner)

---

## Deskripsi Proyek

**KelanaAI** adalah aplikasi console sederhana berbasis Python yang dirancang untuk membantu pengguna merencanakan perjalanan. Aplikasi ini menerima input dari pengguna mengenai destinasi, negara, durasi perjalanan, anggaran, mata uang, dan bulan perjalanan, lalu menampilkan ringkasan perjalanan dalam format yang rapi dan terstruktur.

---

## Struktur Proyek

```
kelana-ai/
├── README.md                 # Dokumentasi proyek
├── backend/
│   └── main.py               # Logika utama aplikasi
└── frontend/
    └── .gitkeep              # Placeholder untuk pengembangan frontend
```

---

## Fitur Utama

- **Input Interaktif:** Mengambil data perjalanan langsung dari pengguna via terminal.
- **Konversi Tipe Data:**
  - `days` dikonversi ke `int()`
  - `budget` dikonversi ke `float()`
- **Output Terstruktur:** Menampilkan ringkasan perjalanan menggunakan `f-string` dengan format rapi.

---

## Teknologi yang Digunakan

- **Python 3.x**
- **Git & GitHub** untuk version control dan release management
- **Semantic Versioning** (`v0.1.0`)

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

3. Masukkan data sesuai petunjuk di terminal.

---

## Contoh Output

```
========================
KelanaAI
========================
Destination: Japan
Country: Japan
Days: 5
Budget: 1500.0 USD
Travel Month: December
```

---

## Riwayat Rilis

| Versi | Tag | Deskripsi |
|-------|-----|-----------|
| v0.1.0 | `v0.1.0` | Rilis awal - Console app dasar dengan fitur input dan output trip summary |

---

## Pengembangan Selanjutnya

- [ ] Pengembangan antarmuka pengguna (frontend)
- [ ] Integrasi AI untuk rekomendasi destinasi
- [ ] Penyimpanan data perjalanan ke database atau file

---

## Lisensi

Proyek ini dibuat untuk keperluan pembelajaran.
