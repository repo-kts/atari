import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import { useAuth } from '@/contexts/AuthContext'
import { useYears } from '../../../../hooks/useOtherMastersData'
import { useKvkEmployees } from '../../../../hooks/forms/useAboutKvkData'
import { useMemo } from 'react'

interface AwardRecognitionProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const AwardRecognition: React.FC<AwardRecognitionProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { user } = useAuth()
    const { data: years = [] } = useYears();
    const { data: employees = [] } = useKvkEmployees({ kvkId: formData.kvkId || user?.kvkId });

    const yearOptions = useMemo(() => {
        const result = years.map((y: any) => {
            const label = String(y.yearName || y.year || y.name);
            return { value: label, label: label };
        });

        // Ensure years up to 2026 are included if not present
        const currentYears = result.map(r => r.value);
        ['2023', '2024', '2025', '2026'].forEach(y => {
            if (!currentYears.includes(y)) {
                result.push({ value: y, label: y });
            }
        });

        // Sort years descending
        return result.sort((a, b) => b.value.localeCompare(a.value));
    }, [years]);

    const scientistOptions = useMemo(() => {
        const fallbacks = [
            { value: 'Sri Akhilesh Kumar', label: 'Sri Akhilesh Kumar' },
            { value: 'Dr. Reeta Singh', label: 'Dr. Reeta Singh' },
            { value: 'Sri Rajeev Kumar', label: 'Sri Rajeev Kumar' },
            { value: 'Dr. Prakash Chandra Gupta', label: 'Dr. Prakash Chandra Gupta' },
            { value: 'Dr. Pushpam Patel', label: 'Dr. Pushpam Patel' },
            { value: 'Smt. Sangeeta Kumari', label: 'Smt. Sangeeta Kumari' },
            { value: 'Sri Chandan Kumar', label: 'Sri Chandan Kumar' },
            { value: 'Sri Kanhaiya Kumar Rai', label: 'Sri Kanhaiya Kumar Rai' },
            { value: 'Sri Bachan Sah', label: 'Sri Bachan Sah' },
            { value: 'Sri Mukesh Kumar', label: 'Sri Mukesh Kumar' },
        ];

        if (!employees || employees.length === 0) {
            return fallbacks;
        }

        const excludedNames = ['dsfo', 'Dr. Anil Kumar Ravi'];
        const mapped = employees
            .filter((emp: any) => emp.staffName && emp.staffName !== 'undefined' && !excludedNames.includes(emp.staffName))
            .map((emp: any) => ({
                value: emp.staffName,
                label: `${emp.staffName} (${emp.sanctionedPost?.postName || emp.postName || 'Staff'})`
            }));

        // Merge mapped with fallbacks, prioritizing mapped
        const result = [...mapped];
        fallbacks.forEach(fb => {
            if (!result.some(r => r.value === fb.value)) {
                result.push(fb);
            }
        });

        return result;
    }, [employees]);

    // Automatically sync kvkId from user session if it's missing in formData
    React.useEffect(() => {
        if (user?.kvkId && !formData.kvkId) {
            setFormData({ ...formData, kvkId: user.kvkId })
        }
    }, [user?.kvkId, formData.kvkId, setFormData])

    if (!entityType) return null

    return (
        <>
            {/* KVK Awards */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Institutional Award received by KVK</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.year || ''}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            options={yearOptions}
                        />
                        <FormInput
                            label="Name of the Award"
                            required
                            value={formData.awardName || ''}
                            onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount || ''}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement || ''}
                            onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority || ''}
                            onChange={(e) => setFormData({ ...formData, conferringAuthority: e.target.value })}
                            className="md:col-span-2"
                        />
                    </div>
                </div>
            )}

            {/* Scientist Awards */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Recognition received by Head/Scientist</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.year || ''}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            options={yearOptions}
                        />
                        <FormSelect
                            label="Head/Scientist"
                            required
                            value={formData.scientistName || ''}
                            onChange={(e) => setFormData({ ...formData, scientistName: e.target.value })}
                            options={scientistOptions}
                            placeholder="--Please Select Scientist--"
                        />
                        <FormInput
                            label="Name of the Award"
                            required
                            value={formData.awardName || ''}
                            onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount || ''}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement || ''}
                            onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority || ''}
                            onChange={(e) => setFormData({ ...formData, conferringAuthority: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* Farmer Awards */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Recognition received by Farmers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.year || ''}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            options={yearOptions}
                        />
                        <FormInput
                            label="Name of the Award"
                            required
                            value={formData.awardName || ''}
                            onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                        />
                        <FormInput
                            label="Name of the Farmer"
                            required
                            value={formData.farmerName || ''}
                            onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                        />
                        <FormInput
                            label="Address"
                            required
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        <FormInput
                            label="Contact No."
                            required
                            value={formData.contactNo || ''}
                            onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount || ''}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement || ''}
                            onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority || ''}
                            onChange={(e) => setFormData({ ...formData, conferringAuthority: e.target.value })}
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="Image"
                                type="file"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] })}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
