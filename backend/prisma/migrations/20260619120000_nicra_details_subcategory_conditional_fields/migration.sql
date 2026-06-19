-- NICRA Details: subcategory-specific conditional fields.
-- All columns are nullable and additive — only the field set relevant to the
-- selected NICRA sub-category is populated by the form. Non-destructive.

ALTER TABLE "nicra_details"
    -- NRM > Rainwater harvesting structures developed
    ADD COLUMN "new_nos" INTEGER,
    ADD COLUMN "renovated_nos" INTEGER,
    ADD COLUMN "storage_capacity_cu_m" DOUBLE PRECISION,
    ADD COLUMN "protective_irrigation_potential_ha" DOUBLE PRECISION,
    ADD COLUMN "cropping_intensity_increase_pct" DOUBLE PRECISION,
    -- Crop production > Integration of cropping system with other farming
    ADD COLUMN "fodder_quantity_utilized" DOUBLE PRECISION,
    ADD COLUMN "reduced_fodder_purchase_pct" DOUBLE PRECISION,
    -- Crop production > Performance of Community nurseries
    ADD COLUMN "coverage_area_ha" DOUBLE PRECISION,
    -- Livestock & Fisheries > vaccination camps / Goat-sheep-pig / poultry
    ADD COLUMN "type_of_animal" TEXT,
    ADD COLUMN "no_of_animal_covered" INTEGER,
    ADD COLUMN "less_one_yr_calf" INTEGER,
    ADD COLUMN "heifer" INTEGER,
    ADD COLUMN "adult" INTEGER,
    ADD COLUMN "kid" INTEGER,
    ADD COLUMN "buck" INTEGER,
    ADD COLUMN "doe" INTEGER,
    ADD COLUMN "chick_lt_9_weeks" INTEGER,
    ADD COLUMN "growing_chickens_9_to_20_weeks" INTEGER,
    ADD COLUMN "gt_20_weeks" INTEGER,
    -- Livestock & Fisheries > Performance of fish in the ponds/ water bodies
    ADD COLUMN "fish_species" TEXT,
    ADD COLUMN "fish_yield" DOUBLE PRECISION,
    -- Livestock demonstration in NICRA adopted villages (Buffalo/Cow/Goat/Poultry)
    ADD COLUMN "animal_name" TEXT,
    ADD COLUMN "no_of_animals_unit" INTEGER,
    ADD COLUMN "milk_yield" DOUBLE PRECISION,
    -- Performance of improved shelters for poultry and dairy animals
    ADD COLUMN "demo_unit_size_nos" INTEGER,
    ADD COLUMN "survival_rate_demo" DOUBLE PRECISION,
    ADD COLUMN "survival_rate_local" DOUBLE PRECISION,
    ADD COLUMN "survival_increase_pct" DOUBLE PRECISION;
