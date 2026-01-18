import React, { useState } from 'react'
import { localStorageService } from '../../../utils/localStorageService'
import { BankAccount } from '../../../types/bankAccount'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

interface EditBankAccountProps {
    account: BankAccount
    onSuccess: () => void
    onCancel: () => void
}

export const EditBankAccount: React.FC<EditBankAccountProps> = ({
    account,
    onSuccess,
    onCancel,
}) => {
    const [formData, setFormData] = useState<Partial<BankAccount>>({
        account_type: account.account_type,
        account_name: account.account_name,
        bank_name: account.bank_name,
        location: account.location,
        account_number: account.account_number,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.account_type) {
            newErrors.account_type = 'Account type is required'
        }
        if (!formData.account_name) {
            newErrors.account_name = 'Account name is required'
        }
        if (!formData.bank_name) {
            newErrors.bank_name = 'Bank name is required'
        }
        if (!formData.location) {
            newErrors.location = 'Location is required'
        }
        if (!formData.account_number) {
            newErrors.account_number = 'Account number is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        localStorageService.updateBankAccount(account.id, formData)
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Account Type
                </label>
                <select
                    value={formData.account_type || 'Kvk'}
                    onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                    className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-[#212121] ${
                        errors.account_type ? 'border-red-300' : 'border-[#E0E0E0]'
                    }`}
                >
                    <option value="Kvk">Kvk</option>
                    <option value="Revolving Fund">Revolving Fund</option>
                    <option value="Other">Other</option>
                </select>
                {errors.account_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.account_type}</p>
                )}
            </div>

            <Input
                label="Account Name"
                value={formData.account_name || ''}
                onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                error={errors.account_name}
                required
            />

            <Input
                label="Bank Name"
                value={formData.bank_name || ''}
                onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                error={errors.bank_name}
                required
            />

            <Input
                label="Location"
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                error={errors.location}
                required
            />

            <Input
                label="Account Number"
                value={formData.account_number || ''}
                onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                error={errors.account_number}
                required
            />

            <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                    Update Bank Account
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
