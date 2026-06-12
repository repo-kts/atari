-- "Other" option support for CRA, ARYA, TSP/SCSP, Natural Farming (soil), Agri-Drone.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the form record when that option is selected.

-- Master flags
ALTER TABLE "cra_croping_system" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "cra_farming_system" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "enterprise_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tsp_scsp_district" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "natural_farming_soil_parameter_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "agri_drone_demonstrations_on_master" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

-- Form record "Other" free-text columns
ALTER TABLE "cra_details" ADD COLUMN "cropping_system_other" TEXT;
ALTER TABLE "cra_details" ADD COLUMN "farming_system_other" TEXT;
ALTER TABLE "arya_current_year" ADD COLUMN "enterprise_other" TEXT;
ALTER TABLE "arya_prev_year" ADD COLUMN "enterprise_other" TEXT;
ALTER TABLE "tsp_scsp" ADD COLUMN "activity_other" TEXT;
ALTER TABLE "soil_data_information" ADD COLUMN "soil_parameter_other" TEXT;
ALTER TABLE "kvk_agri_drone_demonstration" ADD COLUMN "demonstrations_on_other" TEXT;
