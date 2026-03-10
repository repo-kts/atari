const prisma = require('../../config/prisma.js');

const parseDateOrNow = (dateStr) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d) ? new Date() : d;
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
                    actionTaken: data.actionTaken === 'YES' ? 'YES' : 'NO',
                    reason: data.reason || '',
                    uploadedFile: data.uploadedFile || '',
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
            return await prisma.sacMeeting.findMany({
                where,
                include: { kvk: { select: { kvkName: true } } },
                orderBy: { sacMeetingId: 'desc' }
            });
        },
        findById: async (id, user) => {
            const where = { sacMeetingId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            return await prisma.sacMeeting.findFirst({
                where,
                include: { kvk: { select: { kvkName: true } } }
            });
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
            if (data.actionTaken !== undefined) updateData.actionTaken = data.actionTaken === 'YES' ? 'YES' : 'NO';
            if (data.reason !== undefined) updateData.reason = data.reason;
            if (data.uploadedFile !== undefined) updateData.uploadedFile = data.uploadedFile;

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
                    reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
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
            return await prisma.atariMeeting.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                    reportingYear: true
                },
                orderBy: { atariMeetingId: 'desc' }
            });
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
                    reportingYear: true
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
            if (data.reportingYearId !== undefined) updateData.reportingYearId = data.reportingYearId ? parseInt(data.reportingYearId) : null;

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
