-- Add SetNull on delete for kvk_staff -> staff_category_master relation

DO $$
BEGIN
  -- Update staff_category_master relation
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_staff') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_staff' AND column_name = 'staff_category_id') THEN
      -- Drop existing constraint (check for common constraint name patterns)
      ALTER TABLE kvk_staff DROP CONSTRAINT IF EXISTS kvk_staff_staffCategoryId_fkey CASCADE;
      ALTER TABLE kvk_staff DROP CONSTRAINT IF EXISTS kvk_staff_staff_category_id_fkey CASCADE;
      
      -- Recreate with SET NULL
      ALTER TABLE kvk_staff 
        ADD CONSTRAINT kvk_staff_staff_category_id_fkey 
        FOREIGN KEY (staff_category_id) 
        REFERENCES staff_category_master(staff_category_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
