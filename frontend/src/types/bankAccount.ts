import { KVKDetails } from './kvk'

export interface BankAccount {
    id: number
    kvk_id: number
    user_id: number
    account_type: string // "Kvk" | "Revolving Fund" | etc.
    account_name: string
    bank_name: string
    location: string
    account_number: string
    created_at: string
    updated_at: string
    deleted_at?: string | null
    // Relations
    kvk?: KVKDetails
}
