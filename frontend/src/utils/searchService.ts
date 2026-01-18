import { KVKDetails } from '../types/kvk'
import { BankAccount } from '../types/bankAccount'
import { Staff, SearchFilters } from '../types/staff'

export const searchService = {
    searchKVKs: (query: string, filters?: SearchFilters): KVKDetails[] => {
        const allKVKs = JSON.parse(localStorage.getItem('atari-kvk-details') || '[]') as KVKDetails[]
        let filtered = allKVKs.filter(kvk => !kvk.deleted_at)

        // Apply filters
        if (filters) {
            if (filters.zone_id) {
                filtered = filtered.filter(kvk => kvk.state?.zone_id === filters.zone_id)
            }
            if (filters.state_id) {
                filtered = filtered.filter(kvk => kvk.state_id === filters.state_id)
            }
            if (filters.district_id) {
                filtered = filtered.filter(kvk => kvk.district_id === filters.district_id)
            }
            if (filters.university_id) {
                filtered = filtered.filter(kvk => kvk.uni_id === filters.university_id)
            }
        }

        // Apply search query
        if (query.trim()) {
            const searchLower = query.toLowerCase()
            filtered = filtered.filter(kvk => {
                return (
                    kvk.kvk_name?.toLowerCase().includes(searchLower) ||
                    kvk.email?.toLowerCase().includes(searchLower) ||
                    kvk.mobile?.includes(searchLower) ||
                    kvk.state?.state_name?.toLowerCase().includes(searchLower) ||
                    kvk.district?.district_name?.toLowerCase().includes(searchLower) ||
                    kvk.university?.university_name?.toLowerCase().includes(searchLower) ||
                    kvk.org_name?.toLowerCase().includes(searchLower)
                )
            })
        }

        return filtered
    },

    searchBankAccounts: (
        query: string,
        kvkId?: number,
        filters?: SearchFilters
    ): BankAccount[] => {
        const allAccounts = JSON.parse(localStorage.getItem('atari-bank-accounts') || '[]') as BankAccount[]
        let filtered = allAccounts.filter(acc => !acc.deleted_at)

        // Filter by KVK ID
        if (kvkId !== undefined) {
            filtered = filtered.filter(acc => acc.kvk_id === kvkId)
        }

        // Apply filters
        if (filters?.account_type) {
            filtered = filtered.filter(acc => acc.account_type === filters.account_type)
        }

        // Apply search query
        if (query.trim()) {
            const searchLower = query.toLowerCase()
            filtered = filtered.filter(acc => {
                return (
                    acc.account_type?.toLowerCase().includes(searchLower) ||
                    acc.account_name?.toLowerCase().includes(searchLower) ||
                    acc.bank_name?.toLowerCase().includes(searchLower) ||
                    acc.account_number?.includes(searchLower) ||
                    acc.location?.toLowerCase().includes(searchLower) ||
                    acc.kvk?.kvk_name?.toLowerCase().includes(searchLower)
                )
            })
        }

        // Load KVK details for each account
        const kvks = JSON.parse(localStorage.getItem('atari-kvk-details') || '[]') as KVKDetails[]
        filtered = filtered.map(acc => {
            const kvk = kvks.find(k => k.id === acc.kvk_id)
            return { ...acc, kvk }
        })

        return filtered
    },

    searchStaff: (
        query: string,
        kvkId?: number,
        filters?: SearchFilters
    ): Staff[] => {
        const allStaff = JSON.parse(localStorage.getItem('atari-staff') || '[]') as Staff[]
        let filtered = allStaff.filter(s => !s.deleted_at)

        // Filter by KVK ID
        if (kvkId !== undefined) {
            filtered = filtered.filter(s => s.kvk_id === kvkId)
        }

        // Apply filters
        if (filters) {
            if (filters.job_type) {
                filtered = filtered.filter(s => s.job_type === filters.job_type)
            }
            if (filters.cast_category) {
                filtered = filtered.filter(s => s.cast_category === filters.cast_category)
            }
            if (filters.is_transferred !== undefined) {
                filtered = filtered.filter(
                    s => (s.is_transferred === 1) === filters.is_transferred
                )
            }
        }

        // Apply search query
        if (query.trim()) {
            const searchLower = query.toLowerCase()
            filtered = filtered.filter(s => {
                return (
                    s.staff_name?.toLowerCase().includes(searchLower) ||
                    s.email?.toLowerCase().includes(searchLower) ||
                    s.mobile?.includes(searchLower) ||
                    s.post?.post_name?.toLowerCase().includes(searchLower) ||
                    s.designation?.toLowerCase().includes(searchLower) ||
                    s.discipline?.toLowerCase().includes(searchLower)
                )
            })
        }

        // Load KVK and post details for each staff
        const kvks = JSON.parse(localStorage.getItem('atari-kvk-details') || '[]') as KVKDetails[]
        filtered = filtered.map(s => {
            const kvk = kvks.find(k => k.id === s.kvk_id)
            return { ...s, kvks: kvk }
        })

        return filtered
    },
}
