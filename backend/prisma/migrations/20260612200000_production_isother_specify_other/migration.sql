-- "Other" option support for the Production Supply masters:
-- Product Category, Product Type, Product.
-- isOther flags a master row as the "Other" option; *_other columns hold the
-- free-text value entered on the production-supply record when that option is
-- selected. Mirrors 20260612120000_fld_isother_specify_other.

ALTER TABLE "product_category" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product_type" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN "is_other" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "kvk_production_supply" ADD COLUMN "product_category_other" TEXT;
ALTER TABLE "kvk_production_supply" ADD COLUMN "product_type_other" TEXT;
ALTER TABLE "kvk_production_supply" ADD COLUMN "product_other" TEXT;
