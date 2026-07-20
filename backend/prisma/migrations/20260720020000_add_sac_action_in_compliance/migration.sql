-- "In Compliance" is an Action Taken choice, not a separate form field.
ALTER TYPE "ActionStatus"
ADD VALUE IF NOT EXISTS 'IN_COMPLIANCE';
