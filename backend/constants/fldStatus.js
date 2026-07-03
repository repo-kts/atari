const FLD_STATUS = Object.freeze({
    ONGOING: 'ONGOING',
    COMPLETED: 'COMPLETED',
    TRANSFERRED_TO_NEXT_YEAR: 'TRANSFERRED_TO_NEXT_YEAR',
});

const NORMALIZED_STATUS_ALIASES = Object.freeze({
    ongoing: FLD_STATUS.ONGOING,
    ongoing_completed: FLD_STATUS.ONGOING,
    completed: FLD_STATUS.COMPLETED,
    transferred: FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR,
    transfered: FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR,
    transferred_to_next_year: FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR,
});

const ALLOWED_TRANSITIONS = Object.freeze({
    [FLD_STATUS.ONGOING]: new Set([FLD_STATUS.COMPLETED, FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR]),
    [FLD_STATUS.COMPLETED]: new Set(),
    [FLD_STATUS.TRANSFERRED_TO_NEXT_YEAR]: new Set(),
});

function normalizeFldStatus(rawStatus) {
    if (!rawStatus) return FLD_STATUS.ONGOING;
    const normalizedKey = String(rawStatus).trim().toLowerCase().replace(/\s+/g, '_');
    return NORMALIZED_STATUS_ALIASES[normalizedKey] || FLD_STATUS.ONGOING;
}

function canTransition(fromStatus, toStatus) {
    const source = normalizeFldStatus(fromStatus);
    const target = normalizeFldStatus(toStatus);
    return ALLOWED_TRANSITIONS[source]?.has(target) || false;
}

module.exports = {
    FLD_STATUS,
    normalizeFldStatus,
    canTransition,
};
