-- Upgrade: if the table was created with an integer PK (older migration), replace with UUID.
-- Skips when farmers_practicing_id is already UUID.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'farmers_practicing_natural_farming'
      AND c.column_name = 'farmers_practicing_id'
      AND c.data_type = 'integer'
  ) THEN
    DROP TABLE "farmers_practicing_natural_farming" CASCADE;

    CREATE TABLE "farmers_practicing_natural_farming" (
        "farmers_practicing_id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "kvk_id" INTEGER NOT NULL,
        "reporting_year" TIMESTAMP(3),
        "farmer_name" TEXT NOT NULL,
        "contact_number" TEXT NOT NULL,
        "village_name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "no_of_indigenous_cows" INTEGER,
        "land_holding" DOUBLE PRECISION,
        "normal_crops_grown" INTEGER,
        "practicing_years_of_natural_farming" TEXT,
        "area_covered_under_natural_farming" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "crop_grown_under_natural_farming" TEXT NOT NULL DEFAULT '',
        "natural_farming_technology_practicing_adopted" TEXT NOT NULL DEFAULT '',
        "plant_height_without" DOUBLE PRECISION,
        "plant_height_with" DOUBLE PRECISION,
        "other_relevant_parameter_without" DOUBLE PRECISION,
        "other_relevant_parameter_with" DOUBLE PRECISION,
        "yield_without" DOUBLE PRECISION,
        "yield_with" DOUBLE PRECISION,
        "cost_without" DOUBLE PRECISION,
        "cost_with" DOUBLE PRECISION,
        "gross_return_without" DOUBLE PRECISION,
        "gross_return_with" DOUBLE PRECISION,
        "net_return_without" DOUBLE PRECISION,
        "net_return_with" DOUBLE PRECISION,
        "bc_ratio_without" DOUBLE PRECISION,
        "bc_ratio_with" DOUBLE PRECISION,
        "soil_ph_without" DOUBLE PRECISION,
        "soil_ph_with" DOUBLE PRECISION,
        "soil_oc_without" DOUBLE PRECISION,
        "soil_oc_with" DOUBLE PRECISION,
        "soil_ec_without" DOUBLE PRECISION,
        "soil_ec_with" DOUBLE PRECISION,
        "available_n_without" DOUBLE PRECISION,
        "available_n_with" DOUBLE PRECISION,
        "available_p_without" DOUBLE PRECISION,
        "available_p_with" DOUBLE PRECISION,
        "available_k_without" DOUBLE PRECISION,
        "available_k_with" DOUBLE PRECISION,
        "soil_microbes_without" DOUBLE PRECISION,
        "soil_microbes_with" DOUBLE PRECISION,
        "any_other_without" DOUBLE PRECISION,
        "any_other_with" DOUBLE PRECISION,
        "farmer_feedback" TEXT NOT NULL DEFAULT '',
        "images" TEXT,

        CONSTRAINT "farmers_practicing_natural_farming_pkey" PRIMARY KEY ("farmers_practicing_id")
    );

    CREATE INDEX "farmers_practicing_natural_farming_kvk_id_idx" ON "farmers_practicing_natural_farming"("kvk_id");

    ALTER TABLE "farmers_practicing_natural_farming" ADD CONSTRAINT "farmers_practicing_natural_farming_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
