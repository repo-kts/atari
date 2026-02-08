import { useState, useCallback, useEffect } from 'react'
import { ENTITY_TYPES } from '../constants/entityTypes'
// import { useAuthStore } from '../stores/authStore'

export type AboutKvkEntity =
    | typeof ENTITY_TYPES.KVK_BANK_ACCOUNTS
    | typeof ENTITY_TYPES.KVK_EMPLOYEES
    | typeof ENTITY_TYPES.KVK_STAFF_TRANSFERRED
    | typeof ENTITY_TYPES.KVK_INFRASTRUCTURE
    | typeof ENTITY_TYPES.KVK_VEHICLES
    | typeof ENTITY_TYPES.KVK_VEHICLE_DETAILS
    | typeof ENTITY_TYPES.KVK_EQUIPMENTS
    | typeof ENTITY_TYPES.KVK_EQUIPMENT_DETAILS
    | typeof ENTITY_TYPES.KVK_FARM_IMPLEMENTS
    | typeof ENTITY_TYPES.KVKS

export function useAboutKvkData(_entityType: AboutKvkEntity) {
    // const { user } = useAuthStore()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // const isAdmin = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'].includes(user?.role || '')

    const fetchAll = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            setData([])
        } catch (err) {
            setError('Failed to fetch About KVK data')
        } finally {
            setLoading(false)
        }
    }, [])

    const create = useCallback(async (newData: any) => {
        setLoading(true)
        try {
            console.log('Create record (Mock removed):', newData)
            await fetchAll()
        } catch (err) {
            setError('Failed to create record')
        } finally {
            setLoading(false)
        }
    }, [fetchAll])

    const update = useCallback(async ({ id, data: updates }: { id: number, data: any }) => {
        setLoading(true)
        try {
            console.log('Update record (Mock removed):', id, updates)
            await fetchAll()
        } catch (err) {
            setError('Failed to update record')
        } finally {
            setLoading(false)
        }
    }, [fetchAll])

    const remove = useCallback(async (id: number) => {
        setLoading(true)
        try {
            console.log('Delete record (Mock removed):', id)
            await fetchAll()
        } catch (err) {
            setError('Failed to delete record')
        } finally {
            setLoading(false)
        }
    }, [fetchAll])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    return { data, loading, error, create, update, remove, fetchAll }
}
