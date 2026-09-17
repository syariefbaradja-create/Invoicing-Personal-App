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
- [x] Dashboard: tertagih bulan ini, belum dibayar, jumlah overdue, tren cashflow bulanan (chart 6 bulan), 5 invoice terbaru — semua dihitung langsung dari status invoice (tidak ada pencatatan ganda)
- [x] Invoices: filter status + filter periode (Semua Waktu/Bulan Ini/Tahun Ini), bisa dikombinasikan
- [x] Settings: profil bisnis, logo bisnis (upload + preview + hapus), rekening bank, prefix nomor invoice, default theme, currency, warna utama & aksen invoice, pilihan font PDF (Sans/Serif/Mono)
- [x] Desain visual (via skill `ui-ux-pro-max`): palet navy/hijau untuk finance tool, IBM Plex Sans, Phosphor icons, status badge semantik
- [x] Export data CSV/JSON (`/api/export`) — Contacts, Invoices, Invoice Items per CSV, atau backup lengkap dalam satu JSON
- [x] Additional charges (biaya tambahan custom, nominal/%) per invoice
- [x] Diskon per-item (selain diskon level invoice, keduanya bisa dipakai bersamaan)
- [x] Total terbilang (mis. "Empat Juta Enam Ratus Lima Puluh Ribu Rupiah") di preview, PDF, dan halaman publik — khusus currency IDR
- [x] Shareable link publik (`/share/[token]`) — klien bisa buka & download PDF invoice tanpa login, link di-generate dari tombol "Share Link" di halaman invoice
- [x] Tanda tangan digital — upload gambar signature di Settings, otomatis tampil di semua invoice PDF (raster only, sama seperti logo)
- [x] Attachments per invoice — upload PDF/gambar (maks 5MB) di halaman invoice, bisa didownload dari halaman detail maupun share link publik
- [x] Recurring invoice — tandai invoice sebagai template (mingguan/bulanan/tiap 3 bulan/tahunan), draft baru otomatis dibuat begitu jatuh temponya lewat (dicek tiap kali Dashboard dibuka — tidak perlu cron server terpisah)
- [x] Payment tracking parsial — catat pembayaran bertahap (Amount Received, Transaction Charge, metode, tanggal), progress bar "Rp X Collected / Rp Y Due" di invoice & halaman share publik, status otomatis jadi Lunas begitu terkumpul penuh
- [x] Layout PDF lanjutan (dari Fase 3) — ukuran halaman (A4/Letter/Legal), margin (Sempit/Normal/Lebar, skala proporsional per theme), watermark diagonal dengan teks custom (mis. "DRAFT"), semua diatur global di Settings

Fase 1 dan sebagian besar Fase 2 dari roadmap Refrens (lihat memory project) sudah selesai, plus satu item Fase 3 (layout PDF lanjutan) yang kompleksitasnya rendah. Belum dikerjakan (di luar scope sesi ini):

- [ ] Reminder email (butuh layanan pengirim email — SMTP/Resend/dll — belum disiapkan)
- [ ] Backup database otomatis terjadwal (saat ini manual via halaman Settings → Export Data)
- [ ] Logo/signature SVG belum tampil di PDF (react-pdf hanya render raster — PNG/JPG/WEBP)
- [ ] Custom formula columns, payment gateway, approval workflow, audit trail, credit/debit note, early-pay discount (sisa Fase 3 — sengaja ditunda, lihat dokumen roadmap)

## Catatan teknis

- Database file: `prisma/dev.db` (di-gitignore — backup manual secara berkala).
- Nomor invoice reset otomatis tiap tahun (`INV-2026-001`, dst.), disimpan di tabel `BusinessProfile`.
- Status "Overdue" adalah status turunan (invoice `SENT`/`UNPAID` dengan `dueDate` terlewat), bukan status tersimpan terpisah — sesuai prinsip "status invoice adalah satu-satunya sumber data" di PRD.
- Recurring invoice tidak pakai cron/scheduler terpisah — `processRecurringInvoices()` dipanggil tiap Dashboard dimuat, cukup untuk pola pemakaian harian single-user. Kalau Dashboard tidak dibuka berhari-hari, draft baru baru muncul saat dibuka lagi (bukan generate tepat waktu).
