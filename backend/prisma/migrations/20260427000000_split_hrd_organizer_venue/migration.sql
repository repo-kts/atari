-- Split organizer_venue into organizer + venue.
-- Existing rows: keep their value as `organizer`, leave `venue` empty.
ALTER TABLE "hrd_program" RENAME COLUMN "organizer_venue" TO "organizer";
ALTER TABLE "hrd_program" ADD COLUMN "venue" TEXT NOT NULL DEFAULT '';
