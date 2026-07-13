# Complete Downstream “Other” Support Design

## Goal

Complete the existing master-controlled “Other” behavior for the 17 confirmed downstream form fields that currently accept an `isOther` master option without showing or storing a custom value.

## User-visible behavior

- A “Please specify other …” input appears only when the selected master row has `isOther: true`.
- The custom input is required while the Other option is selected.
- Selecting a normal option hides the custom input and clears any stale custom value from form state.
- Create and update requests store the custom text alongside the selected master ID.
- Edit pages restore the saved custom text.
- List and report display values prefer the saved custom text over the generic master label.

## Confirmed scope

### Direct selector omissions

1. KVK Employee Details — Discipline.
2. CFLD Extension Activities Organized — Extension Activity.
3. CFLD Budget Utilization — Crop.
4. FLD Technical Feedback — Crop.
5. Natural Farming Demonstration — Staff Category.
6. Performance, Impact of KVK Activities — Specific Area.
7. Performance, Entrepreneurship — Enterprise Type.

### Season omissions

8. FLD Introduction.
9. OFT.
10. CRA Details.
11. CSISA.
12. NARI Bio-Fortified Crop.
13. Natural Farming Demonstration.
14. Natural Farming Soil Data.
15. NICRA Details.
16. Seed Hub Programme.
17. Performance, Instructional Farm Crops.

## Explicit exclusions

Zone, State, District, Organization, and University do not support Other behavior. Their master editors must not render the “Mark as Other” checkbox, and their KVK/User profile selectors must not render custom-value inputs.

The existing additive `is_other` database columns for these five structural masters remain in place and default to `false`; no destructive migration will remove them.

Parent selectors used only to organize master-to-master hierarchies are also excluded from downstream custom-value storage. Selecting a parent while creating another master record does not represent a KVK form submission.

## Architecture

The implementation extends the project’s existing convention instead of adding a new abstraction:

- Master APIs return `isOther` on selectable options.
- React options preserve that flag through `createMasterDataOptions`.
- `useOtherSpecify` controls visibility and stale-value clearing.
- `SpecifyOtherInput` renders the required custom input.
- Consumer Prisma models store nullable, purpose-named text fields such as `disciplineOther`, `seasonOther`, or `cropOther`.
- Form repositories accept, persist, return, and prefer these fields when generating display labels.

For the two Performance Impact forms that already store the selected values as strings rather than foreign keys, the selected Other label remains the selector state and a separate nullable custom-value field preserves the actual value. This keeps edit behavior unambiguous and consistent with relation-backed forms.

## Database changes

One additive migration adds only nullable `TEXT` columns to affected consumer tables. Existing rows receive `NULL`; no existing IDs, names, relationships, or submitted values are modified.

No `DROP`, `DELETE`, `TRUNCATE`, column rename, or type conversion is permitted.

## Validation and error handling

- The frontend marks a visible custom input as required.
- The backend trims custom text and stores empty strings as `NULL`.
- When a non-Other option is submitted, stale custom text is cleared.
- Existing requests that omit the new property remain valid.
- Duplicate-name and foreign-key behavior remains unchanged.

## Testing

- Replace the incomplete fixed consumer inventory with contract coverage for all 17 confirmed fields.
- Add tests proving each consumer Prisma model exposes its nullable custom field.
- Add repository tests proving create/update payloads retain the custom field where repository sanitizers use allow-lists.
- Add source-level UI contracts proving each selector carries `isOther`, invokes `useOtherSpecify`, and renders `SpecifyOtherInput`.
- Verify the tests fail before implementation and pass afterward.
- Run Prisma validation and generation, all backend tests, the frontend production build, and `git diff --check`.

## Delivery

Implementation will be committed separately from this design. After verification, the code can be pushed to `v2-prod`. The additive migration must then be deployed against the intended database before the updated backend is used.
