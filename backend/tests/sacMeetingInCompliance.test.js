const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const prisma = require('../config/prisma.js');
const meetingsRepository = require('../repositories/forms/meetingsRepository.js');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('SAC meeting create saves In Compliance independently from Action Taken', async () => {
    const originalCreate = prisma.sacMeeting.create;
    let captured;

    prisma.sacMeeting.create = async (args) => {
        captured = args.data;
        return { sacMeetingId: 1, ...args.data };
    };

    try {
        await meetingsRepository.sac.create({
            startDate: '2026-01-01',
            endDate: '2026-01-02',
            actionTaken: 'NO',
            inCompliance: 'YES',
        }, { kvkId: 1 });

        assert.equal(captured.actionTaken, 'NO');
        assert.equal(captured.inCompliance, 'YES');
    } finally {
        prisma.sacMeeting.create = originalCreate;
    }
});

test('SAC meeting update can clear In Compliance without changing Action Taken', async () => {
    const originalFindFirst = prisma.sacMeeting.findFirst;
    const originalUpdate = prisma.sacMeeting.update;
    let captured;

    prisma.sacMeeting.findFirst = async () => ({ sacMeetingId: 1, kvkId: 1, actionTaken: 'YES' });
    prisma.sacMeeting.update = async (args) => {
        captured = args.data;
        return { sacMeetingId: 1, actionTaken: 'YES', ...args.data };
    };

    try {
        await meetingsRepository.sac.update(1, { inCompliance: '' }, { kvkId: 1 });

        assert.deepEqual(captured, { inCompliance: null });
    } finally {
        prisma.sacMeeting.findFirst = originalFindFirst;
        prisma.sacMeeting.update = originalUpdate;
    }
});

test('SAC meeting form, schema, view, and report expose In Compliance', () => {
    const form = read('../frontend/src/pages/dashboard/shared/forms/meetings/MeetingForms.tsx');
    const schema = read('prisma/kvk/meetings/sac_schema.prisma');
    const fields = read('../frontend/src/constants/fieldNames.ts');
    const report = read('services/reports/formsTemplate/meetingsTemplates/sacMeetingTemplate.js');

    assert.match(
        form,
        /label="In Compliance"[\s\S]*?value=\{formData\.inCompliance \?\? ''\}[\s\S]*?onChange=\{handleFieldChange\('inCompliance'\)\}/,
    );
    assert.match(schema, /^\s*inCompliance\s+ActionStatus\?\s+@map\("in_compliance"\)/m);
    assert.match(fields, /IN_COMPLIANCE:\s*'inCompliance'/);
    assert.match(report, /row\.inCompliance/);
});
