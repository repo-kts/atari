import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface AryaFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    aryaEnterprises: any[]
}

export const AryaForms: React.FC<AryaFormsProps> = ({
    entityType,
    formData,
    setFormData,
    aryaEnterprises
}) => {
    const handleAryaFileChange = (_field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            const previews: string[] = [];
            let count = 0;

            newFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews[index] = reader.result as string;
                    count++;
                    if (count === newFiles.length) {
                        setFormData((prev: any) => {
                            const existingPhotos = Array.isArray(prev.arya_photos) ? prev.arya_photos : [];
                            const newlyAdded = newFiles.map((f, i) => ({
                                file: f,
                                preview: previews[i],
                                image: previews[i],
                                caption: ''
                            }));
                            return {
                                ...prev,
                                arya_photos: [...existingPhotos, ...newlyAdded]
                            };
                        });
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeAryaPhoto = (index: number) => {
        setFormData((prev: any) => {
            const photos = [...(prev.arya_photos || [])];
            photos.splice(index, 1);
            return { ...prev, arya_photos: photos };
        });
    };

    const updateAryaCaption = (index: number, caption: string) => {
        setFormData((prev: any) => {
            const photos = [...(prev.arya_photos || [])];
            if (photos[index]) {
                photos[index] = { ...photos[index], caption };
            }
            return { ...prev, arya_photos: photos };
        });
    };

    // Normalize incoming formData when editing
    React.useEffect(() => {
        if (!formData || (entityType !== ENTITY_TYPES.PROJECT_ARYA_CURRENT && entityType !== ENTITY_TYPES.PROJECT_ARYA_EVALUATION)) return;

        if (formData.imagePath && typeof formData.imagePath === 'string') {
            if (formData.imagePath.startsWith('[')) {
                try {
                    const parsed = JSON.parse(formData.imagePath);
                    if (Array.isArray(parsed)) {
                        setFormData((prev: any) => ({
                            ...prev,
                            imagePath: null,
                            arya_photos: parsed.map((item: any) => ({
                                preview: item.image,
                                image: item.image,
                                caption: item.caption
                            }))
                        }));
                    }
                } catch (e) { }
            } else if (formData.imagePath.startsWith('{')) {
                try {
                    const parsed = JSON.parse(formData.imagePath);
                    setFormData((prev: any) => ({
                        ...prev,
                        imagePath: null,
                        arya_photos: [{
                            preview: parsed.image,
                            image: parsed.image,
                            caption: parsed.caption
                        }]
                    }));
                } catch (e) { }
            }
        }
    }, [entityType, formData.imagePath]);

    const renderPhotoFields = () => (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-[#212121]">Images</label>

            {Array.isArray(formData.arya_photos) && formData.arya_photos.length > 0 && (
                <div className="space-y-4 mb-4">
                    <p className="text-xs font-semibold text-[#487749]">Existing/Selected Image:</p>
                    <div className="grid grid-cols-2 gap-4">
                        {formData.arya_photos.map((item: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                                <div className="relative group w-32 h-32">
                                    <img
                                        src={item.preview || (typeof item.image === 'string' ? (item.image.startsWith('data:') ? item.image : `${import.meta.env.VITE_API_URL || ''}${item.image.startsWith('/') ? '' : '/'}${item.image}`) : '')}
                                        className="w-full h-full object-cover rounded-xl border-2 border-[#487749]/20 shadow-sm transition-transform group-hover:scale-105"
                                        alt={`Preview ${idx + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAryaPhoto(idx)}
                                        className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <FormInput
                                    label={`Caption ${idx + 1}`}
                                    value={item.caption || ''}
                                    onChange={(e) => updateAryaCaption(idx, e.target.value)}
                                    placeholder="Add caption..."
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAryaFileChange('imagePath')}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-dashed border-[#487749]/30 p-4 rounded-2xl"
            />
            <p className="text-[11px] text-gray-400 italic">
                Supported formats: JPG, PNG, GIF. Max file size: 5MB.
            </p>
        </div>
    );

    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_ARYA_CURRENT && (
                <div className="space-y-10">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Reporting Year"
                                required
                                type="date"
                                value={formData.reportingYear || ''}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, reportingYear: e.target.value }))}
                            />
                            <MasterDataDropdown
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId || ''}
                                onChange={(value) => setFormData((prev: any) => ({ ...prev, enterpriseId: value }))}
                                options={createMasterDataOptions(aryaEnterprises, 'enterpriseId', 'enterpriseName')}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">No. of entrepreneurial units established</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Male" type="number" required value={formData.unitsMale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsMale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Female" type="number" required value={formData.unitsFemale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsFemale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Viable units" type="number" required value={formData.viableUnits || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, viableUnits: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Closed units" type="number" required value={formData.closedUnits || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, closedUnits: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of Training conducted" type="number" required value={formData.trainingsConducted || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, trainingsConducted: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Start Date" type="date" required value={formData.startDate || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, startDate: e.target.value }))} />
                            <FormInput label="End Date" type="date" required value={formData.endDate || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, endDate: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">No. of rural youth trained</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Male" type="number" required value={formData.youthMale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, youthMale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Female" type="number" required value={formData.youthFemale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, youthFemale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of Groups Formed" type="number" required value={formData.groupsFormed || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, groupsFormed: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of Groups active" type="number" required value={formData.groupsActive || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, groupsActive: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of person left the group" type="number" required value={formData.personsLeftGroup || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, personsLeftGroup: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of Members in each Group" type="number" required value={formData.membersPerGroup || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, membersPerGroup: parseInt(e.target.value) || 0 }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Financial Impact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Average size of each unit (agro rental unit)" type="number" required value={formData.avgSizeOfUnit || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, avgSizeOfUnit: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Total Production unit/year" type="number" required value={formData.totalProductionPerYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, totalProductionPerYear: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Per unit cost of Production" type="number" required value={formData.perUnitCostOfProduction || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, perUnitCostOfProduction: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Sale value of Produce" type="number" required value={formData.saleValueOfProduce || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, saleValueOfProduce: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Employment generated (man-days)" type="number" required value={formData.employmentGeneratedMandays || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentGeneratedMandays: parseFloat(e.target.value) || 0 }))} />
                            {renderPhotoFields()}
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_ARYA_EVALUATION && (
                <div className="space-y-10">
                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Reporting Year"
                                required
                                type="date"
                                value={formData.reportingYear || ''}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, reportingYear: e.target.value }))}
                            />
                            <MasterDataDropdown
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId || ''}
                                onChange={(value) => setFormData((prev: any) => ({ ...prev, enterpriseId: value }))}
                                options={createMasterDataOptions(aryaEnterprises, 'enterpriseId', 'enterpriseName')}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">No. of entrepreneurial units established</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Male" type="number" required value={formData.unitsMale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsMale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Female" type="number" required value={formData.unitsFemale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsFemale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of non-functional entrepreneurial unit closed" type="number" required value={formData.nonFunctionalUnitsClosed || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, nonFunctionalUnitsClosed: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Date of Closing" type="date" required value={formData.dateOfClosing || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfClosing: e.target.value }))} />
                            <FormInput label="No. of non-functional entrepreneurial unit restarted (i.e. Previously closed)" type="number" required value={formData.nonFunctionalUnitsRestarted || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, nonFunctionalUnitsRestarted: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Date of restart" type="date" required value={formData.dateOfRestart || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfRestart: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Entrepreneurial Unit Size related to production capacity/ year (Production (Kg/unit))</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="No. of unit" type="number" required value={formData.numberOfUnits || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, numberOfUnits: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Unit Capacity" type="number" required value={formData.unitCapacity || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitCapacity: parseFloat(e.target.value) || 0 }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Entrepreneurial Establishment Cost/unit (Rs.)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Fixed cost" type="number" required value={formData.fixedCost || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, fixedCost: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Variable cost" type="number" required value={formData.variableCost || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, variableCost: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="total production/unit/year" type="number" required value={formData.totalProductionPerUnitYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, totalProductionPerUnitYear: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Gross cost of production/unit/ year (Rs.)" type="number" required value={formData.grossCostPerUnitYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, grossCostPerUnitYear: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="gross values of production/unit/ year (Rs.)" type="number" required value={formData.grossReturnPerUnitYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, grossReturnPerUnitYear: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="net benefit / unit/ year (Rs.)" type="number" required value={formData.netBenefitPerUnitYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, netBenefitPerUnitYear: parseFloat(e.target.value) || 0 }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Employment generated/ year (man-day @ 8 hrs/ day)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Family" type="number" required value={formData.employmentFamilyMandays || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentFamilyMandays: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Other than family" type="number" required value={formData.employmentOtherMandays || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentOtherMandays: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="No. of persons visited entrepreneur unit" type="number" required value={formData.personsVisitedUnit || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, personsVisitedUnit: parseInt(e.target.value) || 0 }))} />
                            {renderPhotoFields()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
