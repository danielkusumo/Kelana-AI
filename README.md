# KelanaAI

> **Versi:** `v0.4.0`  
> **Tipe Aplikasi:** Web API (FastAPI)  
> **Fokus:** Trip Planner dengan Database PostgreSQL

---

## Deskripsi Proyek

**KelanaAI** adalah aplikasi perencanaan perjalanan berbasis Web API menggunakan FastAPI dan PostgreSQL. Aplikasi ini menyediakan endpoint untuk membuat, membaca, memperbarui, dan menghapus (CRUD) rencana perjalanan dengan rekomendasi kategori, anggaran harian, serta transportasi yang disesuaikan dengan gaya perjalanan pengguna. Data perjalanan sekarang disimpan persisten di database PostgreSQL menggunakan SQLAlchemy ORM.

---

## Struktur Proyek

```
kelana-ai/
├── README.md
├── backend/
│   ├── main.py              # FastAPI app & API endpoints
│   ├── database.py          # SQLAlchemy engine, session, Base
│   ├── .env                 # Environment variables (DATABASE_URL)
│   ├── requirements.txt     # Python dependencies
│   ├── models/
│   │   └── trip.py          # SQLAlchemy ORM model for Trip
│   └── services/
│       └── trip_service.py  # Business logic & helper functions
└── frontend/
    └── .gitkeep
```

---

## Fitur Utama

### v0.4.0 — PostgreSQL Database Integration & Full CRUD API

#### 1. Database Integration (SQLAlchemy + PostgreSQL)

- Menggunakan **SQLAlchemy 2.0** sebagai ORM untuk berinteraksi dengan database **PostgreSQL**.
- Konfigurasi koneksi database melalui environment variable `DATABASE_URL` di file `.env`.
- Tabel `trips` dibuat secara otomatis saat aplikasi pertama kali dijalankan (`init_db()`).

#### 2. Trip Model (ORM)

```python
class Trip(Base):
    __tablename__ = "trips"
    id                   = Column(Integer, primary_key=True)
    destination          = Column(String, nullable=False)
    days                 = Column(Integer, nullable=False)
    budget               = Column(Float, nullable=False)
    travel_style         = Column(String, nullable=False)
    category             = Column(String, nullable=False)
    daily_budget         = Column(Float, nullable=False)
    recommended_transport = Column(String, nullable=False)
```

#### 3. Full CRUD Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/v1/trips` | Membuat rencana perjalanan baru |
| `GET`  | `/api/v1/trips` | Mengambil semua daftar perjalanan |
| `GET`  | `/api/v1/trips/{trip_id}` | Mengambil detail perjalanan berdasarkan ID |
| `PUT`  | `/api/v1/trips/{trip_id}` | Memperbarui data perjalanan berdasarkan ID |
| `DELETE` | `/api/v1/trips/{trip_id}` | Menghapus perjalanan berdasarkan ID |

#### 4. Supporting Endpoints (tetap dari v0.3.0)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET`  | `/api/v1/trip-categories` | Mengembalikan daftar kategori perjalanan |
| `GET`  | `/api/v1/recommendations?destination={dest}` | Mengembalikan rekomendasi tempat berdasarkan destinasi |
| `GET`  | `/api/v1/transportations` | Mengembalikan daftar moda transportasi |

---

## Business Rules

### `recommended_transport`

| `travel_style` / `category` | `recommended_transport` |
|----------------------------|--------------------------|
| Backpacker                 | Bus                      |
| Standard                   | Train                    |
| Luxury                     | Flight                   |

### `category` (ditentukan dari `budget`)

| Budget        | Category   |
|---------------|------------|
| `< 1000`      | Backpacker |
| `1000 - 3000` | Standard   |
| `> 3000`      | Luxury     |

---

## Contoh Request & Response

### `POST /api/v1/trips` — Create Trip

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
  "id": 1,
  "destination": "Bali",
  "days": 30,
  "budget": 2000.0,
  "travel_style": "Family",
  "category": "Standard",
  "daily_budget": 66.67,
  "recommended_transport": "Train"
}
```

### `GET /api/v1/trips` — List All Trips

**Response:**

```json
[
  {
    "id": 1,
    "destination": "Bali",
    "days": 30,
    "budget": 2000.0,
    "travel_style": "Family",
    "category": "Standard",
    "daily_budget": 66.67,
    "recommended_transport": "Train"
  }
]
```

### `GET /api/v1/trips/{trip_id}` — Get Trip by ID

**Response (200 OK):**

```json
{
  "id": 1,
  "destination": "Bali",
  "days": 30,
  "budget": 2000.0,
  "travel_style": "Family",
  "category": "Standard",
  "daily_budget": 66.67,
  "recommended_transport": "Train"
}
```

**Response (404 Not Found):**

```json
{"detail": "Trip with id 999 not found"}
```

### `PUT /api/v1/trips/{trip_id}` — Update Trip

**Request:**

```json
{
  "destination": "Lombok",
  "days": 15,
  "budget": 5000,
  "travel_style": "Luxury"
}
```

**Response:**

```json
{
  "id": 1,
  "destination": "Lombok",
  "days": 15,
  "budget": 5000.0,
  "travel_style": "Luxury",
  "category": "Luxury",
  "daily_budget": 333.33,
  "recommended_transport": "Flight"
}
```

### `DELETE /api/v1/trips/{trip_id}` — Delete Trip

**Response:**

```json
{"message": "Trip with id 1 has been successfully deleted"}
```

---

## Cara Menjalankan

### 1. Clone repositori

```bash
git clone https://github.com/danielkusumo/Kelana-AI.git
cd kelana-ai
```

### 2. Buat dan aktifkan virtual environment

```bash
python -m venv backend/.venv
```

- **Windows:**
  ```bash
  backend\.venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source backend/.venv/bin/activate
  ```

### 3. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Konfigurasi Database

Buat file `backend/.env` dan isi dengan connection string PostgreSQL kamu:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/kelana_db
```

> Pastikan PostgreSQL sudah berjalan dan database `kelana_db` sudah dibuat.

### 5. Jalankan server

```bash
uvicorn backend.main:app --reload
```

### 6. Akses API

- Root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Swagger UI (dokumentasi interaktif): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Contoh Penggunaan dengan `curl`

### Create Trip

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

### List All Trips

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/trips"
```

### Get Trip by ID

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/trips/1"
```

### Update Trip

```bash
curl -X PUT "http://127.0.0.1:8000/api/v1/trips/1" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Lombok",
    "days": 15,
    "budget": 5000,
    "travel_style": "Luxury"
  }'
```

### Delete Trip

```bash
curl -X DELETE "http://127.0.0.1:8000/api/v1/trips/1"
```

### List Trip Categories

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/trip-categories"
```

### Get Recommendations

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/recommendations?destination=Bali"
```

### List Transportations

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/transportations"
```

---

## Riwayat Rilis

| Versi  | Tag      | Deskripsi |
|--------|----------|-----------|
| **v0.4.0** | `v0.4.0` | **PostgreSQL Database Integration**: penambahan `database.py`, SQLAlchemy ORM model `Trip`, dan full CRUD endpoints (`POST`, `GET`, `PUT`, `DELETE`) dengan persistensi data ke PostgreSQL |
| v0.3.0 | `v0.3.0` | Transformasi ke Web API (FastAPI): endpoint `POST /api/v1/trips` diperluas dengan `travel_style` & `recommended_transport`, serta penambahan endpoint `GET /api/v1/trip-categories` |
| v0.2.0 | `v0.2.0` | Modularisasi arsitektur dengan pemisahan logika bisnis ke `trip_service.py` dan implementasi presentation layer dengan validasi input & loop interaktif di `main.py` |
| v0.1.0 | `v0.1.0` | Console app dasar dengan fitur input dan output trip summary |