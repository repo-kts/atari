const successStoryRepository = require('../../repositories/forms/successStoryRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');
const { createAttachmentBinding, createAttachmentAwareCrud } = require('./formAttachmentBinding.js');

const crud = createAttachmentAwareCrud({
    repo: successStoryRepository,
    binding: createAttachmentBinding({
        formCode: 'success_story',
        primaryKey: 'successStoryId',
    }),
    onWrite: (record, user) =>
        reportCacheInvalidationService.invalidateDataSourceForKvk(
            'successStory',
            record?.kvkId || user?.kvkId,
        ),
});

const successStoryService = {
    getAll: crud.findAll,
    getById: crud.findById,
    create: crud.create,
    update: crud.update,
    delete: crud.delete,
};

module.exports = successStoryService;
