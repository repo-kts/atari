-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_current_year') THEN
    ALTER TABLE "arya_current_year" DROP CONSTRAINT "arya_current_year_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_prev_year') THEN
    ALTER TABLE "arya_prev_year" DROP CONSTRAINT "arya_prev_year_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'atari_meeting') THEN
    ALTER TABLE "atari_meeting" DROP CONSTRAINT "atari_meeting_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beneficiaries_details') THEN
    ALTER TABLE "beneficiaries_details" DROP CONSTRAINT "beneficiaries_details_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cfl cfld_technical_parameter') THEN
    ALTER TABLE "cfl cfld_technical_parameter" DROP CONSTRAINT "cfl cfld_technical_parameter_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csisa') THEN
    ALTER TABLE "csisa" DROP CONSTRAINT "csisa_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demonstration_info') THEN
    ALTER TABLE "demonstration_info" DROP CONSTRAINT "demonstration_info_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_activity') THEN
    ALTER TABLE "drmr_activity" DROP CONSTRAINT "drmr_activity_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_details') THEN
    ALTER TABLE "drmr_details" DROP CONSTRAINT "drmr_details_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'extension_activity_organized') THEN
    ALTER TABLE "extension_activity_organized" DROP CONSTRAINT "extension_activity_organized_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmer_award') THEN
    ALTER TABLE "farmer_award" DROP CONSTRAINT "farmer_award_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_information') THEN
    ALTER TABLE "financial_information" DROP CONSTRAINT "financial_information_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_extension') THEN
    ALTER TABLE "fld_extension" DROP CONSTRAINT "fld_extension_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_technical_feedback') THEN
    ALTER TABLE "fld_technical_feedback" DROP CONSTRAINT "fld_technical_feedback_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fpo_cbbo_details') THEN
    ALTER TABLE "fpo_cbbo_details" DROP CONSTRAINT "fpo_cbbo_details_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fpo_management') THEN
    ALTER TABLE "fpo_management" DROP CONSTRAINT "fpo_management_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'geographical_info') THEN
    ALTER TABLE "geographical_info" DROP CONSTRAINT "geographical_info_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hrd_program') THEN
    ALTER TABLE "hrd_program" DROP CONSTRAINT "hrd_program_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_agri_drone') THEN
    ALTER TABLE "kvk_agri_drone" DROP CONSTRAINT "kvk_agri_drone_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_award') THEN
    ALTER TABLE "kvk_award" DROP CONSTRAINT "kvk_award_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_bank_account') THEN
    ALTER TABLE "kvk_bank_account" DROP CONSTRAINT "kvk_bank_account_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_budget_utilization') THEN
    ALTER TABLE "kvk_budget_utilization" DROP CONSTRAINT "kvk_budget_utilization_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_equipment') THEN
    ALTER TABLE "kvk_equipment" DROP CONSTRAINT "kvk_equipment_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_extension_activity') THEN
    ALTER TABLE "kvk_extension_activity" DROP CONSTRAINT "kvk_extension_activity_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_farm_implement') THEN
    ALTER TABLE "kvk_farm_implement" DROP CONSTRAINT "kvk_farm_implement_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_fld_introduction') THEN
    ALTER TABLE "kvk_fld_introduction" DROP CONSTRAINT "kvk_fld_introduction_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_important_day_celebration') THEN
    ALTER TABLE "kvk_important_day_celebration" DROP CONSTRAINT "kvk_important_day_celebration_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_infrastructure') THEN
    ALTER TABLE "kvk_infrastructure" DROP CONSTRAINT "kvk_infrastructure_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft') THEN
    ALTER TABLE "kvk_oft" DROP CONSTRAINT "kvk_oft_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_extension_activity') THEN
    ALTER TABLE "kvk_other_extension_activity" DROP CONSTRAINT "kvk_other_extension_activity_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_programme') THEN
    ALTER TABLE "kvk_other_programme" DROP CONSTRAINT "kvk_other_programme_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_seed_hub_program') THEN
    ALTER TABLE "kvk_seed_hub_program" DROP CONSTRAINT "kvk_seed_hub_program_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_soil_water_analysis') THEN
    ALTER TABLE "kvk_soil_water_analysis" DROP CONSTRAINT "kvk_soil_water_analysis_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_soil_water_equipment') THEN
    ALTER TABLE "kvk_soil_water_equipment" DROP CONSTRAINT "kvk_soil_water_equipment_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_staff') THEN
    ALTER TABLE "kvk_staff" DROP CONSTRAINT "kvk_staff_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_technology_week_celebration') THEN
    ALTER TABLE "kvk_technology_week_celebration" DROP CONSTRAINT "kvk_technology_week_celebration_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_vehicle') THEN
    ALTER TABLE "kvk_vehicle" DROP CONSTRAINT "kvk_vehicle_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_world_soil_celebration') THEN
    ALTER TABLE "kvk_world_soil_celebration" DROP CONSTRAINT "kvk_world_soil_celebration_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra_basic_info') THEN
    ALTER TABLE "nicra_basic_info" DROP CONSTRAINT "nicra_basic_info_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra_details') THEN
    ALTER TABLE "nicra_details" DROP CONSTRAINT "nicra_details_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra_extension_activity') THEN
    ALTER TABLE "nicra_extension_activity" DROP CONSTRAINT "nicra_extension_activity_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra_training') THEN
    ALTER TABLE "nicra_training" DROP CONSTRAINT "nicra_training_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'physical_info') THEN
    ALTER TABLE "physical_info" DROP CONSTRAINT "physical_info_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sac_meeting') THEN
    ALTER TABLE "sac_meeting" DROP CONSTRAINT "sac_meeting_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scientist_award') THEN
    ALTER TABLE "scientist_award" DROP CONSTRAINT "scientist_award_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'soil_data_information') THEN
    ALTER TABLE "soil_data_information" DROP CONSTRAINT "soil_data_information_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_transfer_history') THEN
    ALTER TABLE "staff_transfer_history" DROP CONSTRAINT "staff_transfer_history_from_kvk_id_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_transfer_history') THEN
    ALTER TABLE "staff_transfer_history" DROP CONSTRAINT "staff_transfer_history_to_kvk_id_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachh_quarterly_expenditure') THEN
    ALTER TABLE "swachh_quarterly_expenditure" DROP CONSTRAINT "swachh_quarterly_expenditure_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachhta_hi_sewa') THEN
    ALTER TABLE "swachhta_hi_sewa" DROP CONSTRAINT "swachhta_hi_sewa_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachhta_pakhwada') THEN
    ALTER TABLE "swachhta_pakhwada" DROP CONSTRAINT "swachhta_pakhwada_kvkId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_achievement') THEN
    ALTER TABLE "training_achievement" DROP CONSTRAINT "training_achievement_kvkId_fkey";
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_current_year') THEN
    ALTER TABLE "arya_current_year" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_enterprise') THEN
    ALTER TABLE "arya_enterprise" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_prev_year') THEN
    ALTER TABLE "arya_prev_year" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'atari_meeting') THEN
    ALTER TABLE "atari_meeting" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_item') THEN
    ALTER TABLE "budget_item" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'category') THEN
    ALTER TABLE "category" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cfl cfld_technical_parameter') THEN
    ALTER TABLE "cfl cfld_technical_parameter" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientele_master') THEN
    ALTER TABLE "clientele_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_coordinator_master') THEN
    ALTER TABLE "course_coordinator_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cra_croping_system') THEN
    ALTER TABLE "cra_croping_system" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cra_farming_system') THEN
    ALTER TABLE "cra_farming_system" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop') THEN
    ALTER TABLE "crop" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop_type') THEN
    ALTER TABLE "crop_type" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csisa') THEN
    ALTER TABLE "csisa" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csisa_crop_detail') THEN
    ALTER TABLE "csisa_crop_detail" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discipline') THEN
    ALTER TABLE "discipline" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'districtMaster') THEN
    ALTER TABLE "districtMaster" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_activity') THEN
    ALTER TABLE "drmr_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_activity_component') THEN
    ALTER TABLE "drmr_activity_component" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_details') THEN
    ALTER TABLE "drmr_details" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enterprise_master') THEN
    ALTER TABLE "enterprise_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event') THEN
    ALTER TABLE "event" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'extension_activity') THEN
    ALTER TABLE "extension_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'extension_activity_organized') THEN
    ALTER TABLE "extension_activity_organized" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmer_award') THEN
    ALTER TABLE "farmer_award" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_activity') THEN
    ALTER TABLE "fld_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_crop_master') THEN
    ALTER TABLE "fld_crop_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_extension') THEN
    ALTER TABLE "fld_extension" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_technical_feedback') THEN
    ALTER TABLE "fld_technical_feedback" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fpo_cbbo_details') THEN
    ALTER TABLE "fpo_cbbo_details" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fpo_management') THEN
    ALTER TABLE "fpo_management" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funding_source_master') THEN
    ALTER TABLE "funding_source_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hrd_program') THEN
    ALTER TABLE "hrd_program" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'important_day') THEN
    ALTER TABLE "important_day" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk') THEN
    ALTER TABLE "kvk" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_agri_drone') THEN
    ALTER TABLE "kvk_agri_drone" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_award') THEN
    ALTER TABLE "kvk_award" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_bank_account') THEN
    ALTER TABLE "kvk_bank_account" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_budget_utilization') THEN
    ALTER TABLE "kvk_budget_utilization" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_budget_utilization_item') THEN
    ALTER TABLE "kvk_budget_utilization_item" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_equipment') THEN
    ALTER TABLE "kvk_equipment" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_extension_activity') THEN
    ALTER TABLE "kvk_extension_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_farm_implement') THEN
    ALTER TABLE "kvk_farm_implement" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_fld_introduction') THEN
    ALTER TABLE "kvk_fld_introduction" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_important_day_celebration') THEN
    ALTER TABLE "kvk_important_day_celebration" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_infrastructure') THEN
    ALTER TABLE "kvk_infrastructure" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_infrastructure_master') THEN
    ALTER TABLE "kvk_infrastructure_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft') THEN
    ALTER TABLE "kvk_oft" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft_technology') THEN
    ALTER TABLE "kvk_oft_technology" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_extension_activity') THEN
    ALTER TABLE "kvk_other_extension_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_programme') THEN
    ALTER TABLE "kvk_other_programme" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_seed_hub_program') THEN
    ALTER TABLE "kvk_seed_hub_program" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_soil_water_analysis') THEN
    ALTER TABLE "kvk_soil_water_analysis" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_soil_water_equipment') THEN
    ALTER TABLE "kvk_soil_water_equipment" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_staff') THEN
    ALTER TABLE "kvk_staff" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_technology_week_celebration') THEN
    ALTER TABLE "kvk_technology_week_celebration" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_vehicle') THEN
    ALTER TABLE "kvk_vehicle" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_world_soil_celebration') THEN
    ALTER TABLE "kvk_world_soil_celebration" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modules') THEN
    ALTER TABLE "modules" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oft_subject') THEN
    ALTER TABLE "oft_subject" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oft_technology_type') THEN
    ALTER TABLE "oft_technology_type" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oft_thematic_area') THEN
    ALTER TABLE "oft_thematic_area" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orgMaster') THEN
    ALTER TABLE "orgMaster" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'other_extension_activity') THEN
    ALTER TABLE "other_extension_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'other_extension_activity_type') THEN
    ALTER TABLE "other_extension_activity_type" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pay_level_master') THEN
    ALTER TABLE "pay_level_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
    ALTER TABLE "permissions" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product') THEN
    ALTER TABLE "product" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_category') THEN
    ALTER TABLE "product_category" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_type') THEN
    ALTER TABLE "product_type" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'publication') THEN
    ALTER TABLE "publication" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
    ALTER TABLE "roles" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sac_meeting') THEN
    ALTER TABLE "sac_meeting" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sanctioned_post') THEN
    ALTER TABLE "sanctioned_post" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scientist_award') THEN
    ALTER TABLE "scientist_award" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'season') THEN
    ALTER TABLE "season" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sector') THEN
    ALTER TABLE "sector" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'soil_water_analysis') THEN
    ALTER TABLE "soil_water_analysis" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_category_master') THEN
    ALTER TABLE "staff_category_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_transfer_history') THEN
    ALTER TABLE "staff_transfer_history" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stateMaster') THEN
    ALTER TABLE "stateMaster" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_category') THEN
    ALTER TABLE "sub_category" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachh_quarterly_expenditure') THEN
    ALTER TABLE "swachh_quarterly_expenditure" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachhta_hi_sewa') THEN
    ALTER TABLE "swachhta_hi_sewa" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachhta_pakhwada') THEN
    ALTER TABLE "swachhta_pakhwada" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'thematic_area') THEN
    ALTER TABLE "thematic_area" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'thematic_area_master') THEN
    ALTER TABLE "thematic_area_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_achievement') THEN
    ALTER TABLE "training_achievement" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_area') THEN
    ALTER TABLE "training_area" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_area_master') THEN
    ALTER TABLE "training_area_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_thematic_area') THEN
    ALTER TABLE "training_thematic_area" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_type') THEN
    ALTER TABLE "training_type" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_type_master') THEN
    ALTER TABLE "training_type_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'universityMaster') THEN
    ALTER TABLE "universityMaster" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'year_master') THEN
    ALTER TABLE "year_master" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'zone') THEN
    ALTER TABLE "zone" ALTER COLUMN "updated_at" DROP DEFAULT;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_bank_account') THEN
    ALTER TABLE "kvk_bank_account" ADD CONSTRAINT "kvk_bank_account_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_staff') THEN
    ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_equipment') THEN
    ALTER TABLE "kvk_equipment" ADD CONSTRAINT "kvk_equipment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_farm_implement') THEN
    ALTER TABLE "kvk_farm_implement" ADD CONSTRAINT "kvk_farm_implement_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_infrastructure') THEN
    ALTER TABLE "kvk_infrastructure" ADD CONSTRAINT "kvk_infrastructure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_transfer_history') THEN
    ALTER TABLE "staff_transfer_history" ADD CONSTRAINT "staff_transfer_history_from_kvk_id_fkey" FOREIGN KEY ("from_kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_transfer_history') THEN
    ALTER TABLE "staff_transfer_history" ADD CONSTRAINT "staff_transfer_history_to_kvk_id_fkey" FOREIGN KEY ("to_kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_vehicle') THEN
    ALTER TABLE "kvk_vehicle" ADD CONSTRAINT "kvk_vehicle_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmer_award') THEN
    ALTER TABLE "farmer_award" ADD CONSTRAINT "farmer_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_award') THEN
    ALTER TABLE "kvk_award" ADD CONSTRAINT "kvk_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scientist_award') THEN
    ALTER TABLE "scientist_award" ADD CONSTRAINT "scientist_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_extension_activity') THEN
    ALTER TABLE "kvk_extension_activity" ADD CONSTRAINT "kvk_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_important_day_celebration') THEN
    ALTER TABLE "kvk_important_day_celebration" ADD CONSTRAINT "kvk_important_day_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_extension_activity') THEN
    ALTER TABLE "kvk_other_extension_activity" ADD CONSTRAINT "kvk_other_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_technology_week_celebration') THEN
    ALTER TABLE "kvk_technology_week_celebration" ADD CONSTRAINT "kvk_technology_week_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_extension') THEN
    ALTER TABLE "fld_extension" ADD CONSTRAINT "fld_extension_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_fld_introduction') THEN
    ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_technical_feedback') THEN
    ALTER TABLE "fld_technical_feedback" ADD CONSTRAINT "fld_technical_feedback_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft') THEN
    ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_agri_drone') THEN
    ALTER TABLE "kvk_agri_drone" ADD CONSTRAINT "kvk_agri_drone_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_prev_year') THEN
    ALTER TABLE "arya_prev_year" ADD CONSTRAINT "arya_prev_year_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_current_year') THEN
    ALTER TABLE "arya_current_year" ADD CONSTRAINT "arya_current_year_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_budget_utilization') THEN
    ALTER TABLE "kvk_budget_utilization" ADD CONSTRAINT "kvk_budget_utilization_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'extension_activity_organized') THEN
    ALTER TABLE "extension_activity_organized" ADD CONSTRAINT "extension_activity_organized_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cfl cfld_technical_parameter') THEN
    ALTER TABLE "cfl cfld_technical_parameter" ADD CONSTRAINT "cfl cfld_technical_parameter_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csisa') THEN
    ALTER TABLE "csisa" ADD CONSTRAINT "csisa_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_activity') THEN
    ALTER TABLE "drmr_activity" ADD CONSTRAINT "drmr_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_details') THEN
    ALTER TABLE "drmr_details" ADD CONSTRAINT "drmr_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fpo_cbbo_details') THEN
    ALTER TABLE "fpo_cbbo_details" ADD CONSTRAINT "fpo_cbbo_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fpo_management') THEN
    ALTER TABLE "fpo_management" ADD CONSTRAINT "fpo_management_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beneficiaries_details') THEN
    ALTER TABLE "beneficiaries_details" ADD CONSTRAINT "beneficiaries_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demonstration_info') THEN
    ALTER TABLE "demonstration_info" ADD CONSTRAINT "demonstration_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_information') THEN
    ALTER TABLE "financial_information" ADD CONSTRAINT "financial_information_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'geographical_info') THEN
    ALTER TABLE "geographical_info" ADD CONSTRAINT "geographical_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'physical_info') THEN
    ALTER TABLE "physical_info" ADD CONSTRAINT "physical_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'soil_data_information') THEN
    ALTER TABLE "soil_data_information" ADD CONSTRAINT "soil_data_information_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra_basic_info') THEN
    ALTER TABLE "nicra_basic_info" ADD CONSTRAINT "nicra_basic_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra_details') THEN
    ALTER TABLE "nicra_details" ADD CONSTRAINT "nicra_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra_extension_activity') THEN
    ALTER TABLE "nicra_extension_activity" ADD CONSTRAINT "nicra_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra_training') THEN
    ALTER TABLE "nicra_training" ADD CONSTRAINT "nicra_training_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_programme') THEN
    ALTER TABLE "kvk_other_programme" ADD CONSTRAINT "kvk_other_programme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_seed_hub_program') THEN
    ALTER TABLE "kvk_seed_hub_program" ADD CONSTRAINT "kvk_seed_hub_program_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_achievement') THEN
    ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hrd_program') THEN
    ALTER TABLE "hrd_program" ADD CONSTRAINT "hrd_program_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'atari_meeting') THEN
    ALTER TABLE "atari_meeting" ADD CONSTRAINT "atari_meeting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sac_meeting') THEN
    ALTER TABLE "sac_meeting" ADD CONSTRAINT "sac_meeting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_soil_water_analysis') THEN
    ALTER TABLE "kvk_soil_water_analysis" ADD CONSTRAINT "kvk_soil_water_analysis_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_soil_water_equipment') THEN
    ALTER TABLE "kvk_soil_water_equipment" ADD CONSTRAINT "kvk_soil_water_equipment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_world_soil_celebration') THEN
    ALTER TABLE "kvk_world_soil_celebration" ADD CONSTRAINT "kvk_world_soil_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachhta_hi_sewa') THEN
    ALTER TABLE "swachhta_hi_sewa" ADD CONSTRAINT "swachhta_hi_sewa_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachh_quarterly_expenditure') THEN
    ALTER TABLE "swachh_quarterly_expenditure" ADD CONSTRAINT "swachh_quarterly_expenditure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachhta_pakhwada') THEN
    ALTER TABLE "swachhta_pakhwada" ADD CONSTRAINT "swachhta_pakhwada_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

