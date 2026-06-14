/**
 * Module spec registry. Add a new module by requiring its spec here — the UI
 * dropdown and all engine endpoints pick it up automatically.
 */
const specs = [
    require('./modules/bankAccount.js'),
    require('./modules/employee.js'),
    require('./modules/infrastructure.js'),
    require('./modules/oft.js'),
    require('./modules/vehicle.js'),
    require('./modules/vehicleDetails.js'),
    require('./modules/fld.js'),
];

const byKey = new Map(specs.map(s => [s.key, s]));

function listModules() {
    return specs.map(s => ({
        key: s.key,
        label: s.label,
        model: s.model,
        foreignKeys: s.foreignKeys || {},
    }));
}

function getModule(key) {
    const spec = byKey.get(key);
    if (!spec) throw new Error(`Unknown module "${key}"`);
    return spec;
}

module.exports = { listModules, getModule };
