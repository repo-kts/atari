const test = require('node:test');
const assert = require('node:assert/strict');

const {
    renderMobileAppSection,
} = require('../services/reports/formsTemplate/digitalInfoTemplates/mobileAppTemplate.js');
const {
    renderWebPortalSection,
} = require('../services/reports/formsTemplate/digitalInfoTemplates/webPortalTemplate.js');
const {
    renderKisanSarathiSection,
} = require('../services/reports/formsTemplate/digitalInfoTemplates/kisanSarathiTemplate.js');
const {
    renderKmasSection,
} = require('../services/reports/formsTemplate/digitalInfoTemplates/kmasTemplate.js');
const {
    renderMsgDetailsSection,
} = require('../services/reports/formsTemplate/digitalInfoTemplates/msgDetailsTemplate.js');
const {
    renderRaweFetFitSection,
} = require('../services/reports/formsTemplate/miscTemplates/raweFetFitTemplate.js');

const context = {
    _escapeHtml: (value) => String(value),
};

function render(renderer, records) {
    return renderer.call(
        context,
        { id: 'test', title: 'Test' },
        records,
        'section-test',
        false,
    );
}

test('BLA-71 Mobile App report totals apps developed and downloads', () => {
    const html = render(renderMobileAppSection, [
        {
            kvkName: 'KVK Gumla',
            numberOfAppsDeveloped: 2,
            nameOfApp: 'App A',
            languageOfApp: 'English',
            meantFor: 'Crop',
            numberOfTimesDownloaded: 5,
        },
        {
            kvkName: 'KVK Bhagalpur',
            numberOfAppsDeveloped: 6,
            nameOfApp: 'App B',
            languageOfApp: 'Hindi',
            meantFor: 'Livestock',
            numberOfTimesDownloaded: 53,
        },
    ]);

    assert.match(html, /<td>Total<\/td>\s*<td style="text-align:center;">8<\/td>/);
    assert.match(html, /<td style="text-align:center;">58<\/td>\s*<\/tr>/);
});

test('BLA-71 Web Portal report totals visitors and registered farmers', () => {
    const html = render(renderWebPortalSection, [
        { kvkName: 'KVK A', webPortalName: 'Portal A', noOfVisitors: 25, noOfFarmersRegistered: 4556 },
        { kvkName: 'KVK B', webPortalName: 'Portal B', noOfVisitors: 787, noOfFarmersRegistered: 787 },
    ]);

    assert.match(html, /<td>Total<\/td>\s*<td>—<\/td>\s*<td style="text-align:center;">812<\/td>/);
    assert.match(html, /<td style="text-align:center;">5343<\/td>/);
});

test('BLA-71 Kisan Sarathi report totals registrations and calls', () => {
    const html = render(renderKisanSarathiSection, [
        {
            kvkName: 'KVK A',
            noOfFarmersRegisteredOnKspPortal: 100,
            phoneCallAddressed: 10,
            phoneCallAnswered: 8,
        },
        {
            kvkName: 'KVK B',
            noOfFarmersRegisteredOnKspPortal: 200,
            phoneCallAddressed: 20,
            phoneCallAnswered: 15,
        },
    ]);

    assert.match(html, /<td>Total<\/td>\s*<td style="text-align:center;">300<\/td>/);
    assert.match(html, /<td style="text-align:center;">30<\/td>/);
    assert.match(html, /<td style="text-align:center;">23<\/td>/);
});

test('BLA-71 KMAS report totals farmers covered and advisories sent', () => {
    const html = render(renderKmasSection, [
        { kvkName: 'KVK A', noOfFarmersCovered: 100, noOfAdvisoriesSent: 6 },
        { kvkName: 'KVK B', noOfFarmersCovered: 250, noOfAdvisoriesSent: 9 },
    ]);

    assert.match(html, /<td>Total<\/td>\s*<td style="text-align:center;">350<\/td>/);
    assert.match(html, /<td style="text-align:center;">15<\/td>/);
});

test('BLA-71 other-channel tables total the four channel rows for each KVK', () => {
    const html = render(renderMsgDetailsSection, [{
        kvkName: 'KVK A',
        textNoOfFarmersCovered: 10,
        textNoOfAdvisoriesSent: 1,
        whatsappNoOfFarmersCovered: 20,
        whatsappNoOfAdvisoriesSent: 2,
        weatherNoOfFarmersCovered: 30,
        weatherNoOfAdvisoriesSent: 3,
        socialNoOfFarmersCovered: 40,
        socialNoOfAdvisoriesSent: 4,
    }]);

    assert.match(html, /<td>Total<\/td>\s*<td>—<\/td>\s*<td style="text-align:center;">100<\/td>/);
    assert.match(html, /<td style="text-align:center;">10<\/td>/);
    assert.equal((html.match(/<td>Total<\/td>/g) || []).length, 1);
});

test('BLA-71 RAWE/FET report totals students and inclusive days stayed', () => {
    const html = render(renderRaweFetFitSection, [
        {
            kvk: { kvkName: 'KVK A' },
            attachmentType: { name: 'RAWE' },
            maleStudents: 2,
            femaleStudents: 3,
            startDate: '2026-01-01',
            endDate: '2026-01-03',
        },
        {
            kvk: { kvkName: 'KVK B' },
            attachmentType: { name: 'FET' },
            maleStudents: 4,
            femaleStudents: 1,
            startDate: '2026-02-01',
            endDate: '2026-02-01',
        },
    ]);

    assert.match(html, /<td>Total<\/td>\s*<td>—<\/td>\s*<td style="text-align:center;">10<\/td>/);
    assert.match(html, /<td style="text-align:center;">4<\/td>/);
});

test('BLA-71 does not add a misleading total row when a table has no data', () => {
    [
        renderMobileAppSection,
        renderWebPortalSection,
        renderKisanSarathiSection,
        renderKmasSection,
        renderMsgDetailsSection,
        renderRaweFetFitSection,
    ].forEach((renderer) => {
        assert.doesNotMatch(render(renderer, []), /<td>Total<\/td>/);
    });
});
