-- DropForeignKey
ALTER TABLE "arya_current_year" DROP CONSTRAINT "arya_current_year_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "arya_prev_year" DROP CONSTRAINT "arya_prev_year_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "atari_meeting" DROP CONSTRAINT "atari_meeting_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "beneficiaries_details" DROP CONSTRAINT "beneficiaries_details_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "cfl cfld_technical_parameter" DROP CONSTRAINT "cfl cfld_technical_parameter_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "csisa" DROP CONSTRAINT "csisa_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "demonstration_info" DROP CONSTRAINT "demonstration_info_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "drmr_activity" DROP CONSTRAINT "drmr_activity_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "drmr_details" DROP CONSTRAINT "drmr_details_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "extension_activity_organized" DROP CONSTRAINT "extension_activity_organized_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "farmer_award" DROP CONSTRAINT "farmer_award_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "financial_information" DROP CONSTRAINT "financial_information_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "fld_extension" DROP CONSTRAINT "fld_extension_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "fld_technical_feedback" DROP CONSTRAINT "fld_technical_feedback_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "fpo_cbbo_details" DROP CONSTRAINT "fpo_cbbo_details_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "fpo_management" DROP CONSTRAINT "fpo_management_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "geographical_info" DROP CONSTRAINT "geographical_info_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "hrd_program" DROP CONSTRAINT "hrd_program_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_agri_drone" DROP CONSTRAINT "kvk_agri_drone_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_award" DROP CONSTRAINT "kvk_award_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_bank_account" DROP CONSTRAINT "kvk_bank_account_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_budget_utilization" DROP CONSTRAINT "kvk_budget_utilization_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_equipment" DROP CONSTRAINT "kvk_equipment_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_extension_activity" DROP CONSTRAINT "kvk_extension_activity_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_farm_implement" DROP CONSTRAINT "kvk_farm_implement_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_fld_introduction" DROP CONSTRAINT "kvk_fld_introduction_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_important_day_celebration" DROP CONSTRAINT "kvk_important_day_celebration_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_infrastructure" DROP CONSTRAINT "kvk_infrastructure_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_oft" DROP CONSTRAINT "kvk_oft_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_other_extension_activity" DROP CONSTRAINT "kvk_other_extension_activity_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_other_programme" DROP CONSTRAINT "kvk_other_programme_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_seed_hub_program" DROP CONSTRAINT "kvk_seed_hub_program_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_soil_water_analysis" DROP CONSTRAINT "kvk_soil_water_analysis_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_soil_water_equipment" DROP CONSTRAINT "kvk_soil_water_equipment_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_staff" DROP CONSTRAINT "kvk_staff_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_technology_week_celebration" DROP CONSTRAINT "kvk_technology_week_celebration_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_vehicle" DROP CONSTRAINT "kvk_vehicle_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "kvk_world_soil_celebration" DROP CONSTRAINT "kvk_world_soil_celebration_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "nicra_basic_info" DROP CONSTRAINT "nicra_basic_info_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "nicra_details" DROP CONSTRAINT "nicra_details_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "nicra_extension_activity" DROP CONSTRAINT "nicra_extension_activity_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "nicra_training" DROP CONSTRAINT "nicra_training_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "physical_info" DROP CONSTRAINT "physical_info_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "sac_meeting" DROP CONSTRAINT "sac_meeting_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "scientist_award" DROP CONSTRAINT "scientist_award_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "soil_data_information" DROP CONSTRAINT "soil_data_information_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "staff_transfer_history" DROP CONSTRAINT "staff_transfer_history_from_kvk_id_fkey";
-- DropForeignKey
ALTER TABLE "staff_transfer_history" DROP CONSTRAINT "staff_transfer_history_to_kvk_id_fkey";
-- DropForeignKey
ALTER TABLE "swachh_quarterly_expenditure" DROP CONSTRAINT "swachh_quarterly_expenditure_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "swachhta_hi_sewa" DROP CONSTRAINT "swachhta_hi_sewa_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "swachhta_pakhwada" DROP CONSTRAINT "swachhta_pakhwada_kvkId_fkey";
-- DropForeignKey
ALTER TABLE "training_achievement" DROP CONSTRAINT "training_achievement_kvkId_fkey";
-- AlterTable
ALTER TABLE "arya_current_year" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "arya_enterprise" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "arya_prev_year" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "atari_meeting" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "budget_item" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "category" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "cfl cfld_technical_parameter" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "clientele_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "course_coordinator_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "cra_croping_system" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "cra_farming_system" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "crop" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "crop_type" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "csisa" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "csisa_crop_detail" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "discipline" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "districtMaster" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "drmr_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "drmr_activity_component" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "drmr_details" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "enterprise_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "event" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "extension_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "extension_activity_organized" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "farmer_award" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "fld_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "fld_crop_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "fld_extension" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "fld_technical_feedback" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "fpo_cbbo_details" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "fpo_management" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "funding_source_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "hrd_program" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "important_day" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_agri_drone" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_award" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_bank_account" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_budget_utilization" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_budget_utilization_item" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_equipment" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_extension_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_farm_implement" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_fld_introduction" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_important_day_celebration" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_infrastructure" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_infrastructure_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_oft" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_oft_technology" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_other_extension_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_other_programme" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_seed_hub_program" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_soil_water_analysis" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_soil_water_equipment" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_staff" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_technology_week_celebration" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_vehicle" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "kvk_world_soil_celebration" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "oft_subject" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "oft_technology_type" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "oft_thematic_area" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "orgMaster" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "other_extension_activity" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "other_extension_activity_type" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "pay_level_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "permissions" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "product" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "product_category" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "product_type" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "publication" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "sac_meeting" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "sanctioned_post" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "scientist_award" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "season" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "sector" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "soil_water_analysis" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "staff_category_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "staff_transfer_history" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "stateMaster" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "sub_category" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "swachh_quarterly_expenditure" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "swachhta_hi_sewa" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "swachhta_pakhwada" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "thematic_area" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "thematic_area_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "training_achievement" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "training_area" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "training_area_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "training_thematic_area" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "training_type" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "training_type_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "universityMaster" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "year_master" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AlterTable
ALTER TABLE "zone" ALTER COLUMN "updated_at" DROP DEFAULT;
-- AddForeignKey
ALTER TABLE "kvk_bank_account" ADD CONSTRAINT "kvk_bank_account_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_staff" ADD CONSTRAINT "kvk_staff_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_equipment" ADD CONSTRAINT "kvk_equipment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_farm_implement" ADD CONSTRAINT "kvk_farm_implement_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_infrastructure" ADD CONSTRAINT "kvk_infrastructure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "staff_transfer_history" ADD CONSTRAINT "staff_transfer_history_from_kvk_id_fkey" FOREIGN KEY ("from_kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "staff_transfer_history" ADD CONSTRAINT "staff_transfer_history_to_kvk_id_fkey" FOREIGN KEY ("to_kvk_id") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_vehicle" ADD CONSTRAINT "kvk_vehicle_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "farmer_award" ADD CONSTRAINT "farmer_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_award" ADD CONSTRAINT "kvk_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "scientist_award" ADD CONSTRAINT "scientist_award_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_extension_activity" ADD CONSTRAINT "kvk_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_important_day_celebration" ADD CONSTRAINT "kvk_important_day_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_other_extension_activity" ADD CONSTRAINT "kvk_other_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_technology_week_celebration" ADD CONSTRAINT "kvk_technology_week_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "fld_extension" ADD CONSTRAINT "fld_extension_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_fld_introduction" ADD CONSTRAINT "kvk_fld_introduction_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "fld_technical_feedback" ADD CONSTRAINT "fld_technical_feedback_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_oft" ADD CONSTRAINT "kvk_oft_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_agri_drone" ADD CONSTRAINT "kvk_agri_drone_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "arya_prev_year" ADD CONSTRAINT "arya_prev_year_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "arya_current_year" ADD CONSTRAINT "arya_current_year_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_budget_utilization" ADD CONSTRAINT "kvk_budget_utilization_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "extension_activity_organized" ADD CONSTRAINT "extension_activity_organized_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "cfl cfld_technical_parameter" ADD CONSTRAINT "cfl cfld_technical_parameter_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "csisa" ADD CONSTRAINT "csisa_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "drmr_activity" ADD CONSTRAINT "drmr_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "drmr_details" ADD CONSTRAINT "drmr_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "fpo_cbbo_details" ADD CONSTRAINT "fpo_cbbo_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "fpo_management" ADD CONSTRAINT "fpo_management_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "beneficiaries_details" ADD CONSTRAINT "beneficiaries_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "demonstration_info" ADD CONSTRAINT "demonstration_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "financial_information" ADD CONSTRAINT "financial_information_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "geographical_info" ADD CONSTRAINT "geographical_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "physical_info" ADD CONSTRAINT "physical_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soil_data_information" ADD CONSTRAINT "soil_data_information_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "nicra_basic_info" ADD CONSTRAINT "nicra_basic_info_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "nicra_details" ADD CONSTRAINT "nicra_details_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "nicra_extension_activity" ADD CONSTRAINT "nicra_extension_activity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "nicra_training" ADD CONSTRAINT "nicra_training_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_other_programme" ADD CONSTRAINT "kvk_other_programme_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_seed_hub_program" ADD CONSTRAINT "kvk_seed_hub_program_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "training_achievement" ADD CONSTRAINT "training_achievement_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "hrd_program" ADD CONSTRAINT "hrd_program_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "atari_meeting" ADD CONSTRAINT "atari_meeting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "sac_meeting" ADD CONSTRAINT "sac_meeting_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_soil_water_analysis" ADD CONSTRAINT "kvk_soil_water_analysis_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_soil_water_equipment" ADD CONSTRAINT "kvk_soil_water_equipment_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kvk_world_soil_celebration" ADD CONSTRAINT "kvk_world_soil_celebration_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "swachhta_hi_sewa" ADD CONSTRAINT "swachhta_hi_sewa_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "swachh_quarterly_expenditure" ADD CONSTRAINT "swachh_quarterly_expenditure_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "swachhta_pakhwada" ADD CONSTRAINT "swachhta_pakhwada_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
