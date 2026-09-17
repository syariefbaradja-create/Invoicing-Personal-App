-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessName" TEXT NOT NULL DEFAULT '',
    "ownerName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankBranch" TEXT,
    "defaultTheme" TEXT NOT NULL DEFAULT 'MODERN_BOLD',
    "primaryColor" TEXT NOT NULL DEFAULT '#1E3A5F',
    "accentColor" TEXT NOT NULL DEFAULT '#059669',
    "fontChoice" TEXT NOT NULL DEFAULT 'Helvetica',
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "nextInvoiceSeq" INTEGER NOT NULL DEFAULT 1,
    "invoiceSeqYear" INTEGER NOT NULL DEFAULT 0,
    "defaultTerms" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BusinessProfile" ("accentColor", "address", "bankAccountName", "bankAccountNumber", "bankBranch", "bankName", "businessName", "currency", "defaultTerms", "defaultTheme", "email", "fontChoice", "id", "invoicePrefix", "invoiceSeqYear", "logoUrl", "nextInvoiceSeq", "ownerName", "phone", "primaryColor", "updatedAt") SELECT "accentColor", "address", "bankAccountName", "bankAccountNumber", "bankBranch", "bankName", "businessName", "currency", "defaultTerms", "defaultTheme", "email", "fontChoice", "id", "invoicePrefix", "invoiceSeqYear", "logoUrl", "nextInvoiceSeq", "ownerName", "phone", "primaryColor", "updatedAt" FROM "BusinessProfile";
DROP TABLE "BusinessProfile";
ALTER TABLE "new_BusinessProfile" RENAME TO "BusinessProfile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
