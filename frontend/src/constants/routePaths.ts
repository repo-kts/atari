/**
 * Centralized Route Paths Configuration
 *
 * All route paths used across the application are defined here
 * to ensure consistency, maintainability, and single source of truth.
 *
 * This file serves as the authoritative source for all route paths.
 * Import and use these constants instead of hardcoding paths.
 *
 * Usage:
 *   import { ROUTE_PATHS } from '@/constants/routePaths'
 *   ROUTE_PATHS.ACHIEVEMENTS.FLD.EXTENSION_TRAINING
 */

export const ROUTE_PATHS = {
    // About KVK Routes
    ABOUT_KVK: {
        BASE: '/forms/about-kvk',
        VIEW_KVKS: {
            BASE: '/forms/about-kvk/view-kvks',
            DETAILS: '/forms/about-kvk/view-kvks/:id',
            BANK: '/forms/about-kvk/view-kvks/:id/bank',
            EMPLOYEES: '/forms/about-kvk/view-kvks/:id/employees',
            VEHICLES: '/forms/about-kvk/view-kvks/:id/vehicles',
            EQUIPMENTS: '/forms/about-kvk/view-kvks/:id/equipments',
        },
    },
    // Achievements Routes
    ACHIEVEMENTS: {
        BASE: '/forms/achievements',
        OFT: '/forms/achievements/oft',
        FLD: {
            BASE: '/forms/achievements/fld',
            EXTENSION_TRAINING: '/forms/achievements/fld/extension-training',
            TECHNICAL_FEEDBACK: '/forms/achievements/fld/technical-feedback',
        },
        TRAININGS: '/forms/achievements/trainings',
        EXTENSION_ACTIVITIES: '/forms/achievements/extension-activities',
        OTHER_EXTENSION: '/forms/achievements/other-extension',
        TECHNOLOGY_WEEK: '/forms/achievements/technology-week',
        CELEBRATION_DAYS: '/forms/achievements/celebration-days',
        PRODUCTION_SUPPLY: '/forms/achievements/production-supply',
        PUBLICATIONS: '/forms/achievements/publications',
        SOIL_EQUIPMENT: '/forms/achievements/soil-equipment',
        SOIL_ANALYSIS: '/forms/achievements/soil-analysis',
        WORLD_SOIL_DAY: '/forms/achievements/world-soil-day',
        HRD: '/forms/achievements/hrd',
        AWARDS: {
            KVK: '/forms/achievements/awards/kvk',
            SCIENTIST: '/forms/achievements/awards/scientist',
            FARMER: '/forms/achievements/awards/farmer',
        },
        PROJECTS: {
            BASE: '/forms/achievements/projects',
            CFLD: {
                TECHNICAL_PARAMETER: '/forms/achievements/projects/cfld/technical-parameter',
                EXTENSION_ACTIVITY: '/forms/achievements/projects/cfld/extension-activity',
                BUDGET_UTILIZATION: '/forms/achievements/projects/cfld/budget-utilization',
            },
            CRA: {
                DETAILS: '/forms/achievements/projects/cra/details',
                EXTENSION_ACTIVITY: '/forms/achievements/projects/cra/extension-activity',
            },
            FPO: {
                DETAILS: '/forms/achievements/projects/fpo/details',
                MANAGEMENT: '/forms/achievements/projects/fpo/management',
            },
            DRMR: {
                DETAILS: '/forms/achievements/projects/drmr/details',
                ACTIVITY: '/forms/achievements/projects/drmr/activity',
            },
            NARI: {
                NUTRI_SMART: '/forms/achievements/projects/nari/nutri-smart',
                BIO_FORTIFIED: '/forms/achievements/projects/nari/bio-fortified',
                VALUE_ADDITION: '/forms/achievements/projects/nari/value-addition',
                TRAINING_PROGRAMM: '/forms/achievements/projects/nari/training-programm',
                EXTENSION_ACTIVITIES: '/forms/achievements/projects/nari/extension-activities',
            },
            ARYA: {
                CURRENT: '/forms/achievements/projects/arya',
                EVALUATION: '/forms/achievements/projects/arya-evaluation',
            },
            CSISA: '/forms/achievements/projects/csisa',
            TSP_SCSP: '/forms/achievements/projects/sub-plan-activity',
            NICRA: {
                BASE: '/forms/achievements/projects/nicra',
                BASIC_INFORMATION: '/forms/achievements/projects/nicra/basic-information',
                DETAILS: '/forms/achievements/projects/nicra/details',
                TRAINING: '/forms/achievements/projects/nicra/training',
                EXTENSION_ACTIVITY: '/forms/achievements/projects/nicra/extension-activity',
                OTHERS: {
                    BASE: '/forms/achievements/projects/nicra/others',
                    INTERVENTION: '/forms/achievements/projects/nicra/others/intervention',
                    REVENUE_GENERATED: '/forms/achievements/projects/nicra/others/revenue-generated',
                    CUSTOM_HIRING: '/forms/achievements/projects/nicra/others/custom-hiring',
                    VCRMC: '/forms/achievements/projects/nicra/others/vcrmc',
                    SOIL_HEALTH_CARD: '/forms/achievements/projects/nicra/others/soil-health-card',
                    CONVERGENCE_PROGRAMME: '/forms/achievements/projects/nicra/others/convergence-programme',
                    DIGNITARIES_VISITED: '/forms/achievements/projects/nicra/others/dignitaries-visited',
                    PI_COPI_LIST: '/forms/achievements/projects/nicra/others/pi-copi-list',
                },
            },
            NATURAL_FARMING: {
                GEOGRAPHICAL_INFORMATION: '/forms/achievements/projects/natural-farming/geographical-information',
                PHYSICAL_INFORMATION: '/forms/achievements/projects/natural-farming/physical-information',
                DEMONSTRATION_INFORMATION: '/forms/achievements/projects/natural-farming/demonstration-information',
                FARMERS_PRACTICING: '/forms/achievements/projects/natural-farming/farmers-practicing',
                BENEFICIARIES: '/forms/achievements/projects/natural-farming/beneficiaries',
                SOIL_DATA: '/forms/achievements/projects/natural-farming/soil-data',
                BUDGET_EXPENDITURE: '/forms/achievements/projects/natural-farming/budget-expenditure',
            },
            AGRI_DRONE: '/forms/achievements/projects/agri-drone',
            DEMONSTRATION_DETAILS: '/forms/achievements/projects/demonstration-details',
            SEED_HUB_PROGRAM: '/forms/achievements/projects/seed-hub-program',
            OTHER_PROGRAM: '/forms/achievements/other-program',
        },
    },
} as const;
