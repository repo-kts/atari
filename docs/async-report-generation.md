# Asynchronous aggregated PDF reports

Aggregated PDF generation uses Vercel Queues so the browser request is not
held open while data is collected and Chromium renders the report.

## Runtime flow

1. `POST /api/reports/aggregated/jobs` creates a database job and one part per
   selected report section.
2. The `report-generation` queue invokes `backend/api/report-generation.js`.
3. Sections are grouped into bounded PDF parts. By default each part contains
   four sections and up to four parts run concurrently. Parts are stored under
   `report-jobs/{jobId}/parts/`.
4. The final queue message creates the cover and contents pages, merges all
   parts, applies global page numbering, and stores
   `report-jobs/{jobId}/final/report.pdf`.
5. `GET /api/reports/aggregated/jobs/:jobId` returns progress and short-lived
   signed preview/download URLs for the requesting user.

## Required production configuration

- Deploy `backend/prisma/migrations/20260724090000_add_report_generation_jobs`.
- Keep the existing `DATABASE_URL` configuration available to all backend
  functions.
- Keep the existing `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, and
  `AWS_SECRET_ACCESS_KEY` variables available to the queue consumer.
- Vercel supplies queue authentication through project OIDC. No queue token is
  required in the deployed backend.
- `REPORT_SECTIONS_PER_PART` can tune the number of sections rendered by one
  Chromium invocation (default `4`, bounded from `1` to `8`).
- `REPORT_PARALLEL_PARTS` can tune concurrent queue lanes for a job (default
  `4`, bounded from `1` to `6`).

The final object is marked as expiring after seven days in the database.
Configure an S3 lifecycle rule for the `report-jobs/` prefix if physical object
deletion after seven days is required. Temporary part objects are deleted as
soon as the final PDF is successfully stored.
