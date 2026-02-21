import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'

interface AwardRecognitionProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

/**
 * Helper to convert File to Base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const AwardRecognition: React.FC<AwardRecognitionProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    if (!entityType) return null

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setFormData({ ...formData, image: base64 });
            } catch (error) {
                console.error("Error converting file to base64:", error);
            }
        }
    };

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
                            options={[
                                { value: '2023-24', label: '2023-24' },
                                { value: '2024-25', label: '2024-25' },
                                { value: '2025-26', label: '2025-26' },
                            ]}
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
                            options={[
                                { value: '2023', label: '2023' },
                                { value: '2024', label: '2024' },
                                { value: '2025', label: '2025' },
                                { value: '2026', label: '2026' },
                            ]}
                        />
                        <FormSelect
                            label="Head/Scientist"
                            required
                            value={formData.scientistName || ''}
                            onChange={(e) => setFormData({ ...formData, scientistName: e.target.value })}
                            options={[
                                { value: 'Dr. Reetha Singh', label: 'Dr. Reetha Singh' },
                                { value: 'Sri Rajeev Kumar', label: 'Sri Rajeev Kumar' },
                                { value: 'Dr. Pushpam Patel', label: 'Dr. Pushpam Patel' },
                                { value: 'Smt Sangeetha Kumari', label: 'Smt Sangeetha Kumari' },
                            ]}
                            placeholder="--Please Select--"
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
                            options={[
                                { value: '2023-24', label: '2023-24' },
                                { value: '2024-25', label: '2024-25' },
                                { value: '2025-26', label: '2025-26' },
                            ]}
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
                                onChange={handleFileChange}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
