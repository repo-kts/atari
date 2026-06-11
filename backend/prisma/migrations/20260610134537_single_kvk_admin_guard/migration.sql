-- Enforce at most one active KVK Admin per KVK at the database level.
-- The service layer (userManagementService.ensureSingleKvkAdminPerKvk)
-- performs the same check for a friendly error message; this trigger closes
-- the check-then-write race. A partial unique index can't express the rule
-- because role ids differ across environments — the trigger matches on role
-- NAME instead ('kvk_amdin' is a known legacy typo role).
-- The advisory xact lock serializes concurrent writes for the same KVK, so
-- the EXISTS check always sees the competing transaction's committed row.

CREATE OR REPLACE FUNCTION enforce_single_kvk_admin() RETURNS trigger AS $$
BEGIN
    IF NEW.kvk_id IS NULL OR NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM roles r
        WHERE r.role_id = NEW.role_id
          AND r.role_name IN ('kvk_admin', 'kvk_amdin')
    ) THEN
        RETURN NEW;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext('single-kvk-admin-' || NEW.kvk_id::text));

    IF EXISTS (
        SELECT 1
        FROM users u
        JOIN roles r ON r.role_id = u.role_id
        WHERE u.kvk_id = NEW.kvk_id
          AND u.deleted_at IS NULL
          AND r.role_name IN ('kvk_admin', 'kvk_amdin')
          AND u.user_id <> NEW.user_id
    ) THEN
        RAISE EXCEPTION 'KVK % already has an active KVK Admin', NEW.kvk_id
            USING ERRCODE = '23505';
    END IF;

    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_kvk_admin ON users;
CREATE TRIGGER trg_single_kvk_admin
    BEFORE INSERT OR UPDATE OF role_id, kvk_id, deleted_at ON users
    FOR EACH ROW EXECUTE FUNCTION enforce_single_kvk_admin();
