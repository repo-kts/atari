const { ValidationError } = require('./errorHandler.js');

function validateFileSize(file, maxBytes, label = 'File') {
    if (!file || file.size === undefined || file.size === null) return;
    if (Number(file.size) > maxBytes) {
        throw new ValidationError(`${label} exceeds max size ${maxBytes} bytes`);
    }
}

function validateAllowedMime(file, allowed = [], label = 'File') {
    if (!file || !file.mimeType) return;
    if (!allowed.includes(file.mimeType)) {
        throw new ValidationError(`${label} has unsupported mime type`);
    }
}

// Images must fall within 200KB–2MB. Skips when size is unknown/absent.
const IMAGE_MIN_BYTES = 200 * 1024;
const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
function validateImageSize(file, label = 'Image') {
    if (!file || file.size === undefined || file.size === null) return;
    const size = Number(file.size);
    if (!Number.isFinite(size)) return;
    if (size < IMAGE_MIN_BYTES) {
        throw new ValidationError(`${label} must be at least 200KB`);
    }
    if (size > IMAGE_MAX_BYTES) {
        throw new ValidationError(`${label} must not exceed 2MB`);
    }
}

module.exports = {
    validateFileSize,
    validateAllowedMime,
    validateImageSize,
    IMAGE_MIN_BYTES,
    IMAGE_MAX_BYTES,
};
