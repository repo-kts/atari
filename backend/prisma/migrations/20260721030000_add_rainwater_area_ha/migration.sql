-- BLA-51 adds the covered area to Rain Water Harvesting records.
ALTER TABLE "rainwater_harvesting"
ADD COLUMN "area_ha" DOUBLE PRECISION NOT NULL DEFAULT 0;
