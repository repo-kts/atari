import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { FormInput } from '../shared/FormComponents'
import { DatePicker } from '@/components/ui/date-picker'
import { LoadingButton } from '@/components/common/LoadingButton'

export interface NariBioFortifiedResultValue {
    reportingYear: string
    cropName: string
    variety: string
    areaHa: string | number
    productionKg: string | number
    consumptionGm: string | number
    formOfConsumption: string
    daysInYear: string | number
}

interface NariBioFortifiedResultFormProps {
    mode?: 'create' | 'edit'
    initialValue?: Partial<NariBioFortifiedResultValue>
    onClose: () => void
    onSubmit: (value: NariBioFortifiedResultValue) => Promise<void>
}

const defaultValue: NariBioFortifiedResultValue = {
    reportingYear: '',
    cropName: '',
    variety: '',
    areaHa: '',
    productionKg: '',
    consumptionGm: '',
    formOfConsumption: '',
    daysInYear: '',
}

export const NariBioFortifiedResultForm: React.FC<NariBioFortifiedResultFormProps> = ({ mode = 'create', initialValue, onClose, onSubmit }) => {
    const [submitting, setSubmitting] = useState(false)
    const [value, setValue] = useState<NariBioFortifiedResultValue>({ ...defaultValue, ...(initialValue || {}) })

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

    const title = mode === 'create'
        ? "Create Details of Consumption Pattern of Bio-fortified Crops Each Beneficiary"
        : "Edit Details of Consumption Pattern of Bio-fortified Crops Each Beneficiary"

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
                    {title}
                </h1>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] min-h-[300px] animate-in fade-in zoom-in-95 duration-500">
                <form id="nariBioResultForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DatePicker
                            label="Reporting Year"
                            required
                            value={value.reportingYear}
                            onChange={(dateStr) => setValue(v => ({ ...v, reportingYear: dateStr }))}
                        />
                        <FormInput
                            label="Name of Bio-fortified crops"
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
                            label="Area grown (ha)"
                            type="number"
                            required
                            value={value.areaHa}
                            onChange={(e) => setValue((v) => ({ ...v, areaHa: e.target.value }))}
                        />
                        <FormInput
                            label="Production/yield (kg/ha)"
                            type="number"
                            required
                            value={value.productionKg}
                            onChange={(e) => setValue((v) => ({ ...v, productionKg: e.target.value }))}
                        />
                        <FormInput
                            label="Consumption (gm/day/person)"
                            type="number"
                            required
                            value={value.consumptionGm}
                            onChange={(e) => setValue((v) => ({ ...v, consumptionGm: e.target.value }))}
                        />
                        <FormInput
                            label="Form of consumption"
                            required
                            value={value.formOfConsumption}
                            onChange={(e) => setValue((v) => ({ ...v, formOfConsumption: e.target.value }))}
                        />
                        <FormInput
                            label="No. of days of consumption in a year"
                            type="number"
                            required
                            value={value.daysInYear}
                            onChange={(e) => setValue((v) => ({ ...v, daysInYear: e.target.value }))}
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
