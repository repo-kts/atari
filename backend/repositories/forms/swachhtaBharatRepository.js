const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');

const parseDateOrNow = (dateStr) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d) ? new Date() : d;
};

const swachhtaBharatRepository = {
    hiSewa: {
        create: async (data, user) => {
            const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
            if (!kvkId) throw new Error('KVK ID is required');

            return await prisma.swachhtaHiSewa.create({
                data: {
                    kvkId,
                    observationDate: parseDateOrNow(data.dateDurationOfObservation ?? data.observationDate),
                    totalActivities: parseInt(data.totalNoOfActivitiesUndertaken ?? data.totalActivities) || 0,
                    staffCount: parseInt(data.participantsStaff ?? data.noOfStaffs ?? data.staffCount) || 0,
                    farmerCount: parseInt(data.participantsFarmers ?? data.noOfFarmers ?? data.farmerCount) || 0,
                    othersCount: parseInt(data.participantsOthers ?? data.noOfOthers ?? data.othersCount) || 0,
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
            const data = await prisma.swachhtaHiSewa.findMany({
                where,
                include: { kvk: { select: { kvkName: true } } },
                orderBy: { swachhtaHiSewaId: 'desc' }
            });

            return data.map(item => ({
                ...item,
                noOfTotal: (item.staffCount || 0) + (item.farmerCount || 0) + (item.othersCount || 0),
                totalNoOfActivitiesUndertaken: item.totalActivities,
                noOfStaffs: item.staffCount,
                noOfFarmers: item.farmerCount,
                noOfOthers: item.othersCount,
                dateDurationOfObservation: item.observationDate
            }));
        },
        findById: async (id, user) => {
            const where = { swachhtaHiSewaId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const item = await prisma.swachhtaHiSewa.findFirst({
                where,
                include: { kvk: { select: { kvkName: true } } }
            });
            if (!item) return null;
            return {
                ...item,
                noOfTotal: (item.staffCount || 0) + (item.farmerCount || 0) + (item.othersCount || 0),
                totalNoOfActivitiesUndertaken: item.totalActivities,
                noOfStaffs: item.staffCount,
                noOfFarmers: item.farmerCount,
                noOfOthers: item.othersCount,
                dateDurationOfObservation: item.observationDate
            };
        },
        update: async (id, data, user) => {
            const where = { swachhtaHiSewaId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.swachhtaHiSewa.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');

            const updateData = {};
            
            const observationDate = data.dateDurationOfObservation ?? data.observationDate;
            if (observationDate !== undefined) updateData.observationDate = parseDateOrNow(observationDate);
            
            const totalActivities = data.totalNoOfActivitiesUndertaken ?? data.totalActivities;
            if (totalActivities !== undefined) updateData.totalActivities = parseInt(totalActivities) || 0;
            
            const staffCount = data.participantsStaff ?? data.noOfStaffs ?? data.staffCount;
            if (staffCount !== undefined) updateData.staffCount = parseInt(staffCount) || 0;
            
            const farmerCount = data.participantsFarmers ?? data.noOfFarmers ?? data.farmerCount;
            if (farmerCount !== undefined) updateData.farmerCount = parseInt(farmerCount) || 0;
            
            const othersCount = data.participantsOthers ?? data.noOfOthers ?? data.othersCount;
            if (othersCount !== undefined) updateData.othersCount = parseInt(othersCount) || 0;

            return await prisma.swachhtaHiSewa.update({
                where: { swachhtaHiSewaId: parseInt(id) },
                data: updateData
            });
        },
        delete: async (id, user) => {
            const where = { swachhtaHiSewaId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.swachhtaHiSewa.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');
            return await prisma.swachhtaHiSewa.delete({ where: { swachhtaHiSewaId: parseInt(id) } });
        }
    },
    pakhwada: {
        create: async (data, user) => {
            const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
            if (!kvkId) throw new Error('KVK ID is required');

            return await prisma.swachhtaPakhwada.create({
                data: {
                    kvkId,
                    observationDate: parseDateOrNow(data.dateDurationOfObservation ?? data.observationDate),
                    totalActivities: parseInt(data.totalNoOfActivitiesUndertaken ?? data.totalActivities) || 0,
                    staffCount: parseInt(data.participantsStaff ?? data.noOfStaffs ?? data.staffCount) || 0,
                    farmerCount: parseInt(data.participantsFarmers ?? data.noOfFarmers ?? data.farmerCount) || 0,
                    othersCount: parseInt(data.participantsOthers ?? data.noOfOthers ?? data.othersCount) || 0,
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
            const data = await prisma.swachhtaPakhwada.findMany({
                where,
                include: { kvk: { select: { kvkName: true } } },
                orderBy: { swachhtaPakhwadaId: 'desc' }
            });

            return data.map(item => ({
                ...item,
                noOfTotal: (item.staffCount || 0) + (item.farmerCount || 0) + (item.othersCount || 0),
                totalNoOfActivitiesUndertaken: item.totalActivities,
                noOfStaffs: item.staffCount,
                noOfFarmers: item.farmerCount,
                noOfOthers: item.othersCount,
                dateDurationOfObservation: item.observationDate
            }));
        },
        findById: async (id, user) => {
            const where = { swachhtaPakhwadaId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const item = await prisma.swachhtaPakhwada.findFirst({
                where,
                include: { kvk: { select: { kvkName: true } } }
            });
            if (!item) return null;
            return {
                ...item,
                noOfTotal: (item.staffCount || 0) + (item.farmerCount || 0) + (item.othersCount || 0),
                totalNoOfActivitiesUndertaken: item.totalActivities,
                noOfStaffs: item.staffCount,
                noOfFarmers: item.farmerCount,
                noOfOthers: item.othersCount,
                dateDurationOfObservation: item.observationDate
            };
        },
        update: async (id, data, user) => {
            const where = { swachhtaPakhwadaId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.swachhtaPakhwada.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');

            const updateData = {};
            
            const observationDate = data.dateDurationOfObservation ?? data.observationDate;
            if (observationDate !== undefined) updateData.observationDate = parseDateOrNow(observationDate);
            
            const totalActivities = data.totalNoOfActivitiesUndertaken ?? data.totalActivities;
            if (totalActivities !== undefined) updateData.totalActivities = parseInt(totalActivities) || 0;
            
            const staffCount = data.participantsStaff ?? data.noOfStaffs ?? data.staffCount;
            if (staffCount !== undefined) updateData.staffCount = parseInt(staffCount) || 0;
            
            const farmerCount = data.participantsFarmers ?? data.noOfFarmers ?? data.farmerCount;
            if (farmerCount !== undefined) updateData.farmerCount = parseInt(farmerCount) || 0;
            
            const othersCount = data.participantsOthers ?? data.noOfOthers ?? data.othersCount;
            if (othersCount !== undefined) updateData.othersCount = parseInt(othersCount) || 0;

            return await prisma.swachhtaPakhwada.update({
                where: { swachhtaPakhwadaId: parseInt(id) },
                data: updateData
            });
        },
        delete: async (id, user) => {
            const where = { swachhtaPakhwadaId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.swachhtaPakhwada.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');
            return await prisma.swachhtaPakhwada.delete({ where: { swachhtaPakhwadaId: parseInt(id) } });
        }
    },
    budget: {
        create: async (data, user) => {
            const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
            if (!kvkId) throw new Error('KVK ID is required');

            return await prisma.swachhQuarterlyExpenditure.create({
                data: {
                    kvkId,
                    reportingYear: (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })(),
                    vermiVillageCovered: parseInt(data.vermicompostingVillages ?? data.vermiVillageCovered ?? data.vermicompostingNoOfVillageCovered) || 0,
                    vermiTotalExpenditure: parseFloat(data.vermicompostingExpenditure ?? data.vermiTotalExpenditure ?? data.vermicompostingTotalExpenditure) || 0,
                    otherVillageCovered: parseInt(data.otherVillages ?? data.otherVillageCovered ?? data.otherNoOfVillageCovered) || 0,
                    otherTotalExpenditure: parseFloat(data.otherExpenditure ?? data.otherTotalExpenditure) || 0,
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
            const data = await prisma.swachhQuarterlyExpenditure.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                },
                orderBy: { swachhQuarterlyExpenditureId: 'desc' }
            });

            return data.map(item => ({
                ...item,
                vermicompostingNoOfVillageCovered: item.vermiVillageCovered,
                vermicompostingTotalExpenditure: item.vermiTotalExpenditure,
                otherNoOfVillageCovered: item.otherVillageCovered,
                otherTotalExpenditure: item.otherTotalExpenditure
            }));
        },
        findById: async (id, user) => {
            const where = { swachhQuarterlyExpenditureId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const item = await prisma.swachhQuarterlyExpenditure.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true } },
                }
            });
            if (!item) return null;
            return {
                ...item,
                vermicompostingNoOfVillageCovered: item.vermiVillageCovered,
                vermicompostingTotalExpenditure: item.vermiTotalExpenditure,
                otherNoOfVillageCovered: item.otherVillageCovered,
                otherTotalExpenditure: item.otherTotalExpenditure
            };
        },
        update: async (id, data, user) => {
            const where = { swachhQuarterlyExpenditureId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.swachhQuarterlyExpenditure.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');

            const updateData = {};
            
            if (data.reportingYear !== undefined) {
                const d = parseReportingYearDate(data.reportingYear);
                ensureNotFutureDate(d);
                updateData.reportingYear = d;
            }
            
            const vermiVillageCovered = data.vermicompostingVillages ?? data.vermiVillageCovered ?? data.vermicompostingNoOfVillageCovered;
            if (vermiVillageCovered !== undefined) updateData.vermiVillageCovered = parseInt(vermiVillageCovered) || 0;
            
            const vermiTotalExpenditure = data.vermicompostingExpenditure ?? data.vermiTotalExpenditure ?? data.vermicompostingTotalExpenditure;
            if (vermiTotalExpenditure !== undefined) updateData.vermiTotalExpenditure = parseFloat(vermiTotalExpenditure) || 0;
            
            const otherVillageCovered = data.otherVillages ?? data.otherVillageCovered ?? data.otherNoOfVillageCovered;
            if (otherVillageCovered !== undefined) updateData.otherVillageCovered = parseInt(otherVillageCovered) || 0;
            
            const otherTotalExpenditure = data.otherExpenditure ?? data.otherTotalExpenditure;
            if (otherTotalExpenditure !== undefined) updateData.otherTotalExpenditure = parseFloat(otherTotalExpenditure) || 0;

            return await prisma.swachhQuarterlyExpenditure.update({
                where: { swachhQuarterlyExpenditureId: parseInt(id) },
                data: updateData
            });
        },
        delete: async (id, user) => {
            const where = { swachhQuarterlyExpenditureId: parseInt(id) };
            if (user && user.kvkId) {
                where.kvkId = parseInt(user.kvkId);
            }
            const existing = await prisma.swachhQuarterlyExpenditure.findFirst({ where });
            if (!existing) throw new Error('Record not found or unauthorized');
            return await prisma.swachhQuarterlyExpenditure.delete({ where: { swachhQuarterlyExpenditureId: parseInt(id) } });
        }
    }
};

module.exports = swachhtaBharatRepository;
