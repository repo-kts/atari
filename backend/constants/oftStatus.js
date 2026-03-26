const OFT_STATUS = Object.freeze({
    ONGOING: 'ONGOING',
    COMPLETED: 'COMPLETED',
    TRANSFERRED_TO_NEXT_YEAR: 'TRANSFERRED_TO_NEXT_YEAR',
});

const NORMALIZED_STATUS_ALIASES = Object.freeze({
    ongoing: OFT_STATUS.ONGOING,
    ongoing_completed: OFT_STATUS.ONGOING,
    completed: OFT_STATUS.COMPLETED,
    transferred_to_next_year: OFT_STATUS.TRANSFERRED_TO_NEXT_YEAR,
});

const ALLOWED_TRANSITIONS = Object.freeze({
    [OFT_STATUS.ONGOING]: new Set([OFT_STATUS.COMPLETED, OFT_STATUS.TRANSFERRED_TO_NEXT_YEAR]),
    [OFT_STATUS.COMPLETED]: new Set(),
    [OFT_STATUS.TRANSFERRED_TO_NEXT_YEAR]: new Set(),
});

function normalizeOftStatus(rawStatus) {
    if (!rawStatus) return OFT_STATUS.ONGOING;
    const normalizedKey = String(rawStatus).trim().toLowerCase().replace(/\s+/g, '_');
    return NORMALIZED_STATUS_ALIASES[normalizedKey] || OFT_STATUS.ONGOING;
}

function canTransition(fromStatus, toStatus) {
    const source = normalizeOftStatus(fromStatus);
    const target = normalizeOftStatus(toStatus);
    return ALLOWED_TRANSITIONS[source]?.has(target) || false;
}

module.exports = {
    OFT_STATUS,
    normalizeOftStatus,
    canTransition,
};
