const prisma = require('../../config/prisma.js');
const { buildFormListOrderBy, sortFormListRows } = require('../../utils/formListOrderBy.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');

const parseDateOrNow = (dateStr) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d) ? new Date() : d;
};

const ACTION_STATUSES = new Set(['YES', 'NO', 'IN_COMPLIANCE']);

const resolveSacActionStatus = (data, fallback = 'NO') => {
    // Backward compatibility for payloads produced while In Compliance was a
    // separate dropdown. New clients send IN_COMPLIANCE as actionTaken.
    if (data && data.inCompliance === 'YES') return 'IN_COMPLIANCE';
    if (data && ACTION_STATUSES.has(data.actionTaken)) return data.actionTaken;
    return fallback;
};

const mapSacMeeting = (item) => {
    const actionTaken = item.inCompliance === 'YES'
        ? 'IN_COMPLIANCE'
        : item.actionTaken;
    return {
        ...item,
        actionTaken,
        noOfParticipantsPerf: item.numberOfParticipants,
        totalStatutoryMembersPresent: item.statutoryMembersPresent,
        file: item.uploadedFile
    };
};

const meetingsRepository = {
    sac: {
        create: async (data, user) => {
            const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
            if (!kvkId) throw new Error('KVK ID is required');

            return await prisma.sacMeeting.create({
                data: {
                    kvkId,
                    startDate: parseDateOrNow(data.startDate),
                    endDate: parseDateOrNow(data.endDate),
                    numberOfParticipants: parseInt(data.numberOfParticipants) || 0,
                    statutoryMembersPresent: parseInt(data.statutoryMembersPresent) || 0,
                    salientRecommendations: data.salientRecommendations || '',
                    actionTaken: resolveSacActionStatus(data),
                    reason: data.reason || '',
                    uploadedFile: Array.isArray(data.uploadedFile) ? data.uploadedFile[0] : (data.uploadedFile || ''),
                }
            });
        },
        findAll: async (filters = {}, user) => {
            const where = {};
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            } else if (filters.kvkId) {
                where.kvkId = parseInt(filters.kvkId);
            }
            const data = await prisma.sacMeeting.findMany({
                where,
                include: { kvk: { select: { kvkName: true } } },
                orderBy: buildFormListOrderBy(user, { kvkRelation: 'kvk', createdAt: true, tiebreak: 'sacMeetingId' })
            });

            return data.map(mapSacMeeting);
        },
        findById: async (id, user) => {
            const where = { sacMeetingId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const item = await prisma.sacMeeting.findFirst({
                where,
                include: { kvk: { select: { kvkName: true } } }
            });
            if (!item) return null;
            return mapSacMeeting(item);
        },
        update: async (id, data, user) => {
            const where = { sacMeetingId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.sacMeeting.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');

            const updateData = {};
            if (data.startDate !== undefined) updateData.startDate = parseDateOrNow(data.startDate);
            if (data.endDate !== undefined) updateData.endDate = parseDateOrNow(data.endDate);
            if (data.numberOfParticipants !== undefined) updateData.numberOfParticipants = parseInt(data.numberOfParticipants);
            if (data.statutoryMembersPresent !== undefined) updateData.statutoryMembersPresent = parseInt(data.statutoryMembersPresent);
            if (data.salientRecommendations !== undefined) updateData.salientRecommendations = data.salientRecommendations;
            if (data.actionTaken !== undefined || data.inCompliance === 'YES') {
                updateData.actionTaken = resolveSacActionStatus(data, existing.actionTaken);
                // Clear any legacy selection after it has been merged into Action Taken.
                updateData.inCompliance = null;
            }
            if (data.reason !== undefined) updateData.reason = data.reason;
            if (data.uploadedFile !== undefined) {
                updateData.uploadedFile = Array.isArray(data.uploadedFile) ? data.uploadedFile[0] : (data.uploadedFile || '');
            }

            return await prisma.sacMeeting.update({
                where: { sacMeetingId: parseInt(id) },
                data: updateData
            });
        },
        delete: async (id, user) => {
            const where = { sacMeetingId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.sacMeeting.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');
            return await prisma.sacMeeting.delete({ where: { sacMeetingId: parseInt(id) } });
        }
    },
    other: {
        create: async (data, user) => {
            const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
            if (!kvkId) throw new Error('KVK ID is required');

            return await prisma.atariMeeting.create({
                data: {
                    kvkId,
                    meetingDate: parseDateOrNow(data.meetingDate),
                    typeOfMeeting: data.typeOfMeeting || '',
                    agenda: data.agenda || '',
                    representativeFromAtari: data.representativeFromAtari || '',
                    reportingYear: (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })(),
                }
            });
        },
        findAll: async (filters = {}, user) => {
            const where = {};
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            } else if (filters.kvkId) {
                where.kvkId = parseInt(filters.kvkId);
            }
            const _sortRows = await prisma.atariMeeting.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                },
                orderBy: buildFormListOrderBy(user, { reportingYear: true, kvkRelation: 'kvk', createdAt: true, tiebreak: 'atariMeetingId' })
            });
            return sortFormListRows(_sortRows, user, { tiebreak: 'atariMeetingId' });
        },
        findById: async (id, user) => {
            const where = { atariMeetingId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            return await prisma.atariMeeting.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                }
            });
        },
        update: async (id, data, user) => {
            const where = { atariMeetingId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.atariMeeting.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');

            const updateData = {};
            if (data.meetingDate !== undefined) updateData.meetingDate = parseDateOrNow(data.meetingDate);
            if (data.typeOfMeeting !== undefined) updateData.typeOfMeeting = data.typeOfMeeting;
            if (data.agenda !== undefined) updateData.agenda = data.agenda;
            if (data.representativeFromAtari !== undefined) updateData.representativeFromAtari = data.representativeFromAtari;
            if (data.reportingYear !== undefined) {
                const d = parseReportingYearDate(data.reportingYear);
                ensureNotFutureDate(d);
                updateData.reportingYear = d;
            }

            return await prisma.atariMeeting.update({
                where: { atariMeetingId: parseInt(id) },
                data: updateData
            });
        },
        delete: async (id, user) => {
            const where = { atariMeetingId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.atariMeeting.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');
            return await prisma.atariMeeting.delete({ where: { atariMeetingId: parseInt(id) } });
        }
    }
};

module.exports = meetingsRepository;
