import { useCallback, useMemo } from 'react'
import { masterDataApi } from '../services/masterDataApi'
import { aboutKvkApi } from '../services/aboutKvkApi'
import type { Zone, State, District, Organization } from '../types/masterData'
import type { Kvk } from '../types/aboutKvk'
import type { User } from '../types/auth'
import type { EntitySearchOption } from '../components/common/EntitySearchSelect'

export type HierarchyEntityType = 'zone' | 'state' | 'district' | 'org' | 'kvk'

export interface DerivedHierarchy {
    zoneId: number | null
    stateId: number | null
    districtId: number | null
    orgId: number | null
    universityId: number | null
    kvkId: number | null
}

const EMPTY_HIERARCHY: DerivedHierarchy = {
    zoneId: null,
    stateId: null,
    districtId: null,
    orgId: null,
    universityId: null,
    kvkId: null,
}

/** The one entity type each role's account is ultimately scoped to. */
export const ROLE_TARGET_ENTITY: Record<string, HierarchyEntityType> = {
    zone_admin: 'zone',
    state_admin: 'state',
    state_user: 'state',
    district_admin: 'district',
    district_user: 'district',
    org_admin: 'org',
    org_user: 'org',
    kvk_admin: 'kvk',
    kvk_user: 'kvk',
}

/** Hierarchy depth used to decide whether an actor's own scope already covers a level. */
const ENTITY_LEVEL: Record<HierarchyEntityType, number> = {
    zone: 1,
    state: 2,
    district: 3,
    org: 4,
    kvk: 5,
}

export const ENTITY_LABEL: Record<HierarchyEntityType, string> = {
    zone: 'Zone',
    state: 'State',
    district: 'District',
    org: 'Institute',
    kvk: 'KVK',
}

/** Which `DerivedHierarchy` key holds an entity type's own id. */
export const ENTITY_ID_FIELD: Record<HierarchyEntityType, keyof DerivedHierarchy> = {
    zone: 'zoneId',
    state: 'stateId',
    district: 'districtId',
    org: 'orgId',
    kvk: 'kvkId',
}

const SEARCH_PAGE_SIZE = 20

export function joinSublabel(parts: Array<string | undefined | null>): string | undefined {
    const cleaned = parts.filter((p): p is string => !!p && p.trim().length > 0)
    return cleaned.length > 0 ? cleaned.join(', ') : undefined
}

function deriveFromRecord(targetEntity: HierarchyEntityType | null, record: unknown): DerivedHierarchy {
    switch (targetEntity) {
        case 'zone': {
            const z = record as Zone
            return { ...EMPTY_HIERARCHY, zoneId: z.zoneId }
        }
        case 'state': {
            const s = record as State
            return { ...EMPTY_HIERARCHY, stateId: s.stateId, zoneId: s.zoneId ?? s.zone?.zoneId ?? null }
        }
        case 'district': {
            const d = record as District
            return { ...EMPTY_HIERARCHY, districtId: d.districtId, stateId: d.stateId, zoneId: d.zoneId }
        }
        case 'org': {
            const o = record as Organization
            return {
                ...EMPTY_HIERARCHY,
                orgId: o.orgId,
                districtId: o.districtId ?? o.district?.districtId ?? null,
                stateId: o.district?.state?.stateId ?? null,
                zoneId: o.district?.state?.zone?.zoneId ?? null,
            }
        }
        case 'kvk': {
            const k = record as Kvk
            return {
                zoneId: k.zoneId ?? null,
                stateId: k.stateId ?? null,
                districtId: k.districtId ?? null,
                orgId: k.orgId ?? null,
                universityId: k.universityId ?? null,
                kvkId: k.kvkId,
            }
        }
        default:
            return EMPTY_HIERARCHY
    }
}

interface UseUserHierarchyPickerArgs {
    selectedRole: string | null
    isSubAdmin: boolean
    actorLevel: number
    currentUser: User | null | undefined
    /** True when a kvk_admin is acting on a kvk_user — fully inherits, no picker at all. */
    isKvkAdminActor: boolean
}

export interface UseUserHierarchyPickerResult {
    targetEntity: HierarchyEntityType | null
    targetField: keyof DerivedHierarchy | null
    /** False when the field should be inherited from the actor's own scope with no picker shown. */
    showPicker: boolean
    entityLabel: string
    placeholder: string
    emptyMessage: string
    search: (query: string, signal?: AbortSignal) => Promise<EntitySearchOption<unknown>[]>
    /**
     * Resolve the final hierarchy payload from a picked record (or `null` to use the
     * fully-inherited path). Also re-applies the actor's own scope at every level their
     * own role already covers, as a defense-in-depth safety net on top of scoped search.
     */
    resolveHierarchy: (record: unknown | null) => DerivedHierarchy
}

export function useUserHierarchyPicker({
    selectedRole,
    isSubAdmin,
    actorLevel,
    currentUser,
    isKvkAdminActor,
}: UseUserHierarchyPickerArgs): UseUserHierarchyPickerResult {
    const targetEntity = selectedRole ? ROLE_TARGET_ENTITY[selectedRole] ?? null : null

    const showPicker = useMemo(() => {
        if (!targetEntity || isKvkAdminActor) return false
        if (!isSubAdmin) return true
        return ENTITY_LEVEL[targetEntity] > actorLevel
    }, [targetEntity, isKvkAdminActor, isSubAdmin, actorLevel])

    // Every ID the actor's own account already carries — used to scope search results
    // to their own subtree, and combines safely (AND) regardless of which entity is queried.
    const actorScopeFilter = useMemo(() => {
        if (!isSubAdmin || !currentUser) return {}
        const filter: Record<string, number> = {}
        if (currentUser.zoneId) filter.zoneId = currentUser.zoneId
        if (currentUser.stateId) filter.stateId = currentUser.stateId
        if (currentUser.districtId) filter.districtId = currentUser.districtId
        if (currentUser.orgId) filter.orgId = currentUser.orgId
        return filter
    }, [isSubAdmin, currentUser])

    const search = useCallback(
        async (query: string, signal?: AbortSignal): Promise<EntitySearchOption<unknown>[]> => {
            switch (targetEntity) {
                case 'zone': {
                    const res = await masterDataApi.getZones({ search: query, limit: SEARCH_PAGE_SIZE }, signal)
                    return res.data.map(z => ({ value: z.zoneId, label: z.zoneName, record: z }))
                }
                case 'state': {
                    const res = await masterDataApi.getStates(
                        { search: query, limit: SEARCH_PAGE_SIZE, ...actorScopeFilter },
                        signal,
                    )
                    return res.data.map(s => ({
                        value: s.stateId,
                        label: s.stateName,
                        sublabel: joinSublabel([s.zone?.zoneName ? `Zone: ${s.zone.zoneName}` : undefined]),
                        record: s,
                    }))
                }
                case 'district': {
                    const res = await masterDataApi.getDistricts(
                        { search: query, limit: SEARCH_PAGE_SIZE, ...actorScopeFilter },
                        signal,
                    )
                    return res.data.map(d => ({
                        value: d.districtId,
                        label: d.districtName,
                        sublabel: joinSublabel([d.state?.stateName, d.zone?.zoneName]),
                        record: d,
                    }))
                }
                case 'org': {
                    const res = await masterDataApi.getOrganizations(
                        { search: query, limit: SEARCH_PAGE_SIZE, ...actorScopeFilter },
                        signal,
                    )
                    return res.data.map(o => ({
                        value: o.orgId,
                        label: o.orgName,
                        sublabel: joinSublabel([o.district?.districtName, o.district?.state?.stateName]),
                        record: o,
                    }))
                }
                case 'kvk': {
                    const res = await aboutKvkApi.getKvks(
                        { search: query, limit: SEARCH_PAGE_SIZE, ...actorScopeFilter },
                        signal,
                    )
                    return res.data.map(k => ({
                        value: k.kvkId,
                        label: k.kvkName,
                        sublabel: joinSublabel([k.org?.orgName, k.district?.districtName, k.state?.stateName]),
                        record: k,
                    }))
                }
                default:
                    return []
            }
        },
        [targetEntity, actorScopeFilter],
    )

    const forcedHierarchy: DerivedHierarchy | null = useMemo(() => {
        if (!isSubAdmin || !currentUser) return null
        return {
            zoneId: currentUser.zoneId ?? null,
            stateId: currentUser.stateId ?? null,
            districtId: currentUser.districtId ?? null,
            orgId: currentUser.orgId ?? null,
            kvkId: isKvkAdminActor ? (currentUser.kvkId ?? null) : null,
            universityId: isKvkAdminActor ? ((currentUser as User & { universityId?: number | null }).universityId ?? null) : null,
        }
    }, [isSubAdmin, currentUser, isKvkAdminActor])

    const resolveHierarchy = useCallback(
        (record: unknown | null): DerivedHierarchy => {
            const base = record ? deriveFromRecord(targetEntity, record) : forcedHierarchy ?? EMPTY_HIERARCHY
            if (!isSubAdmin || !currentUser) return base
            return {
                zoneId: currentUser.zoneId ?? null,
                stateId: actorLevel >= ENTITY_LEVEL.state ? (currentUser.stateId ?? null) : base.stateId,
                districtId: actorLevel >= ENTITY_LEVEL.district ? (currentUser.districtId ?? null) : base.districtId,
                orgId: actorLevel >= ENTITY_LEVEL.org ? (currentUser.orgId ?? null) : base.orgId,
                universityId: base.universityId,
                kvkId: base.kvkId,
            }
        },
        [targetEntity, forcedHierarchy, isSubAdmin, currentUser, actorLevel],
    )

    return {
        targetEntity,
        targetField: targetEntity ? ENTITY_ID_FIELD[targetEntity] : null,
        showPicker,
        entityLabel: targetEntity ? ENTITY_LABEL[targetEntity] : '',
        placeholder: targetEntity ? `Search ${ENTITY_LABEL[targetEntity].toLowerCase()}…` : 'Select a role first',
        emptyMessage: targetEntity ? `No ${ENTITY_LABEL[targetEntity].toLowerCase()} found` : '',
        search,
        resolveHierarchy,
    }
}
