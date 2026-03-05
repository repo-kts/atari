-- Add SetNull on delete for kvk_staff -> pay_level_master relation

DO $$
BEGIN
  -- Update pay_level_master relation
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_staff') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_staff' AND column_name = 'pay_level_id') THEN
      -- Drop existing constraint (check for common constraint name patterns)
      ALTER TABLE kvk_staff DROP CONSTRAINT IF EXISTS kvk_staff_payLevelId_fkey CASCADE;
      ALTER TABLE kvk_staff DROP CONSTRAINT IF EXISTS kvk_staff_pay_level_id_fkey CASCADE;
      
      -- Recreate with SET NULL
      ALTER TABLE kvk_staff 
        ADD CONSTRAINT kvk_staff_pay_level_id_fkey 
        FOREIGN KEY (pay_level_id) 
        REFERENCES pay_level_master(pay_level_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
