const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('affected forms have nullable storage for their specified Other values', () => {
    const infrastructure = read('prisma/kvk/about-kvk/infra_schema.prisma');
    const soilWater = read('prisma/kvk/soil_water_testing/analysis_details_schema.prisma');
    const district = read('prisma/kvk/performance-indicators/district-village/district_level_schema.prisma');

    assert.match(
        infrastructure,
        /^\s*sourceOfFundingOther\s+String\?\s+@map\("source_of_funding_other"\)/m,
    );
    assert.match(
        soilWater,
        /^\s*samplesAnalysedThroughOther\s+String\?\s+@map\("samples_analysed_through_other"\)/m,
    );
    assert.match(
        district,
        /^\s*accountTypeOther\s+String\?\s+@map\("account_type_other"\)/m,
    );
});
