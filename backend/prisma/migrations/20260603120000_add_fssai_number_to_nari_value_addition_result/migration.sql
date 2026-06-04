-- Add optional FSSAI number to NARI value-addition results.
-- Required (non-empty) only when fssai_certification = 'Yes'; enforced in the
-- application layer (repositories/forms/nariValueAdditionRepository.js).
ALTER TABLE "nari_value_addition_result" ADD COLUMN IF NOT EXISTS "fssai_number" TEXT;
