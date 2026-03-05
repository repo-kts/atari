-- Add SetNull on delete for kvk_staff -> sanctioned_post relation

DO $$
BEGIN
  -- Update sanctioned_post relation
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_staff') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_staff' AND column_name = 'sanctioned_post_id') THEN
      -- Make column nullable
      ALTER TABLE kvk_staff ALTER COLUMN sanctioned_post_id DROP NOT NULL;
      
      -- Drop existing constraint (check for common constraint name patterns)
      ALTER TABLE kvk_staff DROP CONSTRAINT IF EXISTS kvk_staff_sanctionedPostId_fkey CASCADE;
      ALTER TABLE kvk_staff DROP CONSTRAINT IF EXISTS kvk_staff_sanctioned_post_id_fkey CASCADE;
      
      -- Recreate with SET NULL
      ALTER TABLE kvk_staff 
        ADD CONSTRAINT kvk_staff_sanctioned_post_id_fkey 
        FOREIGN KEY (sanctioned_post_id) 
        REFERENCES sanctioned_post(sanctioned_post_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
