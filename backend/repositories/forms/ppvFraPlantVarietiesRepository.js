const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const { normalizeRequiredIndianMobile } = require('../../utils/validation.js');

const parseYearFromInput = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = parseInt(String(value).trim(), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const buildDateFromYear = (value) => {
    const year = parseYearFromInput(value, null);
    return year === null ? null : new Date(Date.UTC(year, 0, 1));
};

const resolveReportingYearInput = (rawValue, fallbackYear = null, fallbackDate = null) => {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return {
            year: fallbackYear,
            reportingYearDate: fallbackDate || buildDateFromYear(fallbackYear),
        };
    }

    if (rawValue instanceof Date || (typeof rawValue === 'string' && rawValue.trim().includes('-'))) {
        const parsedDate = parseReportingYearDate(rawValue);
        ensureNotFutureDate(parsedDate);
        return {
            year: parsedDate.getUTCFullYear(),
            reportingYearDate: parsedDate,
        };
    }

    const parsedYear = parseYearFromInput(rawValue, fallbackYear);
    return {
        year: parsedYear,
        reportingYearDate: buildDateFromYear(parsedYear) || fallbackDate,
    };
};

const mapPlantVarietyRecord = (record) => {
    if (!record) return null;

    const reportingYear = record.reportingYearDate
        ? formatReportingYear(record.reportingYearDate)
        : formatReportingYear(buildDateFromYear(record.reportingYear));

    return {
        ...record,
        reportingYear,
        year: record.reportingYear,
    };
};

const ppvFraPlantVarietiesRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        const yearInfo = resolveReportingYearInput(data.reportingYear ?? data.year, new Date().getUTCFullYear(), null);

        const mobile = normalizeRequiredIndianMobile(data.mobile, 'Mobile');

        const record = await prisma.ppvFraPlantVarieties.create({
            data: {
                kvkId,
                reportingYear: yearInfo.year ?? new Date().getUTCFullYear(),
                reportingYearDate: yearInfo.reportingYearDate,
                cropName: data.cropName || '',
                registrationNo: data.registrationNo || null,
                farmerName: data.farmerName || '',
                mobile,
                village: data.village || '',
                block: data.block || '',
                district: data.district || '',
                characteristics: data.characteristics || '',
                image: data.image || null,
            }
        });
        return mapPlantVarietyRecord(record);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }
        const records = await prisma.ppvFraPlantVarieties.findMany({
            where,
            include: {
                kvk: {
                    select: {
                        kvkName: true,
                        district: { select: { districtName: true } }
                    }
                }
            },
            orderBy: { ppvFraPlantVarietiesID: 'desc' }
        });
        return records.map(mapPlantVarietyRecord);
    },

    findById: async (id, user) => {
        const where = { ppvFraPlantVarietiesID: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const record = await prisma.ppvFraPlantVarieties.findFirst({
            where,
            include: {
                kvk: {
                    select: {
                        kvkName: true,
                        district: { select: { districtName: true } }
                    }
                }
            }
        });
        return mapPlantVarietyRecord(record);
    },

    update: async (id, data, user) => {
        const where = { ppvFraPlantVarietiesID: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.ppvFraPlantVarieties.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const yearInfo = (data.reportingYear !== undefined || data.year !== undefined)
            ? resolveReportingYearInput(data.reportingYear ?? data.year, existing.reportingYear, existing.reportingYearDate || null)
            : { year: existing.reportingYear, reportingYearDate: existing.reportingYearDate || buildDateFromYear(existing.reportingYear) };

        let mobileValue = existing.mobile;
        if (data.mobile !== undefined) {
            mobileValue = normalizeRequiredIndianMobile(data.mobile, 'Mobile');
        }

        const record = await prisma.ppvFraPlantVarieties.update({
            where: { ppvFraPlantVarietiesID: parseInt(id) },
            data: {
                reportingYear: yearInfo.year ?? existing.reportingYear,
                reportingYearDate: yearInfo.reportingYearDate || null,
                cropName: data.cropName !== undefined ? data.cropName : existing.cropName,
                registrationNo: data.registrationNo !== undefined ? data.registrationNo : existing.registrationNo,
                farmerName: data.farmerName !== undefined ? data.farmerName : existing.farmerName,
                mobile: mobileValue,
                village: data.village !== undefined ? data.village : existing.village,
                block: data.block !== undefined ? data.block : existing.block,
                district: data.district !== undefined ? data.district : existing.district,
                characteristics: data.characteristics !== undefined ? data.characteristics : existing.characteristics,
                image: data.image !== undefined ? data.image : existing.image,
            }
        });
        return mapPlantVarietyRecord(record);
    },

    delete: async (id, user) => {
        const where = { ppvFraPlantVarietiesID: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.ppvFraPlantVarieties.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.ppvFraPlantVarieties.delete({ where: { ppvFraPlantVarietiesID: parseInt(id) } });
    }
};

module.exports = ppvFraPlantVarietiesRepository;
