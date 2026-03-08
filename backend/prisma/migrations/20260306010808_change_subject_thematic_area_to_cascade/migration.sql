-- Change subject and thematic area foreign keys from SET NULL to CASCADE

-- OFT relations: Change oft_thematic_area -> oft_subject from SET NULL to CASCADE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oft_thematic_area') THEN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'oft_thematic_area' 
               AND constraint_name = 'oft_thematic_area_oft_subject_id_fkey') THEN
      ALTER TABLE oft_thematic_area 
        DROP CONSTRAINT IF EXISTS oft_thematic_area_oft_subject_id_fkey CASCADE;
      ALTER TABLE oft_thematic_area 
        ADD CONSTRAINT oft_thematic_area_oft_subject_id_fkey 
        FOREIGN KEY (oft_subject_id) 
        REFERENCES oft_subject(oft_subject_id) 
        ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Keep kvk_oft -> oft_subject as SET NULL (do not cascade delete kvk_oft records)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_oft' AND column_name = 'oft_subject_id') THEN
      -- Drop constraint if it exists (check both possible constraint names)
      ALTER TABLE kvk_oft DROP CONSTRAINT IF EXISTS kvk_oft_oftSubjectId_fkey CASCADE;
      ALTER TABLE kvk_oft DROP CONSTRAINT IF EXISTS kvk_oft_oft_subject_id_fkey CASCADE;
      -- Recreate with SET NULL
      ALTER TABLE kvk_oft 
        ADD CONSTRAINT kvk_oft_oftSubjectId_fkey 
        FOREIGN KEY (oft_subject_id) 
        REFERENCES oft_subject(oft_subject_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Keep kvk_oft -> oft_thematic_area as SET NULL (do not cascade delete kvk_oft records)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_oft' AND column_name = 'oft_thematic_area_id') THEN
      -- Drop constraint if it exists (check both possible constraint names)
      ALTER TABLE kvk_oft DROP CONSTRAINT IF EXISTS kvk_oft_oftThematicAreaId_fkey CASCADE;
      ALTER TABLE kvk_oft DROP CONSTRAINT IF EXISTS kvk_oft_oft_thematic_area_id_fkey CASCADE;
      -- Recreate with SET NULL
      ALTER TABLE kvk_oft 
        ADD CONSTRAINT kvk_oft_oftThematicAreaId_fkey 
        FOREIGN KEY (oft_thematic_area_id) 
        REFERENCES oft_thematic_area(oft_thematic_area_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
