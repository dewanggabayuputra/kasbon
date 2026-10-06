# Kasbon - Personal Debt Tracker

Aplikasi web sederhana untuk mencatat utang piutang pribadi. Catat siapa hutang berapa ke kamu, atau kamu hutang berapa ke siapa.

## Tech Stack

- **Framework**: Next.js 16 App Router + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) + Supabase Auth
- **Icons**: Lucide React

## Setup

### Prerequisites

- Node.js 18+ dan npm
- Supabase account (free tier OK)

### Environment Setup

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Supabase:
   - Buat project baru di [supabase.com](https://supabase.com)
   - Jalankan migration di folder `supabase/migrations/`
   - Copy credentials Supabase ke `.env.local`

4. Buat file `.env.local` dengan isi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```

### Running Locally

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### Database Migration

Migration SQL sudah tersedia di `supabase/migrations/001_create_debts.sql`. Jalankan melalui Supabase dashboard atau CLI:

```bash
supabase migration up
```

## Features

### Authentication
- Signup & login dengan email + password (Supabase Auth)
- Logout button
- Halaman dashboard hanya bisa diakses user yang login

### Dashboard
- **Summary Cards** (3 card):
  - Total dihutang ke saya
  - Total saya hutang
  - Net (X - Y, warna hijau/merah)

- **Debt List**:
  - Nama orang
  - Tipe (dihutang / saya hutang)
  - Jumlah (format Rp 1.234.000 dengan locale id-ID)
  - Tanggal relative ("3 hari lalu", "kemarin")
  - Status: Belum lunas / Lunas
  - Aksi: Tandai lunas, Edit, Hapus

- **Filters**:
  - Status (Semua / Belum / Lunas)
  - Tipe (Semua / Dihutang / Hutang)

### Form Catat Baru / Edit
- Tipe (radio): Saya dihutang / Saya hutang
- Nama orang (text, required)
- Jumlah (number, required, dalam Rupiah)
- Tanggal (optional, default hari ini)
- Catatan (optional, max 200 char)
- Validasi client + server

### API Endpoints

| Method | Path | Function |
|--------|------|----------|
| GET | /api/debts | List debt user (query: ?status= ?type=) |
| POST | /api/debts | Create entry baru |
| PATCH | /api/debts/[id] | Update (termasuk tandai lunas) |
| DELETE | /api/debts/[id] | Hapus entry |

Semua endpoint:
- Wajib auth (Supabase JWT)
- TypeScript proper (no any)
- Validasi input
- Error response Bahasa Indonesia

### Database

**Tabel debts**:
- `id` (uuid, PK)
- `user_id` (uuid, FK ke auth.users)
- `type` (enum: owed_to_me / i_owe)
- `counterpart_name` (text)
- `amount` (bigint, dalam Rupiah utuh - bukan desimal)
- `note` (text, nullable)
- `due_date` (date, nullable)
- `settled_at` (timestamptz, nullable - null = belum lunas)
- `created_at`, `updated_at`

**Row Level Security (RLS)**:
- User hanya bisa SELECT/INSERT/UPDATE/DELETE row miliknya
- Aman dari akses data user lain via Supabase REST API

## Deployment

### Deploy to Vercel

```bash
git push origin main
```

Vercel akan auto-deploy dari repository.

Konfigurasi environment variables di Vercel:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Technical Approach

Kasbon dibangun dengan memisahkan concerns secara jelas: API layer yang bertanggung jawab untuk validasi dan authorization, component layer untuk UI/UX, dan utility layer untuk formatasi dan helper functions. RLS digunakan sebagai security layer pertama untuk mencegah data breach di database level, bukan hanya di aplikasi. Data formatting (Rupiah, relative time) menggunakan locale id-ID yang standard di browser, sehingga responsif terhadap timezone dan locale pengguna.

## Trade-offs & Future Improvements

Dalam 1 hari lagi, kita bisa improve:
- **Search functionality** - search by nama orang untuk list yang panjang
- **Sort & Group** - sort by jumlah/tanggal, group multiple debts dari orang sama
- **Visualization** - bar chart untuk compare total dihutang vs hutang
- **Mobile Polish** - haptic feedback, smooth animations, bottom sheet optimization
- **Error Resilience** - offline mode, retry logic, more granular error states

## Time Spent

Estimasi development: ~4 jam (setup Supabase + auth + API + components + styling)

## Notes

- Semua data dari Supabase, tidak ada hardcode
- RLS enforced di database level
- Format Rupiah pakai locale id-ID (Rp 1.234.000)
- Relative time display ("3 hari lalu", "kemarin")
- UI casual dan user-friendly, Bahasa Indonesia natural
- TypeScript strict, minimal `any`
- Commit history meaningful dengan 5+ commits
