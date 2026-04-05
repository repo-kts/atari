const ACTIVITY_ROWS = [
    {
        activityType: 'TRAINING',
        group: null,
        itemLabel: 'Training (Capacity building /skill development etc)',
        unitFallback: 'Days',
        valueKeys: ['training_count'],
        specKeys: [],
        prefix: 'training_count_',
    },
    {
        activityType: 'FRONTLINE_DEMONSTRATION',
        group: 'Frontline demonstrations (FLDs) and other demonstrations',
        itemLabel: 'Area under FLDs',
        unitFallback: 'Hectare',
        valueKeys: ['fld_count'],
        specKeys: [],
        prefix: 'fld_count_',
    },
    {
        activityType: 'AWARENESS_CAMP',
        group: null,
        itemLabel: 'Awareness camps, exposure visit etc',
        unitFallback: 'N/A',
        valueKeys: ['awareness_count'],
        specKeys: ['awareness_count'],
        prefix: 'awareness_count_',
    },
    {
        activityType: 'INPUT_SEEDS',
        group: 'Input Distribution',
        itemLabel: 'Seeds (Field Crops)',
        unitFallback: 'Kg',
        valueKeys: ['seeds_qty'],
        specKeys: [],
        prefix: 'seeds_qty_',
    },
    {
        activityType: 'INPUT_SMALL_EQUIPMENT',
        group: null,
        itemLabel: 'Small equipments (Upto Rs.2000)',
        unitFallback: 'Number',
        valueKeys: ['small_equip_qty'],
        specKeys: [],
        prefix: 'small_equip_qty_',
    },
    {
        activityType: 'INPUT_LARGE_EQUIPMENT',
        group: null,
        itemLabel: 'Large equipments (more than Rs.2000)',
        unitFallback: 'Number',
        valueKeys: ['large_equip_qty'],
        specKeys: [],
        prefix: 'large_equip_qty_',
    },
    {
        activityType: 'INPUT_FERTILIZER',
        group: null,
        itemLabel: 'Fertilizers (NPK)/ Secondary/ Micro Fertilizers',
        unitFallback: 'Kg',
        valueKeys: ['fertilizer_qty'],
        specKeys: [],
        prefix: 'fertilizer_qty_',
    },
    {
        activityType: 'INPUT_PPC',
        group: null,
        itemLabel: 'Plant Protection chemicals',
        unitFallback: 'Lit.',
        valueKeys: ['pp_chemicals_qty'],
        specKeys: [],
        prefix: 'pp_chemicals_qty_',
    },
    {
        activityType: 'LITERATURE_DISTRIBUTION',
        group: null,
        itemLabel: 'Distribution of Literature',
        unitFallback: 'N/A',
        valueKeys: ['lecture_count'],
        specKeys: [],
        prefix: 'lecture_count_',
    },
    {
        activityType: 'KISAN_MELA',
        group: null,
        itemLabel: 'Kisan Mela',
        unitFallback: 'N/A',
        valueKeys: ['kisan_mela_count'],
        specKeys: [],
        prefix: 'kisan_mela_count_',
    },
    {
        activityType: 'OTHER',
        group: null,
        itemLabel: 'Any other (specify)',
        unitFallback: 'N/A',
        valueKeys: ['any_other_count'],
        specKeys: ['any_other_count'],
        prefix: 'any_other_count_',
    },
];

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function formatValue(value) {
    if (value === null || value === undefined || value === '') {
        return '0';
    }
    if (typeof value === 'number') {
        return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '');
    }
    return String(value);
}

function pickValue(record, keys = []) {
    for (const key of keys) {
        const value = record?.[key];
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }
    return null;
}

function buildRowWithFallback(config, record, activitiesMap = {}) {
    const preNormalized = activitiesMap[config.activityType] || null;
    const unit = preNormalized?.unit || pickValue(record, [`${config.valueKeys[0]}_unit`]) || config.unitFallback;
    const quantityOrSpecification = preNormalized?.quantityOrSpecification
        ?? preNormalized?.specification
        ?? preNormalized?.quantity
        ?? pickValue(record, [...config.specKeys, ...config.valueKeys])
        ?? 0;

    const generalM = preNormalized?.generalM ?? toNumber(record?.[`${config.prefix}general_m`]);
    const generalF = preNormalized?.generalF ?? toNumber(record?.[`${config.prefix}general_f`]);
    const obcM = preNormalized?.obcM ?? toNumber(record?.[`${config.prefix}obc_m`]);
    const obcF = preNormalized?.obcF ?? toNumber(record?.[`${config.prefix}obc_f`]);
    const scM = preNormalized?.scM ?? toNumber(record?.[`${config.prefix}sc_m`]);
    const scF = preNormalized?.scF ?? toNumber(record?.[`${config.prefix}sc_f`]);
    const stM = preNormalized?.stM ?? toNumber(record?.[`${config.prefix}st_m`]);
    const stF = preNormalized?.stF ?? toNumber(record?.[`${config.prefix}st_f`]);

    const generalT = generalM + generalF;
    const obcT = obcM + obcF;
    const scT = scM + scF;
    const stT = stM + stF;
    const grandTotalM = generalM + obcM + scM + stM;
    const grandTotalF = generalF + obcF + scF + stF;
    const grandTotalT = grandTotalM + grandTotalF;

    return {
        group: config.group,
        itemLabel: config.itemLabel,
        unit,
        quantityOrSpecification,
        generalM,
        generalF,
        generalT,
        obcM,
        obcF,
        obcT,
        scM,
        scF,
        scT,
        stM,
        stF,
        stT,
        grandTotalM,
        grandTotalF,
        grandTotalT,
    };
}

function buildRows(record) {
    const activitiesArray = Array.isArray(record?.activities) ? record.activities : [];
    const activitiesMap = activitiesArray.reduce((acc, item) => {
        if (item?.activityType) {
            acc[item.activityType] = item;
        }
        return acc;
    }, {});

    return ACTIVITY_ROWS.map(config => buildRowWithFallback(config, record, activitiesMap));
}

function renderDrmrActivitySection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const tableHtml = records.map((record, index) => {
        const rows = buildRows(record);
        const kvkName = this._escapeHtml(record.kvkName || '-');
        const year = record.reportingYear ? this._escapeHtml(this._formatFieldValue(record.reportingYear, { type: 'date' })) : '-';
        const groupTitle = `${kvkName} | Reporting Year: ${year}`;

        let previousGroup = null;
        const bodyRows = rows.map((row) => {
            const showGroup = row.group && row.group !== previousGroup;
            previousGroup = row.group || previousGroup;

            const groupRow = showGroup
                ? `<tr class="drmr-activity-group-row"><td colspan="18">${this._escapeHtml(row.group)}</td></tr>`
                : '';

            return `${groupRow}
            <tr>
                <td>${this._escapeHtml(row.itemLabel)}</td>
                <td class="center">${this._escapeHtml(row.unit || '-')}</td>
                <td class="center">${this._escapeHtml(formatValue(row.quantityOrSpecification))}</td>
                <td class="center">${formatValue(row.generalM)}</td>
                <td class="center">${formatValue(row.generalF)}</td>
                <td class="center">${formatValue(row.generalT)}</td>
                <td class="center">${formatValue(row.obcM)}</td>
                <td class="center">${formatValue(row.obcF)}</td>
                <td class="center">${formatValue(row.obcT)}</td>
                <td class="center">${formatValue(row.scM)}</td>
                <td class="center">${formatValue(row.scF)}</td>
                <td class="center">${formatValue(row.scT)}</td>
                <td class="center">${formatValue(row.stM)}</td>
                <td class="center">${formatValue(row.stF)}</td>
                <td class="center">${formatValue(row.stT)}</td>
                <td class="center">${formatValue(row.grandTotalM)}</td>
                <td class="center">${formatValue(row.grandTotalF)}</td>
                <td class="center">${formatValue(row.grandTotalT)}</td>
            </tr>`;
        }).join('');

        return `
        <div class="drmr-activity-block ${index > 0 ? 'drmr-activity-block-next' : ''}">
            <div class="drmr-activity-heading">
                Details Augmenting Rapeseed- Mustard Production of Tribal Farmers of Following states for Sustainable Livelihood Security under Scheduled Tribe Component
            </div>
            <div class="drmr-activity-meta">${groupTitle}</div>
            <table class="data-table drmr-activity-table">
                <thead>
                    <tr>
                        <th rowspan="3" class="activity-col">Item/Activity</th>
                        <th rowspan="3" class="unit-col">Unit</th>
                        <th rowspan="3" class="qty-col">Quantity</th>
                        <th colspan="12">No. of Participants</th>
                        <th colspan="3">Grand Total</th>
                    </tr>
                    <tr>
                        <th colspan="3">General</th>
                        <th colspan="3">OBC</th>
                        <th colspan="3">SC</th>
                        <th colspan="3">ST</th>
                        <th rowspan="2">M</th>
                        <th rowspan="2">F</th>
                        <th rowspan="2">T</th>
                    </tr>
                    <tr>
                        <th>M</th><th>F</th><th>T</th>
                        <th>M</th><th>F</th><th>T</th>
                        <th>M</th><th>F</th><th>T</th>
                        <th>M</th><th>F</th><th>T</th>
                    </tr>
                </thead>
                <tbody>
                    ${bodyRows}
                </tbody>
            </table>
        </div>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <style>
        .drmr-activity-block-next {
            margin-top: 10px;
        }
        .drmr-activity-heading {
            font-size: 8.5pt;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .drmr-activity-meta {
            font-size: 7.6pt;
            margin-bottom: 6px;
        }
        .drmr-activity-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-top: 0;
        }
        .drmr-activity-table th,
        .drmr-activity-table td {
            font-size: 6.6pt !important;
            line-height: 1.12;
            padding: 2px 2px !important;
            word-break: break-word;
            vertical-align: middle;
        }
        .drmr-activity-table thead th {
            text-align: center;
        }
        .drmr-activity-table .center {
            text-align: center;
        }
        .drmr-activity-group-row td {
            font-weight: 700;
            text-align: left !important;
            background: #fff;
        }
        .drmr-activity-table .activity-col {
            width: 31%;
        }
        .drmr-activity-table .unit-col {
            width: 4.5%;
        }
        .drmr-activity-table .qty-col {
            width: 6%;
        }
    </style>
    ${tableHtml}
</div>
`;
}

module.exports = {
    renderDrmrActivitySection,
};
