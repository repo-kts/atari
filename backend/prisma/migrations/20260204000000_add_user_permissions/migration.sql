-- CreateTable (only if referenced tables exist)
DO $$
BEGIN
  -- Only create user_permissions table if both users and permissions tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
    
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_permissions') THEN
      CREATE TABLE "user_permissions" (
          "user_id" INTEGER NOT NULL,
          "permission_id" INTEGER NOT NULL,

          CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_id","permission_id")
      );
    END IF;

    -- AddForeignKey for user_id (only if column exists and constraint doesn't exist)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_permissions' AND column_name = 'user_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_permissions_user_id_fkey') THEN
      ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- AddForeignKey for permission_id (only if column exists and constraint doesn't exist)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_permissions' AND column_name = 'permission_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_permissions_permission_id_fkey') THEN
      ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
