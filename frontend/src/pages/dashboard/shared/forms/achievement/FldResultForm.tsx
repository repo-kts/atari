import React, { useEffect, useState } from 'react'
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

const COMPUTED_INPUT_CLASS = 'bg-gray-100 cursor-not-allowed text-gray-700'

const num = (v: number | string): number => {
    if (v === '' || v === null || v === undefined) return NaN
    const n = Number(v)
    return Number.isFinite(n) ? n : NaN
}

const fmt = (n: number, digits = 2): string =>
    Number.isFinite(n) ? n.toFixed(digits) : ''

export const FldResultForm: React.FC<FldResultFormProps> = ({ mode, initialValue, onClose, onSubmit }) => {
    const [value, setValue] = useState<FldResultValue>({ ...defaultValue, ...(initialValue || {}) })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        setValue({ ...defaultValue, ...(initialValue || {}) })
    }, [initialValue, mode])

    // Auto-compute derived fields whenever any input changes.
    useEffect(() => {
        const dy = num(value.demoYield)
        const cy = num(value.checkYield)
        const dgc = num(value.demoGrossCost)
        const dgr = num(value.demoGrossReturn)
        const cgc = num(value.checkGrossCost)
        const cgr = num(value.checkGrossReturn)

        const increasePercent = Number.isFinite(dy) && Number.isFinite(cy) && cy !== 0
            ? fmt(((dy - cy) / cy) * 100)
            : ''
        const demoNetReturn = Number.isFinite(dgr) && Number.isFinite(dgc) ? fmt(dgr - dgc) : ''
        const demoBcr = Number.isFinite(dgr) && Number.isFinite(dgc) && dgc !== 0 ? fmt(dgr / dgc) : ''
        const checkNetReturn = Number.isFinite(cgr) && Number.isFinite(cgc) ? fmt(cgr - cgc) : ''
        const checkBcr = Number.isFinite(cgr) && Number.isFinite(cgc) && cgc !== 0 ? fmt(cgr / cgc) : ''

        setValue((prev) => {
            if (
                prev.increasePercent === increasePercent &&
                prev.demoNetReturn === demoNetReturn &&
                prev.demoBcr === demoBcr &&
                prev.checkNetReturn === checkNetReturn &&
                prev.checkBcr === checkBcr
            ) {
                return prev
            }
            return {
                ...prev,
                increasePercent,
                demoNetReturn,
                demoBcr,
                checkNetReturn,
                checkBcr,
            }
        })
    }, [
        value.demoYield,
        value.checkYield,
        value.demoGrossCost,
        value.demoGrossReturn,
        value.checkGrossCost,
        value.checkGrossReturn,
    ])

    const setField = (key: keyof FldResultValue, next: string) => setValue((prev) => ({ ...prev, [key]: next }))

    const noop = () => { /* computed field, no-op */ }

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
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormSection title="Yield (q/ha)" className="mb-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput label="Demo" required type="number" value={value.demoYield} onChange={(e) => setField('demoYield', e.target.value)} />
                        <FormInput label="Check" required type="number" value={value.checkYield} onChange={(e) => setField('checkYield', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="% Increase"
                            type="number"
                            value={value.increasePercent}
                            onChange={noop}
                            disabled
                            className={COMPUTED_INPUT_CLASS}
                            helperText="Auto: ((demo - check) / check) × 100"
                        />
                    </div>
                </FormSection>

                <FormSection title="Economics of demonstration (Rs./ha)" className="mb-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput label="Gross Cost" required type="number" value={value.demoGrossCost} onChange={(e) => setField('demoGrossCost', e.target.value)} />
                        <FormInput label="Gross Return" required type="number" value={value.demoGrossReturn} onChange={(e) => setField('demoGrossReturn', e.target.value)} />
                        <FormInput
                            label="Net Return"
                            type="number"
                            value={value.demoNetReturn}
                            onChange={noop}
                            disabled
                            className={COMPUTED_INPUT_CLASS}
                            helperText="Auto: gross return − gross cost"
                        />
                        <FormInput
                            label="BCR"
                            type="number"
                            value={value.demoBcr}
                            onChange={noop}
                            disabled
                            className={COMPUTED_INPUT_CLASS}
                            helperText="Auto: gross return ÷ gross cost"
                        />
                    </div>
                </FormSection>

                <FormSection title="Economics of check (Rs./ha)" className="mb-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput label="Gross Cost" required type="number" value={value.checkGrossCost} onChange={(e) => setField('checkGrossCost', e.target.value)} />
                        <FormInput label="Gross Return" required type="number" value={value.checkGrossReturn} onChange={(e) => setField('checkGrossReturn', e.target.value)} />
                        <FormInput
                            label="Net Return"
                            type="number"
                            value={value.checkNetReturn}
                            onChange={noop}
                            disabled
                            className={COMPUTED_INPUT_CLASS}
                            helperText="Auto: gross return − gross cost"
                        />
                        <FormInput
                            label="BCR"
                            type="number"
                            value={value.checkBcr}
                            onChange={noop}
                            disabled
                            className={COMPUTED_INPUT_CLASS}
                            helperText="Auto: gross return ÷ gross cost"
                        />
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
