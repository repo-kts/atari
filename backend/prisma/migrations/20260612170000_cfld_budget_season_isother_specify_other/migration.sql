-- "Other" option support for the CFLD Budget Utilization season.
-- season_other holds the free-text value entered on the budget record when the
-- chosen season row is flagged isOther. Mirrors the other CFLD slices.

ALTER TABLE "kvk_budget_utilization" ADD COLUMN "season_other" TEXT;
