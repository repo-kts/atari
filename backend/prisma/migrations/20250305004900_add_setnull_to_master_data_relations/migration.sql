-- Make foreign keys nullable and add SetNull on delete for product relations
ALTER TABLE product_type ALTER COLUMN product_category_id DROP NOT NULL;
ALTER TABLE product ALTER COLUMN product_category_id DROP NOT NULL;
ALTER TABLE product ALTER COLUMN product_type_id DROP NOT NULL;

-- Drop and recreate product_type constraint
ALTER TABLE product_type DROP CONSTRAINT IF EXISTS product_type_product_category_id_fkey CASCADE;
ALTER TABLE product_type 
  ADD CONSTRAINT product_type_product_category_id_fkey 
  FOREIGN KEY (product_category_id) 
  REFERENCES product_category(product_category_id) 
  ON DELETE SET NULL;

-- Drop and recreate product constraints
ALTER TABLE product DROP CONSTRAINT IF EXISTS product_product_category_id_fkey CASCADE;
ALTER TABLE product DROP CONSTRAINT IF EXISTS product_product_type_id_fkey CASCADE;

ALTER TABLE product 
  ADD CONSTRAINT product_product_category_id_fkey 
  FOREIGN KEY (product_category_id) 
  REFERENCES product_category(product_category_id) 
  ON DELETE SET NULL;

ALTER TABLE product 
  ADD CONSTRAINT product_product_type_id_fkey 
  FOREIGN KEY (product_type_id) 
  REFERENCES product_type(product_type_id) 
  ON DELETE SET NULL;

-- Training relations (only if tables exist)
DO $$
BEGIN
  -- Check and alter training_area if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_area') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'training_area' AND column_name = 'training_type_id') THEN
      ALTER TABLE training_area ALTER COLUMN training_type_id DROP NOT NULL;
      ALTER TABLE training_area DROP CONSTRAINT IF EXISTS training_area_training_type_id_fkey CASCADE;
      ALTER TABLE training_area 
        ADD CONSTRAINT training_area_training_type_id_fkey 
        FOREIGN KEY (training_type_id) 
        REFERENCES training_type(training_type_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;

  -- Check and alter training_thematic_area if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_thematic_area') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'training_thematic_area' AND column_name = 'training_area_id') THEN
      ALTER TABLE training_thematic_area ALTER COLUMN training_area_id DROP NOT NULL;
      ALTER TABLE training_thematic_area DROP CONSTRAINT IF EXISTS training_thematic_area_training_area_id_fkey CASCADE;
      ALTER TABLE training_thematic_area 
        ADD CONSTRAINT training_thematic_area_training_area_id_fkey 
        FOREIGN KEY (training_area_id) 
        REFERENCES training_area(training_area_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- OFT relations (only if tables exist)
DO $$
BEGIN
  -- Check and alter oft_thematic_area if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oft_thematic_area') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oft_thematic_area' AND column_name = 'oft_subject_id') THEN
      ALTER TABLE oft_thematic_area ALTER COLUMN oft_subject_id DROP NOT NULL;
      ALTER TABLE oft_thematic_area DROP CONSTRAINT IF EXISTS oft_thematic_area_oft_subject_id_fkey CASCADE;
      ALTER TABLE oft_thematic_area 
        ADD CONSTRAINT oft_thematic_area_oft_subject_id_fkey 
        FOREIGN KEY (oft_subject_id) 
        REFERENCES oft_subject(oft_subject_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;

  -- Check and alter kvk_oft if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_oft') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_oft' AND column_name = 'oft_subject_id') THEN
      ALTER TABLE kvk_oft ALTER COLUMN oft_subject_id DROP NOT NULL;
      ALTER TABLE kvk_oft DROP CONSTRAINT IF EXISTS kvk_oft_oftSubjectId_fkey CASCADE;
      ALTER TABLE kvk_oft 
        ADD CONSTRAINT kvk_oft_oftSubjectId_fkey 
        FOREIGN KEY (oft_subject_id) 
        REFERENCES oft_subject(oft_subject_id) 
        ON DELETE SET NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_oft' AND column_name = 'oft_thematic_area_id') THEN
      ALTER TABLE kvk_oft ALTER COLUMN oft_thematic_area_id DROP NOT NULL;
      ALTER TABLE kvk_oft DROP CONSTRAINT IF EXISTS kvk_oft_oftThematicAreaId_fkey CASCADE;
      ALTER TABLE kvk_oft 
        ADD CONSTRAINT kvk_oft_oftThematicAreaId_fkey 
        FOREIGN KEY (oft_thematic_area_id) 
        REFERENCES oft_thematic_area(oft_thematic_area_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Training schema relations (KvkTraining) (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kvk_training') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_training' AND column_name = 'training_type_id') THEN
      ALTER TABLE kvk_training ALTER COLUMN training_type_id DROP NOT NULL;
      ALTER TABLE kvk_training DROP CONSTRAINT IF EXISTS kvk_training_trainingTypeId_fkey CASCADE;
      ALTER TABLE kvk_training 
        ADD CONSTRAINT kvk_training_trainingTypeId_fkey 
        FOREIGN KEY (training_type_id) 
        REFERENCES training_type(training_type_id) 
        ON DELETE SET NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kvk_training' AND column_name = 'training_area_id') THEN
      ALTER TABLE kvk_training ALTER COLUMN training_area_id DROP NOT NULL;
      ALTER TABLE kvk_training DROP CONSTRAINT IF EXISTS kvk_training_trainingAreaId_fkey CASCADE;
      ALTER TABLE kvk_training 
        ADD CONSTRAINT kvk_training_trainingAreaId_fkey 
        FOREIGN KEY (training_area_id) 
        REFERENCES training_area(training_area_id) 
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
