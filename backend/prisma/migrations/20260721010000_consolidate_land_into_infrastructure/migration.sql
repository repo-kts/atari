-- BLA-49: consolidate land information into Infrastructure Details.
-- Existing land-detail rows are intentionally retained as historical data.
ALTER TABLE "kvk_infrastructure"
  ADD COLUMN "total_area_sqm" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "description" TEXT;
