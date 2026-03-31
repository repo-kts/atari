/**
 * Response Mapper Utilities
 * Provides reusable functions for mapping database responses to frontend-friendly formats
 * Removes redundant fields and table labels to optimize response size
 */
const { formatReportingYearLabel } = require('./reportingYearUtils.js');

/**
 * Extract participant counts from database record with fallback support
 * Handles both camelCase and snake_case field names from Prisma
 * @param {Object} record - Database record
 * @param {string} prefix - Prefix for field names (e.g., 'farmers', 'officials')
 * @returns {Object} Normalized participant counts
 */
function extractParticipantCounts(record, prefix = 'farmers') {
    if (!record) return {};
    
    const baseFields = ['GeneralM', 'GeneralF', 'ObcM', 'ObcF', 'ScM', 'ScF', 'StM', 'StF'];
    const snakeFields = ['general_m', 'general_f', 'obc_m', 'obc_f', 'sc_m', 'sc_f', 'st_m', 'st_f'];
    
    const result = {};
    baseFields.forEach((field, index) => {
        const camelKey = `${prefix}${field}`;
        const snakeKey = `${prefix}_${snakeFields[index]}`;
        const frontendKey = snakeFields[index].replace(`${prefix}_`, '');
        
        // Try camelCase first, then snake_case, default to 0
        result[frontendKey] = record[camelKey] ?? record[snakeKey] ?? 0;
    });
    
    return result;
}

/**
 * Map common relation fields (kvk, crop, season, etc.) to frontend format
 * Returns only essential fields, avoiding redundant table labels
 * @param {Object} record - Database record with relations
 * @param {Object} options - Mapping options
 * @returns {Object} Mapped relation fields
 */
function mapCommonRelations(record, options = {}) {
    if (!record) return {};
    
    const {
        includeKvk = true,
        includeCrop = false,
        includeSeason = false,
        includeYear = false,
        includeStaff = false,
        includeEnterprise = false,
        includeThematicArea = false,
        includeCategory = false,
        includeSubCategory = false,
    } = options;
    
    const mapped = {};
    
    if (includeKvk && record.kvk) {
        mapped.kvkId = record.kvkId;
        mapped.kvkName = record.kvk.kvkName;
    }
    
    if (includeCrop && record.crop) {
        mapped.cropId = record.cropId;
        mapped.cropName = record.crop.cropName;
        mapped.crop = record.crop.cropName; // Alias for backward compatibility
    }
    
    if (includeSeason && record.season) {
        mapped.seasonId = record.seasonId;
        mapped.seasonName = record.season.seasonName;
        mapped.season = record.season.seasonName; // Alias for backward compatibility
    }
    
    if (includeYear) {
        const reportingYearId =
            record.reportingYearId ??
            record.yearId ??
            record.reportingYear?.yearId ??
            null;

        if (reportingYearId !== null && reportingYearId !== undefined) {
            mapped.reportingYearId = reportingYearId;
            mapped.yearId = reportingYearId; // Alias
        }

        const rawReportingYearValue =
            record.reportingYear && typeof record.reportingYear === 'object' && !(record.reportingYear instanceof Date)
                ? record.reportingYear.yearName
                : record.reportingYear;

        const formattedReportingYear = formatReportingYearLabel(rawReportingYearValue);
        if (formattedReportingYear) {
            mapped.reportingYear = formattedReportingYear;
        }
    }
    
    if (includeStaff && record.kvkStaff) {
        mapped.staffId = record.kvkStaffId || record.staffId;
        mapped.staffName = record.kvkStaff.staffName;
    }
    
    if (includeEnterprise && record.enterprise) {
        mapped.enterpriseId = record.enterpriseId;
        mapped.enterpriseName = record.enterprise.enterpriseName;
    }
    
    if (includeThematicArea && record.thematicArea) {
        mapped.thematicAreaId = record.thematicAreaId;
        mapped.thematicAreaName = record.thematicArea.thematicAreaName;
    }
    
    if (includeCategory && record.category) {
        mapped.categoryId = record.categoryId;
        mapped.categoryName = record.category.categoryName;
    }
    
    if (includeSubCategory && record.subCategory) {
        mapped.subCategoryId = record.subCategoryId;
        mapped.subCategoryName = record.subCategory.subCategoryName;
    }
    
    return mapped;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date|string|null|undefined} date - Date to format
 * @returns {string} Formatted date or empty string
 */
function formatDate(date) {
    if (!date) return '';
    try {
        const d = date instanceof Date ? date : new Date(date);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    } catch {
        return '';
    }
}

/**
 * Calculate reporting year from event date
 * @param {Date|string} eventDate - Event date
 * @returns {string} Reporting year string
 */
function calculateReportingYear(eventDate) {
    if (!eventDate) return '';
    try {
        const date = eventDate instanceof Date ? eventDate : new Date(eventDate);
        if (isNaN(date.getTime())) return '';
        const month = date.getMonth() + 1;
        const startYear = month >= 4 ? date.getFullYear() : date.getFullYear() - 1;
        return String(startYear);
    } catch {
        return '';
    }
}

/**
 * Create a base response mapper with common fields
 * @param {Object} config - Configuration object
 * @param {string} config.idField - Field name for ID (e.g., 'celebrationId')
 * @param {Function} config.customMapper - Custom mapping function
 * @returns {Function} Response mapper function
 */
function createBaseMapper(config) {
    return (record) => {
        if (!record) return null;
        
        const base = {
            id: record[config.idField],
            [config.idField]: record[config.idField],
        };
        
        // Apply custom mapper if provided
        if (config.customMapper) {
            return { ...base, ...config.customMapper(record) };
        }
        
        return base;
    };
}

module.exports = {
    extractParticipantCounts,
    mapCommonRelations,
    formatDate,
    calculateReportingYear,
    createBaseMapper,
};
