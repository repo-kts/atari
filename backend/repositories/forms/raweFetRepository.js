const prisma = require('../../config/prisma.js');

const raweFetRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        let parsedAttachmentTypeId = data.attachmentTypeId ? parseInt(data.attachmentTypeId) : 0;

        // If attachmentType name is provided, look it up or create it
        if (data.attachmentType && typeof data.attachmentType === 'string') {
            let typeRec = await prisma.attachmentType.findFirst({
                where: { name: { equals: data.attachmentType, mode: 'insensitive' } }
            });
            if (!typeRec) {
                typeRec = await prisma.attachmentType.create({
                    data: { name: data.attachmentType }
                });
            }
            parsedAttachmentTypeId = typeRec.attachmentTypeId;
        } else if (!parsedAttachmentTypeId || parsedAttachmentTypeId === 0) {
            // Ensure we have a default attachment type if none provided
            let defaultType = await prisma.attachmentType.findFirst({
                where: { name: { equals: 'General', mode: 'insensitive' } }
            });
            if (!defaultType) {
                defaultType = await prisma.attachmentType.create({
                    data: { name: 'General' }
                });
            }
            parsedAttachmentTypeId = defaultType.attachmentTypeId;
        }

        return await prisma.raweFetFitProgramme.create({
            data: {
                kvkId,
                attachmentTypeId: parsedAttachmentTypeId,
                attachmentPath: data.attachmentPath || '',
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
                maleStudents: parseInt(data.maleStudents || 0),
                femaleStudents: parseInt(data.femaleStudents || 0),
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
        return await prisma.raweFetFitProgramme.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                attachmentType: { select: { name: true } }
            },
            orderBy: { raweProgrammeId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { raweProgrammeId: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        return await prisma.raweFetFitProgramme.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                attachmentType: { select: { name: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { raweProgrammeId: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.raweFetFitProgramme.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        let parsedAttachmentTypeId = existing.attachmentTypeId;

        // If attachmentType name is provided, look it up or create it
        if (data.attachmentType && typeof data.attachmentType === 'string') {
            let typeRec = await prisma.attachmentType.findFirst({
                where: { name: { equals: data.attachmentType, mode: 'insensitive' } }
            });
            if (!typeRec) {
                typeRec = await prisma.attachmentType.create({
                    data: { name: data.attachmentType }
                });
            }
            parsedAttachmentTypeId = typeRec.attachmentTypeId;
        } else if (data.attachmentTypeId !== undefined) {
            parsedAttachmentTypeId = parseInt(data.attachmentTypeId);
        }

        return await prisma.raweFetFitProgramme.update({
            where: { raweProgrammeId: parseInt(id) },
            data: {
                attachmentTypeId: parsedAttachmentTypeId,
                attachmentPath: data.attachmentPath !== undefined ? data.attachmentPath : existing.attachmentPath,
                startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : existing.startDate) : existing.startDate,
                endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : existing.endDate) : existing.endDate,
                maleStudents: data.maleStudents !== undefined ? parseInt(data.maleStudents) : existing.maleStudents,
                femaleStudents: data.femaleStudents !== undefined ? parseInt(data.femaleStudents) : existing.femaleStudents,
            }
        });
    },

    delete: async (id, user) => {
        const where = { raweProgrammeId: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.raweFetFitProgramme.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.raweFetFitProgramme.delete({ where: { raweProgrammeId: parseInt(id) } });
    },

    // Attachment Types
    findAllAttachmentTypes: async () => {
        return await prisma.attachmentType.findMany({
            orderBy: { name: 'asc' }
        });
    }
};

module.exports = raweFetRepository;
