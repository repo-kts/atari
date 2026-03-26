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

module.exports = {
    validateFileSize,
    validateAllowedMime,
};
