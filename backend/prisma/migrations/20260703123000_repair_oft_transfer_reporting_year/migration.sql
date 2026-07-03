UPDATE "kvk_oft" AS child
SET "reporting_year" = COALESCE(parent."reporting_year", parent."oft_start_date") + INTERVAL '1 year'
FROM "kvk_oft" AS parent
WHERE child."transferred_from_oft_id" = parent."kvk_oft_id"
  AND COALESCE(parent."reporting_year", parent."oft_start_date") IS NOT NULL
  AND (
    child."reporting_year" IS NULL
    OR EXTRACT(YEAR FROM child."reporting_year") <= EXTRACT(YEAR FROM COALESCE(parent."reporting_year", parent."oft_start_date"))
  );
