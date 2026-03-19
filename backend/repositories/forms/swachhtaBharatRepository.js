const prisma = require('../../config/prisma.js');

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
                    observationDate: parseDateOrNow(data.observationDate),
                    totalActivities: parseInt(data.totalActivities) || 0,
                    staffCount: parseInt(data.staffCount || data.participantsStaff) || 0,
                    farmerCount: parseInt(data.farmerCount || data.participantsFarmers) || 0,
                    othersCount: parseInt(data.othersCount || data.participantsOthers) || 0,
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
            if (data.observationDate !== undefined) updateData.observationDate = parseDateOrNow(data.observationDate);
            if (data.totalActivities !== undefined) updateData.totalActivities = parseInt(data.totalActivities);
            if (data.staffCount !== undefined || data.participantsStaff !== undefined) updateData.staffCount = parseInt(data.staffCount || data.participantsStaff);
            if (data.farmerCount !== undefined || data.participantsFarmers !== undefined) updateData.farmerCount = parseInt(data.farmerCount || data.participantsFarmers);
            if (data.othersCount !== undefined || data.participantsOthers !== undefined) updateData.othersCount = parseInt(data.othersCount || data.participantsOthers);

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
                    observationDate: parseDateOrNow(data.observationDate),
                    totalActivities: parseInt(data.totalActivities) || 0,
                    staffCount: parseInt(data.staffCount || data.participantsStaff) || 0,
                    farmerCount: parseInt(data.farmerCount || data.participantsFarmers) || 0,
                    othersCount: parseInt(data.othersCount || data.participantsOthers) || 0,
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
            if (data.observationDate !== undefined) updateData.observationDate = parseDateOrNow(data.observationDate);
            if (data.totalActivities !== undefined) updateData.totalActivities = parseInt(data.totalActivities);
            if (data.staffCount !== undefined || data.participantsStaff !== undefined) updateData.staffCount = parseInt(data.staffCount || data.participantsStaff);
            if (data.farmerCount !== undefined || data.participantsFarmers !== undefined) updateData.farmerCount = parseInt(data.farmerCount || data.participantsFarmers);
            if (data.othersCount !== undefined || data.participantsOthers !== undefined) updateData.othersCount = parseInt(data.othersCount || data.participantsOthers);

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
                    reportingYearId: (data.reportingYearId || data.yearId || data.reportingYear) ? parseInt(data.reportingYearId || data.yearId || data.reportingYear) : null,
                    vermiVillageCovered: parseInt(data.vermicompostingNoOfVillageCovered || data.vermiVillageCovered || data.vermicompostingVillages) || 0,
                    vermiTotalExpenditure: parseFloat(data.vermicompostingTotalExpenditure || data.vermiTotalExpenditure || data.vermicompostingExpenditure) || 0,
                    otherVillageCovered: parseInt(data.otherNoOfVillageCovered || data.otherVillageCovered || data.otherVillages) || 0,
                    otherTotalExpenditure: parseFloat(data.otherTotalExpenditure || data.otherTotalExpenditure || data.otherExpenditure) || 0,
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
                    reportingYear: true
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
                    reportingYear: true
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
            if (data.reportingYearId !== undefined || data.yearId !== undefined || data.reportingYear !== undefined)
                updateData.reportingYearId = (data.reportingYearId || data.yearId || data.reportingYear) ? parseInt(data.reportingYearId || data.yearId || data.reportingYear) : null;
            if (data.vermiVillageCovered !== undefined || data.vermicompostingNoOfVillageCovered !== undefined || data.vermicompostingVillages !== undefined)
                updateData.vermiVillageCovered = parseInt(data.vermicompostingNoOfVillageCovered || data.vermiVillageCovered || data.vermicompostingVillages);
            if (data.vermiTotalExpenditure !== undefined || data.vermicompostingTotalExpenditure !== undefined || data.vermicompostingExpenditure !== undefined)
                updateData.vermiTotalExpenditure = parseFloat(data.vermicompostingTotalExpenditure || data.vermiTotalExpenditure || data.vermicompostingExpenditure);
            if (data.otherVillageCovered !== undefined || data.otherNoOfVillageCovered !== undefined || data.otherVillages !== undefined)
                updateData.otherVillageCovered = parseInt(data.otherNoOfVillageCovered || data.otherVillageCovered || data.otherVillages);
            if (data.otherTotalExpenditure !== undefined || data.otherTotalExpenditure !== undefined || data.otherExpenditure !== undefined)
                updateData.otherTotalExpenditure = parseFloat(data.otherTotalExpenditure || data.otherTotalExpenditure || data.otherExpenditure);

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
