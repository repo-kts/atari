-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csisa_crop_detail') THEN
    ALTER TABLE "csisa_crop_detail" DROP CONSTRAINT "csisa_crop_detail_csisaId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_activity_component') THEN
    ALTER TABLE "drmr_activity_component" DROP CONSTRAINT "drmr_activity_component_drmrActivityId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_technical_feedback') THEN
    ALTER TABLE "fld_technical_feedback" DROP CONSTRAINT "fld_technical_feedback_fldId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_budget_utilization_item') THEN
    ALTER TABLE "kvk_budget_utilization_item" DROP CONSTRAINT "kvk_budget_utilization_item_budgetId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_extension_activity') THEN
    ALTER TABLE "kvk_extension_activity" DROP CONSTRAINT "kvk_extension_activity_fldId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft_technology') THEN
    ALTER TABLE "kvk_oft_technology" DROP CONSTRAINT "kvk_oft_technology_kvkOftId_fkey";
  END IF;
END $$;

-- DropForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_extension_activity') THEN
    ALTER TABLE "kvk_other_extension_activity" DROP CONSTRAINT "kvk_other_extension_activity_fldId_fkey";
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_extension_activity') THEN
    ALTER TABLE "kvk_extension_activity" ADD CONSTRAINT "kvk_extension_activity_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "kvk_fld_introduction"("kvk_fld_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_other_extension_activity') THEN
    ALTER TABLE "kvk_other_extension_activity" ADD CONSTRAINT "kvk_other_extension_activity_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "kvk_fld_introduction"("kvk_fld_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fld_technical_feedback') THEN
    ALTER TABLE "fld_technical_feedback" ADD CONSTRAINT "fld_technical_feedback_fldId_fkey" FOREIGN KEY ("fldId") REFERENCES "kvk_fld_introduction"("kvk_fld_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft_technology') THEN
    ALTER TABLE "kvk_oft_technology" ADD CONSTRAINT "kvk_oft_technology_kvkOftId_fkey" FOREIGN KEY ("kvkOftId") REFERENCES "kvk_oft"("kvk_oft_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_budget_utilization_item') THEN
    ALTER TABLE "kvk_budget_utilization_item" ADD CONSTRAINT "kvk_budget_utilization_item_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "kvk_budget_utilization"("budget_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'csisa_crop_detail') THEN
    ALTER TABLE "csisa_crop_detail" ADD CONSTRAINT "csisa_crop_detail_csisaId_fkey" FOREIGN KEY ("csisaId") REFERENCES "csisa"("csisa_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drmr_activity_component') THEN
    ALTER TABLE "drmr_activity_component" ADD CONSTRAINT "drmr_activity_component_drmrActivityId_fkey" FOREIGN KEY ("drmrActivityId") REFERENCES "drmr_activity"("drmr_activity_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

