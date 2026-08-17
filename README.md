# KelanaAI

> **Versi:** `v0.3.0`  
> **Tipe Aplikasi:** Web API (FastAPI)  
> **Fokus:** Trip Planner

---

## Deskripsi Proyek

**KelanaAI** adalah aplikasi perencanaan perjalanan berbasis Web API menggunakan FastAPI. Aplikasi ini menyediakan endpoint untuk membuat rencana perjalanan dengan rekomendasi kategori, anggaran harian, serta transportasi yang disesuaikan dengan gaya perjalanan pengguna.

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

### v0.3.0 — Transport Recommendation Endpoint & Trip Categories

#### 1. Transport Recommendation Endpoint (`POST /api/v1/trips`)

Endpoint untuk membuat rencana perjalanan telah diperluas untuk menerima `travel_style` dan mengembalikan `recommended_transport` berdasarkan business rules yang ada.

**Request:**

```json
{
  "destination": "Bali",
  "days": 30,
  "budget": 2000,
  "travel_style": "Family"
}
```

**Response:**

```json
{
  "destination": "Bali",
  "budget": 2000,
  "daily_budget": 66.67,
  "category": "Standard",
  "recommended_transport": "Train"
}
```

**Business Rules — `recommended_transport`:**

| `travel_style` | `recommended_transport` |
|----------------|---------------------------|
| Backpacker     | Bus                       |
| Standard       | Train                     |
| Luxury         | Flight                    |

**Business Rules — `category` (tetap dari sesi sebelumnya):**

| Budget              | Category   |
|---------------------|------------|
| `< 1000`            | Backpacker |
| `1000 - 3000`       | Standard   |
| `> 3000`            | Luxury     |

#### 2. List Trip Categories (`GET /api/v1/trip-categories`)

Endpoint baru yang mengembalikan daftar semua kategori perjalanan yang valid.

**Response:**

```json
[
  "Backpacker",
  "Standard",
  "Luxury"
]
```

---

## Cara Menjalankan

1. Clone repositori ini:
   ```bash
   git clone https://github.com/danielkusumo/Kelana-AI.git
   cd kelana-ai
   ```

2. Buat virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Aktifkan virtual environment:
   - **Windows:**
     ```bash
     .venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source .venv/bin/activate
     ```

4. Install dependensi dari `requirements.txt`:
   ```bash
   pip install -r backend/requirements.txt
   ```

5. Jalankan server:
   ```bash
   uvicorn backend.main:app --reload
   ```

4. Akses API melalui browser atau tools seperti Postman / curl:
   - Root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
   - Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - Swagger UI (dokumentasi interaktif): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Contoh Penggunaan dengan `curl`

**POST /api/v1/trips**

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/trips" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Bali",
    "days": 30,
    "budget": 2000,
    "travel_style": "Family"
  }'
```

**GET /api/v1/trip-categories**

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/trip-categories"
```

---

## Riwayat Rilis

| Versi  | Tag      | Deskripsi |
|--------|----------|-----------|
| v0.3.0 | `v0.3.0` | Transformasi ke Web API (FastAPI): endpoint `POST /api/v1/trips` diperluas dengan `travel_style` & `recommended_transport`, serta penambahan endpoint `GET /api/v1/trip-categories` |
| v0.2.0 | `v0.2.0` | Modularisasi arsitektur dengan pemisahan logika bisnis ke `trip_service.py` dan implementasi presentation layer dengan validasi input & loop interaktif di `main.py` |
| v0.1.0 | `v0.1.0` | Console app dasar dengan fitur input dan output trip summary |