const ppvFraService = require('../../services/forms/ppvFraService.js');

const makeResponder = (res) => ({
    ok: (data) => res.json({ success: true, data }),
    created: (data) => res.status(201).json({ success: true, data }),
    err: (e, code = 400) => res.status(code).json({ success: false, message: e.message }),
});

const ppvFraController = {
    // Training
    findAllTrainings: async (req, res) => {
        try { makeResponder(res).ok(await ppvFraService.findAllTrainings(req.query, req.user)); }
        catch (e) { makeResponder(res).err(e, 500); }
    },
    findTrainingById: async (req, res) => {
        try { makeResponder(res).ok(await ppvFraService.findTrainingById(req.params.id, req.user)); }
        catch (e) { makeResponder(res).err(e, 404); }
    },
    createTraining: async (req, res) => {
        try { makeResponder(res).created(await ppvFraService.createTraining(req.body, req.user)); }
        catch (e) { makeResponder(res).err(e); }
    },
    updateTraining: async (req, res) => {
        try { makeResponder(res).ok(await ppvFraService.updateTraining(req.params.id, req.body, req.user)); }
        catch (e) { makeResponder(res).err(e); }
    },
    deleteTraining: async (req, res) => {
        try {
            await ppvFraService.deleteTraining(req.params.id, req.user);
            makeResponder(res).ok({ message: 'Deleted successfully' });
        } catch (e) { makeResponder(res).err(e); }
    },

    // Plant Varieties
    findAllPlantVarieties: async (req, res) => {
        try { makeResponder(res).ok(await ppvFraService.findAllPlantVarieties(req.query, req.user)); }
        catch (e) { makeResponder(res).err(e, 500); }
    },
    findPlantVarietyById: async (req, res) => {
        try { makeResponder(res).ok(await ppvFraService.findPlantVarietyById(req.params.id, req.user)); }
        catch (e) { makeResponder(res).err(e, 404); }
    },
    createPlantVariety: async (req, res) => {
        try { makeResponder(res).created(await ppvFraService.createPlantVariety(req.body, req.user)); }
        catch (e) { makeResponder(res).err(e); }
    },
    updatePlantVariety: async (req, res) => {
        try { makeResponder(res).ok(await ppvFraService.updatePlantVariety(req.params.id, req.body, req.user)); }
        catch (e) { makeResponder(res).err(e); }
    },
    deletePlantVariety: async (req, res) => {
        try {
            await ppvFraService.deletePlantVariety(req.params.id, req.user);
            makeResponder(res).ok({ message: 'Deleted successfully' });
        } catch (e) { makeResponder(res).err(e); }
    },
};

module.exports = ppvFraController;
