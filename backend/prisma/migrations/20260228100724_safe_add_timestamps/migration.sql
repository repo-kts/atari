-- Safe migration: only alter tables that exist
DO $$
BEGIN
  -- Add timestamps to arya_current_year
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_current_year') THEN
    ALTER TABLE "arya_current_year" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "arya_current_year" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to arya_enterprise
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_enterprise') THEN
    ALTER TABLE "arya_enterprise" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "arya_enterprise" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to arya_prev_year
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arya_prev_year') THEN
    ALTER TABLE "arya_prev_year" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "arya_prev_year" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to atari_meeting
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'atari_meeting') THEN
    ALTER TABLE "atari_meeting" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "atari_meeting" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to budget_item
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_item') THEN
    ALTER TABLE "budget_item" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "budget_item" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to category
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'category') THEN
    ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to cfl cfld_technical_parameter
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cfl cfld_technical_parameter') THEN
    ALTER TABLE "cfl cfld_technical_parameter" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "cfl cfld_technical_parameter" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to clientele_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientele_master') THEN
    ALTER TABLE "clientele_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "clientele_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to course_coordinator_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_coordinator_master') THEN
    ALTER TABLE "course_coordinator_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "course_coordinator_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to cra_croping_system
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cra_croping_system') THEN
    ALTER TABLE "cra_croping_system" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "cra_croping_system" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to cra_farming_system
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cra_farming_system') THEN
    ALTER TABLE "cra_farming_system" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "cra_farming_system" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to crop
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop') THEN
    ALTER TABLE "crop" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "crop" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to crop_type
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crop_type') THEN
    ALTER TABLE "crop_type" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "crop_type" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to csisa
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csisa') THEN
    ALTER TABLE "csisa" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "csisa" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to csisa_crop_detail
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csisa_crop_detail') THEN
    ALTER TABLE "csisa_crop_detail" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "csisa_crop_detail" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to discipline
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discipline') THEN
    ALTER TABLE "discipline" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "discipline" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to districtMaster
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'districtMaster') THEN
    ALTER TABLE "districtMaster" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "districtMaster" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to drmr_activity
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_activity') THEN
    ALTER TABLE "drmr_activity" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "drmr_activity" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to drmr_activity_component
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_activity_component') THEN
    ALTER TABLE "drmr_activity_component" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "drmr_activity_component" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to drmr_details
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_details') THEN
    ALTER TABLE "drmr_details" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "drmr_details" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to enterprise_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enterprise_master') THEN
    ALTER TABLE "enterprise_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "enterprise_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to event
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event') THEN
    ALTER TABLE "event" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "event" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to extension_activity
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'extension_activity') THEN
    ALTER TABLE "extension_activity" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "extension_activity" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to extension_activity_organized
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'extension_activity_organized') THEN
    ALTER TABLE "extension_activity_organized" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "extension_activity_organized" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to fld_activity
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_activity') THEN
    ALTER TABLE "fld_activity" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "fld_activity" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to fld_crop_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_crop_master') THEN
    ALTER TABLE "fld_crop_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "fld_crop_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to fld_extension
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_extension') THEN
    ALTER TABLE "fld_extension" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "fld_extension" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to fld_technical_feedback
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_technical_feedback') THEN
    ALTER TABLE "fld_technical_feedback" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "fld_technical_feedback" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to fpo_cbbo_details
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fpo_cbbo_details') THEN
    ALTER TABLE "fpo_cbbo_details" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "fpo_cbbo_details" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to fpo_management
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fpo_management') THEN
    ALTER TABLE "fpo_management" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "fpo_management" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to funding_source_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funding_source_master') THEN
    ALTER TABLE "funding_source_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "funding_source_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to important_day
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'important_day') THEN
    ALTER TABLE "important_day" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "important_day" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk') THEN
    ALTER TABLE "kvk" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_agri_drone
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_agri_drone') THEN
    ALTER TABLE "kvk_agri_drone" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_agri_drone" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_budget_utilization
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_budget_utilization') THEN
    ALTER TABLE "kvk_budget_utilization" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_budget_utilization" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_budget_utilization_item
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_budget_utilization_item') THEN
    ALTER TABLE "kvk_budget_utilization_item" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_budget_utilization_item" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_equipment
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_equipment') THEN
    ALTER TABLE "kvk_equipment" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_equipment" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_extension_activity
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_extension_activity') THEN
    ALTER TABLE "kvk_extension_activity" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_extension_activity" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_fld_introduction
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_fld_introduction') THEN
    ALTER TABLE "kvk_fld_introduction" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_fld_introduction" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_important_day_celebration
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_important_day_celebration') THEN
    ALTER TABLE "kvk_important_day_celebration" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_important_day_celebration" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_infrastructure_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_infrastructure_master') THEN
    ALTER TABLE "kvk_infrastructure_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_infrastructure_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_oft
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft') THEN
    ALTER TABLE "kvk_oft" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_oft" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_oft_technology
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft_technology') THEN
    ALTER TABLE "kvk_oft_technology" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_oft_technology" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_other_extension_activity
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_extension_activity') THEN
    ALTER TABLE "kvk_other_extension_activity" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_other_extension_activity" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_seed_hub_program
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_seed_hub_program') THEN
    ALTER TABLE "kvk_seed_hub_program" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_seed_hub_program" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_soil_water_equipment
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_soil_water_equipment') THEN
    ALTER TABLE "kvk_soil_water_equipment" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_soil_water_equipment" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_technology_week_celebration
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_technology_week_celebration') THEN
    ALTER TABLE "kvk_technology_week_celebration" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_technology_week_celebration" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to kvk_world_soil_celebration
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_world_soil_celebration') THEN
    ALTER TABLE "kvk_world_soil_celebration" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "kvk_world_soil_celebration" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to nari
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nari') THEN
    ALTER TABLE "nari" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "nari" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to nicra
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nicra') THEN
    ALTER TABLE "nicra" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "nicra" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to oft
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oft') THEN
    ALTER TABLE "oft" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "oft" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to oft_technology
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oft_technology') THEN
    ALTER TABLE "oft_technology" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "oft_technology" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to other_extension_activity
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'other_extension_activity') THEN
    ALTER TABLE "other_extension_activity" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "other_extension_activity" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to other_extension_activity_type
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'other_extension_activity_type') THEN
    ALTER TABLE "other_extension_activity_type" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "other_extension_activity_type" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to pay_level
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pay_level') THEN
    ALTER TABLE "pay_level" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "pay_level" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to pay_level_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pay_level_master') THEN
    ALTER TABLE "pay_level_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "pay_level_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to permissions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
    ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to product
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product') THEN
    ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to product_category
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_category') THEN
    ALTER TABLE "product_category" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "product_category" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to product_type
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_type') THEN
    ALTER TABLE "product_type" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "product_type" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to publication
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'publication') THEN
    ALTER TABLE "publication" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "publication" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to sac_meeting
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sac_meeting') THEN
    ALTER TABLE "sac_meeting" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "sac_meeting" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to scientist_award
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scientist_award') THEN
    ALTER TABLE "scientist_award" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "scientist_award" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to season
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'season') THEN
    ALTER TABLE "season" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "season" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to sector
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sector') THEN
    ALTER TABLE "sector" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "sector" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to seed_hub_program_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seed_hub_program_master') THEN
    ALTER TABLE "seed_hub_program_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "seed_hub_program_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to soil_water_analysis
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'soil_water_analysis') THEN
    ALTER TABLE "soil_water_analysis" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "soil_water_analysis" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to staff
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
    ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to staff_category_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_category_master') THEN
    ALTER TABLE "staff_category_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "staff_category_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to staff_type
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_type') THEN
    ALTER TABLE "staff_type" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "staff_type" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to staff_type_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_type_master') THEN
    ALTER TABLE "staff_type_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "staff_type_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to stateMaster
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stateMaster') THEN
    ALTER TABLE "stateMaster" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "stateMaster" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to sub_category
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_category') THEN
    ALTER TABLE "sub_category" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "sub_category" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to subject
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subject') THEN
    ALTER TABLE "subject" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "subject" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to swachh_quarterly_expenditure
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachh_quarterly_expenditure') THEN
    ALTER TABLE "swachh_quarterly_expenditure" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "swachh_quarterly_expenditure" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to swachhta_hi_sewa
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachhta_hi_sewa') THEN
    ALTER TABLE "swachhta_hi_sewa" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "swachhta_hi_sewa" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to swachhta_pakhwada
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swachhta_pakhwada') THEN
    ALTER TABLE "swachhta_pakhwada" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "swachhta_pakhwada" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to thematic_area
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'thematic_area') THEN
    ALTER TABLE "thematic_area" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "thematic_area" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to thematic_area_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'thematic_area_master') THEN
    ALTER TABLE "thematic_area_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "thematic_area_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to training_achievement
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_achievement') THEN
    ALTER TABLE "training_achievement" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "training_achievement" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to training_area
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_area') THEN
    ALTER TABLE "training_area" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "training_area" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to training_area_area
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_area_area') THEN
    ALTER TABLE "training_area_area" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "training_area_area" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to training_thematic_area
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_thematic_area') THEN
    ALTER TABLE "training_thematic_area" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "training_thematic_area" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to training_type
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_type') THEN
    ALTER TABLE "training_type" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "training_type" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to university_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'university_master') THEN
    ALTER TABLE "university_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "university_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to variety
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variety') THEN
    ALTER TABLE "variety" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "variety" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to year_master
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'year_master') THEN
    ALTER TABLE "year_master" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "year_master" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  -- Add timestamps to zone
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'zone') THEN
    ALTER TABLE "zone" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "zone" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

END $$;