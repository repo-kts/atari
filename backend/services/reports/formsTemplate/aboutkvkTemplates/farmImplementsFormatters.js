function formatCostValue(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return value.toFixed(2);
    }

    return String(value);
}

function formatStatusValue(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    if (typeof value !== 'string') {
        return String(value);
    }

    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

module.exports = {
    formatCostValue,
    formatStatusValue,
};
