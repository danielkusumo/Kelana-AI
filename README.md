# KelanaAI

> **Versi:** `v0.5.0`  
> **Tipe Aplikasi:** Web API (FastAPI)  
> **Fokus:** Trip Planner dengan Database PostgreSQL & AI-Powered Itinerary (AWS Bedrock)

---

## Deskripsi Proyek

**KelanaAI** adalah aplikasi perencanaan perjalanan berbasis Web API menggunakan FastAPI dan PostgreSQL, yang kini dilengkapi dengan **AI-powered itinerary generation** melalui **AWS Bedrock**. Aplikasi ini menyediakan endpoint CRUD lengkap untuk mengelola rencana perjalanan, sekaligus menghasilkan rekomendasi itinerary detail berbasis AI yang mencakup jadwal harian, estimasi anggaran, rekomendasi kuliner, dan saran transportasi.

---

## Struktur Proyek

```
kelana-ai/
├── README.md
├── backend/
│   ├── main.py                    # FastAPI app & API endpoints
│   ├── database.py                # SQLAlchemy engine, session, Base
│   ├── .env                       # Environment variables
│   ├── requirements.txt           # Python dependencies
│   ├── models/
│   │   └── trip.py                # SQLAlchemy ORM model for Trip
│   └── services/
│       ├── trip_service.py        # Business logic & helper functions
│       └── bedrock_service.py     # AWS Bedrock AI integration
└── frontend/
    └── .gitkeep
```

---

## Fitur Utama

### v0.5.0 — AWS Bedrock AI Integration & AI-Powered Itinerary

#### 1. AI-Generated Travel Itinerary (`POST /api/v1/trips`)

Setiap kali membuat rencana perjalanan baru, sistem akan secara otomatis memanggil **Amazon Bedrock** untuk menghasilkan itinerary lengkap dalam format Markdown. Itinerary AI mencakup:

- **Trip Overview** — ringkasan perjalanan
- **Daily Itinerary** — jadwal harian detail (Morning, Afternoon, Evening) untuk setiap hari
- **Estimated Daily Budget** — tabel estimasi anggaran harian
- **Food Recommendations** — rekomendasi kuliner lokal, street food, dan area dining
- **Transport Suggestions** — opsi transportasi yang disarankan

Itinerary AI disimpan di kolom `ai_recommendation` pada tabel `trips` dan dapat diakses kembali melalui endpoint `GET`.

#### 2. AWS Bedrock Configuration

- **Service:** `bedrock-runtime`
- **Default Model:** `amazon.nova-lite-v1:0` (dapat dikonfigurasi via env var `MODEL_ID`)
- **Authentication:** AWS Bearer Token (`AWS_BEARER_TOKEN_BEDROCK`) + Region (`AWS_REGION`)
- **SDK:** `boto3`

#### 3. Updated Trip Model (ORM)

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
    ai_recommendation    = Column(Text, nullable=True)
    created_at           = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

#### 4. Full CRUD Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/v1/trips/{id}/generate` | Membuat rencana perjalanan baru + generate AI itinerary |
| `GET`  | `/api/v1/trips` | Mengambil semua daftar perjalanan |
| `GET`  | `/api/v1/trips/{trip_id}` | Mengambil detail perjalanan berdasarkan ID |
| `PUT`  | `/api/v1/trips/{trip_id}` | Memperbarui data perjalanan berdasarkan ID |
| `DELETE` | `/api/v1/trips/{trip_id}` | Menghapus perjalanan berdasarkan ID |

#### 5. Supporting Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET`  | `/api/v1/trip-categories` | Mengembalikan daftar kategori perjalanan |
| `GET`  | `/api/v1/recommendations?destination={dest}` | Mengembalikan rekomendasi tempat statis berdasarkan destinasi |
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

### `POST /api/v1/trips` — Create Trip (with AI Itinerary)

**Request:**

```json
{
  "destination": "Bali",
  "days": 5,
  "budget": 1500,
  "travel_style": "Standard"
}
```

**Response:**

```json
{
  "id": 1,
  "destination": "Bali",
  "days": 5,
  "budget": 1500.0,
  "travel_style": "Standard",
  "category": "Standard",
  "daily_budget": 300.0,
  "recommended_transport": "Train",
  "ai_recommendation": "# 5-Day Travel Plan to Bali\n\n## Trip Overview\n...",
  "created_at": "2026-08-23T10:30:00"
}
```

> **Notes:** Field `ai_recommendation` berisi itinerary lengkap dalam format Markdown yang dihasilkan oleh AWS Bedrock AI.

### `GET /api/v1/trips` — List All Trips

**Response:**

```json
[
  {
    "id": 1,
    "destination": "Bali",
    "days": 5,
    "budget": 1500.0,
    "travel_style": "Standard",
    "category": "Standard",
    "daily_budget": 300.0,
    "recommended_transport": "Train",
    "ai_recommendation": "# 5-Day Travel Plan to Bali\n\n## Trip Overview\n...",
    "created_at": "2026-08-23T10:30:00"
  }
]
```

### `GET /api/v1/trips/{trip_id}` — Get Trip by ID

**Response (200 OK):**

```json
{
  "id": 1,
  "destination": "Bali",
  "days": 5,
  "budget": 1500.0,
  "travel_style": "Standard",
  "category": "Standard",
  "daily_budget": 300.0,
  "recommended_transport": "Train",
  "ai_recommendation": "# 5-Day Travel Plan to Bali\n\n## Trip Overview\n...",
  "created_at": "2026-08-23T10:30:00"
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
  "days": 7,
  "budget": 2500,
  "travel_style": "Luxury"
}
```

**Response:**

```json
{
  "id": 1,
  "destination": "Lombok",
  "days": 7,
  "budget": 2500.0,
  "travel_style": "Luxury",
  "category": "Standard",
  "daily_budget": 357.14,
  "recommended_transport": "Train",
  "ai_recommendation": "# 5-Day Travel Plan to Bali\n\n## Trip Overview\n...",
  "created_at": "2026-08-23T10:30:00"
}
```

> **Notes:** Update trip tidak memicu regenerasi AI itinerary. Untuk mendapatkan itinerary baru, buat trip baru.

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

### 4. Konfigurasi Environment Variables

Buat file `backend/.env` dan isi dengan konfigurasi berikut:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/kelana_db

# AWS Bedrock
AWS_REGION=ap-southeast-1
AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here

# Optional: Model ID (default: amazon.nova-lite-v1:0)
MODEL_ID=amazon.nova-lite-v1:0
```

> **Requirements:**
> - PostgreSQL sudah berjalan dan database `kelana_db` sudah dibuat.
> - Akun AWS aktif dengan akses ke **Amazon Bedrock** dan model yang dikonfigurasi sudah di-*enable* di region yang ditentukan.

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

### Create Trip (dengan AI Itinerary)

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/trips" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Bali",
    "days": 5,
    "budget": 1500,
    "travel_style": "Standard"
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
    "days": 7,
    "budget": 2500,
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

### Get Recommendations (Static)

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/recommendations?destination=Bali"
```

### List Transportations

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/transportations"
```

---

## Dependencies

| Package | Version | Keterangan |
|---------|---------|------------|
| fastapi | 0.115.6 | Web framework |
| uvicorn | 0.32.1 | ASGI server |
| sqlalchemy | 2.0.36 | ORM untuk PostgreSQL |
| psycopg2-binary | — | PostgreSQL driver |
| python-dotenv | 1.0.0 | Environment variable loader |
| **boto3** | **1.43.56** | **AWS SDK untuk Bedrock integration** |

---

## Riwayat Rilis

| Versi  | Tag      | Deskripsi |
|--------|----------|-----------|
| **v0.5.0** | `v0.5.0` | **AWS Bedrock AI Integration**: penambahan `bedrock_service.py` untuk generate AI-powered travel itinerary, update model `Trip` dengan kolom `ai_recommendation` & `created_at`, serta integrasi `boto3` |
| v0.4.0 | `v0.4.0` | PostgreSQL Database Integration: penambahan `database.py`, SQLAlchemy ORM model `Trip`, dan full CRUD endpoints dengan persistensi data ke PostgreSQL |
| v0.3.0 | `v0.3.0` | Transformasi ke Web API (FastAPI): endpoint `POST /api/v1/trips` diperluas dengan `travel_style` & `recommended_transport`, serta penambahan endpoint `GET /api/v1/trip-categories` |
| v0.2.0 | `v0.2.0` | Modularisasi arsitektur dengan pemisahan logika bisnis ke `trip_service.py` dan implementasi presentation layer dengan validasi input & loop interaktif di `main.py` |
| v0.1.0 | `v0.1.0` | Console app dasar dengan fitur input dan output trip summary |