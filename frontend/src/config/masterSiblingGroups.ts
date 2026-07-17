/**
 * Master Sibling Groups
 *
 * Centralized sibling route groups for All Masters navigation.
 * Each group corresponds to exactly ONE tile on the All Masters landing page,
 * and its order matches the order of items shown in that tile. Opening any
 * master renders its tile-mates as tabs, so the tab order mirrors the tile.
 *
 * Usage:
 *   import { MASTER_SIBLING_GROUPS } from '@/config/masterSiblingGroups'
 *   siblings: MASTER_SIBLING_GROUPS.BASIC_MASTERS
 */

import { ENTITY_PATHS } from '../constants/entityConstants'

export const MASTER_SIBLING_GROUPS = {
    // ── Basic Masters ──────────────────────────────────────────────
    // Tile: "Basic Masters"
    BASIC_MASTERS: [
        ENTITY_PATHS.ZONES,
        ENTITY_PATHS.STATES,
        ENTITY_PATHS.DISTRICTS,
        ENTITY_PATHS.ORGANIZATIONS,
        ENTITY_PATHS.UNIVERSITIES,
        ENTITY_PATHS.KVK_MASTER,
    ],

    // Backup Basic Masters (mounted at /all-master-1; not in sidebar)
    BASIC_MASTERS_1: [
        '/all-master-1/zones',
        '/all-master-1/states',
        '/all-master-1/districts',
        '/all-master-1/organizations',
        '/all-master-1/universities',
        '/all-master-1/kvks',
    ],

    // ── About KVK ──────────────────────────────────────────────────
    // Tile: "Employee Masters"
    EMPLOYEE_MASTERS: [
        ENTITY_PATHS.STAFF_CATEGORY,
        ENTITY_PATHS.SANCTIONED_POST,
        ENTITY_PATHS.DISCIPLINE,
        ENTITY_PATHS.PAY_LEVEL,
        ENTITY_PATHS.PAY_SCALE,
        ENTITY_PATHS.JOB_TYPE,
    ],

    // Tile: "Bank Masters"
    BANK_MASTERS: [
        ENTITY_PATHS.BANK_ACCOUNT_TYPE,
    ],

    // Tile: "Infrastructure & Land"
    INFRASTRUCTURE_LAND_MASTERS: [
        ENTITY_PATHS.INFRASTRUCTURE_MASTER,
        ENTITY_PATHS.LAND_ITEM_MASTER,
    ],

    // Tile: "Assets & Equipment"
    ASSET_EQUIPMENT_MASTERS: [
        ENTITY_PATHS.VEHICLE_TYPE,
        ENTITY_PATHS.EQUIPMENT_TYPE,
        ENTITY_PATHS.EQUIPMENT_MASTER,
        ENTITY_PATHS.VEHICLE_PRESENT_STATUS,
    ],

    // ── Achievements ───────────────────────────────────────────────
    // Tile: "OFT Master"
    OFT_MASTERS: [
        ENTITY_PATHS.OFT_SUBJECT,
        ENTITY_PATHS.OFT_THEMATIC_AREA,
    ],

    // Tile: "FLD Master"
    FLD_MASTERS: [
        ENTITY_PATHS.FLD_SECTOR,
        ENTITY_PATHS.FLD_THEMATIC_AREA,
        ENTITY_PATHS.FLD_CATEGORY,
        ENTITY_PATHS.FLD_SUBCATEGORY,
        ENTITY_PATHS.FLD_CROP,
        ENTITY_PATHS.FLD_ACTIVITY,
    ],

    // Tile: "Training Master"
    TRAINING_BASIC_MASTERS: [
        ENTITY_PATHS.TRAINING_TYPE,
        ENTITY_PATHS.TRAINING_AREA,
        ENTITY_PATHS.TRAINING_THEMATIC,
        ENTITY_PATHS.TRAINING_CLIENTELE,
    ],

    // Tile: "Extension Activities"
    TRAINING_EXTENSION_MASTERS: [
        ENTITY_PATHS.EXTENSION_ACTIVITY,
        ENTITY_PATHS.OTHER_EXTENSION_ACTIVITY,
    ],

    // Tile: "Production of Seed, Planting Materials and Bio Products"
    PRODUCT_MASTERS: [
        ENTITY_PATHS.PRODUCT_CATEGORY,
        ENTITY_PATHS.PRODUCT_TYPE,
        ENTITY_PATHS.PRODUCT,
    ],

    // Tile: "Soil & Celebration Masters"
    SOIL_CELEBRATION_MASTERS: [
        ENTITY_PATHS.SOIL_WATER_ANALYSIS,
        ENTITY_PATHS.IMPORTANT_DAY,
    ],

    // Tile: "Publications"
    PUBLICATION_MASTERS: [
        ENTITY_PATHS.PUBLICATION_ITEM,
    ],

    // ── Projects ───────────────────────────────────────────────────
    // Tile: "CFLD Master"
    CFLD_MASTERS: [
        ENTITY_PATHS.CFLD_CROP,
        ENTITY_PATHS.BUDGET_ITEM_MASTER,
    ],

    // Tile: "Climate Resilient Agriculture"
    CRA_MASTERS: [
        ENTITY_PATHS.CRA_CROPPING_SYSTEM,
        ENTITY_PATHS.CRA_FARMING_SYSTEM,
    ],

    // Tile: "ARYA"
    ARYA_MASTERS: [
        ENTITY_PATHS.ARYA_ENTERPRISE,
    ],

    // Tile: "TSP/SCSP"
    TSP_SCSP_MASTERS: [
        ENTITY_PATHS.TSP_SCSP_TYPE,
        ENTITY_PATHS.TSP_SCSP_ACTIVITY,
    ],

    // Tile: "Natural Farming"
    NATURAL_FARMING_MASTERS: [
        ENTITY_PATHS.NATURAL_FARMING_ACTIVITY,
        ENTITY_PATHS.NATURAL_FARMING_SOIL_PARAMETER,
    ],

    // Tile: "Agri-Drone"
    AGRI_DRONE_MASTERS: [
        ENTITY_PATHS.AGRI_DRONE_DEMONSTRATIONS_ON,
    ],

    // Tile: "NARI Masters"
    NARI_MASTERS: [
        ENTITY_PATHS.NARI_ACTIVITY,
        ENTITY_PATHS.NARI_NUTRITION_GARDEN_TYPE,
        ENTITY_PATHS.NARI_CROP_CATEGORY,
    ],

    // Tile: "NICRA Masters"
    NICRA_MASTERS: [
        ENTITY_PATHS.NICRA_CATEGORY,
        ENTITY_PATHS.NICRA_SUB_CATEGORY,
        ENTITY_PATHS.NICRA_SEED_BANK_FODDER_BANK,
        ENTITY_PATHS.NICRA_DIGNITARY_TYPE,
        ENTITY_PATHS.NICRA_PI_TYPE,
    ],

    // Tile: "Project wise Budget Masters"
    PROJECT_BUDGET_MASTERS: [
        ENTITY_PATHS.FINANCIAL_PROJECT,
    ],

    // ── Performance Indicators ─────────────────────────────────────
    // Tile: "Performance Indicator Masters"
    PERFORMANCE_MASTERS: [
        ENTITY_PATHS.IMPACT_SPECIFIC_AREA,
        ENTITY_PATHS.ENTERPRISE_TYPE,
        ENTITY_PATHS.ACCOUNT_TYPE,
        ENTITY_PATHS.PROGRAMME_TYPE,
    ],

    // ── Miscellaneous ──────────────────────────────────────────────
    // Tile: "Miscellaneous Masters"
    MISC_MASTERS: [
        ENTITY_PATHS.PPV_FRA_TRAINING_TYPE,
        ENTITY_PATHS.DIGNITARY_TYPE,
    ],

    // ── Others Master ──────────────────────────────────────────────
    // Tile: "Calendar & Context Masters"
    CALENDAR_CONTEXT_MASTERS: [
        ENTITY_PATHS.SEASON,
        ENTITY_PATHS.UNIT,
        ENTITY_PATHS.CROP_TYPE,
    ],

    // Tile: "Funding Source"
    FUNDING_SOURCE_MASTERS: [
        ENTITY_PATHS.FUNDING_SOURCE,
    ],
} as const;
