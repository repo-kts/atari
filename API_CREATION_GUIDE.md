# Guide to Creating Full-Stack Form APIs in This Project

Based on our recent debugging session for "Other Extension Activities", here is the definitive checklist and set of gotchas to remember when creating or connecting new APIs in this project. Moving forward, refer to this guide to ensure new forms work flawlessly on the first try.

### 1. Backend Prisma Schema & Repository
- **Foreign Keys**: Always check if a relation is optional or mandatory. If a relation like `fldId` is optional, ensure your repository code explicitly converts empty values to `null` instead of `parseInt(undefined)`, which becomes `NaN` or crashes constraints.
- **Data Casting**: All incoming `req.body` data from string/FormData must be explicitly parsed using `parseInt()` or `new Date()`. Keep in mind `Number(undefined)` is `NaN`.
- **Relationship Lookups**: If the frontend sends a string name (e.g., `staffName` or `activityName`), and the DB needs an integer ID, write a secure lookup in the repository (`prisma.activity.findFirst({ where: { activityName }})`).
- **Update Logic Override**: Beware of payload overlap. If the frontend sends both `activityCount: "10"` and the legacy `numberOfActivities: 21` during an update, your repository `update` function must prioritize checking the new form field (`??` operator) so it doesn't overwrite it with the stale legacy field.

### 2. Frontend Entity Setup (`constants/entityTypes.ts`)
- Every new form needs a specific identifier mapped out inside `ENTITY_TYPES` (e.g., `ACHIEVEMENT_OTHER_EXTENSION`).
- It must also be included properly down at the bottom of the file in the categorizations if needed.

### 3. Frontend ID Mapping (`utils/idFieldMap.ts`) **[CRITICAL]**
- The React Table component relies 100% on `ENTITY_ID_FIELD_MAP`.
- **If you do not add your `ENTITY_TYPES.NEW_FORM_NAME: 'customIdColumnName'`, the "Edit" and "Delete" buttons will fail silently or crash the backend with an `undefined` ID URL endpoint.**

### 4. Data Transformation (`utils/dataTransformationUtils.ts`)
- Whenever the frontend sends an update or create payload to the backend, it strips out nested objects using `COMMON_NESTED_OBJECTS`.
- Ensure your form isn't trying to send complex, nested read-only objects. If custom fields like `isOther: true` are required, add them to `ENTITY_TRANSFORMATION_RULES`.

### 5. API Hooks (`hooks/useEntityHook.ts` & others)
- Create an API service file (`services/yourApi.ts`) that handles the standard CRUD `fetch` calls.
- Wrap it in a React Query hook (`hooks/forms/useYourForm.ts`).
- Finally, bind it to `useEntityHook.ts` so the dynamic DataManagementView component knows exactly which hook to fire when the route opens.

### 6. Field Value Display (`utils/fieldValueUtils.ts`)
- Ensure the table correctly reads your nested relationships (e.g., `item.activity?.activityName`) inside `fieldExtractors`. If the backend changes its return structure (e.g., `activity` instead of `activityType`), the frontend list view will break unless this file is updated.

---

*Keep this reference handy whenever building out the remaining forms.*
