UPDATE "drmr_activity_component"
SET "unit" = 'No.'
WHERE "activity_type" IN (
    'AWARENESS_CAMP'::"DrmrActivityType",
    'LITERATURE_DISTRIBUTION'::"DrmrActivityType",
    'KISAN_MELA'::"DrmrActivityType"
);
