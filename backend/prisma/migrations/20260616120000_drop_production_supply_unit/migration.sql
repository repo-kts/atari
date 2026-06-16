-- Production & Supply of Technological Products: drop the stored `unit` column.
-- Unit now derives from the linked Product's master unit (Product.unit_id -> unit).
-- Editing a product's unit updates it across all production-supply records.
ALTER TABLE "kvk_production_supply" DROP COLUMN "unit";
