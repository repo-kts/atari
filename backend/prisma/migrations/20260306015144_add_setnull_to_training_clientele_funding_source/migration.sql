-- Add SetNull on delete for training_achievement -> clientele_master and funding_source_master relations

DO $$
BEGIN
  -- Update clientele_master relation
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_achievement') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'training_achievement' AND column_name = 'clientele_id') THEN
      -- Make column nullable
      ALTER TABLE training_achievement ALTER COLUMN clientele_id DROP NOT NULL;
      
      -- Drop existing constraint (check for common constraint name patterns)
      ALTER TABLE training_achievement DROP CONSTRAINT IF EXISTS training_achievement_clienteleId_fkey CASCADE;
      ALTER TABLE training_achievement DROP CONSTRAINT IF EXISTS training_achievement_clientele_id_fkey CASCADE;
      
      -- Recreate with SET NULL
      ALTER TABLE training_achievement 
        ADD CONSTRAINT training_achievement_clientele_id_fkey 
        FOREIGN KEY (clientele_id) 
        REFERENCES clientele_master(clientele_id) 
        ON DELETE SET NULL;
    END IF;
    
    -- Update funding_source_master relation
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'training_achievement' AND column_name = 'funding_source_id') THEN
      -- Drop existing constraint (check for common constraint name patterns)
      ALTER TABLE training_achievement DROP CONSTRAINT IF EXISTS training_achievement_fundingSourceId_fkey CASCADE;
      ALTER TABLE training_achievement DROP CONSTRAINT IF EXISTS training_achievement_funding_source_id_fkey CASCADE;
      
      -- Recreate with SET NULL
      ALTER TABLE training_achievement 
        ADD CONSTRAINT training_achievement_funding_source_id_fkey 
        FOREIGN KEY (funding_source_id) 
        REFERENCES funding_source_master(funding_source_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
