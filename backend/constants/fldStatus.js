const FLD_STATUS = Object.freeze({
    ONGOING: 'ONGOING',
    COMPLETED: 'COMPLETED',
    TRANSFERRED_TO_NEXT_YEAR: 'TRANSFERRED_TO_NEXT_YEAR',
});

const NORMALIZED_STATUS_ALIASES = Object.freeze({
    ongoing: FLD_STATUS.ONGOING,
    ongoing_completed: FLD_STATUS.ONGOING,
    completed: FLD_STATUS.COMPLETED,
    transferred_to_next_year: FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR,
});

function normalizeFldStatus(rawStatus) {
    if (!rawStatus) return FLD_STATUS.ONGOING;
    const normalizedKey = String(rawStatus).trim().toLowerCase().replace(/\s+/g, '_');
    return NORMALIZED_STATUS_ALIASES[normalizedKey] || FLD_STATUS.ONGOING;
}

module.exports = {
    FLD_STATUS,
    normalizeFldStatus,
};
