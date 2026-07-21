ALTER TABLE "kvk_infrastructure"
    ALTER COLUMN "not_yet_started" DROP NOT NULL,
    ALTER COLUMN "completed_plinth_level" DROP NOT NULL,
    ALTER COLUMN "completed_lintel_level" DROP NOT NULL,
    ALTER COLUMN "completed_roof_level" DROP NOT NULL,
    ALTER COLUMN "totally_completed" DROP NOT NULL,
    ALTER COLUMN "plinth_area_sqm" DROP NOT NULL,
    ALTER COLUMN "plinth_area_sqm" DROP DEFAULT;
