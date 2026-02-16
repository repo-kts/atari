/**
 * Utility functions for building KVK filter parameters
 * Reusable across components that need to filter KVKs
 */

import type { User } from '../types/auth';

/**
 * Geographic filter parameters for KVK queries
 */
export interface KvkFilterParams {
    universityId?: number;
    stateId?: number;
    districtId?: number;
    orgId?: number;
    zoneId?: number;
}

/**
 * Options for building KVK filter params
 */
export interface BuildKvkFiltersOptions {
    /** Selected university ID (primary filter) */
    universityId?: number | string | null;
    /** Form data containing geographic selections */
    formData?: {
        stateId?: number | string | null;
        districtId?: number | string | null;
        orgId?: number | string | null;
        universityId?: number | string | null;
    };
    /** Current user (for sub-admin filtering) */
    currentUser?: User | null;
    /** Whether current user is sub-admin */
    isSubAdmin?: boolean;
    /** Whether to show state field for sub-admin */
    showStateForSubAdmin?: boolean;
    /** Whether to show district field for sub-admin */
    showDistrictForSubAdmin?: boolean;
    /** Whether to show org field for sub-admin */
    showOrgForSubAdmin?: boolean;
}

/**
 * Builds KVK filter parameters based on user role and selections
 * Optimized to prioritize universityId and add geographic scoping
 *
 * @param options - Configuration options
 * @returns Filter parameters object ready for API call
 *
 * @example
 * const params = buildKvkFilters({
 *     universityId: 5,
 *     formData: { stateId: 2, districtId: 3 },
 *     isSubAdmin: false
 * });
 * // Returns: { universityId: 5, stateId: 2, districtId: 3 }
 */
export function buildKvkFilters(options: BuildKvkFiltersOptions): KvkFilterParams {
    const params: KvkFilterParams = {};

    // Always prioritize universityId from dependsOn (selected university)
    const universityId = options.universityId
        ? Number(options.universityId)
        : (options.formData?.universityId ? Number(options.formData.universityId) : undefined);

    if (universityId) {
        params.universityId = universityId;
    }

    // Add geographic filters for additional scoping
    if (options.isSubAdmin && options.currentUser) {
        // Sub-admin: use creator's fields for levels at/above, form selections for levels below
        const stateId = options.showStateForSubAdmin
            ? (options.formData?.stateId ? Number(options.formData.stateId) : undefined)
            : (options.currentUser.stateId ?? undefined);

        const districtId = options.showDistrictForSubAdmin
            ? (options.formData?.districtId ? Number(options.formData.districtId) : undefined)
            : (options.currentUser.districtId ?? undefined);

        const orgId = options.showOrgForSubAdmin
            ? (options.formData?.orgId ? Number(options.formData.orgId) : undefined)
            : (options.currentUser.orgId ?? undefined);

        if (stateId) params.stateId = stateId;
        if (districtId) params.districtId = districtId;
        if (orgId) params.orgId = orgId;
    } else if (options.formData) {
        // Super admin: use form selections
        if (options.formData.stateId) params.stateId = Number(options.formData.stateId);
        if (options.formData.districtId) params.districtId = Number(options.formData.districtId);
        if (options.formData.orgId) params.orgId = Number(options.formData.orgId);
    }

    return params;
}
