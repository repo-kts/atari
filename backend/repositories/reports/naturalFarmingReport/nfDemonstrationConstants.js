/**
 * Shared definitions for Natural Farming — Demonstration Information exports (PDF/Excel/DOCX).
 * Single source of truth for parameter labels and field keys on normalized records.
 */

const NF_DEMONSTRATION_PARAMETER_DEFS = [
    { label: 'Plant height (cm)', withoutKey: 'plantHeightWithout', withKey: 'plantHeightWith' },
    { label: 'Other relevant parameter', withoutKey: 'otherRelevantParameterWithout', withKey: 'otherRelevantParameterWith' },
    { label: 'Yield (q/ha)', withoutKey: 'yieldWithout', withKey: 'yieldWith' },
    { label: 'Cost of cultivation (Rs/ha)', withoutKey: 'costWithout', withKey: 'costWith' },
    { label: 'Gross Return (Rs/ha)', withoutKey: 'grossReturnWithout', withKey: 'grossReturnWith' },
    { label: 'Net Return (Rs/ha)', withoutKey: 'netReturnWithout', withKey: 'netReturnWith' },
    { label: 'B:C Ratio', withoutKey: 'bcRatioWithout', withKey: 'bcRatioWith' },
    { label: 'Soil PH', withoutKey: 'soilPhWithout', withKey: 'soilPhWith' },
    { label: 'Soil OC (%)', withoutKey: 'soilOcWithout', withKey: 'soilOcWith' },
    { label: 'Soil EC (dS/m)', withoutKey: 'soilEcWithout', withKey: 'soilEcWith' },
    { label: 'Available N (Kg/ha)', withoutKey: 'availableNWithout', withKey: 'availableNWith' },
    { label: 'Available P (Kg/ha)', withoutKey: 'availablePWithout', withKey: 'availablePWith' },
    { label: 'Available K (Kg/ha)', withoutKey: 'availableKWithout', withKey: 'availableKWith' },
    { label: 'Soil Microbes (cfu)', withoutKey: 'soilMicrobesWithout', withKey: 'soilMicrobesWith' },
    { label: 'Any other, specify', withoutKey: 'anyOtherWithout', withKey: 'anyOtherWith' },
];

module.exports = {
    NF_DEMONSTRATION_PARAMETER_DEFS,
};
