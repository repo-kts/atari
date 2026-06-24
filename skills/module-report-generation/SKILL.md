---
name: module-report-generation
description: Keep module-wise report exports aligned across PDF, Excel, and Word in this Atari KVK project. Use when changing a single module's download/report format, KVK-wise/admin grouped exports, report template keys, or PDF/Excel/DOCX data/layout parity.
---

# Module Report Generation

## Workflow

1. Locate the module template key in `frontend/src/pages/dashboard/shared/dataManagementExportTemplateKeys.ts`.
2. Trace the backend renderer in `backend/services/reports/reportTemplateService.js`.
3. Patch the PDF template under `backend/services/reports/formsTemplate/**`.
4. Make Excel and Word use the same data shape and section order as PDF.
5. For admin exports, group by state/district/KVK when requested; for KVK users, keep only that KVK's data.
6. Prefer one Excel sheet per KVK when multiple KVKs exist; use tab colors for grouped outputs.
7. Use small DOCX text, usually 6pt (`TextRun.size = 12`), landscape pages for wide tables, and narrow margins.
8. Run focused validation: `node -c` on changed backend files and a small in-memory export buffer smoke test when possible.

## Report Rules

- Keep PDF, Excel, and DOCX template/data parity.
- Do not leave wide tables cropped; reduce font size, set landscape, fit Excel pages to width, and wrap cells.
- Do not add state/district as repeated table columns when the request asks for state-wise or district-wise grouping.
- Keep module-wise exports separate from all-reports unless the user explicitly asks for all-report changes.
- Do not revert unrelated dirty worktree changes.
