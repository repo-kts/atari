const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const prisma = require('../config/prisma.js');
const meetingsRepository = require('../repositories/forms/meetingsRepository.js');
const {
    renderSacMeetingSection,
} = require('../services/reports/formsTemplate/meetingsTemplates/sacMeetingTemplate.js');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('SAC meeting create stores In Compliance as an Action Taken value', async () => {
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
            actionTaken: 'IN_COMPLIANCE',
        }, { kvkId: 1 });

        assert.equal(captured.actionTaken, 'IN_COMPLIANCE');
        assert.equal('inCompliance' in captured, false);
    } finally {
        prisma.sacMeeting.create = originalCreate;
    }
});

test('SAC meeting create accepts the legacy separate compliance payload', async () => {
    const originalCreate = prisma.sacMeeting.create;
    let captured;

    prisma.sacMeeting.create = async (args) => {
        captured = args.data;
        return { sacMeetingId: 1, ...args.data };
    };

    try {
        await meetingsRepository.sac.create({
            actionTaken: 'NO',
            inCompliance: 'YES',
        }, { kvkId: 1 });

        assert.equal(captured.actionTaken, 'IN_COMPLIANCE');
        assert.equal('inCompliance' in captured, false);
    } finally {
        prisma.sacMeeting.create = originalCreate;
    }
});

test('SAC meeting form and report expose one combined Action Taken field', () => {
    const form = read('../frontend/src/pages/dashboard/shared/forms/meetings/MeetingForms.tsx');
    const schema = read('prisma/kvk/meetings/sac_schema.prisma');
    const fields = read('../frontend/src/constants/fieldNames.ts');
    const report = read('services/reports/formsTemplate/meetingsTemplates/sacMeetingTemplate.js');
    const migration = read(
        'prisma/migrations/20260720020000_add_sac_action_in_compliance/migration.sql',
    );

    assert.match(form, /SAC_ACTION_OPTIONS[\s\S]*?IN_COMPLIANCE[\s\S]*?label: 'In Compliance'/);
    assert.doesNotMatch(form, /label="In Compliance"/);
    assert.match(schema, /^\s*IN_COMPLIANCE\s*$/m);
    assert.doesNotMatch(fields, /IN_COMPLIANCE:\s*'inCompliance'/);
    assert.doesNotMatch(report, /<th>In Compliance<\/th>/);
    assert.match(report, /storedAction === 'IN_COMPLIANCE'/);
    assert.match(migration, /ADD VALUE IF NOT EXISTS 'IN_COMPLIANCE'/);

    const html = renderSacMeetingSection.call(
        { _escapeHtml: (value) => String(value) },
        {},
        [{
            actionTaken: 'IN_COMPLIANCE',
            numberOfParticipants: 1,
            statutoryMembersPresent: 1,
            salientRecommendations: 'Recommendation',
            reason: 'Reason',
        }],
        'sac-section',
        true,
    );
    assert.match(html, /<th>Action Taken<\/th>/);
    assert.match(html, /<td style="text-align:center;">In Compliance<\/td>/);
});
