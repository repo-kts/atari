UPDATE "financial_project" fp
SET "funding_agency_id" = fa."funding_agency_id"
FROM "funding_agency" fa
WHERE fp."funding_agency_id" IS NULL
  AND fa."agency_name" = 'ICAR'
  AND (
    fp."project_name" LIKE 'CFLD%'
    OR fp."project_name" IN ('NICRA', 'ARYA', 'FPO', 'Natural Farming', 'DRMR', 'NARI', 'IIPR', 'SAP')
  );

UPDATE "financial_project" fp
SET "funding_agency_id" = fa."funding_agency_id"
FROM "funding_agency" fa
WHERE fp."funding_agency_id" IS NULL
  AND fa."agency_name" = 'State Govt. Ministry of A&FW'
  AND fp."project_name" IN ('TSP', 'SCSP');

UPDATE "financial_project" fp
SET "funding_agency_id" = fa."funding_agency_id"
FROM "funding_agency" fa
WHERE fp."funding_agency_id" IS NULL
  AND fa."agency_name" = 'Others'
  AND fp."project_name" = 'Others';
