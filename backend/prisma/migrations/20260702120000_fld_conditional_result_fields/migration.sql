ALTER TABLE "kvk_fld_result" ALTER COLUMN "demo_gross_cost" DROP NOT NULL;
ALTER TABLE "kvk_fld_result" ALTER COLUMN "demo_gross_return" DROP NOT NULL;
ALTER TABLE "kvk_fld_result" ALTER COLUMN "demo_net_return" DROP NOT NULL;
ALTER TABLE "kvk_fld_result" ALTER COLUMN "demo_bcr" DROP NOT NULL;
ALTER TABLE "kvk_fld_result" ALTER COLUMN "check_gross_cost" DROP NOT NULL;
ALTER TABLE "kvk_fld_result" ALTER COLUMN "check_gross_return" DROP NOT NULL;
ALTER TABLE "kvk_fld_result" ALTER COLUMN "check_net_return" DROP NOT NULL;
ALTER TABLE "kvk_fld_result" ALTER COLUMN "check_bcr" DROP NOT NULL;

ALTER TABLE "kvk_fld_result" ADD COLUMN "other_parameter_demo" DOUBLE PRECISION;
ALTER TABLE "kvk_fld_result" ADD COLUMN "other_parameter_check" DOUBLE PRECISION;
ALTER TABLE "kvk_fld_result" ADD COLUMN "labor_reduction_man_days" DOUBLE PRECISION;
ALTER TABLE "kvk_fld_result" ADD COLUMN "cost_reduction" DOUBLE PRECISION;
