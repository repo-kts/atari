const formAttachmentService = require('../services/formAttachmentService');

function send(res, p) {
    return p
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            const status = err.statusCode || 400;
            return res.status(status).json({ error: err.message, code: err.code, field: err.field });
        });
}

const formAttachmentController = {
    presignUpload: (req, res) => send(res, formAttachmentService.presignUpload(req.body || {}, req.user)),

    confirmUpload: (req, res) => send(res, formAttachmentService.confirmUpload(req.body || {}, req.user)),

    list: (req, res) => send(res, formAttachmentService.listByRecord({
        formCode: req.query.formCode,
        recordId: req.query.recordId,
        kvkId: req.query.kvkId,
        kind: req.query.kind,
    }, req.user)),

    attachToRecord: (req, res) => send(res, formAttachmentService.attachToRecord(req.body || {}, req.user)),

    update: (req, res) => send(res, formAttachmentService.updateAttachment(req.params.attachmentId, req.body || {}, req.user)),

    remove: (req, res) => send(res, formAttachmentService.deleteAttachment(req.params.attachmentId, req.user)),

    gallery: (req, res) => send(res, formAttachmentService.listForGallery({
        page: req.query.page,
        limit: req.query.limit,
        kvkId: req.query.kvkId,
        formCode: req.query.formCode,
        reportingYear: req.query.reportingYear,
        search: req.query.search,
    }, req.user)),

    galleryForms: (req, res) => send(res, formAttachmentService.listForms(req.user)),

    galleryKvks: (req, res) => send(res, formAttachmentService.listKvks(req.user)),
};

module.exports = formAttachmentController;
