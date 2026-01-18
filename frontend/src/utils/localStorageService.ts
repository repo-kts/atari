import { KVKDetails } from '../types/kvk'
import { BankAccount } from '../types/bankAccount'
import { Staff } from '../types/staff'

const STORAGE_KEYS = {
    KVK_DETAILS: 'atari-kvk-details',
    BANK_ACCOUNTS: 'atari-bank-accounts',
    STAFF: 'atari-staff',
    KVK_USER_MAPPING: 'atari-kvk-user-mapping',
}

export const localStorageService = {
    // KVK Details
    getKVKDetails: (kvkId?: number): KVKDetails[] => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_DETAILS)
        if (!data) return []
        const kvks: KVKDetails[] = JSON.parse(data)
        const activeKvks = kvks.filter(kvk => !kvk.deleted_at)
        if (kvkId !== undefined) {
            return activeKvks.filter(kvk => kvk.id === kvkId)
        }
        return activeKvks
    },

    saveKVKDetails: (kvk: KVKDetails): void => {
        const existing = localStorageService.getKVKDetails()
        const now = new Date().toISOString()
        const newKvk: KVKDetails = {
            ...kvk,
            created_at: kvk.created_at || now,
            updated_at: now,
        }
        const updated = [...existing, newKvk]
        localStorage.setItem(STORAGE_KEYS.KVK_DETAILS, JSON.stringify(updated))
    },

    updateKVKDetails: (id: number, updates: Partial<KVKDetails>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_DETAILS)
        if (!data) return
        const kvks: KVKDetails[] = JSON.parse(data)
        const index = kvks.findIndex(kvk => kvk.id === id)
        if (index !== -1) {
            kvks[index] = {
                ...kvks[index],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.KVK_DETAILS, JSON.stringify(kvks))
        }
    },

    deleteKVKDetails: (id: number): void => {
        localStorageService.updateKVKDetails(id, {
            deleted_at: new Date().toISOString(),
        })
    },

    // Bank Accounts
    getBankAccounts: (kvkId?: number): BankAccount[] => {
        const data = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS)
        if (!data) return []
        const accounts: BankAccount[] = JSON.parse(data)
        const activeAccounts = accounts.filter(acc => !acc.deleted_at)
        if (kvkId !== undefined) {
            return activeAccounts.filter(acc => acc.kvk_id === kvkId)
        }
        return activeAccounts
    },

    saveBankAccount: (account: BankAccount): void => {
        const existing = localStorageService.getBankAccounts()
        const now = new Date().toISOString()
        const newAccount: BankAccount = {
            ...account,
            id: account.id || Date.now(),
            created_at: account.created_at || now,
            updated_at: now,
        }
        const updated = [...existing, newAccount]
        localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updated))
    },

    updateBankAccount: (id: number, updates: Partial<BankAccount>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS)
        if (!data) return
        const accounts: BankAccount[] = JSON.parse(data)
        const index = accounts.findIndex(acc => acc.id === id)
        if (index !== -1) {
            accounts[index] = {
                ...accounts[index],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(accounts))
        }
    },

    deleteBankAccount: (id: number): void => {
        localStorageService.updateBankAccount(id, {
            deleted_at: new Date().toISOString(),
        })
    },

    // Staff
    getStaff: (kvkId?: number): Staff[] => {
        const data = localStorage.getItem(STORAGE_KEYS.STAFF)
        if (!data) return []
        const staff: Staff[] = JSON.parse(data)
        const activeStaff = staff.filter(s => !s.deleted_at)
        if (kvkId !== undefined) {
            return activeStaff.filter(s => s.kvk_id === kvkId)
        }
        return activeStaff
    },

    saveStaff: (staff: Staff): void => {
        const existing = localStorageService.getStaff()
        const now = new Date().toISOString()
        const newStaff: Staff = {
            ...staff,
            id: staff.id || Date.now(),
            created_at: staff.created_at || now,
            updated_at: now,
        }
        const updated = [...existing, newStaff]
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated))
    },

    updateStaff: (id: number, updates: Partial<Staff>): void => {
        const data = localStorage.getItem(STORAGE_KEYS.STAFF)
        if (!data) return
        const staff: Staff[] = JSON.parse(data)
        const index = staff.findIndex(s => s.id === id)
        if (index !== -1) {
            staff[index] = {
                ...staff[index],
                ...updates,
                updated_at: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff))
        }
    },

    deleteStaff: (id: number): void => {
        localStorageService.updateStaff(id, {
            deleted_at: new Date().toISOString(),
        })
    },

    transferStaff: (id: number): void => {
        localStorageService.updateStaff(id, {
            is_transferred: 1,
        })
    },

    // KVK User Mapping
    getKVKUserMapping: (): Record<string, number> => {
        const data = localStorage.getItem(STORAGE_KEYS.KVK_USER_MAPPING)
        if (!data) return {}
        return JSON.parse(data)
    },

    saveKVKUserMapping: (userId: string, kvkId: number): void => {
        const mapping = localStorageService.getKVKUserMapping()
        mapping[userId] = kvkId
        localStorage.setItem(STORAGE_KEYS.KVK_USER_MAPPING, JSON.stringify(mapping))
    },

    getKVKIdForUser: (userId: string): number | null => {
        const mapping = localStorageService.getKVKUserMapping()
        return mapping[userId] || null
    },

    // Initialize with mock data (will be called from mockData.ts)
    initializeMockData: (kvkData: KVKDetails[], bankAccounts: BankAccount[], staff: Staff[]): void => {
        if (!localStorage.getItem(STORAGE_KEYS.KVK_DETAILS)) {
            localStorage.setItem(STORAGE_KEYS.KVK_DETAILS, JSON.stringify(kvkData))
        }
        if (!localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS)) {
            localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(bankAccounts))
        }
        if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff))
        }
    },
}
