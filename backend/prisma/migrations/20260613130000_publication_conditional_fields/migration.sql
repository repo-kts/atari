-- AlterTable
ALTER TABLE "kvk_publication_details" ALTER COLUMN "journal_name" DROP NOT NULL,
ADD COLUMN "publisher_name" TEXT,
ADD COLUMN "venue" TEXT,
ADD COLUMN "isbn_number" TEXT;
