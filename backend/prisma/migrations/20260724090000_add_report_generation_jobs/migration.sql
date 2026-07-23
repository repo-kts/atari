CREATE TABLE "report_generation_jobs" (
    "report_generation_job_id" UUID NOT NULL,
    "requested_by" INTEGER NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "request_payload" JSONB NOT NULL,
    "result_key" TEXT,
    "file_name" TEXT,
    "error_message" TEXT,
    "total_parts" INTEGER NOT NULL DEFAULT 0,
    "completed_parts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_generation_jobs_pkey" PRIMARY KEY ("report_generation_job_id")
);

CREATE TABLE "report_generation_job_parts" (
    "report_generation_job_part_id" UUID NOT NULL,
    "report_generation_job_id" UUID NOT NULL,
    "part_index" INTEGER NOT NULL,
    "section_ids" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "result_key" TEXT,
    "error_message" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_generation_job_parts_pkey" PRIMARY KEY ("report_generation_job_part_id")
);

CREATE INDEX "report_generation_jobs_requested_by_created_at_idx"
ON "report_generation_jobs"("requested_by", "created_at");

CREATE INDEX "report_generation_jobs_status_updated_at_idx"
ON "report_generation_jobs"("status", "updated_at");

CREATE UNIQUE INDEX "report_generation_job_parts_report_generation_job_id_part_index_key"
ON "report_generation_job_parts"("report_generation_job_id", "part_index");

CREATE INDEX "report_generation_job_parts_status_updated_at_idx"
ON "report_generation_job_parts"("status", "updated_at");

ALTER TABLE "report_generation_job_parts"
ADD CONSTRAINT "report_generation_job_parts_report_generation_job_id_fkey"
FOREIGN KEY ("report_generation_job_id")
REFERENCES "report_generation_jobs"("report_generation_job_id")
ON DELETE CASCADE
ON UPDATE CASCADE;
