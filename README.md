# KelanaAI

> **Versi:** `v0.9.0`  
> **Tipe Aplikasi:** Full-Stack Web App (FastAPI Backend + Next.js Frontend)  
> **Fokus:** Trip Planner dengan Database PostgreSQL, AI-Powered Itinerary (AWS Bedrock), **Authentication (JWT) & Per-User Data Ownership**, dan **Knowledge Base (RAG) Tanya-Jawab**

---

## Deskripsi Proyek

**KelanaAI** adalah aplikasi perencanaan perjalanan full-stack yang terdiri dari:

- **Backend (Web API):** FastAPI + PostgreSQL + AWS Bedrock. Menyediakan CRUD lengkap serta menghasilkan rekomendasi itinerary detail (jadwal harian, estimasi anggaran, kuliner, transportasi) menggunakan AI. Dilengkapi **autentikasi JWT** dan **ownership check** — setiap user hanya dapat melihat, mengubah, dan menghapus trip miliknya sendiri.
- **Frontend (Next.js):** Antarmuka web futuristik bertema *space/cosmic* dengan fitur utama:
  - **Home** (`/`) — Form trip planner + loading animasi + auto-redirect ke dashboard setelah AI selesai (wajib login)
  - **Login / Register** — Halaman autentikasi akun
  - **Profile** (`/profile`) — Info pengguna yang sedang login
  - **Dashboard** (`/trips`) — History trip milik user dengan **search, sort & pagination**
  - **Detail** (`/trips/[id]`) — Tampilan itinerary AI per trip dengan hero image + tombol delete

---

## Struktur Proyek

```
kelana-ai/
├── README.md
├── assets/                      # Screenshots halaman (generate, register, signin, trips, bot)
├── backend/
│   ├── main.py                   # FastAPI app & API endpoints (CORS + auth)
│   ├── database.py               # SQLAlchemy engine, session, Base
│   ├── .env                      # Environment variables (DB + AWS + JWT)
│   ├── requirements.txt          # Python dependencies
│   ├── models/
│   │   ├── trip.py               # SQLAlchemy ORM model for Trip (dengan user_id)
│   │   ├── user.py               # SQLAlchemy ORM model for User
│   │   └── migrate.py            # Custom SQL migration runner
│   ├── migrations/               # 001_create_users.sql, 002_add_user_id_to_trips.sql
│   └── services/
│       ├── trip_service.py       # Business logic & helper functions
│       ├── bedrock_service.py    # AWS Bedrock AI integration
│       ├── auth_service.py       # Register, login, JWT, password hashing
│       └── kb_service.py         # Knowledge Base (RAG) retrieval + grounded answer
└── frontend/
    ├── .env.local                # API_URL
    ├── app/
    │   ├── layout.tsx            # Root layout (fonts + footer)
    │   ├── globals.css           # Tema space/cosmic & animasi
    │   ├── page.tsx              # Halaman utama (form → loading → redirect)
    │   ├── login/                # Halaman login
    │   ├── register/             # Halaman registrasi
    │   ├── profile/              # Halaman profil pengguna
    │   ├── ask/                  # Halaman Knowledge Base (RAG) search & bandingkan
    │   └── trips/
    │       ├── page.tsx          # Dashboard history (search + sort + pagination)
    │       └── [id]/page.tsx     # Detail trip itinerary (+ tombol delete)
    ├── components/
    │   ├── ui/
    │   │   └── GlassCard.tsx     # Komponen card glassmorphism
    │   ├── AuthForm.tsx          # Form login & register (reusable)
    │   ├── RequireAuth.tsx       # Guard route (redirect ke login jika belum auth)
    │   ├── ConfirmModal.tsx      # Modal konfirmasi (delete, logout)
    │   ├── TripCard.tsx          # Kartu reusable untuk setiap trip
    │   └── trip-planner/         # TripForm, ItineraryResult, ItineraryContent,
    │                             # LoadingState, StarField
    ├── services/
    │   ├── tripService.ts        # API calls ke backend (getTrips, getTrip, generateTrip, deleteTrip)
    │   ├── authService.ts        # Auth API calls + session (token) management
    │   └── askService.ts         # API calls ke Knowledge Base (askKnowledgeBase, askBaseModel)
    ├── lib/
    │   └── destination.ts        # Pemetaan destinasi → hero image & flag
    ├── types/
    │   ├── trip.ts               # TypeScript interfaces (TripRequest, TripResponse)
    │   └── auth.ts               # TypeScript interfaces (AuthResponse, AuthUser, dll)
    ├── public/                   # Hero images (America, China, Indonesia, Japan, Singapore, world)
    └── package.json
```

---

## Fitur Utama

### v0.9.0 — Knowledge Base (RAG) & Tanya-Jawab Travel

Halaman baru **Ask** (`/ask`) yang memungkinkan user bertanya ke **Amazon Bedrock Knowledge Base** (RAG) dan membandingkan jawaban dengan **base model** langsung:

#### 1. Knowledge Base (RAG) Retrieval

- **Endpoint `POST /api/v1/ask`** — menerima pertanyaan, melakukan `retrieve` ke Bedrock Knowledge Base (top 5 hasil), lalu men-generate jawaban yang *grounded* hanya pada dokumen travel yang relevan.
- **Scoring & ambang kepercayaan:** setiap hasil retrieve memiliki `score`; hanya dokumen dengan `score >= KB_SCORE_THRESHOLD` (default `0.4`) yang diterima sebagai konteks & sumber.
- **Refusal:** jika tidak ada dokumen yang lolos ambang, jawaban berupa penolakan ("Mohon maaf... informasi tidak ditemukan / di bawah ambang kepercayaan").
- **Approval status** (`accepted`, `sources`) dikembalikan ke frontend beserta daftar sumber (`title`, `score`, `uri`, `snippet`), di-deduplikasi per dokumen (menyimpan skor tertinggi).

#### 2. Halaman `/ask` — Web-based Search UI

- **Search bar besar** bertema *web search*, bukan chat/AI playground.
- **Toggle tab** `Knowledge Base` ↔ `Base Model` untuk membandingkan jawaban RAG vs jawaban model tanpa konteks.
- **Status badge** — hijau `Grounded` jika jawaban berbasis dokumen, amber `No match in docs` jika tidak.
- **Sources panel** — setiap dokumen sumber ditampilkan sebagai kartu berisi nama file (mis. `indonesia-customs-and-imei-guide.md`), **relevance bar** + persentase skor, dan link eksternal ke dokumen aslinya.
- Jawaban dirender sebagai **Markdown** (react-markdown + remark-gfm) agar rapi.

#### 3. Endpoint Pembanding

- **`POST /api/v1/ask/base`** — menjawab langsung dari foundation model **tanpa** knowledge base (baseline perbandingan).

---

### v0.8.0 — Authentication (JWT) & Per-User Data Ownership

#### 1. Autentikasi Pengguna (JWT)

Sistem autentikasi berbasis **JWT (JSON Web Token)** dengan hashing password **bcrypt**:

- **Register** (`POST /api/v1/auth/register`) — buat akun baru (name, email, password), langsung mengembalikan token
- **Login** (`POST /api/v1/auth/login`) — verifikasi kredensial, mengembalikan `access_token` (HS256, dengan expiry)
- **Session** — token disimpan di `localStorage` oleh frontend; dikirim sebagai header `Authorization: Bearer <token>`
- **Protected endpoints** — endpoint trip mewajibkan token valid; tanpa token → `401`, token invalid/expired → `401`

#### 2. Halaman Login & Register

UI autentikasi bertema sama dengan aplikasi, reusable via `AuthForm.tsx`:

- **Login** (`/login`) — email + password, link ke register, redirect kembali ke halaman asal (`?next=`)
- **Register** (`/register`) — name + email + password, link ke login
- Validasi error (email duplikat, kredensial salah) ditampilkan inline

#### 3. Route Protection (Frontend)

Komponen `RequireAuth` membungkus halaman-halaman yang dilindungi. Jika belum login, pengguna otomatis di-arahkan ke `/login`:

- **Home** (`/`) — form generate trip
- **Trips** (`/trips`) — daftar trip
- **Trip Detail** (`/trips/[id]`) — detail itinerary
- **Profile** (`/profile`) — profil pengguna

#### 4. Per-User Data Ownership (Backend)

Endpoint trip kini memfilter dan memvalidasi berdasarkan `user_id` dari token:

| Requirement | Perilaku |
|-------------|----------|
| **View: Only own trips** | `GET /api/v1/trips` hanya mengembalikan trip milik user yang login (`filter(user_id == current)`) |
| **Update: Reject others** | `PUT /api/v1/trips/{id}` mengembalikan **403** jika `trip.user_id != user_id` |
| **Delete: Reject others** | `DELETE /api/v1/trips/{id}` mengembalikan **403** jika `trip.user_id != user_id` |
| **Get single trip** | `GET /api/v1/trips/{id}` mengembalikan **403** jika bukan milik user |

Setiap trip baru otomatis menyimpan `user_id` dari token saat dibuat.

#### 5. Halaman Profile (`/profile`)

Menampilkan informasi pengguna yang sedang login: avatar placeholder bergaya **Instagram** (inisial), nama, dan email, plus tombol **Log out** dengan konfirmasi.

#### 6. Konfirmasi untuk Aksi Berbahaya

- **Delete trip** — tombol "Delete" di halaman detail memunculkan dialog konfirmasi sebelum menghapus
- **Log out** — tombol "Log out" di home/profile memunculkan dialog konfirmasi (via komponen reusable `ConfirmModal`)

---

## Screenshots

| Halaman | Gambar |
|---------|--------|
| Generate Trip (Home) | ![Generate Trip](assets/generate.png) |
| Register | ![Register](assets/register.png) |
| Sign In (Login) | ![Sign In](assets/signin.png) |
| My Trips (Dashboard) | ![My Trips](assets/trips.png) |
| Ask the Bot (Knowledge Base) | ![Ask the Bot](assets/bot.png) |

---

### v0.7.0 — Dashboard History, Search & Sort, Direct API

#### 1. Halaman Dashboard (`/trips`) — History & Management

Setelah generate trip, user secara otomatis di-redirect ke dashboard yang menampilkan **semua trip** yang pernah dibuat:

- **Grid kartu** — setiap trip = satu `TripCard` dengan gambar destinasi, durasi, budget, kategori, dan transportasi
- **Trip terbaru di atas** — otomatis diurutkan berdasarkan `created_at` descending
- **Empty state** — tampilan menarik "No trips found" dengan CTA ke halaman generate jika belum ada data
- **Pagination** — otomatis terbagi per halaman (6 item/halaman) dengan tombol Prev/Next + nomor halaman & ellipsis jika jumlah trip melebihi satu halaman

**Kartu Trip (`TripCard`):**

- **Flag destinasi** — emoji bendera (`🇺🇸🇨🇳🇮🇩🇯🇵🇸🇬`) di samping nama destinasi
- **Format mata uang** — budget & daily budget tampil sebagai `USD 2,000` (via `Intl.NumberFormat`)
- **Category badge (color-coded)** — `Backpacker` (hijau), `Standard` (biru), `Luxury` (emas) di pojok gambar
- **Travel style badge** — badge gaya perjalanan (Family, Solo, Couple, dll) dengan warna sesuai

#### 2. Search & Sort

Dashboard dilengkapi **search bar** dan **sort dropdown**:

| Fitur | Keterangan |
|-------|-----------|
| **Search** | Filter berdasarkan `destination`, `travel_style`, `category`, `recommended_transport` — real-time saat mengetik |
| **Sort: Newest First** | Default — trip terbaru di atas |
| **Sort: Oldest First** | Trip terlama di atas |
| **Sort: Budget Low→High** | Urutkan dari biaya termurah |
| **Sort: Budget High→Low** | Urutkan dari biaya termahal |
| **Sort: Duration Short→Long** | Urutkan dari durasi terpendek |
| **Sort: Duration Long→Short** | Urutkan dari durasi terpanjang |
| **Search result count** | Menampilkan jumlah hasil pencarian |
| **Search empty state** | Tampilan "No trips match your search" dengan tombol Clear |

#### 3. Halaman Detail (`/trips/[id]`) — View Itinerary

Klik kartu trip di dashboard → masuk ke halaman detail dinamis:

- **Hero image** destinasi + badge "AI-Generated Itinerary"
- **Info card** — Duration, Budget, Style, Category
- **Itinerary penuh** — dirender dari `ai_recommendation` (Markdown) menggunakan `ItineraryContent`:
  - Daily timeline dengan pointer per hari
  - Estimated budget table
  - Food recommendations
  - Transport suggestions
- **Navigasi** — tombol "Back to trips"

#### 4. Auto-Redirect setelah Generate

Alur generate trip sekarang:

```
Home / → Isi form → Klik Generate → Loading animasi → [Data AI selesai] → Otomatis redirect ke /trips
```

- Loading state tetap ditampilkan sampai selesai (dipercepat jika backend sudah selesai lebih dulu)
- Setelah loading selesai → `router.push("/trips")`
- Trip baru langsung muncul di **paling atas** dashboard

#### 5. Direct Browser → Backend (CORS)

Frontend sekarang memanggil backend **langsung** dari browser (tidak melalui Next.js proxy):

- **Backend** ditambahkan `CORSMiddleware` (mengizinkan origin `http://localhost:3000`)
- **Frontend** menggunakan `API_URL` di `.env.local`
- **Service layer** terpusat di `services/tripService.ts`:
  ```ts
  getTrips()       → GET  /api/v1/trips
  getTrip(id)      → GET  /api/v1/trips/{id}
  generateTrip()   → POST /api/v1/trips/0/generate
  ```

---

### v0.6.0 — Frontend (Next.js)

#### UI Bertema Space/Cosmic

Antarmuka web dibangun dengan **Next.js + Tailwind CSS v4 + Framer Motion**:

- **StarField interaktif** — background bintang animasi dengan efek parallax mengikuti kursor
- **Glassmorphism cards** — panel transparan dengan blur dan glow
- **Palet warna** violet / fuchsia / amber yang konsisten
- **Transisi halus** antar state menggunakan Framer Motion

#### Trip Planner Form

Pengguna mengisi 4 input utama:

- **Destination** — destinasi tujuan
- **Budget ($)** — total anggaran
- **Days** — jumlah hari perjalanan
- **Travel Style** — **dropdown** pilihan (Family, Solo, Couple) dengan default `Family`

#### Hero Destination Image

Gambar destinasi ditampilkan di bagian atas halaman hasil. Pemetaan otomatis ke 5 gambar negara di `public/`:

| Negara | Gambar |
|--------|--------|
| America | `America.jpg` |
| China | `China.jpg` |
| Indonesia | `Indonesia.jpg` |
| Japan | `Japan.jpg` |
| Singapore | `Singapore.jpg` |
| **Destinasi lain** | `world.jpg` |

#### Hasil Itinerary yang Rapi

Konten markdown dari AI (`ai_recommendation`) di-parse dan dirender menjadi:

- **Daily Itinerary** — timeline per hari dengan pointer & header waktu (Morning, Afternoon, Evening)
- **Estimated Daily Budget** — tabel estimasi anggaran
- **Food Recommendations** — rekomendasi kuliner dengan pointer berwarna
- **Transport Suggestions** — saran transportasi

#### Advanced Loading State

- Multi-ring orbital system dengan animasi roket
- Progress steps (Destination Analysis, Route Planning, Dining & Cuisine, dst) dengan checkmark
- Cycling messages
- Loading **dipercepat otomatis** saat backend selesai mengirim data

---

### v0.5.0 — AWS Bedrock AI Integration & AI-Powered Itinerary

#### AI-Generated Travel Itinerary (`POST /api/v1/trips/{id}/generate`)

Setiap kali membuat rencana perjalanan baru, sistem akan secara otomatis memanggil **Amazon Bedrock** untuk menghasilkan itinerary lengkap dalam format Markdown. Itinerary AI mencakup:

- **Trip Overview** — ringkasan perjalanan
- **Daily Itinerary** — jadwal harian detail (Morning, Afternoon, Evening) untuk setiap hari
- **Estimated Daily Budget** — tabel estimasi anggaran harian
- **Food Recommendations** — rekomendasi kuliner lokal, street food, dan area dining
- **Transport Suggestions** — opsi transportasi yang disarankan

Itinerary AI disimpan di kolom `ai_recommendation` pada tabel `trips` dan dapat diakses kembali melalui endpoint `GET`.

#### AWS Bedrock Configuration

- **Service:** `bedrock-runtime`
- **Default Model:** `amazon.nova-lite-v1:0` (dapat dikonfigurasi via env var `MODEL_ID`)
- **Authentication:** AWS Bearer Token (`AWS_BEARER_TOKEN_BEDROCK`) + Region (`AWS_REGION`)
- **SDK:** `boto3`

#### Updated Trip Model (ORM)

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

## API Endpoints (Backend)

### Auth

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/v1/auth/register` | Membuat akun baru (name, email, password) → mengembalikan JWT |
| `POST` | `/api/v1/auth/login` | Login (email, password) → mengembalikan JWT |

### Full CRUD

> **Catatan:** Semua endpoint trip di bawah mewajibkan header `Authorization: Bearer <token>`. Data dibatasi hanya milik user yang login (`user_id` dari token).

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/v1/trips/{id}/generate` | Membuat rencana perjalanan baru + generate AI itinerary |
| `GET`  | `/api/v1/trips` | Mengambil daftar perjalanan **milik user** |
| `GET`  | `/api/v1/trips/{trip_id}` | Mengambil detail perjalanan (403 jika bukan milik user) |
| `PUT`  | `/api/v1/trips/{trip_id}` | Memperbarui data perjalanan (403 jika bukan milik user) |
| `DELETE` | `/api/v1/trips/{trip_id}` | Menghapus perjalanan (403 jika bukan milik user) |

### Supporting Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET`  | `/api/v1/trip-categories` | Mengembalikan daftar kategori perjalanan |
| `GET`  | `/api/v1/recommendations?destination={dest}` | Mengembalikan rekomendasi tempat statis berdasarkan destinasi |
| `GET`  | `/api/v1/transportations` | Mengembalikan daftar moda transportasi |

### Knowledge Base (RAG)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/v1/ask` | Tanya ke Bedrock Knowledge Base → jawaban grounded + daftar sumber (`sources`, `accepted`) |
| `POST` | `/api/v1/ask/base` | Tanya langsung ke foundation model tanpa knowledge base (baseline pembanding) |

---

## Frontend Routes

| Route | Halaman | Deskripsi | Proteksi |
|-------|---------|-----------|----------|
| `/` | Home | Form trip planner + loading + auto-redirect ke `/trips` | ✅ Wajib login |
| `/login` | Login | Form autentikasi masuk | — |
| `/register` | Register | Form pendaftaran akun | — |
| `/profile` | Profile | Info pengguna + logout | ✅ Wajib login |
| `/trips` | Dashboard | History trip milik user dengan search & sort | ✅ Wajib login |
| `/trips/{id}` | Detail | Itinerary lengkap per trip + tombol delete | ✅ Wajib login |
| `/ask` | Ask the Bot | Tanya Knowledge Base (RAG) & bandingkan dengan base model | ✅ Wajib login |

---

## Contoh Request & Response

### `POST /api/v1/trips/{id}/generate` — Create Trip (with AI Itinerary)

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
    "ai_recommendation": "# 5-Day Travel Plan to Bali\n\n## Trip Overview\...",
    "created_at": "2026-08-23T10:30:00"
  }
]
```

---

## Cara Menjalankan

### 1. Clone repositori

```bash
git clone https://github.com/danielkusumo/Kelana-AI.git
cd kelana-ai
```

### 2. Backend Setup

#### a. Virtual environment

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

#### b. Install dependencies

```bash
pip install -r backend/requirements.txt
```

#### c. Konfigurasi Environment Variables

Buat file `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/kelana_db

# AWS Bedrock
AWS_REGION=ap-southeast-1
AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# Optional: Model ID (default: amazon.nova-lite-v1:0)
MODEL_ID=amazon.nova-lite-v1:0

# Knowledge Base (RAG)
KNOWLEDGE_BASE_ID=your_knowledge_base_id
KNOWLEDGE_BASE_MODEL_ARN=arn:aws:bedrock:<region>::foundation-model/amazon.nova-lite-v1:0
KB_SCORE_THRESHOLD=0.4

# JWT
JWT_SECRET_KEY=your_super_secret_key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> **Requirements:**
> - PostgreSQL sudah berjalan dan database `kelana_db` sudah dibuat.
> - Akun AWS aktif dengan akses ke **Amazon Bedrock** dan model yang dikonfigurasi sudah di-*enable* di region yang ditentukan.

#### d. Jalankan backend server

```bash
uvicorn backend.main:app --reload
```

Akses API:
- Root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Setup

#### a. Environment Variables

Buat file `frontend/.env.local`:

```env
API_URL=http://localhost:8000/api/v1
```

#### b. Install dependencies & jalankan

```bash
cd frontend
npm install
npm run dev
```

Akses frontend: [http://localhost:3000](http://localhost:3000)

> **CORS:** Backend sudah mengizinkan origin `http://localhost:3000` via `CORSMiddleware`. Frontend memanggil backend secara langsung (tidak melalui proxy).

---

## Cara Menjalankan (Ringkas / Quick Start)

```bash
# Terminal 1 — Backend
uvicorn backend.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## Contoh Penggunaan dengan `curl`

> **Catatan:** Endpoint trip memerlukan header `Authorization: Bearer <token>`. Dapatkan token lewat register/login di bawah.

### Register (buat akun)

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Your Name", "email": "you@example.com", "password": "secret123"}'
```

### Login (dapatkan token)

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "secret123"}'
```

### Create Trip (dengan AI Itinerary)

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/trips/0/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "destination": "Bali",
    "days": 5,
    "budget": 1500,
    "travel_style": "Standard"
  }'
```

### List All Trips (hanya milik user)

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/trips" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Trip by ID

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/trips/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Trip

```bash
curl -X PUT "http://127.0.0.1:8000/api/v1/trips/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "destination": "Lombok",
    "days": 7,
    "budget": 2500,
    "travel_style": "Luxury"
  }'
```

### Delete Trip

```bash
curl -X DELETE "http://127.0.0.1:8000/api/v1/trips/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Dependencies

### Backend (Python)

| Package | Version | Keterangan |
|---------|---------|------------|
| fastapi | 0.115.6 | Web framework |
| uvicorn | 0.32.1 | ASGI server |
| sqlalchemy | 2.0.36 | ORM untuk PostgreSQL |
| psycopg2-binary | — | PostgreSQL driver |
| python-dotenv | 1.0.0 | Environment variable loader |
| boto3 | 1.43.56 | AWS SDK untuk Bedrock integration |
| bcrypt | — | Hashing password |
| python-jose | — | JWT encoding/decoding |

### Frontend (Node.js)

| Package | Version | Keterangan |
|---------|---------|------------|
| next | 16.3.2 | React framework (App Router) |
| react | 19.2.8 | UI library |
| react-dom | 19.2.8 | React DOM |
| tailwindcss | 4 | Utility-first CSS framework |
| framer-motion | 13.1.1 | Animasi & transisi |
| react-markdown | 10.1.0 | Render markdown hasil AI |
| remark-gfm | 4.0.1 | GitHub Flavored Markdown |
| lucide-react | 1.34.0 | Icon library |

---

## Riwayat Rilis

| Versi  | Tag      | Deskripsi |
|--------|----------|-----------|
| **v0.9.0** | `v0.9.0` | **Knowledge Base (RAG) & Tanya-Jawab Travel**: penambahan `kb_service.py` (retrieve Bedrock Knowledge Base + grounded answer via `converse`), endpoint `POST /api/v1/ask` & `POST /api/v1/ask/base`, scoring & ambang kepercayaan `KB_SCORE_THRESHOLD`, deduplikasi sumber per dokumen, halaman `/ask` (web-based search UI dengan toggle Knowledge Base ↔ Base Model, status badge Grounded/No match, dan sources panel berisi nama dokumen + relevance bar + skor), serta `services/askService.ts` |
| v0.8.0 | `v0.8.0` | **Authentication & Per-User Ownership**: penambahan `auth_service.py` (register, login, JWT HS256 + bcrypt), model `User` & kolom `user_id` di `Trip`, migrasi `001_create_users` & `002_add_user_id_to_trips`, endpoint `/api/v1/auth/*`, ownership check (GET/PUT/DELETE return 403 jika bukan milik user), halaman `/login`, `/register`, `/profile`, komponen `RequireAuth` & `ConfirmModal`, tombol delete trip dengan konfirmasi, dan logout dengan konfirmasi |
| v0.7.0 | `v0.7.0` | **Dashboard History + Search & Sort + Direct API**: penambahan halaman `/trips` (history grid dengan search, sort & pagination), halaman `/trips/[id]` (detail itinerary), auto-redirect ke dashboard setelah generate, direct browser→backend via CORS, `services/tripService.ts`, `TripCard.tsx` (flag destinasi, format `USD 2,000`, category badge color-coded, travel style badge), dan `.env.local` |
| v0.6.0 | `v0.6.0` | **Next.js Frontend**: penambahan frontend Next.js dengan UI space/cosmic, trip planner form, hero destination image, render itinerary AI yang rapi (day-by-day timeline, budget table, food & transport suggestions), loading state animasi, responsive layout, dan footer |
| v0.5.0 | `v0.5.0` | **AWS Bedrock AI Integration**: penambahan `bedrock_service.py` untuk generate AI-powered travel itinerary, update model `Trip` dengan kolom `ai_recommendation` & `created_at`, serta integrasi `boto3` |
| v0.4.0 | `v0.4.0` | PostgreSQL Database Integration: penambahan `database.py`, SQLAlchemy ORM model `Trip`, dan full CRUD endpoints dengan persistensi data ke PostgreSQL |
| v0.3.0 | `v0.3.0` | Transformasi ke Web API (FastAPI): endpoint `POST /api/v1/trips` diperluas dengan `travel_style` & `recommended_transport`, serta penambahan endpoint `GET /api/v1/trip-categories` |
| v0.2.0 | `v0.2.0` | Modularisasi arsitektur dengan pemisahan logika bisnis ke `trip_service.py` dan implementasi presentation layer dengan validasi input & loop interaktif di `main.py` |
| v0.1.0 | `v0.1.0` | Console app dasar dengan fitur input dan output trip summary |