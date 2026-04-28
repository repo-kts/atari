const raweFetService = require('../../services/forms/raweFetService.js');

const makeResponder = (res) => ({
    ok: (data) => res.json({ success: true, data }),
    created: (data) => res.status(201).json({ success: true, data }),
    err: (e, code = 400) => res.status(code).json({ success: false, message: e.message }),
});

const raweFetController = {
    findAll: async (req, res) => {
        try { makeResponder(res).ok(await raweFetService.findAll(req.query, req.user)); }
        catch (e) { makeResponder(res).err(e, 500); }
    },
    findById: async (req, res) => {
        try { makeResponder(res).ok(await raweFetService.findById(req.params.id, req.user)); }
        catch (e) { makeResponder(res).err(e, 404); }
    },
    create: async (req, res) => {
        try { makeResponder(res).created(await raweFetService.create(req.body, req.user)); }
        catch (e) { makeResponder(res).err(e); }
    },
    update: async (req, res) => {
        try { makeResponder(res).ok(await raweFetService.update(req.params.id, req.body, req.user)); }
        catch (e) { makeResponder(res).err(e); }
    },
    delete: async (req, res) => {
        try {
            await raweFetService.delete(req.params.id, req.user);
            makeResponder(res).ok({ message: 'Deleted successfully' });
        } catch (e) { makeResponder(res).err(e); }
    },
    findAllAttachmentTypes: async (req, res) => {
        try { makeResponder(res).ok(await raweFetService.findAllAttachmentTypes()); }
        catch (e) { makeResponder(res).err(e, 500); }
    },
};

module.exports = raweFetController;
