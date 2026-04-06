import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { FormInput } from '../shared/FormComponents'
import { DatePicker } from '@/components/ui/date-picker'
import { LoadingButton } from '@/components/common/LoadingButton'

export interface NariNutritionalGardenResultValue {
    reportingYear: string
    cropName: string
    variety: string
    areaSqm: string | number
    productionKg: string | number
    consumptionKg: string | number
    sellKg: string | number
    income: string | number
}

interface NariNutritionalGardenResultFormProps {
    initialValue?: Partial<NariNutritionalGardenResultValue>
    onClose: () => void
    onSubmit: (value: NariNutritionalGardenResultValue) => Promise<void>
}

const defaultValue: NariNutritionalGardenResultValue = {
    reportingYear: '',
    cropName: '',
    variety: '',
    areaSqm: '',
    productionKg: '',
    consumptionKg: '',
    sellKg: '',
    income: '',
}

export const NariNutritionalGardenResultForm: React.FC<NariNutritionalGardenResultFormProps> = ({ initialValue, onClose, onSubmit }) => {
    const [submitting, setSubmitting] = useState(false)
    const [value, setValue] = useState<NariNutritionalGardenResultValue>({ ...defaultValue, ...(initialValue || {}) })

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
                    Details of established Nutrition Garden in Nutri-Smart village
                </h1>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] min-h-[300px] animate-in fade-in zoom-in-95 duration-500">
                <form id="nariNutriResultForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DatePicker
                            label="Reporting Year"
                            required
                            value={value.reportingYear}
                            onChange={(dateStr) => setValue(v => ({ ...v, reportingYear: dateStr }))}
                        />
                        <FormInput
                            label="Name of crops"
                            required
                            value={value.cropName}
                            onChange={(e) => setValue((v) => ({ ...v, cropName: e.target.value }))}
                        />
                        <FormInput
                            label="Varieties"
                            required
                            value={value.variety}
                            onChange={(e) => setValue((v) => ({ ...v, variety: e.target.value }))}
                        />
                        <FormInput
                            label="Area grown (sqm)"
                            type="number"
                            required
                            value={value.areaSqm}
                            onChange={(e) => setValue((v) => ({ ...v, areaSqm: e.target.value }))}
                        />
                        <FormInput
                            label="Production (kg)"
                            type="number"
                            required
                            value={value.productionKg}
                            onChange={(e) => setValue((v) => ({ ...v, productionKg: e.target.value }))}
                        />
                        <FormInput
                            label="Consumption (kg)"
                            type="number"
                            required
                            value={value.consumptionKg}
                            onChange={(e) => setValue((v) => ({ ...v, consumptionKg: e.target.value }))}
                        />
                        <FormInput
                            label="Sell of produce (Kg)"
                            type="number"
                            required
                            value={value.sellKg}
                            onChange={(e) => setValue((v) => ({ ...v, sellKg: e.target.value }))}
                        />
                        <FormInput
                            label="Income from sell of produce (Rs)"
                            type="number"
                            required
                            value={value.income}
                            onChange={(e) => setValue((v) => ({ ...v, income: e.target.value }))}
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
                            Create Result
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </div>
    )
}
