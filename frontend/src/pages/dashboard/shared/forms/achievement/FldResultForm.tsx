import React, { useEffect, useMemo, useState } from 'react'
import { FormInput, FormSection } from '../shared/FormComponents'

export interface FldResultValue {
    demoYield: number | string
    checkYield: number | string
    increasePercent: number | string
    demoGrossCost: number | string
    demoGrossReturn: number | string
    demoNetReturn: number | string
    demoBcr: number | string
    checkGrossCost: number | string
    checkGrossReturn: number | string
    checkNetReturn: number | string
    checkBcr: number | string
}

interface FldResultFormProps {
    mode: 'create' | 'edit'
    initialValue?: Partial<FldResultValue>
    onClose: () => void
    onSubmit: (value: FldResultValue) => Promise<void>
}

const defaultValue: FldResultValue = {
    demoYield: '',
    checkYield: '',
    increasePercent: '',
    demoGrossCost: '',
    demoGrossReturn: '',
    demoNetReturn: '',
    demoBcr: '',
    checkGrossCost: '',
    checkGrossReturn: '',
    checkNetReturn: '',
    checkBcr: '',
}

export const FldResultForm: React.FC<FldResultFormProps> = ({ mode, initialValue, onClose, onSubmit }) => {
    const [value, setValue] = useState<FldResultValue>({ ...defaultValue, ...(initialValue || {}) })
    const [submitting, setSubmitting] = useState(false)
    const title = useMemo(() => (mode === 'create' ? 'Create FLD Result' : 'Edit FLD Result'), [mode])

    useEffect(() => {
        setValue({ ...defaultValue, ...(initialValue || {}) })
    }, [initialValue, mode])

    const setField = (key: keyof FldResultValue, next: string) => setValue((prev) => ({ ...prev, [key]: next }))

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
        <div className="space-y-3">
            <h1 className="text-xl font-semibold text-[#487749]">{title}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormSection title="Yield (q/ha)" className="mb-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput label="Demo" required type="number" value={value.demoYield} onChange={(e) => setField('demoYield', e.target.value)} />
                        <FormInput label="Check" required type="number" value={value.checkYield} onChange={(e) => setField('checkYield', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput label="% Increase" required type="number" value={value.increasePercent} onChange={(e) => setField('increasePercent', e.target.value)} />
                    </div>
                </FormSection>

                <FormSection title="Economics of demonstration (Rs./ha)" className="mb-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput label="Gross Cost" required type="number" value={value.demoGrossCost} onChange={(e) => setField('demoGrossCost', e.target.value)} />
                        <FormInput label="Gross Return" required type="number" value={value.demoGrossReturn} onChange={(e) => setField('demoGrossReturn', e.target.value)} />
                        <FormInput label="Net Return" required type="number" value={value.demoNetReturn} onChange={(e) => setField('demoNetReturn', e.target.value)} />
                        <FormInput label="BCR" required type="number" value={value.demoBcr} onChange={(e) => setField('demoBcr', e.target.value)} />
                    </div>
                </FormSection>

                <FormSection title="Economics of check (Rs./ha)" className="mb-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput label="Gross Cost" required type="number" value={value.checkGrossCost} onChange={(e) => setField('checkGrossCost', e.target.value)} />
                        <FormInput label="Gross Return" required type="number" value={value.checkGrossReturn} onChange={(e) => setField('checkGrossReturn', e.target.value)} />
                        <FormInput label="Net Return" required type="number" value={value.checkNetReturn} onChange={(e) => setField('checkNetReturn', e.target.value)} />
                        <FormInput label="BCR" required type="number" value={value.checkBcr} onChange={(e) => setField('checkBcr', e.target.value)} />
                    </div>
                </FormSection>

                <div className="flex justify-end gap-2 pt-1">
                    <button type="button" className="px-3 py-1.5 border rounded-lg text-sm" onClick={onClose} disabled={submitting}>Cancel</button>
                    <button
                        type="submit"
                        className="px-4 py-2.5 text-sm font-medium text-white bg-[#487749] rounded-xl hover:bg-[#3d6540] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : mode === 'create' ? 'Create Result' : 'Update Result'}
                    </button>
                </div>
            </form>
        </div>
    )
}
