const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const { getSectionConfig } = require('../config/reportConfig.js');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const {
    buildPublicationGroups,
    buildPublicationDetailsTabularData,
    renderPublicationDetailsDetailedSection,
} = require('../services/reports/formsTemplate/achievementTemplates/publicationDetailsDetailedTemplate.js');
const {
    generatePublicationDetailsExcelBuffer,
    generatePublicationDetailsWordBuffer,
} = require('../utils/publicationDetailsPageExport.js');

const rows = [
    {
        kvkName: 'KVK Bhagalpur',
        category: 'Research Paper Published',
        year: '2025',
        title: 'Soil improvement',
        authorName: 'ATARI Patna, KVK and others',
        journalName: 'Indian Journal',
        pageNo: '101-108',
        naasRating: 6.33,
    },
    {
        kvkName: 'KVK Bhagalpur',
        category: 'Books Published',
        year: '2025',
        title: 'Farm Science',
        authorName: 'KVK Author',
        publisherName: 'ICAR Press',
        isbnNumber: '978-1-23456-789-0',
    },
];

test('KVK publication report uses grouped conditional detail columns', () => {
    const section = getSectionConfig('2.55');
    assert.equal(section.customTemplate, 'publication-details-detailed');

    const { groups } = buildPublicationGroups(rows);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].kvkName, 'KVK Bhagalpur');
    assert.equal(groups[0].publicationGroups.length, 2);

    const research = groups[0].publicationGroups.find(
        (group) => group.publicationItem === 'Research Paper Published',
    );
    assert.deepEqual(
        research.columns.map((column) => column.label),
        ['Publication Year', 'Title', 'Author Name', 'Journal Name', 'Page Number', 'NAAS Rating'],
    );

    const book = groups[0].publicationGroups.find(
        (group) => group.publicationItem === 'Books Published',
    );
    assert.deepEqual(
        book.columns.map((column) => column.label),
        ['Publication Year', 'Title', 'Author Name', 'Publisher Name', 'ISBN Number'],
    );

    const html = renderPublicationDetailsDetailedSection.call(
        reportTemplateService,
        section,
        rows,
        'section-2-55',
        false,
    );
    assert.match(html, /Publication Item: Research Paper Published/);
    assert.match(html, /101-108/);
    assert.match(html, /6\.33/);
    assert.match(html, /Publication Item: Books Published/);
    assert.match(html, /978-1-23456-789-0/);

    const tabular = buildPublicationDetailsTabularData(rows);
    assert.ok(tabular.headers.includes('Publication Item'));
    assert.ok(tabular.headers.includes('Page Number'));
    assert.ok(tabular.headers.includes('NAAS Rating'));
    assert.ok(tabular.headers.includes('ISBN Number'));
});

test('publication report repository carries every conditional form field', async () => {
    const prismaPath = require.resolve('../config/prisma.js');
    const repositoryPath = require.resolve('../repositories/reports/publicationDetailsReportRepository.js');
    const originalPrismaModule = require.cache[prismaPath];

    require.cache[prismaPath] = {
        id: prismaPath,
        filename: prismaPath,
        loaded: true,
        exports: {
            kvkPublicationDetails: {
                findMany: async () => [{
                    publicationDetailsId: 'publication-1',
                    kvk: {
                        kvkName: 'KVK Bhagalpur',
                        state: { stateName: 'Bihar' },
                        district: { districtName: 'Bhagalpur' },
                    },
                    publication: { publicationName: 'Research Paper Published' },
                    publicationOther: null,
                    reportingYear: new Date('2025-01-01T00:00:00.000Z'),
                    title: 'Soil improvement',
                    authorName: 'KVK Author',
                    journalName: 'Indian Journal',
                    pageNo: '101-108',
                    naasRating: 6.33,
                    publisherName: null,
                    venue: null,
                    isbnNumber: null,
                }],
            },
        },
    };
    delete require.cache[repositoryPath];

    try {
        const repository = require(repositoryPath);
        const result = await repository.getKvPublicationDetailsReportData(1, { year: 2025 });
        assert.deepEqual(result[0], {
            publicationDetailsId: 'publication-1',
            kvkName: 'KVK Bhagalpur',
            stateName: 'Bihar',
            districtName: 'Bhagalpur',
            category: 'Research Paper Published',
            title: 'Soil improvement',
            authorName: 'KVK Author',
            journalName: 'Indian Journal',
            pageNo: '101-108',
            naasRating: 6.33,
            publisherName: '',
            venue: '',
            isbnNumber: '',
            year: '2025',
        });
    } finally {
        delete require.cache[repositoryPath];
        if (originalPrismaModule) require.cache[prismaPath] = originalPrismaModule;
        else delete require.cache[prismaPath];
    }
});

test('grouped publication details export to Excel and Word', async () => {
    const [excel, word] = await Promise.all([
        generatePublicationDetailsExcelBuffer('Publication Details', rows),
        generatePublicationDetailsWordBuffer('Publication Details', rows),
    ]);

    assert.ok(excel.length > 1000, 'Excel export should contain a populated workbook');
    assert.ok(word.length > 1000, 'Word export should contain a populated document');
});
