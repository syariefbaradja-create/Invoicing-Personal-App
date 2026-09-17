# Invoicing Tool — Freelance Syarief

Internal invoicing tool untuk pekerjaan freelance digital marketing (Meta/TikTok/Google Ads) ke klien. Single-user, tanpa biaya langganan pihak ketiga. Lihat [PRD](./PRD_Invoicing_Tool_-_Freelance_Syarief.md.txt) untuk detail requirement.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via Prisma ORM
- PDF generation via `@react-pdf/renderer`
- Auth: password/PIN sederhana (cookie session, bukan multi-user)

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Login pakai password dari `.env` (`APP_PASSWORD`).

**Sebelum dipakai:** ganti `APP_PASSWORD` di `.env` dari nilai default, dan jangan commit file `.env`.

## Status implementasi

Sudah jalan:

- [x] Auth password/PIN + session cookie
- [x] Contacts: CRUD klien + riwayat invoice per klien
- [x] Invoices: buat/edit, nomor otomatis (`INV-YYYY-NNN`, reset per tahun), item + qty + harga + subtotal otomatis, diskon (%/nominal), pajak opsional (default off), catatan/terms, live preview
- [x] Status invoice: Draft → Terkirim → Lunas/Belum Lunas, filter list termasuk Overdue (dihitung dari due date, bukan status terpisah)
- [x] Duplicate invoice
- [x] Export PDF multi-theme (`/invoices/[id]/pdf`) — Modern Bold, Minimal Clean, Classic Professional, masing-masing layout berbeda
- [x] Dashboard: tertagih bulan ini, belum dibayar, jumlah overdue, 5 invoice terbaru — semua dihitung langsung dari status invoice (tidak ada pencatatan ganda)
- [x] Settings: profil bisnis, logo bisnis (upload + preview + hapus), rekening bank, prefix nomor invoice, default theme, currency
- [x] Desain visual (via skill `ui-ux-pro-max`): palet navy/hijau untuk finance tool, IBM Plex Sans, Phosphor icons, status badge semantik
- [x] Export data CSV/JSON (`/api/export`) — Contacts, Invoices, Invoice Items per CSV, atau backup lengkap dalam satu JSON

Belum dikerjakan (di luar scope sesi ini):

- [ ] Backup database otomatis terjadwal (saat ini manual via halaman Settings → Export Data)
- [ ] Logo SVG belum tampil di PDF (react-pdf hanya render raster — PNG/JPG/WEBP)

## Catatan teknis

- Database file: `prisma/dev.db` (di-gitignore — backup manual secara berkala).
- Nomor invoice reset otomatis tiap tahun (`INV-2026-001`, dst.), disimpan di tabel `BusinessProfile`.
- Status "Overdue" adalah status turunan (invoice `SENT`/`UNPAID` dengan `dueDate` terlewat), bukan status tersimpan terpisah — sesuai prinsip "status invoice adalah satu-satunya sumber data" di PRD.
