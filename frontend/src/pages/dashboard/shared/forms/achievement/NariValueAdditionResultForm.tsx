import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { DatePicker } from '@/components/ui/date-picker'
import { LoadingButton } from '@/components/common/LoadingButton'

export interface NariValueAdditionResultValue {
    reportingYear: string
    productName: string
    amountProduced: string | number
    marketPrice: string | number
    netIncome: string | number
    shelfLife: string
    fssaiCertified: 'Yes' | 'No' | ''
}

interface NariValueAdditionResultFormProps {
    mode?: 'create' | 'edit'
    initialValue?: Partial<NariValueAdditionResultValue>
    onClose: () => void
    onSubmit: (value: NariValueAdditionResultValue) => Promise<void>
}

const defaultValue: NariValueAdditionResultValue = {
    reportingYear: '',
    productName: '',
    amountProduced: '',
    marketPrice: '',
    netIncome: '',
    shelfLife: '',
    fssaiCertified: '',
}

export const NariValueAdditionResultForm: React.FC<NariValueAdditionResultFormProps> = ({ mode = 'create', initialValue, onClose, onSubmit }) => {
    const [submitting, setSubmitting] = useState(false)
    const [value, setValue] = useState<NariValueAdditionResultValue>({ ...defaultValue, ...(initialValue || {}) })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await onSubmit(value)
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 min-h-[400px]">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#487749] leading-tight">
                    {mode === 'create' ? 'Create Details of value-added products each beneficiary' : 'Edit Value Added Product Result'}
                </h1>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] min-h-[300px] animate-in fade-in zoom-in-95 duration-500">
                <form id="nariValueResultForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DatePicker
                            label="Reporting Year"
                            required
                            value={value.reportingYear}
                            onChange={(dateStr) => setValue(v => ({ ...v, reportingYear: dateStr }))}
                        />
                        <FormInput
                            label="Name of product"
                            required
                            value={value.productName}
                            onChange={(e) => setValue((v) => ({ ...v, productName: e.target.value }))}
                        />
                        <FormInput
                            label="Amount produced (Kg)"
                            type="number"
                            required
                            value={value.amountProduced}
                            onChange={(e) => setValue((v) => ({ ...v, amountProduced: e.target.value }))}
                        />
                        <FormInput
                            label="Market price (Rs/kg)"
                            type="number"
                            required
                            value={value.marketPrice}
                            onChange={(e) => setValue((v) => ({ ...v, marketPrice: e.target.value }))}
                        />
                        <FormInput
                            label="Net Income (Rs)"
                            type="number"
                            required
                            value={value.netIncome}
                            onChange={(e) => setValue((v) => ({ ...v, netIncome: e.target.value }))}
                        />
                        <FormInput
                            label="Shelf-life of produce"
                            required
                            placeholder="e.g. 6 months"
                            value={value.shelfLife}
                            onChange={(e) => setValue((v) => ({ ...v, shelfLife: e.target.value }))}
                        />
                        <FormSelect
                            label="FSSAI Certification"
                            required
                            value={value.fssaiCertified}
                            onChange={(e) => setValue((v) => ({ ...v, fssaiCertified: e.target.value as any }))}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' },
                            ]}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-[#F0F0F0]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-6 py-2.5 border border-[#E0E0E0] rounded-xl text-sm font-semibold text-[#616161] hover:bg-[#F5F5F5] transition-all"
                        >
                            Cancel
                        </button>
                        <LoadingButton
                            type="submit"
                            isLoading={submitting}
                            loadingText="Saving..."
                            variant="primary"
                            className="px-8 py-2.5"
                        >
                            {mode === 'create' ? 'Create Result' : 'Update Result'}
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </div>
    )
}
