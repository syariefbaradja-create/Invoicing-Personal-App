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

Sudah jalan (fungsional, styling masih dasar — desain visual final akan dikerjakan terpisah menggunakan skill `ui-ux-pro-max`):

- [x] Auth password/PIN + session cookie
- [x] Contacts: CRUD klien + riwayat invoice per klien
- [x] Invoices: buat/edit, nomor otomatis (`INV-YYYY-NNN`, reset per tahun), item + qty + harga + subtotal otomatis, diskon (%/nominal), pajak opsional (default off), catatan/terms, live preview
- [x] Status invoice: Draft → Terkirim → Lunas/Belum Lunas, filter list termasuk Overdue (dihitung dari due date, bukan status terpisah)
- [x] Duplicate invoice
- [x] Export PDF (`/invoices/[id]/pdf`)
- [x] Dashboard: tertagih bulan ini, belum dibayar, jumlah overdue, 5 invoice terbaru — semua dihitung langsung dari status invoice (tidak ada pencatatan ganda)
- [x] Settings: profil bisnis, rekening bank, prefix nomor invoice, default theme, currency

Belum dikerjakan (di luar scope sesi ini):

- [ ] Desain visual final (warna, tipografi, layout per Design Direction di PRD) — menyusul via skill `ui-ux-pro-max`
- [ ] Upload logo & kustomisasi warna/font per invoice
- [ ] Multi-theme rendering di PDF (saat ini satu layout PDF netral untuk semua theme)
- [ ] Export data CSV/JSON (portabilitas)
- [ ] Backup database otomatis

## Catatan teknis

- Database file: `prisma/dev.db` (di-gitignore — backup manual secara berkala).
- Nomor invoice reset otomatis tiap tahun (`INV-2026-001`, dst.), disimpan di tabel `BusinessProfile`.
- Status "Overdue" adalah status turunan (invoice `SENT`/`UNPAID` dengan `dueDate` terlewat), bukan status tersimpan terpisah — sesuai prinsip "status invoice adalah satu-satunya sumber data" di PRD.
