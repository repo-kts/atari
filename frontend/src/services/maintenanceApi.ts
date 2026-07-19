/**
 * Maintenance API — TEMPORARY migration cleanup helpers.
 *
 * `wipeKvkModule` deletes every row of a module for the logged-in user's own
 * KVK (the backend scopes by the authenticated session's kvkId; the client
 * cannot target another KVK). Used to clear bad data between migration imports.
 */

import { apiClient } from './api'

export interface WipeKvkModuleResult {
    success: boolean
    message: string
    data: {
        module: string
        entityType: string
        kvkId: number
        deleted: Record<string, number>
        total: number
    }
}

export const wipeKvkModule = (entityType: string) =>
    apiClient.post<WipeKvkModuleResult>('/maintenance/kvk-module-wipe', {
        entityType,
    })

/**
 * entityTypes that support "Delete All". Mirrors the backend registry keys —
 * keep in sync. The button only renders for entityTypes listed here.
 */
export const WIPEABLE_ENTITY_TYPES = new Set<string>([
    // About KVK
    'kvk-bank-accounts',
    'kvk-employees',
    'kvk-infrastructure',
    'kvk-land-details',
    'kvk-vehicles',
    'kvk-vehicle-details',
    'kvk-equipments',
    'kvk-equipment-details',
    // Achievements
    'achievement-oft',
    'achievement-fld',
    'achievement-fld-extension-training',
    'achievement-fld-technical-feedback',
    'achievement-training',
    'achievement-extension',
    'achievement-other-extension',
    'achievement-technology-week',
    'achievement-celebration-days',
    'achievement-production-supply',
    'achievement-publication-details',
    'achievement-soil-equipment',
    'achievement-soil-analysis',
    'achievement-world-soil-day',
    'achievement-hrd',
    'achievement-award-kvk',
    'achievement-award-scientist',
    'achievement-award-farmer',
    // Projects
    'project-cfld-technical-param',
    'project-cfld-extension-activity',
    'project-cfld-budget',
    'project-cra-details',
    'project-cra-extension-activity',
    'project-fpo-details',
    'project-fpo-management',
    'project-drmr-details',
    'project-drmr-activity',
    'project-nari-nutri-garden',
    'project-nari-bio-fortified',
    'project-nari-value-addition',
    'project-nari-training',
    'project-nari-extension',
    'project-arya-current',
    'project-arya-evaluation',
    'project-csisa',
    'project-tsp-scsp',
    'project-nicra-basic',
    'project-nicra-details',
    'project-nicra-training',
    'project-nicra-extension',
    'project-nicra-intervention',
    'project-nicra-revenue',
    'project-nicra-custom-hiring',
    'project-nicra-vcrmc',
    'project-nicra-soil-health',
    'project-nicra-convergence',
    'project-nicra-dignitaries',
    'project-nicra-pi-copi',
    'project-natural-farming-geo',
    'project-natural-farming-physical',
    'project-natural-farming-demo',
    'project-natural-farming-farmers',
    'project-natural-farming-beneficiaries',
    'project-natural-farming-soil',
    'project-natural-farming-budget',
    'project-agri-drone',
    'project-agri-drone-demo',
    'project-seed-hub',
    'project-other',
    // Miscellaneous
    'misc-prevalent-diseases-crops',
    'misc-prevalent-diseases-livestock',
    'misc-ppv-fra-training',
    'misc-ppv-fra-plant-varieties',
    'misc-rawe-fet',
    'misc-vip-visitors',
    // Performance Indicators
    'performance-impact-kvk-activities',
    'performance-impact-entrepreneurship',
    'performance-impact-success-stories',
    'performance-district-level',
    'performance-operational-area',
    'performance-village-adoption',
    'performance-priority-thrust',
    'performance-demonstration-units',
    'performance-instructional-farm-crops',
    'performance-production-units',
    'performance-instructional-farm-livestock',
    'performance-hostel',
    'performance-staff-quarters',
    'performance-rainwater-harvesting',
    'performance-budget-details',
    'performance-project-budget',
    'performance-revolving-fund',
    'performance-revenue-generation',
    'performance-resource-generation',
    'performance-functional-linkage',
    // Digital Information
    'misc-digital-mobile-app',
    'misc-digital-web-portal',
    'misc-digital-kisan-sarathi',
    'misc-digital-kisan-mobile-advisory',
    'misc-digital-other-channels',
    // Swachhta Bharat Abhiyaan
    'misc-swachhta-sewa',
    'misc-swachhta-pakhwada',
    'misc-swachhta-budget',
    // Meetings
    'misc-meetings-sac',
    'misc-meetings-other',
])
