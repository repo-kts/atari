-- Align with other NARI forms: status defaults when not sent on create.
ALTER TABLE "nari_bio_fortified_crop" ALTER COLUMN "status" SET DEFAULT 'ONGOING';
