import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput, FormSelect, FormSection } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface NicraFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any | ((prev: any) => any)) => void
    years?: any[]
    seasons?: any[]
    categories?: any[]
    subCategories?: any[]
    seedBankFodderBanks?: any[]
    dignitaryTypes?: any[]
    piTypes?: any[]
}

export const NicraForms: React.FC<NicraFormsProps> = ({
    entityType,
    formData,
    setFormData,
    seasons = [],
    categories = [],
    subCategories = [],
    seedBankFodderBanks = [],
    dignitaryTypes = [],
    piTypes = []
}) => {
    const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            
            // Generic file processor (handles both compression for images and Base64 for others)
            const processFile = (file: File): Promise<any> => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const content = event.target?.result as string;
                        
                        // If it's an image, we attempt compression for the gallery
                        if (file.type.startsWith('image/')) {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;
                                const MAX_SIZE = 1280;
                                if (width > height && width > MAX_SIZE) {
                                    height *= MAX_SIZE / width;
                                    width = MAX_SIZE;
                                } else if (height > MAX_SIZE) {
                                    width *= MAX_SIZE / height;
                                    height = MAX_SIZE;
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(img, 0, 0, width, height);
                                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                                resolve({
                                    file: null,
                                    preview: compressedBase64,
                                    image: compressedBase64,
                                    name: file.name,
                                    caption: ''
                                });
                            };
                            img.src = content;
                        } else {
                            // Non-image file (PDF, etc.) - just Base64 it
                            resolve(content);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            };

            if (field === 'uploadFile') {
                // Single file handling for Supporting Document
                processFile(newFiles[0]).then(result => {
                    setFormData((prev: any) => ({ ...prev, [field]: result }));
                });
            } else {
                // Multiple gallery photos handling
                Promise.all(newFiles.map(processFile)).then(results => {
                    const existingPhotos = Array.isArray(formData[field]) ? formData[field] : [];
                    setFormData((prev: any) => ({
                        ...prev,
                        [field]: [...existingPhotos, ...results]
                    }));
                });
            }
        }
    };

    const removePhoto = (field: string, index: number) => {
        const photos = [...(Array.isArray(formData[field]) ? formData[field] : [])];
        photos.splice(index, 1);
        setFormData({ ...formData, [field]: photos });
    };

    const updateCaption = (field: string, index: number, caption: string) => {
        const photos = [...(Array.isArray(formData[field]) ? formData[field] : [])];
        if (photos[index]) {
            photos[index] = { ...photos[index], caption };
            setFormData({ ...formData, [field]: photos });
        }
    };

    const renderGallery = (field: string) => {
        if (!Array.isArray(formData[field]) || formData[field].length === 0) return null;

        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {formData[field].map((item: any, idx: number) => {
                    const src = item.preview || (typeof item.image === 'string' ? (item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || ''}${item.image.startsWith('/') ? '' : '/'}${item.image}`) : '');
                    return (
                        <div key={idx} className="relative bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-col group">
                            <div className="relative aspect-square mb-2 overflow-hidden rounded-lg border border-gray-50">
                                <img
                                    src={src}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    alt={`P ${idx + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(field, idx)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10 scale-90"
                                >
                                    <X className="w-3 h-3 stroke-[2.5]" />
                                </button>
                            </div>
                            <div className="space-y-1 mt-auto">
                                <textarea
                                    placeholder="Caption..."
                                    className="w-full text-[12px] font-medium bg-gray-50/50 border border-gray-100 rounded-md focus:bg-white focus:ring-1 focus:ring-green-200 px-2 py-1.5 outline-none transition-all placeholder:text-gray-400 text-gray-700 min-h-[3.5rem] resize-none"
                                    value={item.caption || ''}
                                    onChange={(e) => updateCaption(field, idx, e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderPhotoFields = (field: string) => (
        <FormSection title="Photographs" className="col-span-1 mt-2" noGrid={true}>
            <FormInput
                label=""
                required={!Array.isArray(formData[field]) || formData[field].length === 0}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange(field)}
                helperText="Only images allowed. Uploading new files will be added to the list. Only the first image uploaded will appear in the table. (Max 5MB per file)"
            />
            {renderGallery(field)}
        </FormSection>
    );

    const renderPhotoAndFileRow = (photoField: string) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-2">
                <FormInput
                    label="Photographs"
                    required={!Array.isArray(formData[photoField]) || formData[photoField].length === 0}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange(photoField)}
                    helperText="Only images allowed. Multiple uploads supported. (Max 5MB per file)"
                />
                {renderGallery(photoField)}
            </div>
            <div className="space-y-2">
                <FormInput
                    label="Upload File"
                    type="file"
                    onChange={handleFileChange('uploadFile')}
                    helperText="Upload supporting document (PDF, DOCX, etc.)"
                />
                {formData.uploadFile && (
                    <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100 flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                         File Selected
                         {typeof formData.uploadFile === 'string' && formData.uploadFile.length > 100 && " (Base64 ready)"}
                    </div>
                )}
            </div>
        </div>
    );

    // Normalize incoming photographs and uploadFile data when editing
    useEffect(() => {
        ['photographs', 'uploadFile'].forEach(field => {
            if (formData[field] && typeof formData[field] === 'string') {
                if (field === 'photographs' && (formData[field].startsWith('[') || formData[field].startsWith('{'))) {
                    try {
                        const parsed = JSON.parse(formData[field]);
                        const arrayToMap = Array.isArray(parsed) ? parsed : [parsed];
                        const normalized = arrayToMap.map((item: any) => {
                            if (typeof item === 'string') {
                                return { preview: item, image: item, caption: '' };
                            }
                            const url = item.image || item.url || item.path || item.preview || '';
                            return {
                                preview: url,
                                image: url,
                                caption: item.caption || ''
                            };
                        });
                        setFormData((prev: any) => ({ ...prev, [field]: normalized }));
                    } catch (e) {
                        console.error('Photo parsing error:', e);
                    }
                }
            }
        });
    }, [formData.photographs, setFormData]);

    // Format dates received from backend to YYYY-MM-DD for date inputs
    useEffect(() => {
        const dateFields = ['startDate', 'endDate', 'dateOfVisit', 'constitutionDate', 'meetingDate'];
        let updates: any = {};
        let hasChanges = false;

        dateFields.forEach(field => {
            if (formData[field] && typeof formData[field] === 'string' && formData[field].includes('T')) {
                const formattedDate = formData[field].split('T')[0];
                if (formData[field] !== formattedDate) {
                    updates[field] = formattedDate;
                    hasChanges = true;
                }
            }
        });

        // Special handling for type="month" inputs
        if (formData.monthYear && typeof formData.monthYear === 'string' && formData.monthYear.includes('-')) {
            const formattedMonth = formData.monthYear.substring(0, 7); // YYYY-MM
            if (formData.monthYear !== formattedMonth) {
                updates.monthYear = formattedMonth;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            setFormData((prev: any) => ({ ...prev, ...updates }));
        }
    }, [formData, setFormData]);

    const todayYmd = new Date().toISOString().slice(0, 10);
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_NICRA_BASIC && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Month & Year"
                            required
                            type="month"
                            value={formData.monthYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                        />
                        <div /> {/* Empty space for layout matching */}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">RF (mm) district</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Normal"
                                required
                                type="number"
                                value={formData.rfMmDistrictNormal ?? ''}
                                onChange={(e) => setFormData({ ...formData, rfMmDistrictNormal: e.target.value })}
                            />
                            <FormInput
                                label="Received"
                                required
                                type="number"
                                value={formData.rfMmDistrictReceived ?? ''}
                                onChange={(e) => setFormData({ ...formData, rfMmDistrictReceived: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Temperature OC</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Max."
                                required
                                type="number"
                                value={formData.maxTemperature ?? ''}
                                onChange={(e) => setFormData({ ...formData, maxTemperature: e.target.value })}
                            />
                            <FormInput
                                label="Min."
                                required
                                type="number"
                                value={formData.minTemperature ?? ''}
                                onChange={(e) => setFormData({ ...formData, minTemperature: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Dry spell/ drought</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="> 10 days"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.dry10 || ''}
                                onChange={(e) => setFormData({ ...formData, dry10: e.target.value })}
                            />
                            <FormInput
                                label="> 15 days"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.dry15 || ''}
                                onChange={(e) => setFormData({ ...formData, dry15: e.target.value })}
                            />
                            <FormInput
                                label="> 20 days"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.dry20 || ''}
                                onChange={(e) => setFormData({ ...formData, dry20: e.target.value })}
                            />
                            <FormInput
                                label="Intensive rain > 60 mm"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.intensiveRain || ''}
                                onChange={(e) => setFormData({ ...formData, intensiveRain: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Water depth (cm)"
                            required
                            type="number"
                            value={formData.waterDepth ?? ''}
                            onChange={(e) => setFormData({ ...formData, waterDepth: e.target.value })}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            min={formData.startDate || undefined}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NICRA_DETAILS && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormSelect
                            label="Category"
                            required
                            value={formData.categoryId || formData.nicraCategoryId || ''}
                            onChange={(e) => {
                                const categoryId = parseInt(e.target.value, 10)
                                setFormData({ ...formData, categoryId, nicraCategoryId: categoryId, subCategoryId: '' })
                            }}
                            options={categories.map((c: any) => ({
                                value: c.nicraCategoryId || c.id || c.categoryId,
                                label: c.categoryName
                            }))}
                        />
                        <DependentDropdown
                            label="Sub - Category"
                            required
                            value={formData.subCategoryId || formData.nicraSubCategoryId || ''}
                            dependsOn={{
                                value: formData.categoryId || formData.nicraCategoryId,
                                field: 'categoryId',
                            }}
                            options={[]}
                            emptyMessage="No subcategories available"
                            loadingMessage="Loading subcategories..."
                            onOptionsLoad={async (parentValue: any) => {
                                const selectedCategory = typeof parentValue === 'string' ? parseInt(parentValue, 10) : parentValue
                                return subCategories
                                    .filter((sc: any) => (sc.nicraCategoryId || sc.categoryId) === selectedCategory)
                                    .map((sc: any) => ({
                                        value: sc.nicraSubCategoryId || sc.id || sc.subCategoryId,
                                        label: sc.subCategoryName,
                                    }))
                            }}
                            onChange={(value) => {
                                const id = typeof value === 'number' ? value : parseInt(String(value), 10)
                                setFormData({ ...formData, subCategoryId: id })
                            }}
                        />
                        <FormInput
                            label="FST type"
                            required
                            value={formData.fstType ?? ''}
                            onChange={(e) => setFormData({ ...formData, fstType: e.target.value })}
                        />
                        <FormInput
                            label="Crop Name"
                            required
                            value={formData.cropName ?? ''}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Season"
                            required
                            value={formData.seasonId ?? ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value })}
                            options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                            emptyMessage="No seasons available"
                        />
                        <FormInput
                            label="Technology demonstrated"
                            required
                            value={formData.technologyDemonstrated ?? ''}
                            onChange={(e) => setFormData({ ...formData, technologyDemonstrated: e.target.value })}
                        />
                        <FormInput
                            label="Area (ha)/ Unit"
                            required
                            value={formData.areaOrUnit ?? ''}
                            onChange={(e) => setFormData({ ...formData, areaOrUnit: e.target.value })}
                        />
                        <FormInput
                            label="Yield (q/ ha)"
                            required
                            value={formData.yield ?? ''}
                            onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-gray-100">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Economics of demonstration (Rs/ha)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FormInput
                                label="Gross Cost"
                                required
                                type="number"
                                value={formData.grossCost ?? ''}
                                onChange={(e) => setFormData({ ...formData, grossCost: e.target.value })}
                            />
                            <FormInput
                                label="Net return"
                                required
                                type="number"
                                value={formData.netReturn ?? ''}
                                onChange={(e) => setFormData({ ...formData, netReturn: e.target.value })}
                            />
                            <FormInput
                                label="BCR ration"
                                required
                                type="number"
                                step="0.01"
                                value={formData.bcrRatio ?? ''}
                                onChange={(e) => setFormData({ ...formData, bcrRatio: e.target.value })}
                            />
                        </div>
                    </div>

                    {renderPhotoAndFileRow('photographs')}
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_TRAINING && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Title of the training course"
                            required
                            value={formData.trainingTitle ?? ''}
                            onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
                        />
                        <FormSelect
                            label="Campus Type"
                            required
                            value={formData.campusType ?? ''}
                            onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                            options={[
                                { value: 'ON_CAMPUS', label: 'On Campus' },
                                { value: 'OFF_CAMPUS', label: 'Off Campus' }
                            ]}
                            placeholder="Select"
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            min={formData.startDate || undefined}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormInput
                            label="Remark"
                            required
                            value={formData.remark ?? ''}
                            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_EXTENSION && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormInput
                            label="Activity Name"
                            required
                            value={formData.activityName ?? ''}
                            onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            min={formData.startDate || undefined}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue ?? ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_INTERVENTION && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            min={formData.startDate || undefined}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormSelect
                            label="Seed bank/Fodder bank"
                            required
                            value={formData.seedBankFodderBank ?? ''}
                            onChange={(e) => setFormData({ ...formData, seedBankFodderBank: e.target.value })}
                            options={seedBankFodderBanks.map((opt: any) => ({
                                value: opt.name,
                                label: opt.name,
                            }))}
                            placeholder="Select"
                        />
                        <FormInput
                            label="Crop"
                            required
                            value={formData.crop ?? ''}
                            onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                        />
                        <FormInput
                            label="Variety"
                            required
                            value={formData.variety ?? ''}
                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        />
                        <FormInput
                            label="Quantity in (q)"
                            required
                            type="number"
                            value={formData.quantityQ ?? ''}
                            onChange={(e) => setFormData({ ...formData, quantityQ: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_REVENUE && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormInput
                            label="Revenue"
                            required
                            type="number"
                            value={formData.revenue ?? ''}
                            onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_CUSTOM_HIRING && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ? formData.reportingYear.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                            min={formData.startDate || undefined}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormInput
                            label="Name of farm implement/ equipment"
                            required
                            value={formData.nameOfFarmImplement ?? ''}
                            onChange={(e) => setFormData({ ...formData, nameOfFarmImplement: e.target.value })}
                        />
                        <FormInput
                            label="Area covered by Farm Implement"
                            required
                            type="number"
                            value={formData.areaCovered ?? ''}
                            onChange={(e) => setFormData({ ...formData, areaCovered: e.target.value })}
                        />
                        <FormInput
                            label="Farm Implement used (In Hours)"
                            required
                            type="number"
                            value={formData.farmImplementUsedHours ?? ''}
                            onChange={(e) => setFormData({ ...formData, farmImplementUsedHours: e.target.value })}
                        />
                        <FormInput
                            label="Revenue generated by Farm Implement (Rs.)"
                            required
                            type="number"
                            value={formData.revenueGeneratedRs ?? ''}
                            onChange={(e) => setFormData({ ...formData, revenueGeneratedRs: e.target.value })}
                        />
                        <FormInput
                            label="Expenditure Incurred on repairing (Rs.)"
                            required
                            type="number"
                            value={formData.expenditureIncurredRepairingRs ?? ''}
                            onChange={(e) => setFormData({ ...formData, expenditureIncurredRepairingRs: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {renderPhotoFields('photographs')}
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_VCRMC && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormInput
                            label="Village name"
                            required
                            value={formData.villageName ?? ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                        />
                        <FormInput
                            label="Constitution Date"
                            required
                            type="date"
                            value={formData.constitutionDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, constitutionDate: e.target.value })}
                        />
                        <FormInput
                            label="Meetings organized by VCRMC (no.)"
                            required
                            type="number"
                            value={formData.meetingsOrganized ?? ''}
                            onChange={(e) => setFormData({ ...formData, meetingsOrganized: e.target.value })}
                        />
                        <FormInput
                            label="Meeting Date"
                            required
                            type="date"
                            value={formData.meetingDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                        />
                        <FormInput
                            label="Name of Secretary"
                            required
                            value={formData.nameOfSecretary ?? ''}
                            onChange={(e) => setFormData({ ...formData, nameOfSecretary: e.target.value })}
                        />
                        <FormInput
                            label="Name of President"
                            required
                            value={formData.nameOfPresident ?? ''}
                            onChange={(e) => setFormData({ ...formData, nameOfPresident: e.target.value })}
                        />
                        <FormInput
                            label="Major decision taken"
                            required
                            value={formData.majorDecisionTaken ?? ''}
                            onChange={(e) => setFormData({ ...formData, majorDecisionTaken: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">VCRMC members (no.)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Male"
                                required
                                type="number"
                                value={formData.maleMembers ?? ''}
                                onChange={(e) => setFormData({ ...formData, maleMembers: e.target.value })}
                            />
                            <FormInput
                                label="Female"
                                required
                                type="number"
                                value={formData.femaleMembers ?? ''}
                                onChange={(e) => setFormData({ ...formData, femaleMembers: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {renderPhotoFields('photographs')}
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_SOIL_HEALTH && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            min={formData.startDate || undefined}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormInput
                            label="No. of Soil Samples Collected"
                            required
                            type="number"
                            value={formData.noOfSoilSamplesCollected ?? ''}
                            onChange={(e) => setFormData({ ...formData, noOfSoilSamplesCollected: e.target.value })}
                        />
                        <FormInput
                            label="No. of Samples Analysed"
                            required
                            type="number"
                            value={formData.noOfSamplesAnalysed ?? ''}
                            onChange={(e) => setFormData({ ...formData, noOfSamplesAnalysed: e.target.value })}
                        />
                        <FormInput
                            label="SHC Issued"
                            required
                            type="number"
                            value={formData.shcIssued ?? ''}
                            onChange={(e) => setFormData({ ...formData, shcIssued: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            {/* <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            /> */}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {renderPhotoFields('photographs')}
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_CONVERGENCE && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            min={formData.startDate || undefined}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormInput
                            label="Development Scheme/Programme"
                            required
                            value={formData.developmentSchemeProgramme ?? ''}
                            onChange={(e) => setFormData({ ...formData, developmentSchemeProgramme: e.target.value })}
                        />
                        <FormInput
                            label="Nature of work"
                            required
                            value={formData.natureOfWork ?? ''}
                            onChange={(e) => setFormData({ ...formData, natureOfWork: e.target.value })}
                        />
                        <FormInput
                            label="Amount (Rs)"
                            required
                            type="number"
                            value={formData.amountRs ?? ''}
                            onChange={(e) => setFormData({ ...formData, amountRs: e.target.value })}
                        />
                        <div className="pt-2">
                            {renderPhotoFields('photographs')}
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_DIGNITARIES && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Date of Visit"
                            required
                            type="date"
                            value={formData.dateOfVisit ?? ''}
                            onChange={(e) => setFormData({ ...formData, dateOfVisit: e.target.value })}
                        />
                        <FormSelect
                            label="Type"
                            required
                            value={formData.dignitaryTypeId || formData.type || ''}
                            onChange={(e) => {
                                const val = e.target.value
                                const parsed = parseInt(val, 10)
                                if (!isNaN(parsed)) {
                                    setFormData({ ...formData, dignitaryTypeId: parsed, type: '' })
                                } else {
                                    setFormData({ ...formData, type: val, dignitaryTypeId: '' })
                                }
                            }}
                            options={dignitaryTypes.map((t: any) => ({
                                value: t.nicraDignitaryTypeId,
                                label: t.name,
                            }))}
                            placeholder="Select"
                        />
                        <FormInput
                            label="Name"
                            required
                            value={formData.name ?? ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <FormInput
                            label="Remark"
                            required
                            value={formData.remark ?? ''}
                            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        />
                        {renderPhotoFields('photographs')}
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_PI_COPI && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormSelect
                            label="Type"
                            required
                            value={formData.piTypeId || formData.type || ''}
                            onChange={(e) => {
                                const val = e.target.value
                                const parsed = parseInt(val, 10)
                                if (!isNaN(parsed)) {
                                    setFormData({ ...formData, piTypeId: parsed, type: '' })
                                } else {
                                    setFormData({ ...formData, type: val, piTypeId: '' })
                                }
                            }}
                            options={(piTypes || []).map((t: any) => ({
                                value: t.nicraPiTypeId,
                                label: t.name,
                            }))}
                            placeholder="Select"
                        />
                        <FormInput
                            label="Name"
                            required
                            value={formData.name ?? ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
