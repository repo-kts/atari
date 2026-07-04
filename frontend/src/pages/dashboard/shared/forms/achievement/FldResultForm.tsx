import React, { useEffect, useState } from 'react'
import { FormInput, FormSection } from '../shared/FormComponents'
import {
    FLD_RESULT_TEMPLATES,
} from '@/utils/fldResultTemplate'
import type { FldResultTemplate } from '@/utils/fldResultTemplate'

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
    otherParameterDemo: number | string
    otherParameterCheck: number | string
    laborReductionManDays: number | string
    costReduction: number | string
}

interface FldResultFormProps {
    mode: 'create' | 'edit'
    initialValue?: Partial<FldResultValue>
    template?: FldResultTemplate
    hasSavedResult?: boolean
    onClose: () => void
    onSubmit: (value: FldResultValue) => Promise<void>
    onMarkCompleted?: () => void
    isCompleted?: boolean
    canMarkCompleted?: boolean
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
    otherParameterDemo: '',
    otherParameterCheck: '',
    laborReductionManDays: '',
    costReduction: '',
}

const COMPUTED_INPUT_CLASS = 'bg-gray-100 cursor-not-allowed text-gray-700'

const num = (v: number | string): number => {
    if (v === '' || v === null || v === undefined) return NaN
    const n = Number(v)
    return Number.isFinite(n) ? n : NaN
}

const fmt = (n: number, digits = 2): string =>
    Number.isFinite(n) ? n.toFixed(digits) : ''

const otherParameterKeys: Array<keyof FldResultValue> = [
    'otherParameterDemo',
    'otherParameterCheck',
]

const mechanizationKeys: Array<keyof FldResultValue> = [
    'laborReductionManDays',
    'costReduction',
]

function clearHiddenFields(value: FldResultValue, template: FldResultTemplate): FldResultValue {
    const next = { ...value }
    const showDemoEconomics =
        template === FLD_RESULT_TEMPLATES.CROP_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.DEMO_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    const showCheckEconomics =
        template === FLD_RESULT_TEMPLATES.CROP_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    const showOtherParameters = template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    const showMechanization = template === FLD_RESULT_TEMPLATES.MECHANIZATION

    if (!showDemoEconomics) {
        ;(['demoGrossCost', 'demoGrossReturn', 'demoNetReturn', 'demoBcr'] as Array<keyof FldResultValue>)
            .forEach((key) => { next[key] = '' })
    }
    if (!showCheckEconomics) {
        ;(['checkGrossCost', 'checkGrossReturn', 'checkNetReturn', 'checkBcr'] as Array<keyof FldResultValue>)
            .forEach((key) => { next[key] = '' })
    }
    if (!showOtherParameters) {
        otherParameterKeys.forEach((key) => { next[key] = '' })
    }
    if (!showMechanization) {
        mechanizationKeys.forEach((key) => { next[key] = '' })
    }

    return next
}

export const FldResultForm: React.FC<FldResultFormProps> = ({
    mode,
    initialValue,
    template = FLD_RESULT_TEMPLATES.CROP_ECONOMICS,
    hasSavedResult = false,
    onClose,
    onSubmit,
    onMarkCompleted,
    isCompleted = false,
    canMarkCompleted = true,
}) => {
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
            await onSubmit(clearHiddenFields(value, template))
        } catch {
            // Error already surfaced by the caller; keep the form open for retry.
        } finally {
            setSubmitting(false)
        }
    }

    const showDemoEconomics =
        template === FLD_RESULT_TEMPLATES.CROP_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.DEMO_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    const showCheckEconomics =
        template === FLD_RESULT_TEMPLATES.CROP_ECONOMICS ||
        template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    const showOtherParameters = template === FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    const showMechanization = template === FLD_RESULT_TEMPLATES.MECHANIZATION

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
                            required
                            type="number"
                            value={value.increasePercent}
                            onChange={noop}
                            disabled
                            className={COMPUTED_INPUT_CLASS}
                        />
                    </div>
                </FormSection>

                {showOtherParameters && (
                    <FormSection title="Other Parameters" className="mb-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormInput label="Demonstration" required type="number" value={value.otherParameterDemo} onChange={(e) => setField('otherParameterDemo', e.target.value)} />
                            <FormInput label="Check" required type="number" value={value.otherParameterCheck} onChange={(e) => setField('otherParameterCheck', e.target.value)} />
                        </div>
                    </FormSection>
                )}

                {showMechanization && (
                    <FormSection title="Other Parameters" className="mb-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormInput label="Labor reduction (man days)" required type="number" value={value.laborReductionManDays} onChange={(e) => setField('laborReductionManDays', e.target.value)} />
                            <FormInput label="Cost reduction (Rs./ha or Rs./)" required type="number" value={value.costReduction} onChange={(e) => setField('costReduction', e.target.value)} />
                        </div>
                    </FormSection>
                )}

                {showDemoEconomics && (
                    <FormSection title="Economics of demonstration (Rs./ha)" className="mb-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <FormInput label="Gross Cost" required type="number" value={value.demoGrossCost} onChange={(e) => setField('demoGrossCost', e.target.value)} />
                            <FormInput label="Gross Return" required type="number" value={value.demoGrossReturn} onChange={(e) => setField('demoGrossReturn', e.target.value)} />
                            <FormInput label="Net Return" required type="number" value={value.demoNetReturn} onChange={noop} disabled className={COMPUTED_INPUT_CLASS} />
                            <FormInput label="BCR" required type="number" value={value.demoBcr} onChange={noop} disabled className={COMPUTED_INPUT_CLASS} />
                        </div>
                    </FormSection>
                )}

                {showCheckEconomics && (
                    <FormSection title="Economics of check (Rs./ha)" className="mb-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <FormInput label="Gross Cost" required type="number" value={value.checkGrossCost} onChange={(e) => setField('checkGrossCost', e.target.value)} />
                            <FormInput label="Gross Return" required type="number" value={value.checkGrossReturn} onChange={(e) => setField('checkGrossReturn', e.target.value)} />
                            <FormInput label="Net Return" required type="number" value={value.checkNetReturn} onChange={noop} disabled className={COMPUTED_INPUT_CLASS} />
                            <FormInput label="BCR" required type="number" value={value.checkBcr} onChange={noop} disabled className={COMPUTED_INPUT_CLASS} />
                        </div>
                    </FormSection>
                )}

                <div className="flex justify-end gap-2 pt-1">
                    <button type="button" className="px-3 py-1.5 border rounded-lg text-sm" onClick={onClose} disabled={submitting}>Cancel</button>
                    <button
                        type="submit"
                        className="px-4 py-2.5 text-sm font-medium text-white bg-[#487749] rounded-xl hover:bg-[#3d6540] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : mode === 'create' ? 'Create Result' : 'Update Result'}
                    </button>
                    {canMarkCompleted && !isCompleted && onMarkCompleted && (
                        <button
                            type="button"
                            className="px-4 py-2.5 text-sm font-medium text-white bg-[#487749] rounded-xl hover:bg-[#3d6540] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={submitting || !hasSavedResult}
                            onClick={onMarkCompleted}
                            title={!hasSavedResult ? 'Save the result before marking completed' : undefined}
                        >
                            Mark as Completed
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
