-- Add SetNull on delete for kvk_staff -> discipline and kvk_oft -> discipline relations

DO $$
BEGIN
  -- Update kvk_staff -> discipline relation
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_staff') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_staff' AND column_name = 'discipline_id') THEN
      -- Make column nullable
      ALTER TABLE kvk_staff ALTER COLUMN discipline_id DROP NOT NULL;
      
      -- Drop existing constraint (check for common constraint name patterns)
      ALTER TABLE kvk_staff DROP CONSTRAINT IF EXISTS kvk_staff_disciplineId_fkey CASCADE;
      ALTER TABLE kvk_staff DROP CONSTRAINT IF EXISTS kvk_staff_discipline_id_fkey CASCADE;
      
      -- Recreate with SET NULL
      ALTER TABLE kvk_staff 
        ADD CONSTRAINT kvk_staff_discipline_id_fkey 
        FOREIGN KEY (discipline_id) 
        REFERENCES discipline(discipline_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
  
  -- Update kvk_oft -> discipline relation
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_oft' AND column_name = 'discipline_id') THEN
      -- Make column nullable
      ALTER TABLE kvk_oft ALTER COLUMN discipline_id DROP NOT NULL;
      
      -- Drop existing constraint (check for common constraint name patterns)
      ALTER TABLE kvk_oft DROP CONSTRAINT IF EXISTS kvk_oft_disciplineId_fkey CASCADE;
      ALTER TABLE kvk_oft DROP CONSTRAINT IF EXISTS kvk_oft_discipline_id_fkey CASCADE;
      
      -- Recreate with SET NULL
      ALTER TABLE kvk_oft 
        ADD CONSTRAINT kvk_oft_discipline_id_fkey 
        FOREIGN KEY (discipline_id) 
        REFERENCES discipline(discipline_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
