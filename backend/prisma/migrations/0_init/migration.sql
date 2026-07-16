-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('KVK', 'REVOLVING_FUND', 'OTHER');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PERMANENT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('ACTIVE', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "PayLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6', 'LEVEL_10', 'LEVEL_10R', 'LEVEL_11', 'LEVEL_11R', 'LEVEL_12', 'LEVEL_12R', 'LEVEL_13A', 'LEVEL_14');

-- CreateEnum
CREATE TYPE "FldStatus" AS ENUM ('ONGOING', 'COMPLETED', 'TRANSFERRED_TO_NEXT_YEAR');

-- CreateEnum
CREATE TYPE "OftStatus" AS ENUM ('ONGOING', 'COMPLETED', 'TRANSFERRED_TO_NEXT_YEAR');

-- CreateEnum
CREATE TYPE "CfldTechnicalWorkflowStatus" AS ENUM ('ONGOING', 'TRANSFERRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DrmrActivityType" AS ENUM ('TRAINING', 'FRONTLINE_DEMONSTRATION', 'AWARENESS_CAMP', 'INPUT_SEEDS', 'INPUT_SMALL_EQUIPMENT', 'INPUT_LARGE_EQUIPMENT', 'INPUT_FERTILIZER', 'INPUT_PPC', 'LITERATURE_DISTRIBUTION', 'KISAN_MELA', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "FarmerCategory" AS ENUM ('GENERAL', 'OBC', 'SC', 'ST');

-- CreateEnum
CREATE TYPE "Month" AS ENUM ('JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER');

-- CreateEnum
CREATE TYPE "TspScspType" AS ENUM ('TSP', 'SCSP');

-- CreateEnum
CREATE TYPE "CampusType" AS ENUM ('ON_CAMPUS', 'OFF_CAMPUS');

-- CreateEnum
CREATE TYPE "FormAttachmentKind" AS ENUM ('PHOTO', 'DATASHEET', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "PpvFraTrainingType" AS ENUM ('TRAINING', 'AWARENESS');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('VIEW', 'ADD', 'EDIT', 'DELETE');

-- CreateTable
CREATE TABLE "kvk_bank_account" (
    "bank_account_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "account_name" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_bank_account_pkey" PRIMARY KEY ("bank_account_id")
);

-- CreateTable
CREATE TABLE "kvk_staff" (
    "kvk_staff_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "staff_name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "photo_path" TEXT,
    "resume_path" TEXT,
    "sanctionedPostId" INTEGER,
    "position_order" INTEGER NOT NULL,
    "disciplineId" INTEGER,
    "pay_scale_id" INTEGER,
    "date_of_joining" TIMESTAMP(3) NOT NULL,
    "job_type" "JobType",
    "allowances" TEXT,
    "transfer_status" "TransferStatus" NOT NULL DEFAULT 'ACTIVE',
    "source_kvk_ids" JSONB,
    "original_kvk_id" INTEGER,
    "transfer_count" INTEGER NOT NULL DEFAULT 0,
    "last_transfer_date" TIMESTAMP(3),
    "staffCategoryId" INTEGER,
    "payLevelId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_staff_pkey" PRIMARY KEY ("kvk_staff_id")
);

-- CreateTable
CREATE TABLE "kvk_equipment" (
    "equipment_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "equipment_type_id" INTEGER,
    "equipment_master_id" INTEGER,
    "equipment_name" TEXT,
    "company_brand_model" TEXT,
    "identifier_code" TEXT,
    "year_of_purchase" INTEGER NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "asset_funding_source_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_equipment_pkey" PRIMARY KEY ("equipment_id")
);

-- CreateTable
CREATE TABLE "kvk_equipment_detail" (
    "equipment_detail_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3) NOT NULL,
    "asset_funding_source_id" INTEGER,
    "equipment_status_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_equipment_detail_pkey" PRIMARY KEY ("equipment_detail_id")
);

-- CreateTable
CREATE TABLE "kvk_infrastructure" (
    "infra_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "infraMasterId" INTEGER NOT NULL,
    "specify_name" TEXT,
    "not_yet_started" BOOLEAN NOT NULL,
    "completed_plinth_level" BOOLEAN NOT NULL,
    "completed_lintel_level" BOOLEAN NOT NULL,
    "completed_roof_level" BOOLEAN NOT NULL,
    "totally_completed" BOOLEAN NOT NULL,
    "plinth_area_sqm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "under_use" BOOLEAN NOT NULL,
    "source_of_funding" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_infrastructure_pkey" PRIMARY KEY ("infra_id")
);

-- CreateTable
CREATE TABLE "kvk" (
    "kvk_id" SERIAL NOT NULL,
    "kvk_name" TEXT NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "org_id" INTEGER NOT NULL,
    "university_id" INTEGER,
    "mobile" TEXT NOT NULL,
    "landline" TEXT,
    "fax" TEXT,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "host_org_name" TEXT NOT NULL,
    "host_mobile" TEXT,
    "host_landline" TEXT,
    "host_fax" TEXT,
    "host_email" TEXT,
    "host_address" TEXT,
    "year_of_sanction" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_pkey" PRIMARY KEY ("kvk_id")
);

-- CreateTable
CREATE TABLE "kvk_land_details" (
    "land_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "area_ha" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "kvk_land_details_pkey" PRIMARY KEY ("land_id")
);

-- CreateTable
CREATE TABLE "staff_transfer_history" (
    "transfer_id" SERIAL NOT NULL,
    "kvk_staff_id" INTEGER NOT NULL,
    "from_kvk_id" INTEGER NOT NULL,
    "to_kvk_id" INTEGER NOT NULL,
    "transferred_by" INTEGER,
    "transfer_date" TIMESTAMP(3) NOT NULL,
    "transfer_reason" TEXT,
    "notes" TEXT,
    "is_reversal" BOOLEAN NOT NULL DEFAULT false,
    "reversed_transfer_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_transfer_history_pkey" PRIMARY KEY ("transfer_id")
);

-- CreateTable
CREATE TABLE "kvk_vehicle" (
    "vehicle_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "vehicle_name" TEXT NOT NULL,
    "registration_no" TEXT NOT NULL,
    "year_of_purchase" INTEGER NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_vehicle_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "kvk_vehicle_detail" (
    "vehicle_detail_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3) NOT NULL,
    "total_run" TEXT NOT NULL,
    "repairing_cost" DOUBLE PRECISION,
    "asset_funding_source_id" INTEGER,
    "vehicle_status_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_vehicle_detail_pkey" PRIMARY KEY ("vehicle_detail_id")
);

-- CreateTable
CREATE TABLE "farmer_award" (
    "farmer_award_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "farmer_name" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "award_name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "achievement" TEXT NOT NULL,
    "conferring_authority" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_award_pkey" PRIMARY KEY ("farmer_award_id")
);

-- CreateTable
CREATE TABLE "kvk_award" (
    "kvk_award_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "award_name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "achievement" TEXT NOT NULL,
    "conferring_authority" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_award_pkey" PRIMARY KEY ("kvk_award_id")
);

-- CreateTable
CREATE TABLE "scientist_award" (
    "scientist_award_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "scientist_name" TEXT NOT NULL,
    "award_name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "achievement" TEXT NOT NULL,
    "conferring_authority" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scientist_award_pkey" PRIMARY KEY ("scientist_award_id")
);

-- CreateTable
CREATE TABLE "kvk_extension_activity" (
    "kvk_extension_activity_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "fldId" INTEGER,
    "staffId" INTEGER,
    "activityId" INTEGER,
    "number_of_activities" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "farmers_general_m" INTEGER NOT NULL,
    "farmers_general_f" INTEGER NOT NULL,
    "farmers_obc_m" INTEGER NOT NULL,
    "farmers_obc_f" INTEGER NOT NULL,
    "farmers_sc_m" INTEGER NOT NULL,
    "farmers_sc_f" INTEGER NOT NULL,
    "farmers_st_m" INTEGER NOT NULL,
    "farmers_st_f" INTEGER NOT NULL,
    "officials_general_m" INTEGER NOT NULL,
    "officials_general_f" INTEGER NOT NULL,
    "officials_obc_m" INTEGER NOT NULL,
    "officials_obc_f" INTEGER NOT NULL,
    "officials_sc_m" INTEGER NOT NULL,
    "officials_sc_f" INTEGER NOT NULL,
    "officials_st_m" INTEGER NOT NULL,
    "officials_st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_extension_activity_pkey" PRIMARY KEY ("kvk_extension_activity_id")
);

-- CreateTable
CREATE TABLE "kvk_important_day_celebration" (
    "celebration_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "importantDayId" INTEGER NOT NULL,
    "number_of_activities" INTEGER NOT NULL,
    "farmers_general_m" INTEGER NOT NULL,
    "farmers_general_f" INTEGER NOT NULL,
    "farmers_obc_m" INTEGER NOT NULL,
    "farmers_obc_f" INTEGER NOT NULL,
    "farmers_sc_m" INTEGER NOT NULL,
    "farmers_sc_f" INTEGER NOT NULL,
    "farmers_st_m" INTEGER NOT NULL,
    "farmers_st_f" INTEGER NOT NULL,
    "officials_general_m" INTEGER NOT NULL,
    "officials_general_f" INTEGER NOT NULL,
    "officials_obc_m" INTEGER NOT NULL,
    "officials_obc_f" INTEGER NOT NULL,
    "officials_sc_m" INTEGER NOT NULL,
    "officials_sc_f" INTEGER NOT NULL,
    "officials_st_m" INTEGER NOT NULL,
    "officials_st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_important_day_celebration_pkey" PRIMARY KEY ("celebration_id")
);

-- CreateTable
CREATE TABLE "kvk_other_extension_activity" (
    "kvk_other_extension_activity_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "fldId" INTEGER,
    "staffId" INTEGER,
    "activityTypeId" INTEGER,
    "number_of_activities" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_other_extension_activity_pkey" PRIMARY KEY ("kvk_other_extension_activity_id")
);

-- CreateTable
CREATE TABLE "kvk_technology_week_celebration" (
    "tech_week_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "type_of_activities" TEXT NOT NULL,
    "number_of_activities" INTEGER NOT NULL,
    "related_crop_livestock_technology" TEXT NOT NULL,
    "farmers_general_m" INTEGER NOT NULL,
    "farmers_general_f" INTEGER NOT NULL,
    "farmers_obc_m" INTEGER NOT NULL,
    "farmers_obc_f" INTEGER NOT NULL,
    "farmers_sc_m" INTEGER NOT NULL,
    "farmers_sc_f" INTEGER NOT NULL,
    "farmers_st_m" INTEGER NOT NULL,
    "farmers_st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_technology_week_celebration_pkey" PRIMARY KEY ("tech_week_id")
);

-- CreateTable
CREATE TABLE "fld_extension" (
    "extension_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "fldId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "number_of_activities" INTEGER NOT NULL,
    "remarks" TEXT,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "fld_extension_pkey" PRIMARY KEY ("extension_id")
);

-- CreateTable
CREATE TABLE "kvk_fld_introduction" (
    "kvk_fld_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "kvkStaffId" INTEGER NOT NULL,
    "seasonId" INTEGER,
    "sectorId" INTEGER,
    "thematicAreaId" INTEGER,
    "categoryId" INTEGER,
    "subCategoryId" INTEGER,
    "cropId" INTEGER,
    "fld_name" TEXT NOT NULL,
    "no_of_demonstration" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "expected_completion_date" TIMESTAMP(3),
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "ongoing_completed" "FldStatus" NOT NULL DEFAULT 'ONGOING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_fld_introduction_pkey" PRIMARY KEY ("kvk_fld_id")
);

-- CreateTable
CREATE TABLE "kvk_fld_result" (
    "fld_result_id" SERIAL NOT NULL,
    "kvk_fld_id" INTEGER NOT NULL,
    "demo_yield" DOUBLE PRECISION NOT NULL,
    "check_yield" DOUBLE PRECISION NOT NULL,
    "increase_percent" DOUBLE PRECISION NOT NULL,
    "demo_gross_cost" DOUBLE PRECISION NOT NULL,
    "demo_gross_return" DOUBLE PRECISION NOT NULL,
    "demo_net_return" DOUBLE PRECISION NOT NULL,
    "demo_bcr" DOUBLE PRECISION NOT NULL,
    "check_gross_cost" DOUBLE PRECISION NOT NULL,
    "check_gross_return" DOUBLE PRECISION NOT NULL,
    "check_net_return" DOUBLE PRECISION NOT NULL,
    "check_bcr" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_fld_result_pkey" PRIMARY KEY ("fld_result_id")
);

-- CreateTable
CREATE TABLE "fld_technical_feedback" (
    "feedback_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "fldId" INTEGER NOT NULL,
    "cropId" INTEGER,
    "feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "fld_technical_feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "oft_technology_type" (
    "oft_technology_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oft_technology_type_pkey" PRIMARY KEY ("oft_technology_type_id")
);

-- CreateTable
CREATE TABLE "kvk_oft_technology" (
    "kvk_oft_technology_id" SERIAL NOT NULL,
    "kvkOftId" INTEGER NOT NULL,
    "oftTechnologyTypeId" INTEGER,
    "option_key" TEXT NOT NULL,
    "option_name" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_oft_technology_pkey" PRIMARY KEY ("kvk_oft_technology_id")
);

-- CreateTable
CREATE TABLE "kvk_oft" (
    "kvk_oft_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "seasonId" INTEGER,
    "staffId" INTEGER NOT NULL,
    "oftSubjectId" INTEGER,
    "oftThematicAreaId" INTEGER,
    "disciplineId" INTEGER,
    "source_of_funding_id" INTEGER,
    "unit" TEXT,
    "title_of_oft" TEXT NOT NULL,
    "problem_diagnosed" TEXT NOT NULL,
    "source_of_technology" TEXT NOT NULL,
    "production_system_and_thematic_area" TEXT NOT NULL,
    "performance_indicators" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "number_of_location" INTEGER NOT NULL,
    "number_of_trial_replication" INTEGER NOT NULL,
    "oft_start_date" TIMESTAMP(3) NOT NULL,
    "oft_end_date" TIMESTAMP(3),
    "expected_completion_date" TIMESTAMP(3),
    "critical_input" TEXT NOT NULL,
    "cost_of_oft" DOUBLE PRECISION NOT NULL,
    "farmers_general_m" INTEGER NOT NULL,
    "farmers_general_f" INTEGER NOT NULL,
    "farmers_obc_m" INTEGER NOT NULL,
    "farmers_obc_f" INTEGER NOT NULL,
    "farmers_sc_m" INTEGER NOT NULL,
    "farmers_sc_f" INTEGER NOT NULL,
    "farmers_st_m" INTEGER NOT NULL,
    "farmers_st_f" INTEGER NOT NULL,
    "ongoing_completed" "OftStatus" NOT NULL DEFAULT 'ONGOING',
    "transferred_from_oft_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_oft_pkey" PRIMARY KEY ("kvk_oft_id")
);

-- CreateTable
CREATE TABLE "oft_result_report" (
    "oft_result_report_id" SERIAL NOT NULL,
    "kvk_oft_id" INTEGER NOT NULL,
    "final_recommendation" TEXT NOT NULL,
    "constraints_feedback" TEXT NOT NULL,
    "farmers_participation_process" TEXT NOT NULL,
    "result_text" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "supplementary_datasheet_path" TEXT,
    "supplementary_datasheet_name" TEXT,
    "supplementary_datasheet_size" INTEGER,
    "supplementary_datasheet_mime" TEXT,
    "photograph_path" TEXT,
    "photograph_name" TEXT,
    "photograph_size" INTEGER,
    "photograph_mime" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oft_result_report_pkey" PRIMARY KEY ("oft_result_report_id")
);

-- CreateTable
CREATE TABLE "oft_result_table" (
    "oft_result_table_id" SERIAL NOT NULL,
    "oft_result_report_id" INTEGER NOT NULL,
    "table_title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oft_result_table_pkey" PRIMARY KEY ("oft_result_table_id")
);

-- CreateTable
CREATE TABLE "oft_result_table_column" (
    "oft_result_table_column_id" SERIAL NOT NULL,
    "oft_result_table_id" INTEGER NOT NULL,
    "column_key" TEXT NOT NULL,
    "column_label" TEXT NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oft_result_table_column_pkey" PRIMARY KEY ("oft_result_table_column_id")
);

-- CreateTable
CREATE TABLE "oft_result_table_row" (
    "oft_result_table_row_id" SERIAL NOT NULL,
    "oft_result_table_id" INTEGER NOT NULL,
    "option_key" TEXT,
    "row_label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oft_result_table_row_pkey" PRIMARY KEY ("oft_result_table_row_id")
);

-- CreateTable
CREATE TABLE "oft_result_table_cell" (
    "oft_result_table_cell_id" SERIAL NOT NULL,
    "oft_result_table_row_id" INTEGER NOT NULL,
    "oft_result_table_column_id" INTEGER NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oft_result_table_cell_pkey" PRIMARY KEY ("oft_result_table_cell_id")
);

-- CreateTable
CREATE TABLE "kvk_production_supply" (
    "production_supply_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "product_category_id" INTEGER,
    "product_type_id" INTEGER,
    "product_id" INTEGER,
    "species_name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "value_rs" DOUBLE PRECISION NOT NULL,
    "farmers_general_m" INTEGER NOT NULL,
    "farmers_general_f" INTEGER NOT NULL,
    "farmers_obc_m" INTEGER NOT NULL,
    "farmers_obc_f" INTEGER NOT NULL,
    "farmers_sc_m" INTEGER NOT NULL,
    "farmers_sc_f" INTEGER NOT NULL,
    "farmers_st_m" INTEGER NOT NULL,
    "farmers_st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_production_supply_pkey" PRIMARY KEY ("production_supply_id")
);

-- CreateTable
CREATE TABLE "kvk_agri_drone_demonstration" (
    "agri_drone_demonstration_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "agri_drone_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "agri_drone_demonstrations_on_id" INTEGER,
    "district_id" INTEGER,
    "date_of_demonstration" TIMESTAMP(3),
    "place_of_demonstration" TEXT,
    "crop_name" TEXT,
    "no_of_demos" INTEGER,
    "area_ha" DOUBLE PRECISION,
    "no_of_farmers" INTEGER,
    "general_m" INTEGER,
    "general_f" INTEGER,
    "obc_m" INTEGER,
    "obc_f" INTEGER,
    "sc_m" INTEGER,
    "sc_f" INTEGER,
    "st_m" INTEGER,
    "st_f" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_agri_drone_demonstration_pkey" PRIMARY KEY ("agri_drone_demonstration_id")
);

-- CreateTable
CREATE TABLE "kvk_agri_drone" (
    "agri_drone_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "project_implementing_centre" TEXT NOT NULL,
    "drones_sanctioned" INTEGER NOT NULL,
    "drones_purchased" INTEGER NOT NULL,
    "amount_sanctioned" DOUBLE PRECISION NOT NULL,
    "cost_per_drone" DOUBLE PRECISION NOT NULL,
    "drone_company" TEXT NOT NULL,
    "drone_model" TEXT NOT NULL,
    "pilot_name" TEXT NOT NULL,
    "pilot_contact" TEXT NOT NULL,
    "target_area_ha" DOUBLE PRECISION NOT NULL,
    "demo_amount_sanctioned" DOUBLE PRECISION NOT NULL,
    "demo_amount_utilised" DOUBLE PRECISION NOT NULL,
    "operation_type" TEXT NOT NULL,
    "advantages_observed" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "kvk_agri_drone_pkey" PRIMARY KEY ("agri_drone_id")
);

-- CreateTable
CREATE TABLE "arya_prev_year" (
    "arya_prev_year_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "enterpriseId" INTEGER NOT NULL,
    "units_male" INTEGER NOT NULL,
    "units_female" INTEGER NOT NULL,
    "non_functional_units_closed" INTEGER NOT NULL,
    "date_of_closing" TIMESTAMP(3),
    "non_functional_units_restarted" INTEGER NOT NULL,
    "date_of_restart" TIMESTAMP(3),
    "number_of_units" INTEGER NOT NULL,
    "unit_capacity" DOUBLE PRECISION NOT NULL,
    "fixed_cost" DOUBLE PRECISION NOT NULL,
    "variable_cost" DOUBLE PRECISION NOT NULL,
    "total_production_per_unit_year" DOUBLE PRECISION NOT NULL,
    "gross_cost_per_unit_year" DOUBLE PRECISION NOT NULL,
    "gross_return_per_unit_year" DOUBLE PRECISION NOT NULL,
    "net_benefit_per_unit_year" DOUBLE PRECISION NOT NULL,
    "employment_family_mandays" DOUBLE PRECISION NOT NULL,
    "employment_other_mandays" DOUBLE PRECISION NOT NULL,
    "persons_visited_unit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "arya_prev_year_pkey" PRIMARY KEY ("arya_prev_year_id")
);

-- CreateTable
CREATE TABLE "enterprise_master" (
    "enterprise_id" SERIAL NOT NULL,
    "enterprise_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_master_pkey" PRIMARY KEY ("enterprise_id")
);

-- CreateTable
CREATE TABLE "arya_current_year" (
    "arya_current_year_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "enterpriseId" INTEGER NOT NULL,
    "units_male" INTEGER NOT NULL,
    "units_female" INTEGER NOT NULL,
    "viable_units" INTEGER NOT NULL,
    "closed_units" INTEGER NOT NULL,
    "trainings_conducted" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "youth_male" INTEGER NOT NULL,
    "youth_female" INTEGER NOT NULL,
    "groups_formed" INTEGER NOT NULL,
    "groups_active" INTEGER NOT NULL,
    "persons_left_group" INTEGER NOT NULL,
    "members_per_group" INTEGER NOT NULL,
    "avg_size_of_unit" DOUBLE PRECISION NOT NULL,
    "total_production_per_year" DOUBLE PRECISION NOT NULL,
    "per_unit_cost_of_production" DOUBLE PRECISION NOT NULL,
    "sale_value_of_produce" DOUBLE PRECISION NOT NULL,
    "employment_generated_mandays" DOUBLE PRECISION NOT NULL,
    "image_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "arya_current_year_pkey" PRIMARY KEY ("arya_current_year_id")
);

-- CreateTable
CREATE TABLE "budget_item" (
    "budget_item_id" SERIAL NOT NULL,
    "item_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_item_pkey" PRIMARY KEY ("budget_item_id")
);

-- CreateTable
CREATE TABLE "kvk_budget_utilization" (
    "budget_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "reporting_year_date" TIMESTAMP(3),
    "seasonId" INTEGER,
    "cropId" INTEGER,
    "overall_crop_wise_fund_allocation" DOUBLE PRECISION NOT NULL,
    "area_ha_allotted" DOUBLE PRECISION NOT NULL,
    "area_ha_achieved" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_budget_utilization_pkey" PRIMARY KEY ("budget_id")
);

-- CreateTable
CREATE TABLE "kvk_budget_utilization_item" (
    "utilization_item_id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "budgetItemId" INTEGER NOT NULL,
    "budget_received" DOUBLE PRECISION NOT NULL,
    "budget_utilization" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_budget_utilization_item_pkey" PRIMARY KEY ("utilization_item_id")
);

-- CreateTable
CREATE TABLE "extension_activity_organized" (
    "organized_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "seasonId" INTEGER,
    "extensionActivityId" INTEGER NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "place_of_activity" TEXT NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extension_activity_organized_pkey" PRIMARY KEY ("organized_id")
);

-- CreateTable
CREATE TABLE "cfl_cfld_technical_parameter" (
    "cfl_cfld_tech_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "cropId" INTEGER NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "type_id" INTEGER NOT NULL,
    "seasonId" INTEGER,
    "reporting_year" TIMESTAMP(3),
    "status" "CfldTechnicalWorkflowStatus" NOT NULL DEFAULT 'ONGOING',
    "completed_at" TIMESTAMP(3),
    "variety_name" TEXT NOT NULL,
    "area_in_ha" DOUBLE PRECISION NOT NULL,
    "technology_demonstrated" TEXT NOT NULL,
    "existing_farmer_practice" TEXT NOT NULL,
    "farmer_yield" DOUBLE PRECISION NOT NULL,
    "demo_yield_max" DOUBLE PRECISION NOT NULL,
    "demo_yield_min" DOUBLE PRECISION NOT NULL,
    "demo_yield_avg" DOUBLE PRECISION NOT NULL,
    "percent_increase" DOUBLE PRECISION NOT NULL,
    "district_yield" DOUBLE PRECISION NOT NULL,
    "state_yield" DOUBLE PRECISION NOT NULL,
    "potential_yield" DOUBLE PRECISION NOT NULL,
    "yield_gap_district_minimized" DOUBLE PRECISION NOT NULL,
    "yield_gap_state_minimized" DOUBLE PRECISION NOT NULL,
    "yield_gap_potential_minimized" DOUBLE PRECISION NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "training_photo_path" TEXT,
    "quality_action_photo_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cfl_cfld_technical_parameter_pkey" PRIMARY KEY ("cfl_cfld_tech_id")
);

-- CreateTable
CREATE TABLE "cfl_cfld_economic_parameters" (
    "cfl_cfld_economic_id" SERIAL NOT NULL,
    "cfl_cfld_tech_id" INTEGER NOT NULL,
    "status" "CfldTechnicalWorkflowStatus" NOT NULL DEFAULT 'ONGOING',
    "existing_plot_gross_cost" DOUBLE PRECISION,
    "existing_plot_gross_return" DOUBLE PRECISION,
    "existing_plot_net_return" DOUBLE PRECISION,
    "existing_plot_bcr" DOUBLE PRECISION,
    "demonstration_plot_gross_cost" DOUBLE PRECISION,
    "demonstration_plot_gross_return" DOUBLE PRECISION,
    "demonstration_plot_net_return" DOUBLE PRECISION,
    "demonstration_plot_bcr" DOUBLE PRECISION,
    "additional_income" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cfl_cfld_economic_parameters_pkey" PRIMARY KEY ("cfl_cfld_economic_id")
);

-- CreateTable
CREATE TABLE "cfl_cfld_socio_economic_parameters" (
    "cfl_cfld_socio_id" SERIAL NOT NULL,
    "cfl_cfld_tech_id" INTEGER NOT NULL,
    "status" "CfldTechnicalWorkflowStatus" NOT NULL DEFAULT 'ONGOING',
    "total_produce_obtained_kg" DOUBLE PRECISION,
    "produce_sold_kg_per_household" DOUBLE PRECISION,
    "selling_rate_rs_per_kg" DOUBLE PRECISION,
    "produce_used_for_own_sowing_kg" DOUBLE PRECISION,
    "produce_distributed_to_other_farmers_kg" DOUBLE PRECISION,
    "income_utilization_purpose" TEXT,
    "employment_generated_mandays_per_household" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cfl_cfld_socio_economic_parameters_pkey" PRIMARY KEY ("cfl_cfld_socio_id")
);

-- CreateTable
CREATE TABLE "cfl_cfld_farmers_perception_parameters" (
    "cfl_cfld_perception_id" SERIAL NOT NULL,
    "cfl_cfld_tech_id" INTEGER NOT NULL,
    "status" "CfldTechnicalWorkflowStatus" NOT NULL DEFAULT 'ONGOING',
    "suitability_to_farming_system" TEXT,
    "liking_preference" TEXT,
    "affordability" TEXT,
    "any_negative_effect" TEXT,
    "technology_acceptable_to_all_group_village" TEXT,
    "suggestions_for_change_or_improvement_if_any" TEXT,
    "farmer_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cfl_cfld_farmers_perception_parameters_pkey" PRIMARY KEY ("cfl_cfld_perception_id")
);

-- CreateTable
CREATE TABLE "cra_details" (
    "cra_details_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "season_id" INTEGER,
    "technology_demonstrated" TEXT NOT NULL,
    "croping_system" TEXT NOT NULL,
    "cra_croping_system_id" INTEGER,
    "cra_farming_system_id" INTEGER,
    "area_under_demonstration_acre" DOUBLE PRECISION NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,
    "crop_yield_qha" DOUBLE PRECISION NOT NULL,
    "system_productivity_qha" DOUBLE PRECISION NOT NULL,
    "total_return_rsha" DOUBLE PRECISION NOT NULL,
    "yield_obtained_under_farmer_practices_qha" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "cra_details_pkey" PRIMARY KEY ("cra_details_id")
);

-- CreateTable
CREATE TABLE "cra_extension_activity" (
    "cra_extension_activity_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,
    "exposure_visit_no" INTEGER NOT NULL,

    CONSTRAINT "cra_extension_activity_pkey" PRIMARY KEY ("cra_extension_activity_id")
);

-- CreateTable
CREATE TABLE "csisa" (
    "csisa_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "seasonId" INTEGER,
    "villages_covered" INTEGER NOT NULL,
    "blocks_covered" INTEGER NOT NULL,
    "districts_covered" INTEGER NOT NULL,
    "respondents" INTEGER NOT NULL,
    "trial_name" TEXT NOT NULL,
    "area_covered_ha" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "csisa_pkey" PRIMARY KEY ("csisa_id")
);

-- CreateTable
CREATE TABLE "csisa_crop_detail" (
    "csisa_crop_detail_id" SERIAL NOT NULL,
    "csisaId" INTEGER NOT NULL,
    "crop_name" TEXT NOT NULL,
    "technology_option" TEXT NOT NULL,
    "variety_name" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "sowing_date" TIMESTAMP(3) NOT NULL,
    "harvesting_date" TIMESTAMP(3) NOT NULL,
    "days_of_maturity" INTEGER NOT NULL,
    "grain_yield_q_per_ha" DOUBLE PRECISION NOT NULL,
    "cost_of_cultivation_per_ha" DOUBLE PRECISION NOT NULL,
    "gross_return_per_ha" DOUBLE PRECISION NOT NULL,
    "net_return_per_ha" DOUBLE PRECISION NOT NULL,
    "bcr" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "csisa_crop_detail_pkey" PRIMARY KEY ("csisa_crop_detail_id")
);

-- CreateTable
CREATE TABLE "drmr_activity" (
    "drmr_activity_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_budget_utilized" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "drmr_activity_pkey" PRIMARY KEY ("drmr_activity_id")
);

-- CreateTable
CREATE TABLE "drmr_activity_component" (
    "drmr_activity_component_id" SERIAL NOT NULL,
    "drmrActivityId" INTEGER NOT NULL,
    "activity_type" "DrmrActivityType" NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "specification" TEXT,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drmr_activity_component_pkey" PRIMARY KEY ("drmr_activity_component_id")
);

-- CreateTable
CREATE TABLE "drmr_details" (
    "drmr_details_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "situation" TEXT NOT NULL,
    "variety_improved_practice" TEXT NOT NULL,
    "variety_farmer_practice" TEXT NOT NULL,
    "yield_improved_kg_per_ha" DOUBLE PRECISION NOT NULL,
    "yield_farmer_kg_per_ha" DOUBLE PRECISION NOT NULL,
    "yield_increase_percent" DOUBLE PRECISION NOT NULL,
    "cost_improved_per_ha" DOUBLE PRECISION NOT NULL,
    "cost_farmer_per_ha" DOUBLE PRECISION NOT NULL,
    "gross_return_improved_per_ha" DOUBLE PRECISION NOT NULL,
    "gross_return_farmer_per_ha" DOUBLE PRECISION NOT NULL,
    "net_return_improved_per_ha" DOUBLE PRECISION NOT NULL,
    "net_return_farmer_per_ha" DOUBLE PRECISION NOT NULL,
    "bc_ratio_improved" DOUBLE PRECISION NOT NULL,
    "bc_ratio_farmer" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "drmr_details_pkey" PRIMARY KEY ("drmr_details_id")
);

-- CreateTable
CREATE TABLE "fpo_cbbo_details" (
    "fpo_cbbo_details_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "blocks_allocated" INTEGER NOT NULL,
    "fpos_registered_as_cbbo" INTEGER NOT NULL,
    "avg_members_per_fpo" INTEGER NOT NULL,
    "fpos_received_management_cost" INTEGER NOT NULL,
    "fpos_received_equity_grant" INTEGER NOT NULL,
    "tech_backstopping_provided" INTEGER NOT NULL,
    "training_programme_organized" INTEGER NOT NULL,
    "training_received_by_members" BOOLEAN NOT NULL,
    "assistance_in_economic_activities" INTEGER NOT NULL,
    "business_plan_prepared_with_cbbo" BOOLEAN NOT NULL,
    "business_plan_prepared_without_cbbo" BOOLEAN NOT NULL,
    "fpos_doing_business" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "fpo_cbbo_details_pkey" PRIMARY KEY ("fpo_cbbo_details_id")
);

-- CreateTable
CREATE TABLE "fpo_management" (
    "fpo_management_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "fpo_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "proposed_activity" TEXT NOT NULL,
    "commodity_identified" TEXT NOT NULL,
    "total_bom_members" INTEGER NOT NULL,
    "total_farmers_attached" INTEGER NOT NULL,
    "financial_position_lakh" DOUBLE PRECISION NOT NULL,
    "success_indicator" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "fpo_management_pkey" PRIMARY KEY ("fpo_management_id")
);

-- CreateTable
CREATE TABLE "nari_bio_fortified_crop" (
    "nari_bio_fortified_crop_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "season_id" INTEGER NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "name_of_nutri_smart_village" TEXT NOT NULL,
    "crop_category_id" INTEGER NOT NULL,
    "name_of_crop" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "area_ha" DOUBLE PRECISION NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',

    CONSTRAINT "nari_bio_fortified_crop_pkey" PRIMARY KEY ("nari_bio_fortified_crop_id")
);

-- CreateTable
CREATE TABLE "crop_category" (
    "crop_category_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "crop_category_pkey" PRIMARY KEY ("crop_category_id")
);

-- CreateTable
CREATE TABLE "nari_bio_fortified_crop_result" (
    "nari_bio_fortified_crop_result_id" SERIAL NOT NULL,
    "nari_bio_fortified_crop_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "name_of_crops" TEXT NOT NULL,
    "varieties" TEXT NOT NULL,
    "area_grown_ha" DOUBLE PRECISION NOT NULL,
    "production_kg" DOUBLE PRECISION NOT NULL,
    "consumption_gm_day_person" DOUBLE PRECISION NOT NULL,
    "form_of_consumption" TEXT NOT NULL,
    "no_of_days_in_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nari_bio_fortified_crop_result_pkey" PRIMARY KEY ("nari_bio_fortified_crop_result_id")
);

-- CreateTable
CREATE TABLE "nari_extension_activity" (
    "nari_extension_activity_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "activity_id" INTEGER NOT NULL,
    "name_of_nutri_smart_village" TEXT NOT NULL,
    "name_of_activity" TEXT NOT NULL,
    "no_of_activities" INTEGER NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',

    CONSTRAINT "nari_extension_activity_pkey" PRIMARY KEY ("nari_extension_activity_id")
);

-- CreateTable
CREATE TABLE "nari_activity" (
    "nari_activity_id" SERIAL NOT NULL,
    "activity_name" TEXT NOT NULL,

    CONSTRAINT "nari_activity_pkey" PRIMARY KEY ("nari_activity_id")
);

-- CreateTable
CREATE TABLE "nari_nutritional_garden" (
    "nari_nutritional_garden_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "activity_id" INTEGER NOT NULL,
    "name_of_nutri_smart_village" TEXT NOT NULL,
    "type_of_nutritional_garden_id" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "area_sqm" DOUBLE PRECISION NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',

    CONSTRAINT "nari_nutritional_garden_pkey" PRIMARY KEY ("nari_nutritional_garden_id")
);

-- CreateTable
CREATE TABLE "nutrition_garden_type" (
    "nutrition_garden_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "nutrition_garden_type_pkey" PRIMARY KEY ("nutrition_garden_type_id")
);

-- CreateTable
CREATE TABLE "nari_nutritional_garden_result" (
    "nari_nutritional_garden_result_id" SERIAL NOT NULL,
    "nari_nutritional_garden_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "name_of_crops" TEXT NOT NULL,
    "varieties" TEXT NOT NULL,
    "area_grown_sqm" DOUBLE PRECISION NOT NULL,
    "production_kg" DOUBLE PRECISION NOT NULL,
    "consumption_kg" DOUBLE PRECISION NOT NULL,
    "sell_of_produce_kg" DOUBLE PRECISION NOT NULL,
    "income_from_sell_of_produce" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nari_nutritional_garden_result_pkey" PRIMARY KEY ("nari_nutritional_garden_result_id")
);

-- CreateTable
CREATE TABLE "nari_training_programme" (
    "nari_training_programme_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "activity_id" INTEGER NOT NULL,
    "campus_type" "CampusType" NOT NULL,
    "name_of_nutri_smart_village" TEXT NOT NULL,
    "area_of_training" TEXT NOT NULL,
    "title_of_training" TEXT NOT NULL,
    "no_of_days" INTEGER NOT NULL,
    "no_of_courses" INTEGER NOT NULL,
    "venue" TEXT NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "nari_training_programme_pkey" PRIMARY KEY ("nari_training_programme_id")
);

-- CreateTable
CREATE TABLE "nari_value_addition" (
    "nari_value_addition_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "activity_id" INTEGER NOT NULL,
    "name_of_nutri_smart_village" TEXT NOT NULL,
    "name_of_crop" TEXT NOT NULL,
    "name_of_value_added_product" TEXT NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',

    CONSTRAINT "nari_value_addition_pkey" PRIMARY KEY ("nari_value_addition_id")
);

-- CreateTable
CREATE TABLE "nari_value_addition_result" (
    "nari_value_addition_result_id" SERIAL NOT NULL,
    "nari_value_addition_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "name_of_product" TEXT NOT NULL,
    "amount_produced_kg" DOUBLE PRECISION NOT NULL,
    "market_price_rs_kg" DOUBLE PRECISION NOT NULL,
    "net_income_rs" DOUBLE PRECISION NOT NULL,
    "shelf_life" TEXT NOT NULL,
    "fssai_certification" TEXT NOT NULL,
    "fssai_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nari_value_addition_result_pkey" PRIMARY KEY ("nari_value_addition_result_id")
);

-- CreateTable
CREATE TABLE "beneficiaries_details" (
    "beneficiaries_details_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "reporting_year_date" TIMESTAMP(3),
    "blocks_covered" INTEGER NOT NULL,
    "villages_covered" INTEGER NOT NULL,
    "total_trained_practicing_nf_farmers" INTEGER NOT NULL,
    "farmers_influenced" INTEGER NOT NULL,
    "farmers_engaged_all_season" INTEGER NOT NULL,
    "farmers_engaged_one_season" INTEGER NOT NULL,
    "remarks" TEXT NOT NULL,

    CONSTRAINT "beneficiaries_details_pkey" PRIMARY KEY ("beneficiaries_details_id")
);

-- CreateTable
CREATE TABLE "demonstration_info" (
    "demonstration_info_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "farmerName" TEXT NOT NULL,
    "villageName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "no_of_indigenous_cows" INTEGER,
    "land_holding" DOUBLE PRECISION,
    "gender" "Gender" NOT NULL,
    "category" "FarmerCategory" NOT NULL,
    "cropping_pattern" TEXT NOT NULL,
    "farming_situation" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "activity_name" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "seasonId" INTEGER,
    "technology_demonstrated" TEXT NOT NULL,
    "area_in_ha" DOUBLE PRECISION NOT NULL,
    "farmer_practice_details" TEXT NOT NULL,
    "plantHeightWithout" DOUBLE PRECISION,
    "plantHeightWith" DOUBLE PRECISION,
    "otherRelevantParameterWithout" DOUBLE PRECISION,
    "otherRelevantParameterWith" DOUBLE PRECISION,
    "yieldWithout" DOUBLE PRECISION,
    "yieldWith" DOUBLE PRECISION,
    "costWithout" DOUBLE PRECISION,
    "costWith" DOUBLE PRECISION,
    "grossReturnWithout" DOUBLE PRECISION,
    "grossReturnWith" DOUBLE PRECISION,
    "netReturnWithout" DOUBLE PRECISION,
    "netReturnWith" DOUBLE PRECISION,
    "bcRatioWithout" DOUBLE PRECISION,
    "bcRatioWith" DOUBLE PRECISION,
    "soilPhWithout" DOUBLE PRECISION,
    "soilPhWith" DOUBLE PRECISION,
    "soilOcWithout" DOUBLE PRECISION,
    "soilOcWith" DOUBLE PRECISION,
    "soilEcWithout" DOUBLE PRECISION,
    "soilEcWith" DOUBLE PRECISION,
    "availableNWithout" DOUBLE PRECISION,
    "availableNWith" DOUBLE PRECISION,
    "availablePWithout" DOUBLE PRECISION,
    "availablePWith" DOUBLE PRECISION,
    "availableKWithout" DOUBLE PRECISION,
    "availableKWith" DOUBLE PRECISION,
    "soilMicrobesWithout" DOUBLE PRECISION,
    "soilMicrobesWith" DOUBLE PRECISION,
    "anyOtherWithout" DOUBLE PRECISION,
    "anyOtherWith" DOUBLE PRECISION,
    "farmer_feedback" TEXT NOT NULL,
    "images" TEXT,
    "staff_category_id" INTEGER,

    CONSTRAINT "demonstration_info_pkey" PRIMARY KEY ("demonstration_info_id")
);

-- CreateTable
CREATE TABLE "farmers_practicing_natural_farming" (
    "farmers_practicing_id" UUID NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "farmer_name" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "village_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "no_of_indigenous_cows" INTEGER,
    "land_holding" DOUBLE PRECISION,
    "normal_crops_grown" TEXT,
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

-- CreateTable
CREATE TABLE "financial_information" (
    "financial_information_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "reporting_year_date" TIMESTAMP(3),
    "activity_id" INTEGER,
    "number_of_activities" INTEGER NOT NULL,
    "budget_sanction" DOUBLE PRECISION NOT NULL,
    "budget_expenditure" DOUBLE PRECISION NOT NULL,
    "total_budget_expenditure" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "financial_information_pkey" PRIMARY KEY ("financial_information_id")
);

-- CreateTable
CREATE TABLE "geographical_info" (
    "geographical_info_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "agro_climatic_zone" TEXT NOT NULL,
    "farming_situation" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "geographical_info_pkey" PRIMARY KEY ("geographical_info_id")
);

-- CreateTable
CREATE TABLE "physical_info" (
    "physical_info_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "activity_id" INTEGER,
    "training_title" TEXT,
    "training_date" TIMESTAMP(3),
    "venue" TEXT,
    "general_m" INTEGER,
    "general_f" INTEGER,
    "obc_m" INTEGER,
    "obc_f" INTEGER,
    "sc_m" INTEGER,
    "sc_f" INTEGER,
    "st_m" INTEGER,
    "st_f" INTEGER,
    "remarks" TEXT,
    "innovative_programme_name" TEXT,
    "significance_of_innovative_programme" TEXT,
    "images" TEXT,

    CONSTRAINT "physical_info_pkey" PRIMARY KEY ("physical_info_id")
);

-- CreateTable
CREATE TABLE "natural_farming_activity_master" (
    "natural_farming_activity_id" SERIAL NOT NULL,
    "activity_name" TEXT NOT NULL,

    CONSTRAINT "natural_farming_activity_master_pkey" PRIMARY KEY ("natural_farming_activity_id")
);

-- CreateTable
CREATE TABLE "soil_data_information" (
    "soil_data_information_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "reporting_year_date" TIMESTAMP(3),
    "crop" TEXT NOT NULL,
    "seasonId" INTEGER,
    "soil_parameter_id" INTEGER,
    "ph_before" DOUBLE PRECISION NOT NULL,
    "ec_before" DOUBLE PRECISION NOT NULL,
    "oc_before" DOUBLE PRECISION NOT NULL,
    "n_before" DOUBLE PRECISION NOT NULL,
    "p_before" DOUBLE PRECISION NOT NULL,
    "k_before" DOUBLE PRECISION NOT NULL,
    "soil_microbes_before" DOUBLE PRECISION NOT NULL,
    "ph_after" DOUBLE PRECISION NOT NULL,
    "ec_after" DOUBLE PRECISION NOT NULL,
    "oc_after" DOUBLE PRECISION NOT NULL,
    "n_after" DOUBLE PRECISION NOT NULL,
    "p_after" DOUBLE PRECISION NOT NULL,
    "k_after" DOUBLE PRECISION NOT NULL,
    "soil_microbes_after" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "soil_data_information_pkey" PRIMARY KEY ("soil_data_information_id")
);

-- CreateTable
CREATE TABLE "natural_farming_soil_parameter_master" (
    "natural_farming_soil_parameter_id" SERIAL NOT NULL,
    "parameter_name" TEXT NOT NULL,

    CONSTRAINT "natural_farming_soil_parameter_master_pkey" PRIMARY KEY ("natural_farming_soil_parameter_id")
);

-- CreateTable
CREATE TABLE "nicra_convergence_programme" (
    "nicra_convergence_programme_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "development_scheme_programme" TEXT NOT NULL,
    "nature_of_work" TEXT NOT NULL,
    "amount_rs" DOUBLE PRECISION NOT NULL,
    "photographs" TEXT NOT NULL,

    CONSTRAINT "nicra_convergence_programme_pkey" PRIMARY KEY ("nicra_convergence_programme_id")
);

-- CreateTable
CREATE TABLE "nicra_dignitaries_visited" (
    "nicra_dignitaries_visited_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "date_of_visit" TIMESTAMP(3) NOT NULL,
    "dignitary_type_id" INTEGER,
    "name" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "photographs" TEXT,

    CONSTRAINT "nicra_dignitaries_visited_pkey" PRIMARY KEY ("nicra_dignitaries_visited_id")
);

-- CreateTable
CREATE TABLE "nicra_dignitary_type_master" (
    "nicra_dignitary_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "nicra_dignitary_type_master_pkey" PRIMARY KEY ("nicra_dignitary_type_id")
);

-- CreateTable
CREATE TABLE "nicra_farm_implement" (
    "nicra_farm_implement_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "name_of_farm_implement" TEXT NOT NULL,
    "area_covered" DOUBLE PRECISION NOT NULL,
    "farm_implement_used_hours" DOUBLE PRECISION NOT NULL,
    "revenue_generated_rs" DOUBLE PRECISION NOT NULL,
    "expenditure_incurred_repairing_rs" DOUBLE PRECISION NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,
    "photographs" TEXT NOT NULL,

    CONSTRAINT "nicra_farm_implement_pkey" PRIMARY KEY ("nicra_farm_implement_id")
);

-- CreateTable
CREATE TABLE "nicra_intervention" (
    "nicra_intervention_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "seed_bank_fodder_bank_id" INTEGER,
    "crop" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "quantity_q" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "nicra_intervention_pkey" PRIMARY KEY ("nicra_intervention_id")
);

-- CreateTable
CREATE TABLE "nicra_seed_bank_fodder_bank_master" (
    "nicra_seed_bank_fodder_bank_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "nicra_seed_bank_fodder_bank_master_pkey" PRIMARY KEY ("nicra_seed_bank_fodder_bank_id")
);

-- CreateTable
CREATE TABLE "nicra_basic_info" (
    "nicra_basic_info_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_date" TIMESTAMP(3) NOT NULL,
    "rf_normal" DOUBLE PRECISION NOT NULL,
    "rf_received" DOUBLE PRECISION NOT NULL,
    "temp_max" DOUBLE PRECISION NOT NULL,
    "temp_min" DOUBLE PRECISION NOT NULL,
    "dry_spell_10_days" INTEGER NOT NULL,
    "dry_spell_15_days" INTEGER NOT NULL,
    "dry_spell_20_days" INTEGER NOT NULL,
    "intensive_rain_above_60mm" INTEGER NOT NULL,
    "water_depth_cm" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nicra_basic_info_pkey" PRIMARY KEY ("nicra_basic_info_id")
);

-- CreateTable
CREATE TABLE "nicra_category" (
    "nicra_category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "nicra_category_pkey" PRIMARY KEY ("nicra_category_id")
);

-- CreateTable
CREATE TABLE "nicra_sub_category" (
    "nicra_sub_category_id" SERIAL NOT NULL,
    "sub_category_name" TEXT NOT NULL,
    "nicraCategoryId" INTEGER NOT NULL,

    CONSTRAINT "nicra_sub_category_pkey" PRIMARY KEY ("nicra_sub_category_id")
);

-- CreateTable
CREATE TABLE "nicra_details" (
    "nicra_details_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "nicraCategoryId" INTEGER,
    "nicraSubCategoryId" INTEGER,
    "fst_type" TEXT NOT NULL,
    "crop_name" TEXT NOT NULL,
    "seasonId" INTEGER,
    "month" "Month" NOT NULL,
    "technology_demonstrated" TEXT NOT NULL,
    "area_or_unit" DOUBLE PRECISION NOT NULL,
    "body_weight" DOUBLE PRECISION NOT NULL,
    "yield" DOUBLE PRECISION NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "gross_cost" DOUBLE PRECISION NOT NULL,
    "gross_return" DOUBLE PRECISION NOT NULL,
    "net_return" DOUBLE PRECISION NOT NULL,
    "bcr_ratio" DOUBLE PRECISION NOT NULL,
    "photographs" TEXT,
    "upload_file" TEXT,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "nicra_details_pkey" PRIMARY KEY ("nicra_details_id")
);

-- CreateTable
CREATE TABLE "nicra_extension_activity" (
    "nicra_extension_activity_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "activity_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,

    CONSTRAINT "nicra_extension_activity_pkey" PRIMARY KEY ("nicra_extension_activity_id")
);

-- CreateTable
CREATE TABLE "nicra_training" (
    "nicra_training_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "title_of_training" TEXT NOT NULL,
    "campus_type" "CampusType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "remark" TEXT NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,

    CONSTRAINT "nicra_training_pkey" PRIMARY KEY ("nicra_training_id")
);

-- CreateTable
CREATE TABLE "nicra_pi_copi" (
    "nicra_pi_copi_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "pi_type_id" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "nicra_pi_copi_pkey" PRIMARY KEY ("nicra_pi_copi_id")
);

-- CreateTable
CREATE TABLE "nicra_pi_type_master" (
    "nicra_pi_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "nicra_pi_type_master_pkey" PRIMARY KEY ("nicra_pi_type_id")
);

-- CreateTable
CREATE TABLE "nicra_revenue_generated" (
    "nicra_revenue_generated_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "revenue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "nicra_revenue_generated_pkey" PRIMARY KEY ("nicra_revenue_generated_id")
);

-- CreateTable
CREATE TABLE "nicra_soil_health_card" (
    "nicra_soil_health_card_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "no_of_soil_samples_collected" INTEGER NOT NULL,
    "no_of_samples_analysed" INTEGER NOT NULL,
    "shc_issued" INTEGER NOT NULL,
    "general_m" INTEGER NOT NULL DEFAULT 0,
    "general_f" INTEGER NOT NULL DEFAULT 0,
    "obc_m" INTEGER NOT NULL DEFAULT 0,
    "obc_f" INTEGER NOT NULL DEFAULT 0,
    "sc_m" INTEGER NOT NULL DEFAULT 0,
    "sc_f" INTEGER NOT NULL DEFAULT 0,
    "st_m" INTEGER NOT NULL DEFAULT 0,
    "st_f" INTEGER NOT NULL DEFAULT 0,
    "photographs" TEXT,

    CONSTRAINT "nicra_soil_health_card_pkey" PRIMARY KEY ("nicra_soil_health_card_id")
);

-- CreateTable
CREATE TABLE "nicra_vcrmc" (
    "nicra_vcrmc_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "village_name" TEXT NOT NULL,
    "constitution_date" TIMESTAMP(3) NOT NULL,
    "meetings_organized" INTEGER NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "name_of_secretary" TEXT NOT NULL,
    "name_of_president" TEXT NOT NULL,
    "major_decision_taken" TEXT NOT NULL,
    "male_members" INTEGER NOT NULL,
    "female_members" INTEGER NOT NULL,
    "photographs" TEXT NOT NULL,

    CONSTRAINT "nicra_vcrmc_pkey" PRIMARY KEY ("nicra_vcrmc_id")
);

-- CreateTable
CREATE TABLE "kvk_other_programme" (
    "kvk_other_programme_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "name_of_programme" TEXT NOT NULL,
    "programme_date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "farmers_general_m" INTEGER NOT NULL,
    "farmers_general_f" INTEGER NOT NULL,
    "farmers_obc_m" INTEGER NOT NULL,
    "farmers_obc_f" INTEGER NOT NULL,
    "farmers_sc_m" INTEGER NOT NULL,
    "farmers_sc_f" INTEGER NOT NULL,
    "farmers_st_m" INTEGER NOT NULL,
    "farmers_st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_other_programme_pkey" PRIMARY KEY ("kvk_other_programme_id")
);

-- CreateTable
CREATE TABLE "kvk_seed_hub_program" (
    "seed_hub_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "seasonId" INTEGER,
    "crop_name" TEXT NOT NULL,
    "variety_name" TEXT NOT NULL,
    "area_covered_ha" DOUBLE PRECISION NOT NULL,
    "yield_q_per_ha" DOUBLE PRECISION NOT NULL,
    "quantity_produced_q" DOUBLE PRECISION NOT NULL,
    "quantity_sale_out_q" DOUBLE PRECISION NOT NULL,
    "farmers_purchased" INTEGER NOT NULL,
    "quantity_sale_to_farmers_q" DOUBLE PRECISION NOT NULL,
    "villages_covered" INTEGER NOT NULL,
    "quantity_sale_to_other_org_q" DOUBLE PRECISION NOT NULL,
    "amount_generated_lakh" DOUBLE PRECISION NOT NULL,
    "total_amount_present_lakh" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "kvk_seed_hub_program_pkey" PRIMARY KEY ("seed_hub_id")
);

-- CreateTable
CREATE TABLE "tsp_scsp_district" (
    "tsp_scsp_district_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tsp_scsp_district_pkey" PRIMARY KEY ("tsp_scsp_district_id")
);

-- CreateTable
CREATE TABLE "tsp_scsp_type_master" (
    "tsp_scsp_type_id" SERIAL NOT NULL,
    "type_name" TEXT NOT NULL,

    CONSTRAINT "tsp_scsp_type_master_pkey" PRIMARY KEY ("tsp_scsp_type_id")
);

-- CreateTable
CREATE TABLE "tsp_scsp" (
    "tsp_scsp_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "type" "TspScspType" NOT NULL,
    "tsp_scsp_type_id" INTEGER,
    "activityId" INTEGER,
    "number_of_trainings_or_demos" INTEGER NOT NULL,
    "number_of_beneficiaries" INTEGER NOT NULL,
    "funds_received" DOUBLE PRECISION,
    "achievement_family_income_unit" DOUBLE PRECISION,
    "achievement_consumption_level_unit" DOUBLE PRECISION,
    "achievement_implements_availability_unit" DOUBLE PRECISION,
    "achievement_family_income" DOUBLE PRECISION,
    "achievement_consumption_level" DOUBLE PRECISION,
    "achievement_implements_availability" DOUBLE PRECISION,
    "districtId" INTEGER,
    "sub_district" TEXT,
    "number_of_villages_covered" INTEGER,
    "village_names_covered" TEXT,
    "st_male" INTEGER,
    "st_female" INTEGER,
    "st_total" INTEGER,

    CONSTRAINT "tsp_scsp_pkey" PRIMARY KEY ("tsp_scsp_id")
);

-- CreateTable
CREATE TABLE "kvk_publication_details" (
    "publication_details_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "publication_id" INTEGER,
    "title" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "journal_name" TEXT NOT NULL,
    "naas_rating" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_publication_details_pkey" PRIMARY KEY ("publication_details_id")
);

-- CreateTable
CREATE TABLE "course_coordinator_master" (
    "coordinator_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_coordinator_master_pkey" PRIMARY KEY ("coordinator_id")
);

-- CreateTable
CREATE TABLE "training_achievement" (
    "training_achievement_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "clienteleId" INTEGER,
    "trainingTypeId" INTEGER,
    "trainingAreaId" INTEGER,
    "thematicAreaId" INTEGER NOT NULL,
    "coordinatorId" INTEGER NOT NULL,
    "fundingSourceId" INTEGER,
    "title_of_training" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "funding_agency_name" TEXT,
    "campus_type" "CampusType" NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_achievement_pkey" PRIMARY KEY ("training_achievement_id")
);

-- CreateTable
CREATE TABLE "kisan_sarathi" (
    "kisan_sarathi_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "no_of_farmers_registered_on_ksp_portal" INTEGER NOT NULL,
    "phone_call_addressed" INTEGER NOT NULL,
    "phone_call_answered" INTEGER NOT NULL,
    "crop" TEXT NOT NULL,
    "weather" TEXT NOT NULL,
    "awareness" TEXT NOT NULL,
    "livestocks" TEXT NOT NULL,
    "marketing" TEXT NOT NULL,
    "other_enterprises" TEXT NOT NULL,

    CONSTRAINT "kisan_sarathi_pkey" PRIMARY KEY ("kisan_sarathi_id")
);

-- CreateTable
CREATE TABLE "kmas" (
    "kmas_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "no_of_farmers_covered" INTEGER NOT NULL,
    "no_of_advisories_sent" INTEGER NOT NULL,
    "crop" TEXT NOT NULL,
    "livestock" TEXT NOT NULL,
    "weather" TEXT NOT NULL,
    "marketing" TEXT NOT NULL,
    "awareness" TEXT NOT NULL,
    "other_enterprises" TEXT NOT NULL,
    "any_other" TEXT NOT NULL,

    CONSTRAINT "kmas_pkey" PRIMARY KEY ("kmas_id")
);

-- CreateTable
CREATE TABLE "mobile_app" (
    "mobile_app_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "name_of_the_app" TEXT NOT NULL,
    "meant_for" TEXT NOT NULL,
    "number_of_mobile_apps_developed_by_kvk" INTEGER NOT NULL,
    "language_of_the_app" TEXT NOT NULL,
    "no_of_times_downloaded" INTEGER NOT NULL,

    CONSTRAINT "mobile_app_pkey" PRIMARY KEY ("mobile_app_id")
);

-- CreateTable
CREATE TABLE "msg_details" (
    "msg_details_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "text_no_of_farmers_covered" INTEGER NOT NULL,
    "text_no_of_advisories_sent" INTEGER NOT NULL,
    "text_crop" TEXT NOT NULL,
    "text_livestock" TEXT NOT NULL,
    "text_weather" TEXT NOT NULL,
    "text_marketing" TEXT NOT NULL,
    "text_awareness" TEXT NOT NULL,
    "text_other_enterprises" TEXT NOT NULL,
    "whatsapp_no_of_farmers_covered" INTEGER NOT NULL,
    "whatsapp_no_of_advisories_sent" INTEGER NOT NULL,
    "whatsapp_crop" TEXT NOT NULL,
    "whatsapp_livestock" TEXT NOT NULL,
    "whatsapp_weather" TEXT NOT NULL,
    "whatsapp_marketing" TEXT NOT NULL,
    "whatsapp_awareness" TEXT NOT NULL,
    "whatsapp_other_enterprises" TEXT NOT NULL,
    "weather_no_of_farmers_covered" INTEGER NOT NULL,
    "weather_no_of_advisories_sent" INTEGER NOT NULL,
    "weather_crop" TEXT NOT NULL,
    "weather_livestock" TEXT NOT NULL,
    "weather_weather" TEXT NOT NULL,
    "weather_marketing" TEXT NOT NULL,
    "weather_awareness" TEXT NOT NULL,
    "weather_other_enterprises" TEXT NOT NULL,
    "social_no_of_farmers_covered" INTEGER NOT NULL,
    "social_no_of_advisories_sent" INTEGER NOT NULL,
    "social_crop" TEXT NOT NULL,
    "social_livestock" TEXT NOT NULL,
    "social_weather" TEXT NOT NULL,
    "social_marketing" TEXT NOT NULL,
    "social_awareness" TEXT NOT NULL,
    "social_other_enterprises" TEXT NOT NULL,

    CONSTRAINT "msg_details_pkey" PRIMARY KEY ("msg_details_id")
);

-- CreateTable
CREATE TABLE "web_portal" (
    "web_portal_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "no_of_farmers_registered_on_the_portal" INTEGER NOT NULL,
    "no_of_visitors_visited_the_portal" INTEGER NOT NULL,

    CONSTRAINT "web_portal_pkey" PRIMARY KEY ("web_portal_id")
);

-- CreateTable
CREATE TABLE "form_attachments" (
    "attachment_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "form_code" TEXT NOT NULL,
    "record_id" TEXT,
    "kind" "FormAttachmentKind" NOT NULL DEFAULT 'PHOTO',
    "s3_key" TEXT NOT NULL,
    "file_name" TEXT,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "reporting_year_date" TIMESTAMP(3),
    "uploaded_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_attachments_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "hrd_program" (
    "hrd_program_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "kvkStaffId" INTEGER,
    "course_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "organizer" TEXT NOT NULL,
    "venue" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrd_program_pkey" PRIMARY KEY ("hrd_program_id")
);

-- CreateTable
CREATE TABLE "atari_meeting" (
    "atari_meeting_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "type_of_meeting" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    "representative_from_atari" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "atari_meeting_pkey" PRIMARY KEY ("atari_meeting_id")
);

-- CreateTable
CREATE TABLE "sac_meeting" (
    "sac_meeting_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "number_of_participants" INTEGER NOT NULL,
    "statutory_members_present" INTEGER NOT NULL,
    "salient_recommendations" TEXT NOT NULL,
    "actionTaken" "ActionStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "uploaded_file" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sac_meeting_pkey" PRIMARY KEY ("sac_meeting_id")
);

-- CreateTable
CREATE TABLE "nyk_training" (
    "nyk_training_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "training_title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "fund_received" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "nyk_training_pkey" PRIMARY KEY ("nyk_training_id")
);

-- CreateTable
CREATE TABLE "ppv_fra_plant_varieties" (
    "ppv_fra_plant_varieties_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" INTEGER NOT NULL,
    "reporting_year_date" TIMESTAMP(3),
    "crop_name" TEXT NOT NULL,
    "registration_no" TEXT,
    "farmer_name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "characteristics" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "ppv_fra_plant_varieties_pkey" PRIMARY KEY ("ppv_fra_plant_varieties_id")
);

-- CreateTable
CREATE TABLE "ppv_fra_training" (
    "ppv_fra_training_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "programme_date" TIMESTAMP(3) NOT NULL,
    "type_id" INTEGER,
    "type" "PpvFraTrainingType" NOT NULL DEFAULT 'TRAINING',
    "title" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "resource_person" TEXT NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,

    CONSTRAINT "ppv_fra_training_pkey" PRIMARY KEY ("ppv_fra_training_id")
);

-- CreateTable
CREATE TABLE "prevalent_diseases_in_crop" (
    "prevalent_disease_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "disease_name" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "date_of_outbreak" TIMESTAMP(3) NOT NULL,
    "area_affected" DOUBLE PRECISION NOT NULL,
    "commodity_loss_percent" DOUBLE PRECISION NOT NULL,
    "preventive_measures_area" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "prevalent_diseases_in_crop_pkey" PRIMARY KEY ("prevalent_disease_id")
);

-- CreateTable
CREATE TABLE "prevalent_diseases_livestock" (
    "prevalent_livestock_disease_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "disease_name" TEXT NOT NULL,
    "livestock_type" TEXT NOT NULL,
    "date_of_outbreak" TIMESTAMP(3) NOT NULL,
    "mortality_count" DOUBLE PRECISION NOT NULL,
    "animals_treated" INTEGER NOT NULL,
    "preventive_measures" TEXT NOT NULL,

    CONSTRAINT "prevalent_diseases_livestock_pkey" PRIMARY KEY ("prevalent_livestock_disease_id")
);

-- CreateTable
CREATE TABLE "attachment_type" (
    "attachment_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "attachment_type_pkey" PRIMARY KEY ("attachment_type_id")
);

-- CreateTable
CREATE TABLE "rawe_fet_fit_programme" (
    "rawe_programme_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "attachmentTypeId" INTEGER NOT NULL,
    "attachment_path" TEXT,
    "male_students" INTEGER NOT NULL,
    "female_students" INTEGER NOT NULL,

    CONSTRAINT "rawe_fet_fit_programme_pkey" PRIMARY KEY ("rawe_programme_id")
);

-- CreateTable
CREATE TABLE "dignitary_type" (
    "dignitary_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "dignitary_type_pkey" PRIMARY KEY ("dignitary_type_id")
);

-- CreateTable
CREATE TABLE "vip_visitors" (
    "vip_visitor_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "date_of_visit" TIMESTAMP(3) NOT NULL,
    "dignitaryTypeId" INTEGER NOT NULL,
    "minister_name" TEXT NOT NULL,
    "salient_points" TEXT NOT NULL,

    CONSTRAINT "vip_visitors_pkey" PRIMARY KEY ("vip_visitor_id")
);

-- CreateTable
CREATE TABLE "module_images" (
    "image_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "zone_id" INTEGER,
    "state_id" INTEGER,
    "district_id" INTEGER,
    "org_id" INTEGER,
    "module_id" INTEGER NOT NULL,
    "caption" TEXT,
    "image_date" TIMESTAMP(3) NOT NULL,
    "reporting_year" INTEGER NOT NULL,
    "reporting_year_date" TIMESTAMP(3),
    "image_data" BYTEA NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_name" TEXT,
    "uploaded_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "district_level_data" (
    "district_level_data_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "account_type" TEXT NOT NULL,
    "information" TEXT NOT NULL,
    "season" TEXT,
    "type" TEXT,
    "crop_name" TEXT,
    "area" DOUBLE PRECISION,
    "production" DOUBLE PRECISION,
    "productivity" DOUBLE PRECISION,
    "month" TEXT,
    "rainfall" DOUBLE PRECISION,
    "max_temp" DOUBLE PRECISION,
    "min_temp" DOUBLE PRECISION,
    "max_rh" DOUBLE PRECISION,
    "min_rh" DOUBLE PRECISION,
    "livestock_name" TEXT,
    "number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "district_level_data_pkey" PRIMARY KEY ("district_level_data_id")
);

-- CreateTable
CREATE TABLE "operational_area" (
    "operational_area_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "taluk" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "major_crops" TEXT NOT NULL,
    "major_problems" TEXT NOT NULL,
    "thrust_areas" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_area_pkey" PRIMARY KEY ("operational_area_id")
);

-- CreateTable
CREATE TABLE "priority_thrust_area" (
    "priority_thrust_area_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "thrust_area" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priority_thrust_area_pkey" PRIMARY KEY ("priority_thrust_area_id")
);

-- CreateTable
CREATE TABLE "village_adoption" (
    "village_adoption_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "village" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "action_taken" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_adoption_pkey" PRIMARY KEY ("village_adoption_id")
);

-- CreateTable
CREATE TABLE "budget_detail" (
    "budget_detail_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "salary_allocation" DOUBLE PRECISION NOT NULL,
    "salary_expenditure" DOUBLE PRECISION NOT NULL,
    "general_main_grant_allocation" DOUBLE PRECISION NOT NULL,
    "general_main_grant_expenditure" DOUBLE PRECISION NOT NULL,
    "general_tsp_grant_allocation" DOUBLE PRECISION NOT NULL,
    "general_tsp_grant_expenditure" DOUBLE PRECISION NOT NULL,
    "general_scsp_grant_allocation" DOUBLE PRECISION NOT NULL,
    "general_scsp_grant_expenditure" DOUBLE PRECISION NOT NULL,
    "capital_main_grant_allocation" DOUBLE PRECISION NOT NULL,
    "capital_main_grant_expenditure" DOUBLE PRECISION NOT NULL,
    "capital_tsp_grant_allocation" DOUBLE PRECISION NOT NULL,
    "capital_tsp_grant_expenditure" DOUBLE PRECISION NOT NULL,
    "capital_scsp_grant_allocation" DOUBLE PRECISION NOT NULL,
    "capital_scsp_grant_expenditure" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_detail_pkey" PRIMARY KEY ("budget_detail_id")
);

-- CreateTable
CREATE TABLE "project_budget" (
    "project_budget_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "financial_project_id" INTEGER NOT NULL,
    "account_number" TEXT NOT NULL,
    "funding_agency_id" INTEGER,
    "specify_project_name" TEXT,
    "specify_agency_name" TEXT,
    "budget_estimate" DOUBLE PRECISION NOT NULL,
    "budget_allocated" DOUBLE PRECISION NOT NULL,
    "budget_released" DOUBLE PRECISION NOT NULL,
    "expenditure" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_budget_pkey" PRIMARY KEY ("project_budget_id")
);

-- CreateTable
CREATE TABLE "resource_generation" (
    "resource_generation_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "programme_name" TEXT NOT NULL,
    "programme_purpose" TEXT NOT NULL,
    "sources_of_fund" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "infrastructure_created" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_generation_pkey" PRIMARY KEY ("resource_generation_id")
);

-- CreateTable
CREATE TABLE "revenue_generation" (
    "revenue_generation_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "head_name" TEXT NOT NULL,
    "income" DOUBLE PRECISION NOT NULL,
    "sponsoring_agency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_generation_pkey" PRIMARY KEY ("revenue_generation_id")
);

-- CreateTable
CREATE TABLE "revolving_fund" (
    "revolving_fund_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "opening_balance" DOUBLE PRECISION NOT NULL,
    "income_during_year" DOUBLE PRECISION NOT NULL,
    "expenditure_during_year" DOUBLE PRECISION NOT NULL,
    "kind" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revolving_fund_pkey" PRIMARY KEY ("revolving_fund_id")
);

-- CreateTable
CREATE TABLE "entrepreneurship" (
    "entrepreneurship_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "entrepreneur_name" TEXT NOT NULL,
    "registered_address" TEXT NOT NULL,
    "year_of_establishment" INTEGER NOT NULL,
    "enterprise_type" TEXT NOT NULL,
    "members_associated" INTEGER NOT NULL,
    "registration_details" TEXT NOT NULL,
    "technical_components" TEXT NOT NULL,
    "kvk_role" TEXT NOT NULL,
    "annual_income" DOUBLE PRECISION NOT NULL,
    "development_timeline" TEXT NOT NULL,
    "status_before_after" TEXT NOT NULL,
    "present_working_condition" TEXT NOT NULL,
    "major_achievements" TEXT NOT NULL,
    "major_constraints" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrepreneurship_pkey" PRIMARY KEY ("entrepreneurship_id")
);

-- CreateTable
CREATE TABLE "kvk_impact_activity" (
    "impact_activity_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "specific_area" TEXT NOT NULL,
    "brief_details" TEXT NOT NULL,
    "farmers_benefitted" INTEGER NOT NULL,
    "horizontal_spread" TEXT NOT NULL,
    "adoption_percentage" DOUBLE PRECISION NOT NULL,
    "qualitative_impact" TEXT NOT NULL,
    "quantitative_impact" TEXT NOT NULL,
    "income_before" DOUBLE PRECISION NOT NULL,
    "income_after" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_impact_activity_pkey" PRIMARY KEY ("impact_activity_id")
);

-- CreateTable
CREATE TABLE "success_story" (
    "success_story_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "farmer_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "education" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "professional_membership" TEXT,
    "awards_received" TEXT,
    "major_achievement" TEXT NOT NULL,
    "story_title" TEXT NOT NULL,
    "problem_statement" TEXT NOT NULL,
    "kvk_intervention" TEXT NOT NULL,
    "practices_followed" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "future_plans" TEXT,
    "supporting_images" TEXT,
    "enterprise" TEXT NOT NULL,
    "gross_income" DOUBLE PRECISION NOT NULL,
    "net_income" DOUBLE PRECISION NOT NULL,
    "cost_benefit_ratio" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "success_story_pkey" PRIMARY KEY ("success_story_id")
);

-- CreateTable
CREATE TABLE "demonstration_unit" (
    "demonstration_unit_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "demo_unit_name" TEXT NOT NULL,
    "year_of_establishment" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "variety_breed" TEXT NOT NULL,
    "produce" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "cost_of_inputs" DOUBLE PRECISION NOT NULL,
    "gross_income" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demonstration_unit_pkey" PRIMARY KEY ("demonstration_unit_id")
);

-- CreateTable
CREATE TABLE "hostel_utilization" (
    "hostel_utilization_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "months" TEXT NOT NULL,
    "trainees_stayed" INTEGER NOT NULL,
    "trainee_days" INTEGER NOT NULL,
    "reason_for_short_fall" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_utilization_pkey" PRIMARY KEY ("hostel_utilization_id")
);

-- CreateTable
CREATE TABLE "instructional_farm_crop" (
    "instructional_farm_crop_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "season_id" INTEGER,
    "crop_name" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "variety" TEXT NOT NULL,
    "type_of_produce" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "cost_of_inputs" DOUBLE PRECISION NOT NULL,
    "gross_income" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructional_farm_crop_pkey" PRIMARY KEY ("instructional_farm_crop_id")
);

-- CreateTable
CREATE TABLE "instructional_farm_livestock" (
    "instructional_farm_livestock_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "animal_name" TEXT NOT NULL,
    "species_breed" TEXT NOT NULL,
    "type_of_produce" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "cost_of_inputs" DOUBLE PRECISION NOT NULL,
    "gross_income" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructional_farm_livestock_pkey" PRIMARY KEY ("instructional_farm_livestock_id")
);

-- CreateTable
CREATE TABLE "production_unit" (
    "production_unit_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "product_name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "cost_of_inputs" DOUBLE PRECISION NOT NULL,
    "gross_income" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_unit_pkey" PRIMARY KEY ("production_unit_id")
);

-- CreateTable
CREATE TABLE "rainwater_harvesting" (
    "rainwater_harvesting_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "training_programmes" INTEGER NOT NULL,
    "demonstrations" INTEGER NOT NULL,
    "plant_material" INTEGER NOT NULL,
    "farmer_visits" INTEGER NOT NULL,
    "official_visits" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rainwater_harvesting_pkey" PRIMARY KEY ("rainwater_harvesting_id")
);

-- CreateTable
CREATE TABLE "staff_quarters_utilization" (
    "staff_quarters_utilization_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "date_of_completion" TIMESTAMP(3),
    "is_completed" TEXT NOT NULL,
    "number_of_quarters" INTEGER NOT NULL,
    "occupancy_details" TEXT NOT NULL,
    "occupancy_data" TEXT,
    "remark" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_quarters_utilization_pkey" PRIMARY KEY ("staff_quarters_utilization_id")
);

-- CreateTable
CREATE TABLE "functional_linkage" (
    "functional_linkage_id" TEXT NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "reporting_year" TIMESTAMP(3),
    "organization_name" TEXT NOT NULL,
    "nature_of_linkage" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "functional_linkage_pkey" PRIMARY KEY ("functional_linkage_id")
);

-- CreateTable
CREATE TABLE "kvk_soil_water_analysis" (
    "soil_water_analysis_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "analysis_id" INTEGER NOT NULL,
    "samples_analysed_through" TEXT NOT NULL,
    "samples_analysed" INTEGER NOT NULL,
    "villages_number" INTEGER NOT NULL,
    "amount_realized" INTEGER NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "kvk_soil_water_analysis_pkey" PRIMARY KEY ("soil_water_analysis_id")
);

-- CreateTable
CREATE TABLE "soil_water_analysis" (
    "soil_water_analysis_id" SERIAL NOT NULL,
    "analysis_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soil_water_analysis_pkey" PRIMARY KEY ("soil_water_analysis_id")
);

-- CreateTable
CREATE TABLE "kvk_soil_water_equipment" (
    "soil_water_equipment_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "soilWaterAnalysisId" INTEGER NOT NULL,
    "equipment_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "kvk_soil_water_equipment_pkey" PRIMARY KEY ("soil_water_equipment_id")
);

-- CreateTable
CREATE TABLE "kvk_world_soil_celebration" (
    "world_soil_celebration_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "activities_conducted" INTEGER NOT NULL,
    "soil_health_card_distributed" INTEGER NOT NULL,
    "vip_names" TEXT NOT NULL,
    "participants" INTEGER NOT NULL,
    "general_m" INTEGER NOT NULL,
    "general_f" INTEGER NOT NULL,
    "obc_m" INTEGER NOT NULL,
    "obc_f" INTEGER NOT NULL,
    "sc_m" INTEGER NOT NULL,
    "sc_f" INTEGER NOT NULL,
    "st_m" INTEGER NOT NULL,
    "st_f" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "kvk_world_soil_celebration_pkey" PRIMARY KEY ("world_soil_celebration_id")
);

-- CreateTable
CREATE TABLE "swachhta_hi_sewa" (
    "swachhta_hi_sewa_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "observation_date" TIMESTAMP(3) NOT NULL,
    "total_activities" INTEGER NOT NULL,
    "staff_count" INTEGER NOT NULL,
    "farmer_count" INTEGER NOT NULL,
    "others_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "swachhta_hi_sewa_pkey" PRIMARY KEY ("swachhta_hi_sewa_id")
);

-- CreateTable
CREATE TABLE "swachh_quarterly_expenditure" (
    "swachh_quarterly_expenditure_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "vermi_village_covered" INTEGER NOT NULL,
    "vermi_total_expenditure" DOUBLE PRECISION NOT NULL,
    "other_village_covered" INTEGER NOT NULL,
    "other_total_expenditure" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reporting_year" TIMESTAMP(3),

    CONSTRAINT "swachh_quarterly_expenditure_pkey" PRIMARY KEY ("swachh_quarterly_expenditure_id")
);

-- CreateTable
CREATE TABLE "swachhta_pakhwada" (
    "swachhta_pakhwada_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "observation_date" TIMESTAMP(3) NOT NULL,
    "total_activities" INTEGER NOT NULL,
    "staff_count" INTEGER NOT NULL,
    "farmer_count" INTEGER NOT NULL,
    "others_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "swachhta_pakhwada_pkey" PRIMARY KEY ("swachhta_pakhwada_id")
);

-- CreateTable
CREATE TABLE "targets" (
    "target_id" SERIAL NOT NULL,
    "kvk_id" INTEGER NOT NULL,
    "zone_id" INTEGER,
    "state_id" INTEGER,
    "district_id" INTEGER,
    "org_id" INTEGER,
    "reporting_year" INTEGER NOT NULL,
    "reporting_year_date" TIMESTAMP(3),
    "type_name" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "farmer_target" INTEGER,
    "season" TEXT,
    "crop_name" TEXT,
    "area_target" INTEGER,
    "created_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "targets_pkey" PRIMARY KEY ("target_id")
);

-- CreateTable
CREATE TABLE "fld_crop_master" (
    "cfld_id" SERIAL NOT NULL,
    "season_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "crop_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fld_crop_master_pkey" PRIMARY KEY ("cfld_id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" SERIAL NOT NULL,
    "event_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "extension_activity" (
    "extension_activity_id" SERIAL NOT NULL,
    "extension_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extension_activity_pkey" PRIMARY KEY ("extension_activity_id")
);

-- CreateTable
CREATE TABLE "sector" (
    "sector_id" SERIAL NOT NULL,
    "sector_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sector_pkey" PRIMARY KEY ("sector_id")
);

-- CreateTable
CREATE TABLE "thematic_area" (
    "thematic_area_id" SERIAL NOT NULL,
    "thematic_area_name" TEXT NOT NULL,
    "sectorId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thematic_area_pkey" PRIMARY KEY ("thematic_area_id")
);

-- CreateTable
CREATE TABLE "category" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "sectorId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "sub_category" (
    "sub_category_id" SERIAL NOT NULL,
    "sub_category_name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "sectorId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_category_pkey" PRIMARY KEY ("sub_category_id")
);

-- CreateTable
CREATE TABLE "crop" (
    "crop_id" SERIAL NOT NULL,
    "crop_name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subCategoryId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_pkey" PRIMARY KEY ("crop_id")
);

-- CreateTable
CREATE TABLE "account_type_master" (
    "account_type_id" SERIAL NOT NULL,
    "account_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_type_master_pkey" PRIMARY KEY ("account_type_id")
);

-- CreateTable
CREATE TABLE "asset_funding_source_master" (
    "asset_funding_source_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_funding_source_master_pkey" PRIMARY KEY ("asset_funding_source_id")
);

-- CreateTable
CREATE TABLE "vehicle_present_status_master" (
    "vehicle_status_id" SERIAL NOT NULL,
    "status_code" TEXT NOT NULL,
    "status_label" TEXT NOT NULL,
    "hide_in_next_year" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_present_status_master_pkey" PRIMARY KEY ("vehicle_status_id")
);

-- CreateTable
CREATE TABLE "equipment_present_status_master" (
    "equipment_status_id" SERIAL NOT NULL,
    "status_code" TEXT NOT NULL,
    "status_label" TEXT NOT NULL,
    "hide_in_next_year" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_present_status_master_pkey" PRIMARY KEY ("equipment_status_id")
);

-- CreateTable
CREATE TABLE "crop_type" (
    "type_id" SERIAL NOT NULL,
    "type_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_type_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "discipline" (
    "discipline_id" SERIAL NOT NULL,
    "discipline_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discipline_pkey" PRIMARY KEY ("discipline_id")
);

-- CreateTable
CREATE TABLE "enterprise_type_master" (
    "enterprise_type_id" SERIAL NOT NULL,
    "enterprise_type_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_type_master_pkey" PRIMARY KEY ("enterprise_type_id")
);

-- CreateTable
CREATE TABLE "equipment_master" (
    "equipment_master_id" SERIAL NOT NULL,
    "equipment_type_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_master_pkey" PRIMARY KEY ("equipment_master_id")
);

-- CreateTable
CREATE TABLE "equipment_type_master" (
    "equipment_type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_type_master_pkey" PRIMARY KEY ("equipment_type_id")
);

-- CreateTable
CREATE TABLE "fld_activity" (
    "activity_id" SERIAL NOT NULL,
    "activity_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fld_activity_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "financial_project" (
    "financial_project_id" SERIAL NOT NULL,
    "project_name" TEXT NOT NULL,
    "funding_agency_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_project_pkey" PRIMARY KEY ("financial_project_id")
);

-- CreateTable
CREATE TABLE "funding_agency" (
    "funding_agency_id" SERIAL NOT NULL,
    "agency_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funding_agency_pkey" PRIMARY KEY ("funding_agency_id")
);

-- CreateTable
CREATE TABLE "funding_source_master" (
    "funding_source_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funding_source_master_pkey" PRIMARY KEY ("funding_source_id")
);

-- CreateTable
CREATE TABLE "important_day" (
    "important_day_id" SERIAL NOT NULL,
    "day_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "important_day_pkey" PRIMARY KEY ("important_day_id")
);

-- CreateTable
CREATE TABLE "kvk_infrastructure_master" (
    "infra_master_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kvk_infrastructure_master_pkey" PRIMARY KEY ("infra_master_id")
);

-- CreateTable
CREATE TABLE "impact_specific_area_master" (
    "specificAreaId" SERIAL NOT NULL,
    "specificAreaName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impact_specific_area_master_pkey" PRIMARY KEY ("specificAreaId")
);

-- CreateTable
CREATE TABLE "other_extension_activity_type" (
    "activity_type_id" SERIAL NOT NULL,
    "activity_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "other_extension_activity_type_pkey" PRIMARY KEY ("activity_type_id")
);

-- CreateTable
CREATE TABLE "pay_level_master" (
    "pay_level_id" SERIAL NOT NULL,
    "level_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pay_level_master_pkey" PRIMARY KEY ("pay_level_id")
);

-- CreateTable
CREATE TABLE "pay_scale_master" (
    "pay_scale_id" SERIAL NOT NULL,
    "scale_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pay_scale_master_pkey" PRIMARY KEY ("pay_scale_id")
);

-- CreateTable
CREATE TABLE "ppv_fra_training_type_master" (
    "type_id" SERIAL NOT NULL,
    "type_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ppv_fra_training_type_master_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "programme_type_master" (
    "programme_type_id" SERIAL NOT NULL,
    "programme_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programme_type_master_pkey" PRIMARY KEY ("programme_type_id")
);

-- CreateTable
CREATE TABLE "sanctioned_post" (
    "sanctioned_post_id" SERIAL NOT NULL,
    "post_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanctioned_post_pkey" PRIMARY KEY ("sanctioned_post_id")
);

-- CreateTable
CREATE TABLE "season" (
    "season_id" SERIAL NOT NULL,
    "season_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_pkey" PRIMARY KEY ("season_id")
);

-- CreateTable
CREATE TABLE "staff_category_master" (
    "staff_category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_category_master_pkey" PRIMARY KEY ("staff_category_id")
);

-- CreateTable
CREATE TABLE "clientele_master" (
    "clientele_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientele_master_pkey" PRIMARY KEY ("clientele_id")
);

-- CreateTable
CREATE TABLE "oft_subject" (
    "oft_subject_id" SERIAL NOT NULL,
    "oft_subject_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oft_subject_pkey" PRIMARY KEY ("oft_subject_id")
);

-- CreateTable
CREATE TABLE "oft_thematic_area" (
    "oft_thematic_area_id" SERIAL NOT NULL,
    "oft_thematic_area_name" TEXT NOT NULL,
    "oft_subject_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oft_thematic_area_pkey" PRIMARY KEY ("oft_thematic_area_id")
);

-- CreateTable
CREATE TABLE "other_extension_activity" (
    "other_extension_activity_id" SERIAL NOT NULL,
    "other_extension_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "other_extension_activity_pkey" PRIMARY KEY ("other_extension_activity_id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "product_category_id" SERIAL NOT NULL,
    "product_category_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("product_category_id")
);

-- CreateTable
CREATE TABLE "product_type" (
    "product_type_id" SERIAL NOT NULL,
    "product_category_type" TEXT NOT NULL,
    "product_category_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("product_type_id")
);

-- CreateTable
CREATE TABLE "product" (
    "product_id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_category_id" INTEGER,
    "product_type_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "cra_croping_system" (
    "cra_croping_system_id" SERIAL NOT NULL,
    "crop_name" TEXT NOT NULL,
    "season_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cra_croping_system_pkey" PRIMARY KEY ("cra_croping_system_id")
);

-- CreateTable
CREATE TABLE "cra_farming_system" (
    "cra_farming_system_id" SERIAL NOT NULL,
    "farming_system_name" TEXT NOT NULL,
    "season_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cra_farming_system_pkey" PRIMARY KEY ("cra_farming_system_id")
);

-- CreateTable
CREATE TABLE "arya_enterprise" (
    "arya_enterprise_id" SERIAL NOT NULL,
    "enterprise_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arya_enterprise_pkey" PRIMARY KEY ("arya_enterprise_id")
);

-- CreateTable
CREATE TABLE "agri_drone_demonstrations_on_master" (
    "agri_drone_demonstrations_on_id" SERIAL NOT NULL,
    "demonstrations_on_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agri_drone_demonstrations_on_master_pkey" PRIMARY KEY ("agri_drone_demonstrations_on_id")
);

-- CreateTable
CREATE TABLE "publication" (
    "publication_id" SERIAL NOT NULL,
    "publication_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publication_pkey" PRIMARY KEY ("publication_id")
);

-- CreateTable
CREATE TABLE "training_type" (
    "training_type_id" SERIAL NOT NULL,
    "training_type_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_type_pkey" PRIMARY KEY ("training_type_id")
);

-- CreateTable
CREATE TABLE "training_area" (
    "training_area_id" SERIAL NOT NULL,
    "training_area_name" TEXT NOT NULL,
    "trainingTypeId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_area_pkey" PRIMARY KEY ("training_area_id")
);

-- CreateTable
CREATE TABLE "training_thematic_area" (
    "training_thematic_area_id" SERIAL NOT NULL,
    "training_thematic_area_name" TEXT NOT NULL,
    "trainingAreaId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_thematic_area_pkey" PRIMARY KEY ("training_thematic_area_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "notification_attachments" (
    "attachment_id" SERIAL NOT NULL,
    "notification_id" INTEGER,
    "s3_key" TEXT NOT NULL,
    "file_name" TEXT,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_attachments_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "user_notification_id" SERIAL NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("user_notification_id")
);

-- CreateTable
CREATE TABLE "user_login_activity" (
    "log_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "kvk_id" INTEGER,
    "user_name" TEXT,
    "user_email" TEXT,
    "role_name" TEXT,
    "zone_id" INTEGER,
    "state_id" INTEGER,
    "district_id" INTEGER,
    "org_id" INTEGER,
    "kvk_name" TEXT,
    "activity" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "event_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_login_activity_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "description" TEXT,
    "hierarchy_level" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "modules" (
    "module_id" SERIAL NOT NULL,
    "menu_name" TEXT NOT NULL,
    "sub_menu_name" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("module_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "permission_id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "user_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_id","permission_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "token_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "zone_id" INTEGER,
    "state_id" INTEGER,
    "district_id" INTEGER,
    "org_id" INTEGER,
    "university_id" INTEGER,
    "kvk_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "phone_number" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "zone" (
    "zone_id" SERIAL NOT NULL,
    "zone_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zone_pkey" PRIMARY KEY ("zone_id")
);

-- CreateTable
CREATE TABLE "stateMaster" (
    "state_id" SERIAL NOT NULL,
    "state_name" TEXT NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stateMaster_pkey" PRIMARY KEY ("state_id")
);

-- CreateTable
CREATE TABLE "districtMaster" (
    "district_id" SERIAL NOT NULL,
    "district_name" TEXT NOT NULL,
    "stateId" INTEGER NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districtMaster_pkey" PRIMARY KEY ("district_id")
);

-- CreateTable
CREATE TABLE "orgMaster" (
    "org_id" SERIAL NOT NULL,
    "org_name" TEXT,
    "district_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orgMaster_pkey" PRIMARY KEY ("org_id")
);

-- CreateTable
CREATE TABLE "universityMaster" (
    "university_id" SERIAL NOT NULL,
    "university_name" TEXT NOT NULL,
    "org_id" INTEGER NOT NULL,
    "host_mobile" TEXT,
    "host_landline" TEXT,
    "host_fax" TEXT,
    "host_email" TEXT,
    "host_address" TEXT,
    "host_org" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universityMaster_pkey" PRIMARY KEY ("university_id")
);

-- CreateIndex
CREATE INDEX "kvk_bank_account_kvkId_idx" ON "kvk_bank_account"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_staff_kvkId_idx" ON "kvk_staff"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_staff_sanctionedPostId_idx" ON "kvk_staff"("sanctionedPostId");

-- CreateIndex
CREATE INDEX "kvk_staff_disciplineId_idx" ON "kvk_staff"("disciplineId");

-- CreateIndex
CREATE INDEX "kvk_staff_staff_name_idx" ON "kvk_staff"("staff_name");

-- CreateIndex
CREATE INDEX "kvk_staff_email_idx" ON "kvk_staff"("email");

-- CreateIndex
CREATE INDEX "kvk_staff_mobile_idx" ON "kvk_staff"("mobile");

-- CreateIndex
CREATE INDEX "kvk_staff_transfer_status_idx" ON "kvk_staff"("transfer_status");

-- CreateIndex
CREATE INDEX "kvk_staff_original_kvk_id_idx" ON "kvk_staff"("original_kvk_id");

-- CreateIndex
CREATE INDEX "kvk_staff_staffCategoryId_idx" ON "kvk_staff"("staffCategoryId");

-- CreateIndex
CREATE INDEX "kvk_staff_payLevelId_idx" ON "kvk_staff"("payLevelId");

-- CreateIndex
CREATE INDEX "kvk_staff_pay_scale_id_idx" ON "kvk_staff"("pay_scale_id");

-- CreateIndex
CREATE INDEX "kvk_equipment_kvkId_idx" ON "kvk_equipment"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_equipment_asset_funding_source_id_idx" ON "kvk_equipment"("asset_funding_source_id");

-- CreateIndex
CREATE INDEX "kvk_equipment_equipment_type_id_idx" ON "kvk_equipment"("equipment_type_id");

-- CreateIndex
CREATE INDEX "kvk_equipment_equipment_master_id_idx" ON "kvk_equipment"("equipment_master_id");

-- CreateIndex
CREATE INDEX "kvk_equipment_detail_kvkId_reporting_year_idx" ON "kvk_equipment_detail"("kvkId", "reporting_year");

-- CreateIndex
CREATE INDEX "kvk_equipment_detail_equipment_id_reporting_year_idx" ON "kvk_equipment_detail"("equipment_id", "reporting_year");

-- CreateIndex
CREATE INDEX "kvk_equipment_detail_equipment_status_id_idx" ON "kvk_equipment_detail"("equipment_status_id");

-- CreateIndex
CREATE INDEX "kvk_equipment_detail_asset_funding_source_id_idx" ON "kvk_equipment_detail"("asset_funding_source_id");

-- CreateIndex
CREATE UNIQUE INDEX "kvk_equipment_detail_equipment_id_reporting_year_key" ON "kvk_equipment_detail"("equipment_id", "reporting_year");

-- CreateIndex
CREATE INDEX "kvk_infrastructure_kvkId_idx" ON "kvk_infrastructure"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_infrastructure_infraMasterId_idx" ON "kvk_infrastructure"("infraMasterId");

-- CreateIndex
CREATE INDEX "kvk_zoneId_idx" ON "kvk"("zoneId");

-- CreateIndex
CREATE INDEX "kvk_stateId_idx" ON "kvk"("stateId");

-- CreateIndex
CREATE INDEX "kvk_districtId_idx" ON "kvk"("districtId");

-- CreateIndex
CREATE INDEX "kvk_org_id_idx" ON "kvk"("org_id");

-- CreateIndex
CREATE INDEX "kvk_university_id_idx" ON "kvk"("university_id");

-- CreateIndex
CREATE INDEX "kvk_kvk_name_idx" ON "kvk"("kvk_name");

-- CreateIndex
CREATE INDEX "kvk_email_idx" ON "kvk"("email");

-- CreateIndex
CREATE INDEX "kvk_land_details_kvk_id_idx" ON "kvk_land_details"("kvk_id");

-- CreateIndex
CREATE INDEX "staff_transfer_history_kvk_staff_id_idx" ON "staff_transfer_history"("kvk_staff_id");

-- CreateIndex
CREATE INDEX "staff_transfer_history_from_kvk_id_idx" ON "staff_transfer_history"("from_kvk_id");

-- CreateIndex
CREATE INDEX "staff_transfer_history_to_kvk_id_idx" ON "staff_transfer_history"("to_kvk_id");

-- CreateIndex
CREATE INDEX "staff_transfer_history_transfer_date_idx" ON "staff_transfer_history"("transfer_date");

-- CreateIndex
CREATE INDEX "kvk_vehicle_kvkId_idx" ON "kvk_vehicle"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_vehicle_vehicle_name_idx" ON "kvk_vehicle"("vehicle_name");

-- CreateIndex
CREATE INDEX "kvk_vehicle_detail_kvkId_reporting_year_idx" ON "kvk_vehicle_detail"("kvkId", "reporting_year");

-- CreateIndex
CREATE INDEX "kvk_vehicle_detail_vehicle_id_reporting_year_idx" ON "kvk_vehicle_detail"("vehicle_id", "reporting_year");

-- CreateIndex
CREATE INDEX "kvk_vehicle_detail_vehicle_status_id_idx" ON "kvk_vehicle_detail"("vehicle_status_id");

-- CreateIndex
CREATE INDEX "kvk_vehicle_detail_asset_funding_source_id_idx" ON "kvk_vehicle_detail"("asset_funding_source_id");

-- CreateIndex
CREATE UNIQUE INDEX "kvk_vehicle_detail_vehicle_id_reporting_year_key" ON "kvk_vehicle_detail"("vehicle_id", "reporting_year");

-- CreateIndex
CREATE INDEX "farmer_award_kvkId_idx" ON "farmer_award"("kvkId");

-- CreateIndex
CREATE INDEX "farmer_award_reporting_year_idx" ON "farmer_award"("reporting_year");

-- CreateIndex
CREATE INDEX "farmer_award_created_at_idx" ON "farmer_award"("created_at");

-- CreateIndex
CREATE INDEX "kvk_award_kvkId_idx" ON "kvk_award"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_award_reporting_year_idx" ON "kvk_award"("reporting_year");

-- CreateIndex
CREATE INDEX "kvk_award_created_at_idx" ON "kvk_award"("created_at");

-- CreateIndex
CREATE INDEX "scientist_award_kvkId_idx" ON "scientist_award"("kvkId");

-- CreateIndex
CREATE INDEX "scientist_award_reporting_year_idx" ON "scientist_award"("reporting_year");

-- CreateIndex
CREATE INDEX "scientist_award_created_at_idx" ON "scientist_award"("created_at");

-- CreateIndex
CREATE INDEX "kvk_extension_activity_kvkId_idx" ON "kvk_extension_activity"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_extension_activity_fldId_idx" ON "kvk_extension_activity"("fldId");

-- CreateIndex
CREATE INDEX "kvk_extension_activity_staffId_idx" ON "kvk_extension_activity"("staffId");

-- CreateIndex
CREATE INDEX "kvk_extension_activity_activityId_idx" ON "kvk_extension_activity"("activityId");

-- CreateIndex
CREATE INDEX "kvk_important_day_celebration_kvkId_idx" ON "kvk_important_day_celebration"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_important_day_celebration_importantDayId_idx" ON "kvk_important_day_celebration"("importantDayId");

-- CreateIndex
CREATE INDEX "kvk_important_day_celebration_event_date_idx" ON "kvk_important_day_celebration"("event_date");

-- CreateIndex
CREATE INDEX "kvk_other_extension_activity_kvkId_idx" ON "kvk_other_extension_activity"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_other_extension_activity_fldId_idx" ON "kvk_other_extension_activity"("fldId");

-- CreateIndex
CREATE INDEX "kvk_other_extension_activity_staffId_idx" ON "kvk_other_extension_activity"("staffId");

-- CreateIndex
CREATE INDEX "kvk_other_extension_activity_activityTypeId_idx" ON "kvk_other_extension_activity"("activityTypeId");

-- CreateIndex
CREATE INDEX "kvk_technology_week_celebration_kvkId_idx" ON "kvk_technology_week_celebration"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_technology_week_celebration_start_date_idx" ON "kvk_technology_week_celebration"("start_date");

-- CreateIndex
CREATE INDEX "fld_extension_kvkId_idx" ON "fld_extension"("kvkId");

-- CreateIndex
CREATE INDEX "fld_extension_fldId_idx" ON "fld_extension"("fldId");

-- CreateIndex
CREATE INDEX "fld_extension_activityId_idx" ON "fld_extension"("activityId");

-- CreateIndex
CREATE INDEX "fld_extension_reporting_year_idx" ON "fld_extension"("reporting_year");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_kvkId_idx" ON "kvk_fld_introduction"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_seasonId_idx" ON "kvk_fld_introduction"("seasonId");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_sectorId_idx" ON "kvk_fld_introduction"("sectorId");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_thematicAreaId_idx" ON "kvk_fld_introduction"("thematicAreaId");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_categoryId_idx" ON "kvk_fld_introduction"("categoryId");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_subCategoryId_idx" ON "kvk_fld_introduction"("subCategoryId");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_cropId_idx" ON "kvk_fld_introduction"("cropId");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_kvkStaffId_idx" ON "kvk_fld_introduction"("kvkStaffId");

-- CreateIndex
CREATE INDEX "kvk_fld_introduction_expected_completion_date_idx" ON "kvk_fld_introduction"("expected_completion_date");

-- CreateIndex
CREATE UNIQUE INDEX "kvk_fld_result_kvk_fld_id_key" ON "kvk_fld_result"("kvk_fld_id");

-- CreateIndex
CREATE INDEX "kvk_fld_result_kvk_fld_id_idx" ON "kvk_fld_result"("kvk_fld_id");

-- CreateIndex
CREATE INDEX "fld_technical_feedback_kvkId_idx" ON "fld_technical_feedback"("kvkId");

-- CreateIndex
CREATE INDEX "fld_technical_feedback_fldId_idx" ON "fld_technical_feedback"("fldId");

-- CreateIndex
CREATE INDEX "fld_technical_feedback_cropId_idx" ON "fld_technical_feedback"("cropId");

-- CreateIndex
CREATE INDEX "fld_technical_feedback_reporting_year_idx" ON "fld_technical_feedback"("reporting_year");

-- CreateIndex
CREATE UNIQUE INDEX "oft_technology_type_name_key" ON "oft_technology_type"("name");

-- CreateIndex
CREATE INDEX "kvk_oft_technology_kvkOftId_idx" ON "kvk_oft_technology"("kvkOftId");

-- CreateIndex
CREATE INDEX "kvk_oft_technology_oftTechnologyTypeId_idx" ON "kvk_oft_technology"("oftTechnologyTypeId");

-- CreateIndex
CREATE INDEX "kvk_oft_technology_option_key_idx" ON "kvk_oft_technology"("option_key");

-- CreateIndex
CREATE UNIQUE INDEX "kvk_oft_technology_kvkOftId_option_key_key" ON "kvk_oft_technology"("kvkOftId", "option_key");

-- CreateIndex
CREATE INDEX "kvk_oft_kvkId_idx" ON "kvk_oft"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_oft_seasonId_idx" ON "kvk_oft"("seasonId");

-- CreateIndex
CREATE INDEX "kvk_oft_staffId_idx" ON "kvk_oft"("staffId");

-- CreateIndex
CREATE INDEX "kvk_oft_disciplineId_idx" ON "kvk_oft"("disciplineId");

-- CreateIndex
CREATE INDEX "kvk_oft_oftSubjectId_idx" ON "kvk_oft"("oftSubjectId");

-- CreateIndex
CREATE INDEX "kvk_oft_oftThematicAreaId_idx" ON "kvk_oft"("oftThematicAreaId");

-- CreateIndex
CREATE INDEX "kvk_oft_source_of_funding_id_idx" ON "kvk_oft"("source_of_funding_id");

-- CreateIndex
CREATE INDEX "kvk_oft_expected_completion_date_idx" ON "kvk_oft"("expected_completion_date");

-- CreateIndex
CREATE INDEX "kvk_oft_ongoing_completed_idx" ON "kvk_oft"("ongoing_completed");

-- CreateIndex
CREATE INDEX "kvk_oft_transferred_from_oft_id_idx" ON "kvk_oft"("transferred_from_oft_id");

-- CreateIndex
CREATE UNIQUE INDEX "oft_result_report_kvk_oft_id_key" ON "oft_result_report"("kvk_oft_id");

-- CreateIndex
CREATE INDEX "oft_result_report_kvk_oft_id_idx" ON "oft_result_report"("kvk_oft_id");

-- CreateIndex
CREATE INDEX "oft_result_table_oft_result_report_id_sort_order_idx" ON "oft_result_table"("oft_result_report_id", "sort_order");

-- CreateIndex
CREATE INDEX "oft_result_table_column_oft_result_table_id_sort_order_idx" ON "oft_result_table_column"("oft_result_table_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "oft_result_table_column_oft_result_table_id_column_key_key" ON "oft_result_table_column"("oft_result_table_id", "column_key");

-- CreateIndex
CREATE INDEX "oft_result_table_row_oft_result_table_id_sort_order_idx" ON "oft_result_table_row"("oft_result_table_id", "sort_order");

-- CreateIndex
CREATE INDEX "oft_result_table_row_option_key_idx" ON "oft_result_table_row"("option_key");

-- CreateIndex
CREATE INDEX "oft_result_table_cell_oft_result_table_row_id_idx" ON "oft_result_table_cell"("oft_result_table_row_id");

-- CreateIndex
CREATE INDEX "oft_result_table_cell_oft_result_table_column_id_idx" ON "oft_result_table_cell"("oft_result_table_column_id");

-- CreateIndex
CREATE UNIQUE INDEX "oft_result_table_cell_oft_result_table_row_id_oft_result_ta_key" ON "oft_result_table_cell"("oft_result_table_row_id", "oft_result_table_column_id");

-- CreateIndex
CREATE INDEX "kvk_production_supply_kvkId_idx" ON "kvk_production_supply"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_production_supply_reporting_year_idx" ON "kvk_production_supply"("reporting_year");

-- CreateIndex
CREATE INDEX "kvk_production_supply_product_category_id_idx" ON "kvk_production_supply"("product_category_id");

-- CreateIndex
CREATE INDEX "kvk_production_supply_product_type_id_idx" ON "kvk_production_supply"("product_type_id");

-- CreateIndex
CREATE INDEX "kvk_production_supply_product_id_idx" ON "kvk_production_supply"("product_id");

-- CreateIndex
CREATE INDEX "kvk_agri_drone_demonstration_kvkId_idx" ON "kvk_agri_drone_demonstration"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_agri_drone_demonstration_agri_drone_id_idx" ON "kvk_agri_drone_demonstration"("agri_drone_id");

-- CreateIndex
CREATE INDEX "kvk_agri_drone_demonstration_reporting_year_idx" ON "kvk_agri_drone_demonstration"("reporting_year");

-- CreateIndex
CREATE INDEX "kvk_agri_drone_demonstration_district_id_idx" ON "kvk_agri_drone_demonstration"("district_id");

-- CreateIndex
CREATE INDEX "kvk_agri_drone_demonstration_agri_drone_demonstrations_on_i_idx" ON "kvk_agri_drone_demonstration"("agri_drone_demonstrations_on_id");

-- CreateIndex
CREATE INDEX "kvk_agri_drone_kvkId_idx" ON "kvk_agri_drone"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_agri_drone_reporting_year_idx" ON "kvk_agri_drone"("reporting_year");

-- CreateIndex
CREATE INDEX "arya_prev_year_kvkId_idx" ON "arya_prev_year"("kvkId");

-- CreateIndex
CREATE INDEX "arya_prev_year_enterpriseId_idx" ON "arya_prev_year"("enterpriseId");

-- CreateIndex
CREATE INDEX "arya_prev_year_reporting_year_idx" ON "arya_prev_year"("reporting_year");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_master_enterprise_name_key" ON "enterprise_master"("enterprise_name");

-- CreateIndex
CREATE INDEX "enterprise_master_enterprise_name_idx" ON "enterprise_master"("enterprise_name");

-- CreateIndex
CREATE INDEX "arya_current_year_kvkId_idx" ON "arya_current_year"("kvkId");

-- CreateIndex
CREATE INDEX "arya_current_year_enterpriseId_idx" ON "arya_current_year"("enterpriseId");

-- CreateIndex
CREATE INDEX "arya_current_year_reporting_year_idx" ON "arya_current_year"("reporting_year");

-- CreateIndex
CREATE UNIQUE INDEX "budget_item_item_name_key" ON "budget_item"("item_name");

-- CreateIndex
CREATE INDEX "kvk_budget_utilization_kvkId_idx" ON "kvk_budget_utilization"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_budget_utilization_year_idx" ON "kvk_budget_utilization"("year");

-- CreateIndex
CREATE INDEX "kvk_budget_utilization_reporting_year_date_idx" ON "kvk_budget_utilization"("reporting_year_date");

-- CreateIndex
CREATE INDEX "kvk_budget_utilization_kvkId_reporting_year_date_idx" ON "kvk_budget_utilization"("kvkId", "reporting_year_date");

-- CreateIndex
CREATE INDEX "kvk_budget_utilization_seasonId_idx" ON "kvk_budget_utilization"("seasonId");

-- CreateIndex
CREATE INDEX "kvk_budget_utilization_cropId_idx" ON "kvk_budget_utilization"("cropId");

-- CreateIndex
CREATE INDEX "kvk_budget_utilization_item_budgetId_idx" ON "kvk_budget_utilization_item"("budgetId");

-- CreateIndex
CREATE INDEX "kvk_budget_utilization_item_budgetItemId_idx" ON "kvk_budget_utilization_item"("budgetItemId");

-- CreateIndex
CREATE UNIQUE INDEX "kvk_budget_utilization_item_budgetId_budgetItemId_key" ON "kvk_budget_utilization_item"("budgetId", "budgetItemId");

-- CreateIndex
CREATE INDEX "extension_activity_organized_kvkId_idx" ON "extension_activity_organized"("kvkId");

-- CreateIndex
CREATE INDEX "extension_activity_organized_seasonId_idx" ON "extension_activity_organized"("seasonId");

-- CreateIndex
CREATE INDEX "extension_activity_organized_extensionActivityId_idx" ON "extension_activity_organized"("extensionActivityId");

-- CreateIndex
CREATE INDEX "cfl_cfld_technical_parameter_kvkId_idx" ON "cfl_cfld_technical_parameter"("kvkId");

-- CreateIndex
CREATE INDEX "cfl_cfld_technical_parameter_cropId_idx" ON "cfl_cfld_technical_parameter"("cropId");

-- CreateIndex
CREATE INDEX "cfl_cfld_technical_parameter_seasonId_idx" ON "cfl_cfld_technical_parameter"("seasonId");

-- CreateIndex
CREATE INDEX "cfl_cfld_technical_parameter_type_id_idx" ON "cfl_cfld_technical_parameter"("type_id");

-- CreateIndex
CREATE INDEX "cfl_cfld_technical_parameter_reporting_year_idx" ON "cfl_cfld_technical_parameter"("reporting_year");

-- CreateIndex
CREATE INDEX "cfl_cfld_economic_parameters_cfl_cfld_tech_id_idx" ON "cfl_cfld_economic_parameters"("cfl_cfld_tech_id");

-- CreateIndex
CREATE UNIQUE INDEX "cfl_cfld_economic_parameters_cfl_cfld_tech_id_key" ON "cfl_cfld_economic_parameters"("cfl_cfld_tech_id");

-- CreateIndex
CREATE INDEX "cfl_cfld_socio_economic_parameters_cfl_cfld_tech_id_idx" ON "cfl_cfld_socio_economic_parameters"("cfl_cfld_tech_id");

-- CreateIndex
CREATE UNIQUE INDEX "cfl_cfld_socio_economic_parameters_cfl_cfld_tech_id_key" ON "cfl_cfld_socio_economic_parameters"("cfl_cfld_tech_id");

-- CreateIndex
CREATE INDEX "cfl_cfld_farmers_perception_parameters_cfl_cfld_tech_id_idx" ON "cfl_cfld_farmers_perception_parameters"("cfl_cfld_tech_id");

-- CreateIndex
CREATE UNIQUE INDEX "cfl_cfld_farmers_perception_parameters_cfl_cfld_tech_id_key" ON "cfl_cfld_farmers_perception_parameters"("cfl_cfld_tech_id");

-- CreateIndex
CREATE INDEX "cra_details_kvk_id_idx" ON "cra_details"("kvk_id");

-- CreateIndex
CREATE INDEX "cra_details_cra_croping_system_id_idx" ON "cra_details"("cra_croping_system_id");

-- CreateIndex
CREATE INDEX "cra_details_cra_farming_system_id_idx" ON "cra_details"("cra_farming_system_id");

-- CreateIndex
CREATE INDEX "cra_extension_activity_kvk_id_idx" ON "cra_extension_activity"("kvk_id");

-- CreateIndex
CREATE INDEX "csisa_kvkId_idx" ON "csisa"("kvkId");

-- CreateIndex
CREATE INDEX "csisa_seasonId_idx" ON "csisa"("seasonId");

-- CreateIndex
CREATE INDEX "csisa_reporting_year_idx" ON "csisa"("reporting_year");

-- CreateIndex
CREATE INDEX "csisa_crop_detail_csisaId_idx" ON "csisa_crop_detail"("csisaId");

-- CreateIndex
CREATE INDEX "drmr_activity_kvkId_idx" ON "drmr_activity"("kvkId");

-- CreateIndex
CREATE INDEX "drmr_activity_reporting_year_idx" ON "drmr_activity"("reporting_year");

-- CreateIndex
CREATE INDEX "drmr_activity_component_drmrActivityId_idx" ON "drmr_activity_component"("drmrActivityId");

-- CreateIndex
CREATE INDEX "drmr_activity_component_activity_type_idx" ON "drmr_activity_component"("activity_type");

-- CreateIndex
CREATE INDEX "drmr_details_kvkId_idx" ON "drmr_details"("kvkId");

-- CreateIndex
CREATE INDEX "drmr_details_reporting_year_idx" ON "drmr_details"("reporting_year");

-- CreateIndex
CREATE INDEX "fpo_cbbo_details_kvkId_idx" ON "fpo_cbbo_details"("kvkId");

-- CreateIndex
CREATE INDEX "fpo_cbbo_details_reporting_year_idx" ON "fpo_cbbo_details"("reporting_year");

-- CreateIndex
CREATE UNIQUE INDEX "fpo_management_registration_number_key" ON "fpo_management"("registration_number");

-- CreateIndex
CREATE INDEX "fpo_management_kvkId_idx" ON "fpo_management"("kvkId");

-- CreateIndex
CREATE INDEX "fpo_management_fpo_name_idx" ON "fpo_management"("fpo_name");

-- CreateIndex
CREATE INDEX "fpo_management_reporting_year_idx" ON "fpo_management"("reporting_year");

-- CreateIndex
CREATE INDEX "nari_bio_fortified_crop_kvkId_idx" ON "nari_bio_fortified_crop"("kvkId");

-- CreateIndex
CREATE INDEX "nari_bio_fortified_crop_activity_id_idx" ON "nari_bio_fortified_crop"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "crop_category_name_key" ON "crop_category"("name");

-- CreateIndex
CREATE INDEX "nari_bio_fortified_crop_result_nari_bio_fortified_crop_id_idx" ON "nari_bio_fortified_crop_result"("nari_bio_fortified_crop_id");

-- CreateIndex
CREATE INDEX "nari_extension_activity_kvkId_idx" ON "nari_extension_activity"("kvkId");

-- CreateIndex
CREATE INDEX "nari_extension_activity_activity_id_idx" ON "nari_extension_activity"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "nari_activity_activity_name_key" ON "nari_activity"("activity_name");

-- CreateIndex
CREATE INDEX "nari_nutritional_garden_kvkId_idx" ON "nari_nutritional_garden"("kvkId");

-- CreateIndex
CREATE INDEX "nari_nutritional_garden_activity_id_idx" ON "nari_nutritional_garden"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_garden_type_name_key" ON "nutrition_garden_type"("name");

-- CreateIndex
CREATE INDEX "nari_nutritional_garden_result_nari_nutritional_garden_id_idx" ON "nari_nutritional_garden_result"("nari_nutritional_garden_id");

-- CreateIndex
CREATE INDEX "nari_training_programme_kvkId_idx" ON "nari_training_programme"("kvkId");

-- CreateIndex
CREATE INDEX "nari_training_programme_activity_id_idx" ON "nari_training_programme"("activity_id");

-- CreateIndex
CREATE INDEX "nari_value_addition_kvkId_idx" ON "nari_value_addition"("kvkId");

-- CreateIndex
CREATE INDEX "nari_value_addition_activity_id_idx" ON "nari_value_addition"("activity_id");

-- CreateIndex
CREATE INDEX "nari_value_addition_result_nari_value_addition_id_idx" ON "nari_value_addition_result"("nari_value_addition_id");

-- CreateIndex
CREATE INDEX "beneficiaries_details_kvkId_idx" ON "beneficiaries_details"("kvkId");

-- CreateIndex
CREATE INDEX "beneficiaries_details_reporting_year_date_idx" ON "beneficiaries_details"("reporting_year_date");

-- CreateIndex
CREATE INDEX "beneficiaries_details_kvkId_reporting_year_date_idx" ON "beneficiaries_details"("kvkId", "reporting_year_date");

-- CreateIndex
CREATE INDEX "demonstration_info_kvkId_idx" ON "demonstration_info"("kvkId");

-- CreateIndex
CREATE INDEX "farmers_practicing_natural_farming_kvk_id_idx" ON "farmers_practicing_natural_farming"("kvk_id");

-- CreateIndex
CREATE INDEX "financial_information_kvkId_idx" ON "financial_information"("kvkId");

-- CreateIndex
CREATE INDEX "financial_information_reporting_year_date_idx" ON "financial_information"("reporting_year_date");

-- CreateIndex
CREATE INDEX "financial_information_kvkId_reporting_year_date_idx" ON "financial_information"("kvkId", "reporting_year_date");

-- CreateIndex
CREATE INDEX "geographical_info_kvkId_idx" ON "geographical_info"("kvkId");

-- CreateIndex
CREATE INDEX "geographical_info_reporting_year_idx" ON "geographical_info"("reporting_year");

-- CreateIndex
CREATE INDEX "physical_info_kvkId_idx" ON "physical_info"("kvkId");

-- CreateIndex
CREATE UNIQUE INDEX "natural_farming_activity_master_activity_name_key" ON "natural_farming_activity_master"("activity_name");

-- CreateIndex
CREATE INDEX "soil_data_information_kvkId_idx" ON "soil_data_information"("kvkId");

-- CreateIndex
CREATE INDEX "soil_data_information_reporting_year_date_idx" ON "soil_data_information"("reporting_year_date");

-- CreateIndex
CREATE INDEX "soil_data_information_kvkId_reporting_year_date_idx" ON "soil_data_information"("kvkId", "reporting_year_date");

-- CreateIndex
CREATE UNIQUE INDEX "natural_farming_soil_parameter_master_parameter_name_key" ON "natural_farming_soil_parameter_master"("parameter_name");

-- CreateIndex
CREATE INDEX "nicra_convergence_programme_kvk_id_idx" ON "nicra_convergence_programme"("kvk_id");

-- CreateIndex
CREATE INDEX "nicra_dignitaries_visited_kvk_id_idx" ON "nicra_dignitaries_visited"("kvk_id");

-- CreateIndex
CREATE INDEX "nicra_dignitaries_visited_dignitary_type_id_idx" ON "nicra_dignitaries_visited"("dignitary_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "nicra_dignitary_type_master_name_key" ON "nicra_dignitary_type_master"("name");

-- CreateIndex
CREATE INDEX "nicra_farm_implement_kvk_id_idx" ON "nicra_farm_implement"("kvk_id");

-- CreateIndex
CREATE INDEX "nicra_intervention_kvk_id_idx" ON "nicra_intervention"("kvk_id");

-- CreateIndex
CREATE INDEX "nicra_intervention_seed_bank_fodder_bank_id_idx" ON "nicra_intervention"("seed_bank_fodder_bank_id");

-- CreateIndex
CREATE UNIQUE INDEX "nicra_seed_bank_fodder_bank_master_name_key" ON "nicra_seed_bank_fodder_bank_master"("name");

-- CreateIndex
CREATE INDEX "nicra_basic_info_kvkId_idx" ON "nicra_basic_info"("kvkId");

-- CreateIndex
CREATE UNIQUE INDEX "nicra_category_category_name_key" ON "nicra_category"("category_name");

-- CreateIndex
CREATE INDEX "nicra_sub_category_nicraCategoryId_idx" ON "nicra_sub_category"("nicraCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "nicra_sub_category_sub_category_name_nicraCategoryId_key" ON "nicra_sub_category"("sub_category_name", "nicraCategoryId");

-- CreateIndex
CREATE INDEX "nicra_details_kvkId_idx" ON "nicra_details"("kvkId");

-- CreateIndex
CREATE INDEX "nicra_details_nicraCategoryId_idx" ON "nicra_details"("nicraCategoryId");

-- CreateIndex
CREATE INDEX "nicra_details_nicraSubCategoryId_idx" ON "nicra_details"("nicraSubCategoryId");

-- CreateIndex
CREATE INDEX "nicra_details_reporting_year_idx" ON "nicra_details"("reporting_year");

-- CreateIndex
CREATE INDEX "nicra_extension_activity_kvkId_idx" ON "nicra_extension_activity"("kvkId");

-- CreateIndex
CREATE INDEX "nicra_training_kvkId_idx" ON "nicra_training"("kvkId");

-- CreateIndex
CREATE INDEX "nicra_pi_copi_kvk_id_idx" ON "nicra_pi_copi"("kvk_id");

-- CreateIndex
CREATE INDEX "nicra_pi_copi_pi_type_id_idx" ON "nicra_pi_copi"("pi_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "nicra_pi_type_master_name_key" ON "nicra_pi_type_master"("name");

-- CreateIndex
CREATE INDEX "nicra_revenue_generated_kvk_id_idx" ON "nicra_revenue_generated"("kvk_id");

-- CreateIndex
CREATE INDEX "nicra_soil_health_card_kvk_id_idx" ON "nicra_soil_health_card"("kvk_id");

-- CreateIndex
CREATE INDEX "nicra_vcrmc_kvk_id_idx" ON "nicra_vcrmc"("kvk_id");

-- CreateIndex
CREATE INDEX "kvk_other_programme_kvkId_idx" ON "kvk_other_programme"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_seed_hub_program_kvkId_idx" ON "kvk_seed_hub_program"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_seed_hub_program_seasonId_idx" ON "kvk_seed_hub_program"("seasonId");

-- CreateIndex
CREATE INDEX "kvk_seed_hub_program_reporting_year_idx" ON "kvk_seed_hub_program"("reporting_year");

-- CreateIndex
CREATE UNIQUE INDEX "tsp_scsp_district_name_key" ON "tsp_scsp_district"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tsp_scsp_type_master_type_name_key" ON "tsp_scsp_type_master"("type_name");

-- CreateIndex
CREATE INDEX "tsp_scsp_kvkId_idx" ON "tsp_scsp"("kvkId");

-- CreateIndex
CREATE INDEX "tsp_scsp_tsp_scsp_type_id_idx" ON "tsp_scsp"("tsp_scsp_type_id");

-- CreateIndex
CREATE INDEX "tsp_scsp_activityId_idx" ON "tsp_scsp"("activityId");

-- CreateIndex
CREATE INDEX "tsp_scsp_districtId_idx" ON "tsp_scsp"("districtId");

-- CreateIndex
CREATE INDEX "kvk_publication_details_kvkId_idx" ON "kvk_publication_details"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_publication_details_reporting_year_idx" ON "kvk_publication_details"("reporting_year");

-- CreateIndex
CREATE INDEX "kvk_publication_details_publication_id_idx" ON "kvk_publication_details"("publication_id");

-- CreateIndex
CREATE INDEX "kvk_publication_details_created_at_idx" ON "kvk_publication_details"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "course_coordinator_master_name_key" ON "course_coordinator_master"("name");

-- CreateIndex
CREATE INDEX "kisan_sarathi_kvk_id_idx" ON "kisan_sarathi"("kvk_id");

-- CreateIndex
CREATE INDEX "kmas_kvk_id_idx" ON "kmas"("kvk_id");

-- CreateIndex
CREATE INDEX "mobile_app_kvk_id_idx" ON "mobile_app"("kvk_id");

-- CreateIndex
CREATE INDEX "msg_details_kvk_id_idx" ON "msg_details"("kvk_id");

-- CreateIndex
CREATE INDEX "web_portal_kvk_id_idx" ON "web_portal"("kvk_id");

-- CreateIndex
CREATE INDEX "form_attachments_kvk_id_form_code_record_id_idx" ON "form_attachments"("kvk_id", "form_code", "record_id");

-- CreateIndex
CREATE INDEX "form_attachments_form_code_record_id_idx" ON "form_attachments"("form_code", "record_id");

-- CreateIndex
CREATE INDEX "form_attachments_kvk_id_form_code_kind_created_at_idx" ON "form_attachments"("kvk_id", "form_code", "kind", "created_at");

-- CreateIndex
CREATE INDEX "form_attachments_reporting_year_date_idx" ON "form_attachments"("reporting_year_date");

-- CreateIndex
CREATE INDEX "form_attachments_uploaded_by_user_id_idx" ON "form_attachments"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "hrd_program_kvkId_idx" ON "hrd_program"("kvkId");

-- CreateIndex
CREATE INDEX "hrd_program_kvkStaffId_idx" ON "hrd_program"("kvkStaffId");

-- CreateIndex
CREATE INDEX "hrd_program_start_date_idx" ON "hrd_program"("start_date");

-- CreateIndex
CREATE INDEX "hrd_program_created_at_idx" ON "hrd_program"("created_at");

-- CreateIndex
CREATE INDEX "atari_meeting_kvkId_idx" ON "atari_meeting"("kvkId");

-- CreateIndex
CREATE INDEX "atari_meeting_reporting_year_idx" ON "atari_meeting"("reporting_year");

-- CreateIndex
CREATE INDEX "sac_meeting_kvkId_idx" ON "sac_meeting"("kvkId");

-- CreateIndex
CREATE INDEX "nyk_training_kvkId_idx" ON "nyk_training"("kvkId");

-- CreateIndex
CREATE INDEX "ppv_fra_plant_varieties_kvkId_idx" ON "ppv_fra_plant_varieties"("kvkId");

-- CreateIndex
CREATE INDEX "ppv_fra_plant_varieties_reporting_year_date_idx" ON "ppv_fra_plant_varieties"("reporting_year_date");

-- CreateIndex
CREATE INDEX "ppv_fra_plant_varieties_kvkId_reporting_year_date_idx" ON "ppv_fra_plant_varieties"("kvkId", "reporting_year_date");

-- CreateIndex
CREATE INDEX "ppv_fra_training_kvkId_idx" ON "ppv_fra_training"("kvkId");

-- CreateIndex
CREATE INDEX "prevalent_diseases_in_crop_kvkId_idx" ON "prevalent_diseases_in_crop"("kvkId");

-- CreateIndex
CREATE INDEX "prevalent_diseases_livestock_kvkId_idx" ON "prevalent_diseases_livestock"("kvkId");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_type_name_key" ON "attachment_type"("name");

-- CreateIndex
CREATE INDEX "rawe_fet_fit_programme_kvkId_idx" ON "rawe_fet_fit_programme"("kvkId");

-- CreateIndex
CREATE UNIQUE INDEX "dignitary_type_name_key" ON "dignitary_type"("name");

-- CreateIndex
CREATE INDEX "vip_visitors_kvkId_idx" ON "vip_visitors"("kvkId");

-- CreateIndex
CREATE INDEX "module_images_kvk_id_image_date_idx" ON "module_images"("kvk_id", "image_date");

-- CreateIndex
CREATE INDEX "module_images_kvk_id_reporting_year_date_idx" ON "module_images"("kvk_id", "reporting_year_date");

-- CreateIndex
CREATE INDEX "module_images_reporting_year_image_date_idx" ON "module_images"("reporting_year", "image_date");

-- CreateIndex
CREATE INDEX "module_images_reporting_year_date_image_date_idx" ON "module_images"("reporting_year_date", "image_date");

-- CreateIndex
CREATE INDEX "module_images_module_id_image_date_idx" ON "module_images"("module_id", "image_date");

-- CreateIndex
CREATE INDEX "module_images_zone_id_image_date_idx" ON "module_images"("zone_id", "image_date");

-- CreateIndex
CREATE INDEX "module_images_state_id_image_date_idx" ON "module_images"("state_id", "image_date");

-- CreateIndex
CREATE INDEX "module_images_district_id_image_date_idx" ON "module_images"("district_id", "image_date");

-- CreateIndex
CREATE INDEX "module_images_org_id_image_date_idx" ON "module_images"("org_id", "image_date");

-- CreateIndex
CREATE INDEX "module_images_uploaded_by_user_id_image_date_idx" ON "module_images"("uploaded_by_user_id", "image_date");

-- CreateIndex
CREATE INDEX "district_level_data_kvkId_idx" ON "district_level_data"("kvkId");

-- CreateIndex
CREATE INDEX "district_level_data_reporting_year_idx" ON "district_level_data"("reporting_year");

-- CreateIndex
CREATE INDEX "district_level_data_account_type_idx" ON "district_level_data"("account_type");

-- CreateIndex
CREATE INDEX "district_level_data_created_at_idx" ON "district_level_data"("created_at");

-- CreateIndex
CREATE INDEX "operational_area_kvkId_idx" ON "operational_area"("kvkId");

-- CreateIndex
CREATE INDEX "operational_area_reporting_year_idx" ON "operational_area"("reporting_year");

-- CreateIndex
CREATE INDEX "operational_area_village_idx" ON "operational_area"("village");

-- CreateIndex
CREATE INDEX "operational_area_block_idx" ON "operational_area"("block");

-- CreateIndex
CREATE INDEX "operational_area_created_at_idx" ON "operational_area"("created_at");

-- CreateIndex
CREATE INDEX "priority_thrust_area_kvkId_idx" ON "priority_thrust_area"("kvkId");

-- CreateIndex
CREATE INDEX "priority_thrust_area_reporting_year_idx" ON "priority_thrust_area"("reporting_year");

-- CreateIndex
CREATE INDEX "priority_thrust_area_thrust_area_idx" ON "priority_thrust_area"("thrust_area");

-- CreateIndex
CREATE INDEX "priority_thrust_area_created_at_idx" ON "priority_thrust_area"("created_at");

-- CreateIndex
CREATE INDEX "village_adoption_kvkId_idx" ON "village_adoption"("kvkId");

-- CreateIndex
CREATE INDEX "village_adoption_reporting_year_idx" ON "village_adoption"("reporting_year");

-- CreateIndex
CREATE INDEX "village_adoption_village_idx" ON "village_adoption"("village");

-- CreateIndex
CREATE INDEX "village_adoption_created_at_idx" ON "village_adoption"("created_at");

-- CreateIndex
CREATE INDEX "budget_detail_kvkId_idx" ON "budget_detail"("kvkId");

-- CreateIndex
CREATE INDEX "budget_detail_start_date_idx" ON "budget_detail"("start_date");

-- CreateIndex
CREATE INDEX "budget_detail_end_date_idx" ON "budget_detail"("end_date");

-- CreateIndex
CREATE INDEX "budget_detail_created_at_idx" ON "budget_detail"("created_at");

-- CreateIndex
CREATE INDEX "project_budget_kvkId_idx" ON "project_budget"("kvkId");

-- CreateIndex
CREATE INDEX "project_budget_financial_project_id_idx" ON "project_budget"("financial_project_id");

-- CreateIndex
CREATE INDEX "project_budget_funding_agency_id_idx" ON "project_budget"("funding_agency_id");

-- CreateIndex
CREATE INDEX "project_budget_start_date_idx" ON "project_budget"("start_date");

-- CreateIndex
CREATE INDEX "project_budget_end_date_idx" ON "project_budget"("end_date");

-- CreateIndex
CREATE INDEX "project_budget_created_at_idx" ON "project_budget"("created_at");

-- CreateIndex
CREATE INDEX "resource_generation_kvkId_idx" ON "resource_generation"("kvkId");

-- CreateIndex
CREATE INDEX "resource_generation_programme_name_idx" ON "resource_generation"("programme_name");

-- CreateIndex
CREATE INDEX "resource_generation_start_date_idx" ON "resource_generation"("start_date");

-- CreateIndex
CREATE INDEX "resource_generation_end_date_idx" ON "resource_generation"("end_date");

-- CreateIndex
CREATE INDEX "resource_generation_created_at_idx" ON "resource_generation"("created_at");

-- CreateIndex
CREATE INDEX "revenue_generation_kvkId_idx" ON "revenue_generation"("kvkId");

-- CreateIndex
CREATE INDEX "revenue_generation_head_name_idx" ON "revenue_generation"("head_name");

-- CreateIndex
CREATE INDEX "revenue_generation_start_date_idx" ON "revenue_generation"("start_date");

-- CreateIndex
CREATE INDEX "revenue_generation_end_date_idx" ON "revenue_generation"("end_date");

-- CreateIndex
CREATE INDEX "revenue_generation_created_at_idx" ON "revenue_generation"("created_at");

-- CreateIndex
CREATE INDEX "revolving_fund_kvkId_idx" ON "revolving_fund"("kvkId");

-- CreateIndex
CREATE INDEX "revolving_fund_reporting_year_idx" ON "revolving_fund"("reporting_year");

-- CreateIndex
CREATE INDEX "revolving_fund_created_at_idx" ON "revolving_fund"("created_at");

-- CreateIndex
CREATE INDEX "entrepreneurship_kvkId_idx" ON "entrepreneurship"("kvkId");

-- CreateIndex
CREATE INDEX "entrepreneurship_reporting_year_idx" ON "entrepreneurship"("reporting_year");

-- CreateIndex
CREATE INDEX "entrepreneurship_enterprise_type_idx" ON "entrepreneurship"("enterprise_type");

-- CreateIndex
CREATE INDEX "entrepreneurship_created_at_idx" ON "entrepreneurship"("created_at");

-- CreateIndex
CREATE INDEX "kvk_impact_activity_kvkId_idx" ON "kvk_impact_activity"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_impact_activity_reporting_year_idx" ON "kvk_impact_activity"("reporting_year");

-- CreateIndex
CREATE INDEX "kvk_impact_activity_created_at_idx" ON "kvk_impact_activity"("created_at");

-- CreateIndex
CREATE INDEX "success_story_kvkId_idx" ON "success_story"("kvkId");

-- CreateIndex
CREATE INDEX "success_story_reporting_year_idx" ON "success_story"("reporting_year");

-- CreateIndex
CREATE INDEX "success_story_farmer_name_idx" ON "success_story"("farmer_name");

-- CreateIndex
CREATE INDEX "success_story_created_at_idx" ON "success_story"("created_at");

-- CreateIndex
CREATE INDEX "demonstration_unit_kvkId_idx" ON "demonstration_unit"("kvkId");

-- CreateIndex
CREATE INDEX "demonstration_unit_reporting_year_idx" ON "demonstration_unit"("reporting_year");

-- CreateIndex
CREATE INDEX "demonstration_unit_demo_unit_name_idx" ON "demonstration_unit"("demo_unit_name");

-- CreateIndex
CREATE INDEX "demonstration_unit_created_at_idx" ON "demonstration_unit"("created_at");

-- CreateIndex
CREATE INDEX "hostel_utilization_kvkId_idx" ON "hostel_utilization"("kvkId");

-- CreateIndex
CREATE INDEX "hostel_utilization_reporting_year_idx" ON "hostel_utilization"("reporting_year");

-- CreateIndex
CREATE INDEX "hostel_utilization_months_idx" ON "hostel_utilization"("months");

-- CreateIndex
CREATE INDEX "hostel_utilization_created_at_idx" ON "hostel_utilization"("created_at");

-- CreateIndex
CREATE INDEX "instructional_farm_crop_kvkId_idx" ON "instructional_farm_crop"("kvkId");

-- CreateIndex
CREATE INDEX "instructional_farm_crop_reporting_year_idx" ON "instructional_farm_crop"("reporting_year");

-- CreateIndex
CREATE INDEX "instructional_farm_crop_season_id_idx" ON "instructional_farm_crop"("season_id");

-- CreateIndex
CREATE INDEX "instructional_farm_crop_crop_name_idx" ON "instructional_farm_crop"("crop_name");

-- CreateIndex
CREATE INDEX "instructional_farm_crop_created_at_idx" ON "instructional_farm_crop"("created_at");

-- CreateIndex
CREATE INDEX "instructional_farm_livestock_kvkId_idx" ON "instructional_farm_livestock"("kvkId");

-- CreateIndex
CREATE INDEX "instructional_farm_livestock_reporting_year_idx" ON "instructional_farm_livestock"("reporting_year");

-- CreateIndex
CREATE INDEX "instructional_farm_livestock_animal_name_idx" ON "instructional_farm_livestock"("animal_name");

-- CreateIndex
CREATE INDEX "instructional_farm_livestock_created_at_idx" ON "instructional_farm_livestock"("created_at");

-- CreateIndex
CREATE INDEX "production_unit_kvkId_idx" ON "production_unit"("kvkId");

-- CreateIndex
CREATE INDEX "production_unit_reporting_year_idx" ON "production_unit"("reporting_year");

-- CreateIndex
CREATE INDEX "production_unit_product_name_idx" ON "production_unit"("product_name");

-- CreateIndex
CREATE INDEX "production_unit_created_at_idx" ON "production_unit"("created_at");

-- CreateIndex
CREATE INDEX "rainwater_harvesting_kvkId_idx" ON "rainwater_harvesting"("kvkId");

-- CreateIndex
CREATE INDEX "rainwater_harvesting_reporting_year_idx" ON "rainwater_harvesting"("reporting_year");

-- CreateIndex
CREATE INDEX "rainwater_harvesting_created_at_idx" ON "rainwater_harvesting"("created_at");

-- CreateIndex
CREATE INDEX "staff_quarters_utilization_kvkId_idx" ON "staff_quarters_utilization"("kvkId");

-- CreateIndex
CREATE INDEX "staff_quarters_utilization_date_of_completion_idx" ON "staff_quarters_utilization"("date_of_completion");

-- CreateIndex
CREATE INDEX "staff_quarters_utilization_created_at_idx" ON "staff_quarters_utilization"("created_at");

-- CreateIndex
CREATE INDEX "functional_linkage_kvkId_idx" ON "functional_linkage"("kvkId");

-- CreateIndex
CREATE INDEX "functional_linkage_reporting_year_idx" ON "functional_linkage"("reporting_year");

-- CreateIndex
CREATE INDEX "functional_linkage_organization_name_idx" ON "functional_linkage"("organization_name");

-- CreateIndex
CREATE INDEX "functional_linkage_created_at_idx" ON "functional_linkage"("created_at");

-- CreateIndex
CREATE INDEX "kvk_soil_water_analysis_kvkId_idx" ON "kvk_soil_water_analysis"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_soil_water_analysis_analysis_id_idx" ON "kvk_soil_water_analysis"("analysis_id");

-- CreateIndex
CREATE INDEX "kvk_soil_water_analysis_reporting_year_idx" ON "kvk_soil_water_analysis"("reporting_year");

-- CreateIndex
CREATE UNIQUE INDEX "soil_water_analysis_analysis_name_key" ON "soil_water_analysis"("analysis_name");

-- CreateIndex
CREATE INDEX "kvk_soil_water_equipment_kvkId_idx" ON "kvk_soil_water_equipment"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_soil_water_equipment_soilWaterAnalysisId_idx" ON "kvk_soil_water_equipment"("soilWaterAnalysisId");

-- CreateIndex
CREATE INDEX "kvk_soil_water_equipment_reporting_year_idx" ON "kvk_soil_water_equipment"("reporting_year");

-- CreateIndex
CREATE INDEX "kvk_world_soil_celebration_kvkId_idx" ON "kvk_world_soil_celebration"("kvkId");

-- CreateIndex
CREATE INDEX "kvk_world_soil_celebration_reporting_year_idx" ON "kvk_world_soil_celebration"("reporting_year");

-- CreateIndex
CREATE INDEX "swachhta_hi_sewa_kvkId_idx" ON "swachhta_hi_sewa"("kvkId");

-- CreateIndex
CREATE INDEX "swachh_quarterly_expenditure_kvkId_idx" ON "swachh_quarterly_expenditure"("kvkId");

-- CreateIndex
CREATE INDEX "swachh_quarterly_expenditure_reporting_year_idx" ON "swachh_quarterly_expenditure"("reporting_year");

-- CreateIndex
CREATE INDEX "swachhta_pakhwada_kvkId_idx" ON "swachhta_pakhwada"("kvkId");

-- CreateIndex
CREATE INDEX "targets_kvk_id_reporting_year_idx" ON "targets"("kvk_id", "reporting_year");

-- CreateIndex
CREATE INDEX "targets_reporting_year_idx" ON "targets"("reporting_year");

-- CreateIndex
CREATE INDEX "targets_kvk_id_reporting_year_date_idx" ON "targets"("kvk_id", "reporting_year_date");

-- CreateIndex
CREATE INDEX "targets_reporting_year_date_idx" ON "targets"("reporting_year_date");

-- CreateIndex
CREATE INDEX "targets_type_name_idx" ON "targets"("type_name");

-- CreateIndex
CREATE INDEX "targets_zone_id_idx" ON "targets"("zone_id");

-- CreateIndex
CREATE INDEX "targets_state_id_idx" ON "targets"("state_id");

-- CreateIndex
CREATE INDEX "fld_crop_master_cfld_id_idx" ON "fld_crop_master"("cfld_id");

-- CreateIndex
CREATE INDEX "fld_crop_master_season_id_idx" ON "fld_crop_master"("season_id");

-- CreateIndex
CREATE INDEX "fld_crop_master_type_id_idx" ON "fld_crop_master"("type_id");

-- CreateIndex
CREATE INDEX "fld_crop_master_crop_name_idx" ON "fld_crop_master"("crop_name");

-- CreateIndex
CREATE INDEX "event_event_id_idx" ON "event"("event_id");

-- CreateIndex
CREATE INDEX "event_event_name_idx" ON "event"("event_name");

-- CreateIndex
CREATE INDEX "extension_activity_extension_activity_id_idx" ON "extension_activity"("extension_activity_id");

-- CreateIndex
CREATE INDEX "extension_activity_extension_name_idx" ON "extension_activity"("extension_name");

-- CreateIndex
CREATE UNIQUE INDEX "sector_sector_name_key" ON "sector"("sector_name");

-- CreateIndex
CREATE INDEX "sector_sector_id_idx" ON "sector"("sector_id");

-- CreateIndex
CREATE INDEX "sector_sector_name_idx" ON "sector"("sector_name");

-- CreateIndex
CREATE INDEX "thematic_area_sectorId_idx" ON "thematic_area"("sectorId");

-- CreateIndex
CREATE INDEX "thematic_area_thematic_area_name_idx" ON "thematic_area"("thematic_area_name");

-- CreateIndex
CREATE INDEX "category_sectorId_idx" ON "category"("sectorId");

-- CreateIndex
CREATE INDEX "category_category_name_idx" ON "category"("category_name");

-- CreateIndex
CREATE INDEX "sub_category_sub_category_id_idx" ON "sub_category"("sub_category_id");

-- CreateIndex
CREATE INDEX "sub_category_categoryId_idx" ON "sub_category"("categoryId");

-- CreateIndex
CREATE INDEX "sub_category_sectorId_idx" ON "sub_category"("sectorId");

-- CreateIndex
CREATE INDEX "sub_category_sub_category_name_idx" ON "sub_category"("sub_category_name");

-- CreateIndex
CREATE INDEX "crop_categoryId_idx" ON "crop"("categoryId");

-- CreateIndex
CREATE INDEX "crop_subCategoryId_idx" ON "crop"("subCategoryId");

-- CreateIndex
CREATE INDEX "crop_crop_name_idx" ON "crop"("crop_name");

-- CreateIndex
CREATE UNIQUE INDEX "asset_funding_source_master_name_key" ON "asset_funding_source_master"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_present_status_master_status_code_key" ON "vehicle_present_status_master"("status_code");

-- CreateIndex
CREATE INDEX "vehicle_present_status_master_status_code_idx" ON "vehicle_present_status_master"("status_code");

-- CreateIndex
CREATE INDEX "vehicle_present_status_master_is_active_idx" ON "vehicle_present_status_master"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_present_status_master_status_code_key" ON "equipment_present_status_master"("status_code");

-- CreateIndex
CREATE INDEX "equipment_present_status_master_status_code_idx" ON "equipment_present_status_master"("status_code");

-- CreateIndex
CREATE INDEX "equipment_present_status_master_is_active_idx" ON "equipment_present_status_master"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "crop_type_type_name_key" ON "crop_type"("type_name");

-- CreateIndex
CREATE INDEX "crop_type_type_id_idx" ON "crop_type"("type_id");

-- CreateIndex
CREATE INDEX "crop_type_type_name_idx" ON "crop_type"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_discipline_name_key" ON "discipline"("discipline_name");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_type_master_enterprise_type_name_key" ON "enterprise_type_master"("enterprise_type_name");

-- CreateIndex
CREATE INDEX "enterprise_type_master_enterprise_type_id_idx" ON "enterprise_type_master"("enterprise_type_id");

-- CreateIndex
CREATE INDEX "enterprise_type_master_enterprise_type_name_idx" ON "enterprise_type_master"("enterprise_type_name");

-- CreateIndex
CREATE INDEX "equipment_master_equipment_type_id_idx" ON "equipment_master"("equipment_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_master_equipment_type_id_name_key" ON "equipment_master"("equipment_type_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_type_master_name_key" ON "equipment_type_master"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fld_activity_activity_name_key" ON "fld_activity"("activity_name");

-- CreateIndex
CREATE UNIQUE INDEX "financial_project_project_name_key" ON "financial_project"("project_name");

-- CreateIndex
CREATE INDEX "financial_project_financial_project_id_idx" ON "financial_project"("financial_project_id");

-- CreateIndex
CREATE INDEX "financial_project_project_name_idx" ON "financial_project"("project_name");

-- CreateIndex
CREATE INDEX "financial_project_funding_agency_id_idx" ON "financial_project"("funding_agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "funding_agency_agency_name_key" ON "funding_agency"("agency_name");

-- CreateIndex
CREATE INDEX "funding_agency_funding_agency_id_idx" ON "funding_agency"("funding_agency_id");

-- CreateIndex
CREATE INDEX "funding_agency_agency_name_idx" ON "funding_agency"("agency_name");

-- CreateIndex
CREATE UNIQUE INDEX "funding_source_master_name_key" ON "funding_source_master"("name");

-- CreateIndex
CREATE UNIQUE INDEX "important_day_day_name_key" ON "important_day"("day_name");

-- CreateIndex
CREATE UNIQUE INDEX "kvk_infrastructure_master_name_key" ON "kvk_infrastructure_master"("name");

-- CreateIndex
CREATE UNIQUE INDEX "other_extension_activity_type_activity_name_key" ON "other_extension_activity_type"("activity_name");

-- CreateIndex
CREATE UNIQUE INDEX "pay_level_master_level_name_key" ON "pay_level_master"("level_name");

-- CreateIndex
CREATE UNIQUE INDEX "pay_scale_master_scale_name_key" ON "pay_scale_master"("scale_name");

-- CreateIndex
CREATE UNIQUE INDEX "ppv_fra_training_type_master_type_name_key" ON "ppv_fra_training_type_master"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "programme_type_master_programme_type_key" ON "programme_type_master"("programme_type");

-- CreateIndex
CREATE UNIQUE INDEX "sanctioned_post_post_name_key" ON "sanctioned_post"("post_name");

-- CreateIndex
CREATE UNIQUE INDEX "season_season_name_key" ON "season"("season_name");

-- CreateIndex
CREATE INDEX "season_season_id_idx" ON "season"("season_id");

-- CreateIndex
CREATE INDEX "season_season_name_idx" ON "season"("season_name");

-- CreateIndex
CREATE UNIQUE INDEX "staff_category_master_category_name_key" ON "staff_category_master"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "clientele_master_name_key" ON "clientele_master"("name");

-- CreateIndex
CREATE INDEX "oft_subject_oft_subject_id_idx" ON "oft_subject"("oft_subject_id");

-- CreateIndex
CREATE INDEX "oft_subject_oft_subject_name_idx" ON "oft_subject"("oft_subject_name");

-- CreateIndex
CREATE INDEX "oft_thematic_area_oft_thematic_area_id_idx" ON "oft_thematic_area"("oft_thematic_area_id");

-- CreateIndex
CREATE INDEX "oft_thematic_area_oft_subject_id_idx" ON "oft_thematic_area"("oft_subject_id");

-- CreateIndex
CREATE INDEX "oft_thematic_area_oft_thematic_area_name_idx" ON "oft_thematic_area"("oft_thematic_area_name");

-- CreateIndex
CREATE INDEX "other_extension_activity_other_extension_activity_id_idx" ON "other_extension_activity"("other_extension_activity_id");

-- CreateIndex
CREATE INDEX "other_extension_activity_other_extension_name_idx" ON "other_extension_activity"("other_extension_name");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_product_category_name_key" ON "product_category"("product_category_name");

-- CreateIndex
CREATE INDEX "product_category_product_category_id_idx" ON "product_category"("product_category_id");

-- CreateIndex
CREATE INDEX "product_category_product_category_name_idx" ON "product_category"("product_category_name");

-- CreateIndex
CREATE INDEX "product_type_product_type_id_idx" ON "product_type"("product_type_id");

-- CreateIndex
CREATE INDEX "product_type_product_category_type_idx" ON "product_type"("product_category_type");

-- CreateIndex
CREATE INDEX "product_type_product_category_id_idx" ON "product_type"("product_category_id");

-- CreateIndex
CREATE INDEX "product_product_id_idx" ON "product"("product_id");

-- CreateIndex
CREATE INDEX "product_product_name_idx" ON "product"("product_name");

-- CreateIndex
CREATE INDEX "product_product_type_id_idx" ON "product"("product_type_id");

-- CreateIndex
CREATE INDEX "product_product_category_id_idx" ON "product"("product_category_id");

-- CreateIndex
CREATE INDEX "cra_croping_system_cra_croping_system_id_idx" ON "cra_croping_system"("cra_croping_system_id");

-- CreateIndex
CREATE INDEX "cra_croping_system_crop_name_idx" ON "cra_croping_system"("crop_name");

-- CreateIndex
CREATE INDEX "cra_croping_system_season_id_idx" ON "cra_croping_system"("season_id");

-- CreateIndex
CREATE INDEX "cra_farming_system_cra_farming_system_id_idx" ON "cra_farming_system"("cra_farming_system_id");

-- CreateIndex
CREATE INDEX "cra_farming_system_farming_system_name_idx" ON "cra_farming_system"("farming_system_name");

-- CreateIndex
CREATE INDEX "cra_farming_system_season_id_idx" ON "cra_farming_system"("season_id");

-- CreateIndex
CREATE UNIQUE INDEX "arya_enterprise_enterprise_name_key" ON "arya_enterprise"("enterprise_name");

-- CreateIndex
CREATE INDEX "arya_enterprise_arya_enterprise_id_idx" ON "arya_enterprise"("arya_enterprise_id");

-- CreateIndex
CREATE INDEX "arya_enterprise_enterprise_name_idx" ON "arya_enterprise"("enterprise_name");

-- CreateIndex
CREATE UNIQUE INDEX "agri_drone_demonstrations_on_master_demonstrations_on_name_key" ON "agri_drone_demonstrations_on_master"("demonstrations_on_name");

-- CreateIndex
CREATE INDEX "agri_drone_demonstrations_on_master_agri_drone_demonstratio_idx" ON "agri_drone_demonstrations_on_master"("agri_drone_demonstrations_on_id");

-- CreateIndex
CREATE INDEX "agri_drone_demonstrations_on_master_demonstrations_on_name_idx" ON "agri_drone_demonstrations_on_master"("demonstrations_on_name");

-- CreateIndex
CREATE INDEX "publication_publication_id_idx" ON "publication"("publication_id");

-- CreateIndex
CREATE INDEX "publication_publication_name_idx" ON "publication"("publication_name");

-- CreateIndex
CREATE UNIQUE INDEX "training_type_training_type_name_key" ON "training_type"("training_type_name");

-- CreateIndex
CREATE INDEX "training_type_training_type_id_idx" ON "training_type"("training_type_id");

-- CreateIndex
CREATE INDEX "training_type_training_type_name_idx" ON "training_type"("training_type_name");

-- CreateIndex
CREATE INDEX "training_area_training_area_id_idx" ON "training_area"("training_area_id");

-- CreateIndex
CREATE INDEX "training_area_trainingTypeId_idx" ON "training_area"("trainingTypeId");

-- CreateIndex
CREATE INDEX "training_area_training_area_name_idx" ON "training_area"("training_area_name");

-- CreateIndex
CREATE INDEX "training_thematic_area_training_thematic_area_id_idx" ON "training_thematic_area"("training_thematic_area_id");

-- CreateIndex
CREATE INDEX "training_thematic_area_trainingAreaId_idx" ON "training_thematic_area"("trainingAreaId");

-- CreateIndex
CREATE INDEX "training_thematic_area_training_thematic_area_name_idx" ON "training_thematic_area"("training_thematic_area_name");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_created_by_user_id_idx" ON "notifications"("created_by_user_id");

-- CreateIndex
CREATE INDEX "notification_attachments_notification_id_idx" ON "notification_attachments"("notification_id");

-- CreateIndex
CREATE INDEX "notification_attachments_uploaded_by_user_id_idx" ON "notification_attachments"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "user_notifications_user_id_is_read_created_at_idx" ON "user_notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "user_notifications_notification_id_idx" ON "user_notifications"("notification_id");

-- CreateIndex
CREATE INDEX "user_notifications_user_id_idx" ON "user_notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_notification_id_user_id_key" ON "user_notifications"("notification_id", "user_id");

-- CreateIndex
CREATE INDEX "user_login_activity_event_at_idx" ON "user_login_activity"("event_at");

-- CreateIndex
CREATE INDEX "user_login_activity_kvk_id_event_at_idx" ON "user_login_activity"("kvk_id", "event_at");

-- CreateIndex
CREATE INDEX "user_login_activity_user_id_event_at_idx" ON "user_login_activity"("user_id", "event_at");

-- CreateIndex
CREATE INDEX "user_login_activity_activity_event_at_idx" ON "user_login_activity"("activity", "event_at");

-- CreateIndex
CREATE INDEX "user_login_activity_zone_id_event_at_idx" ON "user_login_activity"("zone_id", "event_at");

-- CreateIndex
CREATE INDEX "user_login_activity_state_id_event_at_idx" ON "user_login_activity"("state_id", "event_at");

-- CreateIndex
CREATE INDEX "user_login_activity_district_id_event_at_idx" ON "user_login_activity"("district_id", "event_at");

-- CreateIndex
CREATE INDEX "user_login_activity_org_id_event_at_idx" ON "user_login_activity"("org_id", "event_at");

-- CreateIndex
CREATE INDEX "roles_role_name_idx" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "modules_module_code_key" ON "modules"("module_code");

-- CreateIndex
CREATE INDEX "permissions_module_id_idx" ON "permissions"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_revoked_at_expires_at_idx" ON "refresh_tokens"("user_id", "revoked_at", "expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_revoked_at_idx" ON "refresh_tokens"("revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_deleted_at_idx" ON "users"("email", "deleted_at");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "users_zone_id_idx" ON "users"("zone_id");

-- CreateIndex
CREATE INDEX "users_state_id_idx" ON "users"("state_id");

-- CreateIndex
CREATE INDEX "users_district_id_idx" ON "users"("district_id");

-- CreateIndex
CREATE INDEX "users_org_id_idx" ON "users"("org_id");

-- CreateIndex
CREATE INDEX "users_university_id_idx" ON "users"("university_id");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "users"("last_login_at");

-- CreateIndex
CREATE INDEX "users_kvk_id_idx" ON "users"("kvk_id");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "zone_zone_name_key" ON "zone"("zone_name");

-- CreateIndex
CREATE INDEX "zone_zone_id_idx" ON "zone"("zone_id");

-- CreateIndex
CREATE INDEX "stateMaster_state_id_idx" ON "stateMaster"("state_id");

-- CreateIndex
CREATE INDEX "stateMaster_zoneId_idx" ON "stateMaster"("zoneId");

-- CreateIndex
CREATE INDEX "stateMaster_state_name_idx" ON "stateMaster"("state_name");

-- CreateIndex
CREATE INDEX "districtMaster_district_id_idx" ON "districtMaster"("district_id");

-- CreateIndex
CREATE INDEX "districtMaster_stateId_idx" ON "districtMaster"("stateId");

-- CreateIndex
CREATE INDEX "districtMaster_zoneId_idx" ON "districtMaster"("zoneId");

-- CreateIndex
CREATE INDEX "districtMaster_district_name_idx" ON "districtMaster"("district_name");

-- CreateIndex
CREATE INDEX "orgMaster_org_id_idx" ON "orgMaster"("org_id");

-- CreateIndex
CREATE INDEX "orgMaster_district_id_idx" ON "orgMaster"("district_id");

-- CreateIndex
CREATE INDEX "orgMaster_org_name_idx" ON "orgMaster"("org_name");

-- CreateIndex
CREATE INDEX "universityMaster_university_id_idx" ON "universityMaster"("university_id");

-- CreateIndex
CREATE INDEX "universityMaster_org_id_idx" ON "universityMaster"("org_id");

-- CreateIndex
CREATE INDEX "universityMaster_university_name_idx" ON "universityMaster"("university_name");

-- AddForeignKey
ALTER TABLE "kvk_bank_account" ADD CONSTRAINT "kvk_bank_account_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("discipline_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_original_kvk_id_fkey" FOREIGN KEY ("original_kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_payLevelId_fkey" FOREIGN KEY ("payLevelId") REFERENCES "pay_level_master"("pay_level_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_pay_scale_id_fkey" FOREIGN KEY ("pay_scale_id") REFERENCES "pay_scale_master"("pay_scale_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_sanctionedPostId_fkey" FOREIGN KEY ("sanctionedPostId") REFERENCES "sanctioned_post"("sanctioned_post_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_staffCategoryId_fkey" FOREIGN KEY ("staffCategoryId") REFERENCES "staff_category_master"("staff_category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_equipment" ADD CONSTRAINT "kvk_equipment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_equipment" ADD CONSTRAINT "kvk_equipment_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_type_master"("equipment_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_equipment" ADD CONSTRAINT "kvk_equipment_equipment_master_id_fkey" FOREIGN KEY ("equipment_master_id") REFERENCES "equipment_master"("equipment_master_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_equipment" ADD CONSTRAINT "kvk_equipment_asset_funding_source_id_fkey" FOREIGN KEY ("asset_funding_source_id") REFERENCES "asset_funding_source_master"("asset_funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_equipment_detail" ADD CONSTRAINT "kvk_equipment_detail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_equipment_detail" ADD CONSTRAINT "kvk_equipment_detail_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "kvk_equipment"("equipment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_equipment_detail" ADD CONSTRAINT "kvk_equipment_detail_equipment_status_id_fkey" FOREIGN KEY ("equipment_status_id") REFERENCES "equipment_present_status_master"("equipment_status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_equipment_detail" ADD CONSTRAINT "kvk_equipment_detail_asset_funding_source_id_fkey" FOREIGN KEY ("asset_funding_source_id") REFERENCES "asset_funding_source_master"("asset_funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_infrastructure" ADD CONSTRAINT "kvk_infrastructure_infraMasterId_fkey" FOREIGN KEY ("infraMasterId") REFERENCES "kvk_infrastructure_master"("infra_master_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_infrastructure" ADD CONSTRAINT "kvk_infrastructure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk" ADD CONSTRAINT "kvk_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districtMaster"("district_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk" ADD CONSTRAINT "kvk_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgMaster"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk" ADD CONSTRAINT "kvk_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "stateMaster"("state_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk" ADD CONSTRAINT "kvk_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universityMaster"("university_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk" ADD CONSTRAINT "kvk_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_land_details" ADD CONSTRAINT "kvk_land_details_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_transfer_history" ADD CONSTRAINT "staff_transfer_history_from_kvk_id_fkey" FOREIGN KEY ("from_kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_transfer_history" ADD CONSTRAINT "staff_transfer_history_kvk_staff_id_fkey" FOREIGN KEY ("kvk_staff_id") REFERENCES "kvk_staff"("kvk_staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_transfer_history" ADD CONSTRAINT "staff_transfer_history_to_kvk_id_fkey" FOREIGN KEY ("to_kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_transfer_history" ADD CONSTRAINT "staff_transfer_history_transferred_by_fkey" FOREIGN KEY ("transferred_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_vehicle" ADD CONSTRAINT "kvk_vehicle_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_vehicle_detail" ADD CONSTRAINT "kvk_vehicle_detail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_vehicle_detail" ADD CONSTRAINT "kvk_vehicle_detail_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "kvk_vehicle"("vehicle_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_vehicle_detail" ADD CONSTRAINT "kvk_vehicle_detail_vehicle_status_id_fkey" FOREIGN KEY ("vehicle_status_id") REFERENCES "vehicle_present_status_master"("vehicle_status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_vehicle_detail" ADD CONSTRAINT "kvk_vehicle_detail_asset_funding_source_id_fkey" FOREIGN KEY ("asset_funding_source_id") REFERENCES "asset_funding_source_master"("asset_funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_award" ADD CONSTRAINT "farmer_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_award" ADD CONSTRAINT "kvk_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scientist_award" ADD CONSTRAINT "scientist_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_extension_activity" ADD CONSTRAINT "kvk_extension_activity_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "kvk_fld_introduction"("kvk_fld_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_extension_activity" ADD CONSTRAINT "kvk_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_extension_activity" ADD CONSTRAINT "kvk_extension_activity_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "kvk_staff"("kvk_staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_extension_activity" ADD CONSTRAINT "fld_act_relation_fkey" FOREIGN KEY ("activityId") REFERENCES "fld_activity"("activity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_important_day_celebration" ADD CONSTRAINT "kvk_important_day_celebration_importantDayId_fkey" FOREIGN KEY ("importantDayId") REFERENCES "important_day"("important_day_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_important_day_celebration" ADD CONSTRAINT "kvk_important_day_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_other_extension_activity" ADD CONSTRAINT "kvk_other_extension_activity_activityTypeId_fkey" FOREIGN KEY ("activityTypeId") REFERENCES "other_extension_activity"("other_extension_activity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_other_extension_activity" ADD CONSTRAINT "kvk_other_extension_activity_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "kvk_fld_introduction"("kvk_fld_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_other_extension_activity" ADD CONSTRAINT "kvk_other_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_other_extension_activity" ADD CONSTRAINT "kvk_other_extension_activity_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "kvk_staff"("kvk_staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_technology_week_celebration" ADD CONSTRAINT "kvk_technology_week_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fld_extension" ADD CONSTRAINT "fld_extension_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "fld_activity"("activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fld_extension" ADD CONSTRAINT "fld_extension_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "kvk_fld_introduction"("kvk_fld_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fld_extension" ADD CONSTRAINT "fld_extension_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crop"("crop_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_kvkStaffId_fkey" FOREIGN KEY ("kvkStaffId") REFERENCES "kvk_staff"("kvk_staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sector"("sector_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category"("sub_category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_thematicAreaId_fkey" FOREIGN KEY ("thematicAreaId") REFERENCES "thematic_area"("thematic_area_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_fld_result" ADD CONSTRAINT "kvk_fld_result_kvk_fld_id_fkey" FOREIGN KEY ("kvk_fld_id") REFERENCES "kvk_fld_introduction"("kvk_fld_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fld_technical_feedback" ADD CONSTRAINT "fld_technical_feedback_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crop"("crop_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fld_technical_feedback" ADD CONSTRAINT "fld_technical_feedback_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "kvk_fld_introduction"("kvk_fld_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fld_technical_feedback" ADD CONSTRAINT "fld_technical_feedback_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft_technology" ADD CONSTRAINT "kvk_oft_technology_kvkOftId_fkey" FOREIGN KEY ("kvkOftId") REFERENCES "kvk_oft"("kvk_oft_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft_technology" ADD CONSTRAINT "kvk_oft_technology_oftTechnologyTypeId_fkey" FOREIGN KEY ("oftTechnologyTypeId") REFERENCES "oft_technology_type"("oft_technology_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("discipline_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_oftSubjectId_fkey" FOREIGN KEY ("oftSubjectId") REFERENCES "oft_subject"("oft_subject_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_oftThematicAreaId_fkey" FOREIGN KEY ("oftThematicAreaId") REFERENCES "oft_thematic_area"("oft_thematic_area_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "kvk_staff"("kvk_staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_source_of_funding_id_fkey" FOREIGN KEY ("source_of_funding_id") REFERENCES "funding_source_master"("funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_transferred_from_oft_id_fkey" FOREIGN KEY ("transferred_from_oft_id") REFERENCES "kvk_oft"("kvk_oft_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oft_result_report" ADD CONSTRAINT "oft_result_report_kvk_oft_id_fkey" FOREIGN KEY ("kvk_oft_id") REFERENCES "kvk_oft"("kvk_oft_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oft_result_table" ADD CONSTRAINT "oft_result_table_oft_result_report_id_fkey" FOREIGN KEY ("oft_result_report_id") REFERENCES "oft_result_report"("oft_result_report_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oft_result_table_column" ADD CONSTRAINT "oft_result_table_column_oft_result_table_id_fkey" FOREIGN KEY ("oft_result_table_id") REFERENCES "oft_result_table"("oft_result_table_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oft_result_table_row" ADD CONSTRAINT "oft_result_table_row_oft_result_table_id_fkey" FOREIGN KEY ("oft_result_table_id") REFERENCES "oft_result_table"("oft_result_table_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oft_result_table_cell" ADD CONSTRAINT "oft_result_table_cell_oft_result_table_row_id_fkey" FOREIGN KEY ("oft_result_table_row_id") REFERENCES "oft_result_table_row"("oft_result_table_row_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oft_result_table_cell" ADD CONSTRAINT "oft_result_table_cell_oft_result_table_column_id_fkey" FOREIGN KEY ("oft_result_table_column_id") REFERENCES "oft_result_table_column"("oft_result_table_column_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_production_supply" ADD CONSTRAINT "kvk_production_supply_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_production_supply" ADD CONSTRAINT "kvk_production_supply_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_category"("product_category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_production_supply" ADD CONSTRAINT "kvk_production_supply_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "product_type"("product_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_production_supply" ADD CONSTRAINT "kvk_production_supply_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_agri_drone_demonstration" ADD CONSTRAINT "kvk_agri_drone_demonstration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_agri_drone_demonstration" ADD CONSTRAINT "kvk_agri_drone_demonstration_agri_drone_id_fkey" FOREIGN KEY ("agri_drone_id") REFERENCES "kvk_agri_drone"("agri_drone_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_agri_drone_demonstration" ADD CONSTRAINT "kvk_agri_drone_demonstration_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districtMaster"("district_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_agri_drone_demonstration" ADD CONSTRAINT "kvk_agri_drone_demonstration_agri_drone_demonstrations_on__fkey" FOREIGN KEY ("agri_drone_demonstrations_on_id") REFERENCES "agri_drone_demonstrations_on_master"("agri_drone_demonstrations_on_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_agri_drone" ADD CONSTRAINT "kvk_agri_drone_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arya_prev_year" ADD CONSTRAINT "arya_prev_year_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprise_master"("enterprise_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arya_prev_year" ADD CONSTRAINT "arya_prev_year_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arya_current_year" ADD CONSTRAINT "arya_current_year_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprise_master"("enterprise_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arya_current_year" ADD CONSTRAINT "arya_current_year_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_budget_utilization" ADD CONSTRAINT "kvk_budget_utilization_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crop"("crop_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_budget_utilization" ADD CONSTRAINT "kvk_budget_utilization_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_budget_utilization" ADD CONSTRAINT "kvk_budget_utilization_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_budget_utilization_item" ADD CONSTRAINT "kvk_budget_utilization_item_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "kvk_budget_utilization"("budget_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_budget_utilization_item" ADD CONSTRAINT "kvk_budget_utilization_item_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "budget_item"("budget_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extension_activity_organized" ADD CONSTRAINT "extension_activity_organized_extensionActivityId_fkey" FOREIGN KEY ("extensionActivityId") REFERENCES "extension_activity"("extension_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extension_activity_organized" ADD CONSTRAINT "extension_activity_organized_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extension_activity_organized" ADD CONSTRAINT "extension_activity_organized_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cfl_cfld_technical_parameter" ADD CONSTRAINT "cfl_cfld_technical_parameter_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "fld_crop_master"("cfld_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cfl_cfld_technical_parameter" ADD CONSTRAINT "cfl_cfld_technical_parameter_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "crop_type"("type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cfl_cfld_technical_parameter" ADD CONSTRAINT "cfl_cfld_technical_parameter_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cfl_cfld_technical_parameter" ADD CONSTRAINT "cfl_cfld_technical_parameter_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cfl_cfld_economic_parameters" ADD CONSTRAINT "cfl_cfld_economic_parameters_cfl_cfld_tech_id_fkey" FOREIGN KEY ("cfl_cfld_tech_id") REFERENCES "cfl_cfld_technical_parameter"("cfl_cfld_tech_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cfl_cfld_socio_economic_parameters" ADD CONSTRAINT "cfl_cfld_socio_economic_parameters_cfl_cfld_tech_id_fkey" FOREIGN KEY ("cfl_cfld_tech_id") REFERENCES "cfl_cfld_technical_parameter"("cfl_cfld_tech_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cfl_cfld_farmers_perception_parameters" ADD CONSTRAINT "cfl_cfld_farmers_perception_parameters_cfl_cfld_tech_id_fkey" FOREIGN KEY ("cfl_cfld_tech_id") REFERENCES "cfl_cfld_technical_parameter"("cfl_cfld_tech_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cra_details" ADD CONSTRAINT "cra_details_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cra_details" ADD CONSTRAINT "cra_details_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cra_details" ADD CONSTRAINT "cra_details_cra_croping_system_id_fkey" FOREIGN KEY ("cra_croping_system_id") REFERENCES "cra_croping_system"("cra_croping_system_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cra_details" ADD CONSTRAINT "cra_details_cra_farming_system_id_fkey" FOREIGN KEY ("cra_farming_system_id") REFERENCES "cra_farming_system"("cra_farming_system_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cra_extension_activity" ADD CONSTRAINT "cra_extension_activity_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cra_extension_activity" ADD CONSTRAINT "cra_extension_activity_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "fld_activity"("activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csisa" ADD CONSTRAINT "csisa_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csisa" ADD CONSTRAINT "csisa_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csisa_crop_detail" ADD CONSTRAINT "csisa_crop_detail_csisaId_fkey" FOREIGN KEY ("csisaId") REFERENCES "csisa"("csisa_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drmr_activity" ADD CONSTRAINT "drmr_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drmr_activity_component" ADD CONSTRAINT "drmr_activity_component_drmrActivityId_fkey" FOREIGN KEY ("drmrActivityId") REFERENCES "drmr_activity"("drmr_activity_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drmr_details" ADD CONSTRAINT "drmr_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fpo_cbbo_details" ADD CONSTRAINT "fpo_cbbo_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fpo_management" ADD CONSTRAINT "fpo_management_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_bio_fortified_crop" ADD CONSTRAINT "nari_bio_fortified_crop_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_bio_fortified_crop" ADD CONSTRAINT "nari_bio_fortified_crop_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("season_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_bio_fortified_crop" ADD CONSTRAINT "nari_bio_fortified_crop_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "nari_activity"("nari_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_bio_fortified_crop" ADD CONSTRAINT "nari_bio_fortified_crop_crop_category_id_fkey" FOREIGN KEY ("crop_category_id") REFERENCES "crop_category"("crop_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_bio_fortified_crop_result" ADD CONSTRAINT "nari_bio_fortified_crop_result_nari_bio_fortified_crop_id_fkey" FOREIGN KEY ("nari_bio_fortified_crop_id") REFERENCES "nari_bio_fortified_crop"("nari_bio_fortified_crop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_extension_activity" ADD CONSTRAINT "nari_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_extension_activity" ADD CONSTRAINT "nari_extension_activity_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "nari_activity"("nari_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_nutritional_garden" ADD CONSTRAINT "nari_nutritional_garden_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_nutritional_garden" ADD CONSTRAINT "nari_nutritional_garden_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "nari_activity"("nari_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_nutritional_garden" ADD CONSTRAINT "nari_nutritional_garden_type_of_nutritional_garden_id_fkey" FOREIGN KEY ("type_of_nutritional_garden_id") REFERENCES "nutrition_garden_type"("nutrition_garden_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_nutritional_garden_result" ADD CONSTRAINT "nari_nutritional_garden_result_nari_nutritional_garden_id_fkey" FOREIGN KEY ("nari_nutritional_garden_id") REFERENCES "nari_nutritional_garden"("nari_nutritional_garden_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_training_programme" ADD CONSTRAINT "nari_training_programme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_training_programme" ADD CONSTRAINT "nari_training_programme_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "nari_activity"("nari_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_value_addition" ADD CONSTRAINT "nari_value_addition_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_value_addition" ADD CONSTRAINT "nari_value_addition_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "nari_activity"("nari_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nari_value_addition_result" ADD CONSTRAINT "nari_value_addition_result_nari_value_addition_id_fkey" FOREIGN KEY ("nari_value_addition_id") REFERENCES "nari_value_addition"("nari_value_addition_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiaries_details" ADD CONSTRAINT "beneficiaries_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demonstration_info" ADD CONSTRAINT "demonstration_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demonstration_info" ADD CONSTRAINT "demonstration_info_staff_category_id_fkey" FOREIGN KEY ("staff_category_id") REFERENCES "staff_category_master"("staff_category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demonstration_info" ADD CONSTRAINT "demonstration_info_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmers_practicing_natural_farming" ADD CONSTRAINT "farmers_practicing_natural_farming_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_information" ADD CONSTRAINT "financial_information_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_information" ADD CONSTRAINT "financial_information_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "natural_farming_activity_master"("natural_farming_activity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geographical_info" ADD CONSTRAINT "geographical_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_info" ADD CONSTRAINT "physical_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_info" ADD CONSTRAINT "physical_info_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "natural_farming_activity_master"("natural_farming_activity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soil_data_information" ADD CONSTRAINT "soil_data_information_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soil_data_information" ADD CONSTRAINT "soil_data_information_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soil_data_information" ADD CONSTRAINT "soil_data_information_soil_parameter_id_fkey" FOREIGN KEY ("soil_parameter_id") REFERENCES "natural_farming_soil_parameter_master"("natural_farming_soil_parameter_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_convergence_programme" ADD CONSTRAINT "nicra_convergence_programme_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_dignitaries_visited" ADD CONSTRAINT "nicra_dignitaries_visited_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_dignitaries_visited" ADD CONSTRAINT "nicra_dignitaries_visited_dignitary_type_id_fkey" FOREIGN KEY ("dignitary_type_id") REFERENCES "nicra_dignitary_type_master"("nicra_dignitary_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_farm_implement" ADD CONSTRAINT "nicra_farm_implement_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_intervention" ADD CONSTRAINT "nicra_intervention_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_intervention" ADD CONSTRAINT "nicra_intervention_seed_bank_fodder_bank_id_fkey" FOREIGN KEY ("seed_bank_fodder_bank_id") REFERENCES "nicra_seed_bank_fodder_bank_master"("nicra_seed_bank_fodder_bank_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_basic_info" ADD CONSTRAINT "nicra_basic_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_sub_category" ADD CONSTRAINT "nicra_sub_category_nicraCategoryId_fkey" FOREIGN KEY ("nicraCategoryId") REFERENCES "nicra_category"("nicra_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_details" ADD CONSTRAINT "nicra_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_details" ADD CONSTRAINT "nicra_details_nicraCategoryId_fkey" FOREIGN KEY ("nicraCategoryId") REFERENCES "nicra_category"("nicra_category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_details" ADD CONSTRAINT "nicra_details_nicraSubCategoryId_fkey" FOREIGN KEY ("nicraSubCategoryId") REFERENCES "nicra_sub_category"("nicra_sub_category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_details" ADD CONSTRAINT "nicra_details_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_extension_activity" ADD CONSTRAINT "nicra_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_training" ADD CONSTRAINT "nicra_training_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_pi_copi" ADD CONSTRAINT "nicra_pi_copi_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_pi_copi" ADD CONSTRAINT "nicra_pi_copi_pi_type_id_fkey" FOREIGN KEY ("pi_type_id") REFERENCES "nicra_pi_type_master"("nicra_pi_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_revenue_generated" ADD CONSTRAINT "nicra_revenue_generated_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_soil_health_card" ADD CONSTRAINT "nicra_soil_health_card_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicra_vcrmc" ADD CONSTRAINT "nicra_vcrmc_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_other_programme" ADD CONSTRAINT "kvk_other_programme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_seed_hub_program" ADD CONSTRAINT "kvk_seed_hub_program_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_seed_hub_program" ADD CONSTRAINT "kvk_seed_hub_program_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tsp_scsp" ADD CONSTRAINT "tsp_scsp_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tsp_scsp" ADD CONSTRAINT "tsp_scsp_tsp_scsp_type_id_fkey" FOREIGN KEY ("tsp_scsp_type_id") REFERENCES "tsp_scsp_type_master"("tsp_scsp_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tsp_scsp" ADD CONSTRAINT "tsp_scsp_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "tsp_scsp_district"("tsp_scsp_district_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tsp_scsp" ADD CONSTRAINT "tsp_scsp_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districtMaster"("district_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_publication_details" ADD CONSTRAINT "kvk_publication_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_publication_details" ADD CONSTRAINT "kvk_publication_details_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publication"("publication_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_clienteleId_fkey" FOREIGN KEY ("clienteleId") REFERENCES "clientele_master"("clientele_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "course_coordinator_master"("coordinator_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_fundingSourceId_fkey" FOREIGN KEY ("fundingSourceId") REFERENCES "funding_source_master"("funding_source_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_trainingAreaId_fkey" FOREIGN KEY ("trainingAreaId") REFERENCES "training_area"("training_area_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_thematicAreaId_fkey" FOREIGN KEY ("thematicAreaId") REFERENCES "training_thematic_area"("training_thematic_area_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_trainingTypeId_fkey" FOREIGN KEY ("trainingTypeId") REFERENCES "training_type"("training_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kisan_sarathi" ADD CONSTRAINT "kisan_sarathi_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kmas" ADD CONSTRAINT "kmas_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_app" ADD CONSTRAINT "mobile_app_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msg_details" ADD CONSTRAINT "msg_details_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_portal" ADD CONSTRAINT "web_portal_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_attachments" ADD CONSTRAINT "form_attachments_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_attachments" ADD CONSTRAINT "form_attachments_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrd_program" ADD CONSTRAINT "hrd_program_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hrd_program" ADD CONSTRAINT "hrd_program_kvkStaffId_fkey" FOREIGN KEY ("kvkStaffId") REFERENCES "kvk_staff"("kvk_staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atari_meeting" ADD CONSTRAINT "atari_meeting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sac_meeting" ADD CONSTRAINT "sac_meeting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nyk_training" ADD CONSTRAINT "nyk_training_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppv_fra_plant_varieties" ADD CONSTRAINT "ppv_fra_plant_varieties_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppv_fra_training" ADD CONSTRAINT "ppv_fra_training_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppv_fra_training" ADD CONSTRAINT "ppv_fra_training_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "ppv_fra_training_type_master"("type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prevalent_diseases_in_crop" ADD CONSTRAINT "prevalent_diseases_in_crop_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prevalent_diseases_livestock" ADD CONSTRAINT "prevalent_diseases_livestock_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rawe_fet_fit_programme" ADD CONSTRAINT "rawe_fet_fit_programme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rawe_fet_fit_programme" ADD CONSTRAINT "rawe_fet_fit_programme_attachmentTypeId_fkey" FOREIGN KEY ("attachmentTypeId") REFERENCES "attachment_type"("attachment_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_visitors" ADD CONSTRAINT "vip_visitors_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_visitors" ADD CONSTRAINT "vip_visitors_dignitaryTypeId_fkey" FOREIGN KEY ("dignitaryTypeId") REFERENCES "dignitary_type"("dignitary_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_images" ADD CONSTRAINT "module_images_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_images" ADD CONSTRAINT "module_images_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_images" ADD CONSTRAINT "module_images_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district_level_data" ADD CONSTRAINT "district_level_data_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_area" ADD CONSTRAINT "operational_area_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priority_thrust_area" ADD CONSTRAINT "priority_thrust_area_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village_adoption" ADD CONSTRAINT "village_adoption_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_detail" ADD CONSTRAINT "budget_detail_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_budget" ADD CONSTRAINT "project_budget_financial_project_id_fkey" FOREIGN KEY ("financial_project_id") REFERENCES "financial_project"("financial_project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_budget" ADD CONSTRAINT "project_budget_funding_agency_id_fkey" FOREIGN KEY ("funding_agency_id") REFERENCES "funding_agency"("funding_agency_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_budget" ADD CONSTRAINT "project_budget_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_generation" ADD CONSTRAINT "resource_generation_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_generation" ADD CONSTRAINT "revenue_generation_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revolving_fund" ADD CONSTRAINT "revolving_fund_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrepreneurship" ADD CONSTRAINT "entrepreneurship_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_impact_activity" ADD CONSTRAINT "kvk_impact_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "success_story" ADD CONSTRAINT "success_story_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demonstration_unit" ADD CONSTRAINT "demonstration_unit_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_utilization" ADD CONSTRAINT "hostel_utilization_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructional_farm_crop" ADD CONSTRAINT "instructional_farm_crop_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructional_farm_crop" ADD CONSTRAINT "instructional_farm_crop_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructional_farm_livestock" ADD CONSTRAINT "instructional_farm_livestock_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_unit" ADD CONSTRAINT "production_unit_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainwater_harvesting" ADD CONSTRAINT "rainwater_harvesting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_quarters_utilization" ADD CONSTRAINT "staff_quarters_utilization_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "functional_linkage" ADD CONSTRAINT "functional_linkage_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_soil_water_analysis" ADD CONSTRAINT "kvk_soil_water_analysis_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "soil_water_analysis"("soil_water_analysis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_soil_water_analysis" ADD CONSTRAINT "kvk_soil_water_analysis_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_soil_water_equipment" ADD CONSTRAINT "kvk_soil_water_equipment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_soil_water_equipment" ADD CONSTRAINT "kvk_soil_water_equipment_soilWaterAnalysisId_fkey" FOREIGN KEY ("soilWaterAnalysisId") REFERENCES "soil_water_analysis"("soil_water_analysis_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kvk_world_soil_celebration" ADD CONSTRAINT "kvk_world_soil_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swachhta_hi_sewa" ADD CONSTRAINT "swachhta_hi_sewa_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swachh_quarterly_expenditure" ADD CONSTRAINT "swachh_quarterly_expenditure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swachhta_pakhwada" ADD CONSTRAINT "swachhta_pakhwada_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "targets" ADD CONSTRAINT "targets_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "targets" ADD CONSTRAINT "targets_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fld_crop_master" ADD CONSTRAINT "fld_crop_master_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("season_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fld_crop_master" ADD CONSTRAINT "fld_crop_master_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "crop_type"("type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thematic_area" ADD CONSTRAINT "thematic_area_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sector"("sector_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sector"("sector_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category" ADD CONSTRAINT "sub_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category" ADD CONSTRAINT "sub_category_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sector"("sector_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop" ADD CONSTRAINT "crop_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop" ADD CONSTRAINT "crop_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category"("sub_category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_master" ADD CONSTRAINT "equipment_master_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_type_master"("equipment_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_project" ADD CONSTRAINT "financial_project_funding_agency_id_fkey" FOREIGN KEY ("funding_agency_id") REFERENCES "funding_agency"("funding_agency_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oft_thematic_area" ADD CONSTRAINT "oft_thematic_area_oft_subject_id_fkey" FOREIGN KEY ("oft_subject_id") REFERENCES "oft_subject"("oft_subject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_type" ADD CONSTRAINT "product_type_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_category"("product_category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_category"("product_category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "product_type"("product_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cra_croping_system" ADD CONSTRAINT "cra_croping_system_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("season_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cra_farming_system" ADD CONSTRAINT "cra_farming_system_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("season_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_area" ADD CONSTRAINT "training_area_trainingTypeId_fkey" FOREIGN KEY ("trainingTypeId") REFERENCES "training_type"("training_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_thematic_area" ADD CONSTRAINT "training_thematic_area_trainingAreaId_fkey" FOREIGN KEY ("trainingAreaId") REFERENCES "training_area"("training_area_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_attachments" ADD CONSTRAINT "notification_attachments_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_attachments" ADD CONSTRAINT "notification_attachments_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_login_activity" ADD CONSTRAINT "user_login_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_login_activity" ADD CONSTRAINT "user_login_activity_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districtMaster"("district_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_kvk_id_fkey" FOREIGN KEY ("kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgMaster"("org_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "stateMaster"("state_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universityMaster"("university_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zone"("zone_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stateMaster" ADD CONSTRAINT "stateMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districtMaster" ADD CONSTRAINT "districtMaster_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "stateMaster"("state_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districtMaster" ADD CONSTRAINT "districtMaster_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zone"("zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgMaster" ADD CONSTRAINT "orgMaster_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districtMaster"("district_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universityMaster" ADD CONSTRAINT "universityMaster_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgMaster"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;

