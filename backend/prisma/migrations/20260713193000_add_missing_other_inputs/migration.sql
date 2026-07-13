ALTER TABLE "kvk_infrastructure"
ADD COLUMN "source_of_funding_other" TEXT;

ALTER TABLE "kvk_soil_water_analysis"
ADD COLUMN "samples_analysed_through_other" TEXT;

ALTER TABLE "district_level_data"
ADD COLUMN "account_type_other" TEXT;
