const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
    getSectionConfig,
    buildSectionNumbering,
} = require('../config/reportConfig.js');
const { REPORT_INDEX_TAXONOMY } = require('../config/reportIndexTaxonomy.js');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const {
    renderPrevalentDiseasesCropsSection,
    renderPrevalentDiseasesLivestockSection,
} = require('../services/reports/formsTemplate/miscTemplates/prevalentDiseasesTemplate.js');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('BLA-54 moves Prevalent Diseases into the Performance report hierarchy', () => {
    const performance = REPORT_INDEX_TAXONOMY['4'];
    const districtVillage = performance.groups.find(
        (group) => group.label === 'District and Village Performance',
    );
    const misc = REPORT_INDEX_TAXONOMY['5'];

    assert.deepEqual(
        districtVillage.features.map((feature) => [feature.sectionId, feature.label]),
        [
            ['4.4', 'District Level Data'],
            ['4.5', 'Operational Area Details'],
            ['4.6', 'Village Adoption Programme'],
            ['4.7', 'Priority Thrust Area'],
            ['5.1', 'Prevalent diseases in Crops'],
            ['5.2', 'Prevalent diseases in Livestock/Fishery'],
        ],
    );
    assert.equal(getSectionConfig('5.1').parentSectionId, '4');
    assert.equal(getSectionConfig('5.2').parentSectionId, '4');
    assert.equal(
        misc.groups.flatMap((group) => group.features).some(
            (feature) => feature.sectionId === '5.1' || feature.sectionId === '5.2',
        ),
        false,
    );
    assert.deepEqual(
        misc.groups.map((group) => group.label),
        ['PPV & FRA Sensitization', 'Digital Information'],
    );
});

test('BLA-54 frontend report selector mirrors the backend hierarchy', () => {
    const source = read('frontend/src/config/reportIndexTaxonomy.ts');
    const performanceStart = source.indexOf('performance: {');
    const miscStart = source.indexOf('misc: {', performanceStart);
    const performanceSource = source.slice(performanceStart, miscStart);
    const miscSource = source.slice(miscStart);

    assert.match(performanceSource, /label: 'District and Village Performance'[\s\S]*sectionId: '5\.1'[\s\S]*sectionId: '5\.2'/);
    assert.doesNotMatch(miscSource, /sectionId: '5\.[12]'/);
    assert.match(miscSource, /label: 'PPV & FRA Sensitization'[\s\S]*label: 'Digital Information'/);
});

test('BLA-54 generated PDF index numbers disease modules as 4.2.E and 4.2.F', () => {
    const ids = [
        '1.1',
        '2.1',
        '2.16',
        '4.4',
        '4.5',
        '4.6',
        '4.7',
        '5.1',
        '5.2',
        '5.4',
        '5.5',
    ];
    const numbering = buildSectionNumbering(ids.map(getSectionConfig));
    const performance = numbering.chapters.find((chapter) => chapter.title === 'Performance');
    const districtVillage = performance.groups.find(
        (group) => group.label === 'District and Village Performance',
    );
    const misc = numbering.chapters.find((chapter) => chapter.title === 'Miscellaneous');
    const toc = reportTemplateService._generateTableOfContents(numbering.chapters);

    assert.deepEqual(
        districtVillage.features.slice(-2).map((feature) => [feature.number, feature.sectionId]),
        [
            ['4.2.E', '5.1'],
            ['4.2.F', '5.2'],
        ],
    );
    assert.equal(misc.groups[0].number, '5.1');
    assert.equal(misc.groups[0].label, 'PPV & FRA Sensitization');
    assert.match(toc, /4\.2\.E[\s\S]*Prevalent diseases in Crops/);
    assert.match(toc, /4\.2\.F[\s\S]*Prevalent diseases in Livestock\/Fishery/);
    assert.doesNotMatch(toc, /5\.1\.A[\s\S]*Prevalent diseases in Crops/);
});

test('BLA-54 disease report pages render their assigned hierarchy index', () => {
    const context = {
        _escapeHtml: (value) => String(value ?? ''),
    };
    const crops = renderPrevalentDiseasesCropsSection.call(
        context,
        { id: '4.2.E', title: 'Prevalent diseases in Crops' },
        [],
        'section-5-1',
        true,
    );
    const livestock = renderPrevalentDiseasesLivestockSection.call(
        context,
        { id: '4.2.F', title: 'Prevalent diseases in Livestock/Fishery' },
        [],
        'section-5-2',
        false,
    );

    assert.match(crops, /<h1[^>]*>4\.2\.E Prevalent diseases in Crops<\/h1>/);
    assert.match(livestock, /<h1[^>]*>4\.2\.F Prevalent diseases in Livestock\/Fishery<\/h1>/);
});
