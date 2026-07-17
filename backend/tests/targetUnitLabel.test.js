const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const targetsForm = fs.readFileSync(
    path.resolve(__dirname, '../../frontend/src/pages/features/Targets.tsx'),
    'utf8',
);

test('Targets form maps each supported production target type to its unit label', () => {
    const expectedLabels = {
        'Seed Production': 'Target (qt.)',
        'Planting Material': 'Target (No.)',
        'Livestock Strains and Fish Fingerlings Produced': 'Target (No.)',
        'Soil Water Plants Manures Samples Tested': 'Target (No.)',
        OFT: 'Target (ha)',
        FLD: 'Target (ha)',
        'CFLD Pulses': 'Target (ha)',
        'CFLD Oilseed': 'Target (ha)',
    };

    for (const [typeName, label] of Object.entries(expectedLabels)) {
        assert.ok(
            targetsForm.includes(`'${typeName}': '${label}'`),
            `${typeName} should display ${label}`,
        );
    }
});

test('Targets form derives the rendered label from the selected type', () => {
    assert.match(targetsForm, /TARGET_LABELS\[formTypeName\]\s*\?\?\s*['"]Target['"]/);
    assert.match(targetsForm, /\{targetLabel\}\s*\*/);
});
