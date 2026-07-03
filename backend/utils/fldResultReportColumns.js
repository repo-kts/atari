const { FLD_RESULT_TEMPLATES, getFldResultTemplate } = require('../constants/fldResultTemplate.js');

const BASE_DETAIL_COLUMNS = [
    { key: 'yieldDemo', label: 'Demo', group: 'Yield (q/ha)', decimals: 2 },
    { key: 'yieldCheck', label: 'Check', group: 'Yield (q/ha)', decimals: 2 },
    { key: 'increasePercent', label: '% Increase', group: 'Yield (q/ha)', decimals: 2 },
];

const DEMO_ECONOMICS_COLUMNS = [
    { key: 'demoGrossCost', label: 'Gross Cost', group: 'Economics of demonstration (Rs./ha)', decimals: 1 },
    { key: 'demoGrossReturn', label: 'Gross Return', group: 'Economics of demonstration (Rs./ha)', decimals: 1 },
    { key: 'demoNetReturn', label: 'Net Return', group: 'Economics of demonstration (Rs./ha)', decimals: 1 },
    { key: 'demoBcr', label: 'BCR', group: 'Economics of demonstration (Rs./ha)', decimals: 2 },
];

const CHECK_ECONOMICS_COLUMNS = [
    { key: 'checkGrossCost', label: 'Gross Cost', group: 'Economics of check (Rs./ha)', decimals: 1 },
    { key: 'checkGrossReturn', label: 'Gross Return', group: 'Economics of check (Rs./ha)', decimals: 1 },
    { key: 'checkNetReturn', label: 'Net Return', group: 'Economics of check (Rs./ha)', decimals: 1 },
    { key: 'checkBcr', label: 'BCR', group: 'Economics of check (Rs./ha)', decimals: 2 },
];

const OTHER_PARAMETER_COLUMNS = [
    { key: 'otherParameterDemo', label: 'Demonstration', group: 'Other Parameters', decimals: 2 },
    { key: 'otherParameterCheck', label: 'Check', group: 'Other Parameters', decimals: 2 },
];

const MECHANIZATION_COLUMNS = [
    { key: 'laborReductionManDays', label: 'Labor reduction (man days)', group: 'Other Parameters', decimals: 2 },
    { key: 'costReduction', label: 'Cost reduction (Rs./ha or Rs./)', group: 'Other Parameters', decimals: 2 },
];

function getFldResultReportTemplate(source = {}) {
    return source.resultTemplate || getFldResultTemplate(source);
}

function getFldResultReportColumns(source = {}) {
    const template = getFldResultReportTemplate(source);
    if (template === FLD_RESULT_TEMPLATES.MECHANIZATION) {
        return [...BASE_DETAIL_COLUMNS, ...MECHANIZATION_COLUMNS];
    }
    if (template === FLD_RESULT_TEMPLATES.DEMO_ECONOMICS) {
        return [...BASE_DETAIL_COLUMNS, ...DEMO_ECONOMICS_COLUMNS];
    }
    if (template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS) {
        return [
            ...BASE_DETAIL_COLUMNS,
            ...OTHER_PARAMETER_COLUMNS,
            ...DEMO_ECONOMICS_COLUMNS,
            ...CHECK_ECONOMICS_COLUMNS,
        ];
    }
    return [...BASE_DETAIL_COLUMNS, ...DEMO_ECONOMICS_COLUMNS, ...CHECK_ECONOMICS_COLUMNS];
}

function groupColumns(columns) {
    const groups = [];
    for (const column of columns) {
        const last = groups[groups.length - 1];
        if (last && last.label === column.group) {
            last.columns.push(column);
        } else {
            groups.push({ label: column.group, columns: [column] });
        }
    }
    return groups;
}

module.exports = {
    getFldResultReportTemplate,
    getFldResultReportColumns,
    groupColumns,
};
