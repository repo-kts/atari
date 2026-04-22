import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from './shared/FormComponents'
import { State, District, Organization, University } from '@/types/masterData'
import { useMasterData } from '@/hooks/useMasterData'
import { useAuth } from '@/contexts/AuthContext'
import { X } from 'lucide-react'
import {
    useSanctionedPosts,
    useInfraMasters,
    useKvkVehiclesForDropdown,
    useKvkEquipmentsForDropdown,
    useVehiclePresentStatuses,
    useEquipmentPresentStatuses,
    enumToOptions,
    AccountTypeEnum,
    ImplementPresentStatusEnum
} from '@/hooks/forms/useAboutKvkData'
import { useStaffCategories, usePayLevels, useDisciplines } from '@/hooks/useOtherMastersData'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import { masterDataApi } from '@/services/masterDataApi'
import { useUniversityHostFields } from '@/hooks/useUniversityHostFields'
import { cleanIndianMobileInput } from '@/utils/indianPhone'

interface AboutKvkFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const AboutKvkForms: React.FC<AboutKvkFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {

    const { data: zones = [] } = useMasterData('zones')
    const { user } = useAuth()


    // Fetch About KVK master data
    const { data: sanctionedPosts = [] } = useSanctionedPosts()
    const { data: disciplines = [] } = useDisciplines()
    const { data: infraMasters = [] } = useInfraMasters()
    const { data: staffCategories = [] } = useStaffCategories()
    const { data: payLevels = [] } = usePayLevels()

    const activeKvkId = user?.kvkId || formData.kvkId;
    const reportingYear = formData.reportingYear ? new Date(formData.reportingYear).toISOString() : undefined
    const { data: vehicles = [] } = useKvkVehiclesForDropdown(activeKvkId, reportingYear)
    const { data: equipments = [] } = useKvkEquipmentsForDropdown(activeKvkId, reportingYear)
    const { data: vehicleStatuses = [] } = useVehiclePresentStatuses()
    const { data: equipmentStatuses = [] } = useEquipmentPresentStatuses()

    // Sync kvkId from user when KVK role - use functional update to avoid dependency on formData
    React.useEffect(() => {
        if (user?.kvkId) {
            setFormData((prev: any) => (prev.kvkId ? prev : { ...prev, kvkId: user.kvkId }))
        }
    }, [user?.kvkId])

    // Extract nested IDs from related objects when editing (for select fields)
    // Use functional update to avoid dependency on formData which causes infinite loops
    React.useEffect(() => {
        if (entityType === ENTITY_TYPES.KVK_EMPLOYEES || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) {
            setFormData((prev: any) => {
                const updates: any = {}
                if (prev.sanctionedPost?.sanctionedPostId && !prev.sanctionedPostId) {
                    updates.sanctionedPostId = prev.sanctionedPost.sanctionedPostId
                }
                if (prev.discipline?.disciplineId && !prev.disciplineId) {
                    updates.disciplineId = prev.discipline.disciplineId
                }
                if (prev.kvk?.kvkId && !prev.kvkId) {
                    updates.kvkId = prev.kvk.kvkId
                }
                if (Object.keys(updates).length === 0) return prev
                return { ...prev, ...updates }
            })
        } else if (entityType === ENTITY_TYPES.KVKS) {
            // Extract districtId and orgId from nested objects when editing KVK
            setFormData((prev: any) => {
                const updates: any = {}
                if (prev.district?.state?.zone?.zoneId && !prev.zoneId) {
                    updates.zoneId = prev.district.state.zone.zoneId
                }
                if (prev.district?.state?.stateId && !prev.stateId) {
                    updates.stateId = prev.district.state.stateId
                }
                if (prev.district?.districtId && !prev.districtId) {
                    updates.districtId = prev.district.districtId
                }
                if (prev.org?.orgId && !prev.orgId) {
                    updates.orgId = prev.org.orgId
                }
                if (prev.university?.universityId && !prev.universityId) {
                    updates.universityId = prev.university.universityId
                }
                if (Object.keys(updates).length === 0) return prev
                return { ...prev, ...updates }
            })
        }
    }, [entityType, setFormData])

    // Normalize incoming photoPath for KVK Employees/Staff
    React.useEffect(() => {
        if (entityType === ENTITY_TYPES.KVK_EMPLOYEES || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) {
            const field = 'photoPath';
            if (formData[field] && typeof formData[field] === 'string') {
                if (formData[field].startsWith('[') || formData[field].startsWith('{')) {
                    try {
                        const parsed = JSON.parse(formData[field]);
                        const arrayToMap = Array.isArray(parsed) ? parsed : [parsed];
                        const normalized = arrayToMap.map((item: any) => {
                            if (typeof item === 'string') {
                                return { preview: item, image: item, caption: '' };
                            }
                            const url = item.image || item.url || item.path || item.preview || '';
                            return { preview: url, image: url, caption: item.caption || '' };
                        });
                        setFormData((prev: any) => ({ ...prev, [field]: normalized }));
                    } catch (e) {
                        console.error('Photo parsing error:', e);
                    }
                } else if (formData[field].trim() !== '') {
                    const normalized = [{ preview: formData[field].trim(), image: formData[field].trim(), caption: '' }];
                    setFormData((prev: any) => ({ ...prev, [field]: normalized }));
                }
            }
        }
    }, [formData.kvkStaffId, formData.id, entityType, setFormData]);
    // Autofill host fields from selected University
    const selectedUniversityId = typeof formData.universityId === 'number' ? formData.universityId : undefined
    const { data: uniHost } = useUniversityHostFields(selectedUniversityId)

    React.useEffect(() => {
        if (selectedUniversityId && uniHost) {
            setFormData((prev: any) => ({
                ...prev,
                universityName: uniHost.universityName || prev.universityName || '',
                hostOrg: uniHost.hostOrg || '',
                hostMobile: uniHost.hostMobile || '',
                hostLandline: uniHost.hostLandline || '',
                hostFax: uniHost.hostFax || '',
                hostEmail: uniHost.hostEmail || '',
                hostAddress: uniHost.hostAddress || '',
            }))
        } else if (!selectedUniversityId) {
            setFormData((prev: any) => ({
                ...prev,
                universityName: '',
                hostOrg: '',
                hostMobile: '',
                hostLandline: '',
                hostFax: '',
                hostEmail: '',
                hostAddress: '',
            }))
        }
    }, [selectedUniversityId, uniHost?.universityName, uniHost?.hostOrg, uniHost?.hostMobile, uniHost?.hostLandline, uniHost?.hostFax, uniHost?.hostEmail, uniHost?.hostAddress, setFormData])

    if (!entityType) return null


    return (
        <div className="space-y-4">
            {entityType === ENTITY_TYPES.KVK_BANK_ACCOUNTS && (
                <>
                    <FormSelect
                        label="Account Type"
                        required
                        value={formData.accountType ?? ''}
                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                        options={enumToOptions(AccountTypeEnum)}
                    />
                    <FormInput
                        label="Account Name"
                        required
                        value={formData.accountName ?? ''}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        placeholder="Enter account name"
                    />
                    <FormInput
                        label="Bank Name"
                        required
                        value={formData.bankName ?? ''}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="Enter bank name"
                    />
                    <FormInput
                        label="Account Number"
                        required
                        value={formData.accountNumber ?? ''}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="Enter account number"
                    />
                    <FormInput
                        label="Location"
                        required
                        value={formData.location ?? ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter branch location"
                    />
                </>
            )}

            {(entityType === ENTITY_TYPES.KVK_EMPLOYEES) && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Sanctioned Post"
                            required
                            value={formData.sanctionedPostId ?? ''}
                            onChange={(e) => setFormData({ ...formData, sanctionedPostId: parseInt(e.target.value) })}
                            options={sanctionedPosts.map((p: any) => ({ value: p.sanctionedPostId, label: p.postName }))}
                        />
                        <FormInput
                            label="Staff Name"
                            required
                            value={formData.staffName ?? ''}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            placeholder="Enter staff name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Position Order"
                            required
                            value={formData.positionOrder ?? ''}
                            onChange={(e) => setFormData({ ...formData, positionOrder: parseInt(e.target.value) })}
                            placeholder="Position Order"
                        />
                        <FormInput
                            label="Mobile"
                            required
                            value={formData.mobile ?? ''}
                            onChange={(e) =>
                                setFormData({ ...formData, mobile: cleanIndianMobileInput(e.target.value) })
                            }
                            placeholder="10-digit mobile"
                            inputMode="numeric"
                            autoComplete="tel"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Email"
                            type="email"
                            value={formData.email ?? ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Email address"
                        />
                        <FormSelect
                            label="Pay Level"
                            value={formData.payLevelId ?? ''}
                            onChange={(e) => setFormData({ ...formData, payLevelId: e.target.value ? parseInt(e.target.value) : null })}
                            options={payLevels.map((p: any) => ({ value: p.payLevelId, label: p.levelName }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Pay Scale"
                            value={formData.payScale ?? ''}
                            onChange={(e) => setFormData({ ...formData, payScale: e.target.value })}
                            placeholder="e.g., 15600-39100"
                        />
                        <FormSelect
                            label="Discipline"
                            required
                            value={formData.disciplineId ?? ''}
                            onChange={(e) => setFormData({ ...formData, disciplineId: parseInt(e.target.value) })}
                            options={disciplines.map((d: any) => ({ value: d.disciplineId, label: d.disciplineName }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Date of Birth"
                            required
                            type="date"
                            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: new Date(e.target.value).toISOString() })}
                        />
                        <FormInput
                            label="Date of Joining"
                            required
                            type="date"
                            value={formData.dateOfJoining ? new Date(formData.dateOfJoining).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, dateOfJoining: new Date(e.target.value).toISOString() })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Job Type"
                            value={formData.jobType ?? ''}
                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value || '' })}
                            options={[
                                { value: 'PERMANENT', label: 'Permanent' },
                                { value: 'TEMPORARY', label: 'Temporary' }
                            ]}
                        />
                        <FormInput
                            label="Details of Allowances"
                            value={formData.allowances ?? ''}
                            onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                            placeholder="Allowances"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Category"
                            required
                            value={formData.staffCategoryId ?? ''}
                            onChange={(e) => setFormData({ ...formData, staffCategoryId: parseInt(e.target.value) })}
                            options={staffCategories.map((c: any) => ({ value: c.staffCategoryId, label: c.categoryName }))}
                        />
                        <FormInput
                            label="Resume"
                            value={formData.resumePath ?? ''}
                            onChange={(e) => setFormData({ ...formData, resumePath: e.target.value })}
                            placeholder="Resume link"
                        />
                        <FormSection title="Staff Photos" className="mt-2" noGrid={true}>
                            <FormInput
                                label=""
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e: any) => {
                                    const files = e.target.files;
                                    if (!files || files.length === 0) return;
                                    const readers: Promise<any>[] = Array.from(files).map((file) => {
                                        return new Promise((resolve) => {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                resolve({
                                                    preview: reader.result as string,
                                                    image: reader.result as string,
                                                    caption: ''
                                                });
                                            };
                                            reader.readAsDataURL(file as unknown as Blob);
                                        });
                                    });

                                    Promise.all(readers).then((newPhotos) => {
                                        setFormData((prev: any) => {
                                            const currentPhotos = Array.isArray(prev.photoPath) ? [...prev.photoPath] : [];
                                            return { ...prev, photoPath: [...currentPhotos, ...newPhotos] };
                                        });
                                    });
                                }}
                                helperText="Only images allowed. Uploading new files will be added to the list. Only the first image uploaded will appear in the table. (Max 2MB per file)"
                            />

                            {/* Existing photo gallery rendering */}
                            {Array.isArray(formData.photoPath) && formData.photoPath.length > 0 && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                                    {formData.photoPath.map((item: any, idx: number) => {
                                        const src = item.preview || (typeof item.image === 'string' ? (item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || ''}${item.image.startsWith('/') ? '' : '/'}${item.image}`) : '');
                                        return (
                                            <div key={idx} className="relative bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-col group">
                                                <div className="relative aspect-square mb-2 overflow-hidden rounded-lg border border-gray-50">
                                                    <img
                                                        src={src}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        alt={`Staff ${idx + 1}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData((prev: any) => {
                                                                const photos = [...(Array.isArray(prev.photoPath) ? prev.photoPath : [])];
                                                                photos.splice(idx, 1);
                                                                return { ...prev, photoPath: photos.length > 0 ? photos : null };
                                                            });
                                                        }}
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
                                                        onChange={(e) => {
                                                            setFormData((prev: any) => {
                                                                const photos = [...(Array.isArray(prev.photoPath) ? prev.photoPath : [])];
                                                                if (photos[idx]) {
                                                                    photos[idx] = { ...photos[idx], caption: e.target.value };
                                                                }
                                                                return { ...prev, photoPath: photos };
                                                            });
                                                        }}
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </FormSection>

                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.KVK_INFRASTRUCTURE && (
                <div className="space-y-4">
                    <FormSelect
                        label="Name of Infrastructure"
                        required
                        value={formData.infraMasterId ?? ''}
                        onChange={(e) => setFormData({ ...formData, infraMasterId: parseInt(e.target.value) })}
                        options={infraMasters.map((i: any) => ({ value: i.infraMasterId, label: i.name }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Completed upto plinth level"
                            required
                            value={formData.completedPlinthLevel !== undefined ? (formData.completedPlinthLevel ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, completedPlinthLevel: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                        <FormSelect
                            label="Completed upto lintel level"
                            required
                            value={formData.completedLintelLevel !== undefined ? (formData.completedLintelLevel ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, completedLintelLevel: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Completed upto roof level"
                            required
                            value={formData.completedRoofLevel !== undefined ? (formData.completedRoofLevel ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, completedRoofLevel: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                        <FormSelect
                            label="Not Yet Started"
                            required
                            value={formData.notYetStarted !== undefined ? (formData.notYetStarted ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, notYetStarted: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Totally Completed"
                            required
                            value={formData.totallyCompleted !== undefined ? (formData.totallyCompleted ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, totallyCompleted: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                        <FormInput
                            label="Plinth Area (m²)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.plinthAreaSqM ?? ''}
                            onChange={(e) => setFormData({ ...formData, plinthAreaSqM: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Under use or not"
                            required
                            value={formData.underUse !== undefined ? (formData.underUse ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, underUse: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                        <FormInput
                            label="Source of Funding"
                            required
                            value={formData.sourceOfFunding ?? ''}
                            onChange={(e) => setFormData({ ...formData, sourceOfFunding: e.target.value })}
                            placeholder="Enter source of funding"
                        />
                    </div>
                </div>
            )}

            {(entityType === ENTITY_TYPES.KVK_VEHICLES) && (
                <div className="space-y-4">
                    <FormInput
                        label="Vehicle Name"
                        required
                        value={formData.vehicleName ?? ''}
                        onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                        placeholder="Enter vehicle name"
                    />
                    <FormInput
                        label="Registration No."
                        required
                        value={formData.registrationNo ?? ''}
                        onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                        placeholder="Enter registration number"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Purchase Year"
                            required
                            type="number"
                            value={formData.yearOfPurchase ?? ''}
                            onChange={(e) => setFormData({ ...formData, yearOfPurchase: parseInt(e.target.value) })}
                        />
                        <FormInput
                            label="Total Cost (Rs.)"
                            type="number"
                            value={formData.totalCost ?? ''}
                            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                </div>
            )}

            {(entityType === ENTITY_TYPES.KVK_EQUIPMENTS) && (
                <div className="space-y-4">
                    <FormInput
                        label={"Equipment Name"}
                        required
                        value={formData.equipmentName ?? ''}
                        onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                        placeholder="Enter name"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Purchase Year"
                            required
                            type="number"
                            value={formData.yearOfPurchase ?? ''}
                            onChange={(e) => setFormData({ ...formData, yearOfPurchase: parseInt(e.target.value) })}
                        />
                        <FormInput
                            label="Total Cost (Rs.)"
                            required
                            type="number"
                            value={formData.totalCost ?? ''}
                            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Source of Funding"
                            required
                            value={formData.sourceOfFunding ?? ''}
                            onChange={(e) => setFormData({ ...formData, sourceOfFunding: e.target.value })}
                            placeholder="Enter source"
                        />
                    </div>
                </div>
            )}


            {/* Vehicle Details Form */}
            {entityType === ENTITY_TYPES.KVK_VEHICLE_DETAILS && (
                <div className="space-y-4">
                    <FormInput
                        label="Reporting Year Date"
                        required
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.reportingYear ? new Date(formData.reportingYear).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, reportingYear: value ? new Date(value).toISOString() : '' })
                        }}
                    />
                    <FormSelect
                        label="Vehicle"
                        required
                        value={formData.vehicleId ?? ''}
                        onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
                        disabled={!formData.reportingYear}
                        options={vehicles.map((v: any) => ({ value: v.vehicleId, label: v.vehicleName }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Total Run (km)"
                            required
                            value={formData.totalRun ?? ''}
                            onChange={(e) => setFormData({ ...formData, totalRun: e.target.value })}
                            placeholder="Enter total run"
                        />
                        <FormSelect
                            label="Present Status"
                            required
                            value={formData.vehicleStatusId ?? ''}
                            onChange={(e) => setFormData({ ...formData, vehicleStatusId: parseInt(e.target.value) })}
                            options={vehicleStatuses.map((status: any) => ({ value: status.vehicleStatusId, label: status.statusLabel }))}
                        />
                    </div>
                    <FormInput
                        label="Repairing Cost (Rs.)"
                        type="number"
                        value={formData.repairingCost ?? ''}
                        onChange={(e) => setFormData({ ...formData, repairingCost: parseFloat(e.target.value) })}
                        placeholder="Enter repairing cost (optional)"
                    />
                    <FormInput
                        label="Source of Funding"
                        value={formData.sourceOfFunding ?? ''}
                        onChange={(e) => setFormData({ ...formData, sourceOfFunding: e.target.value })}
                        placeholder="Enter source of funding"
                    />
                </div>
            )}

            {/* Equipment Details Form */}
            {entityType === ENTITY_TYPES.KVK_EQUIPMENT_DETAILS && (
                <div className="space-y-4">
                    <FormInput
                        label="Reporting Year Date"
                        required
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.reportingYear ? new Date(formData.reportingYear).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, reportingYear: value ? new Date(value).toISOString() : '' })
                        }}
                    />
                    <FormSelect
                        label="Equipment"
                        required
                        value={formData.equipmentId ?? ''}
                        onChange={(e) => setFormData({ ...formData, equipmentId: parseInt(e.target.value) })}
                        disabled={!formData.reportingYear}
                        options={equipments.map((eq: any) => ({ value: eq.equipmentId, label: eq.equipmentName }))}
                    />
                    <FormSelect
                        label="Present Status"
                        required
                        value={formData.equipmentStatusId ?? ''}
                        onChange={(e) => setFormData({ ...formData, equipmentStatusId: parseInt(e.target.value) })}
                        options={equipmentStatuses.map((status: any) => ({ value: status.equipmentStatusId, label: status.statusLabel }))}
                    />
                    <FormInput
                        label="Source of Funding"
                        value={formData.sourceOfFunding ?? ''}
                        onChange={(e) => setFormData({ ...formData, sourceOfFunding: e.target.value })}
                        placeholder="Enter source of funding"
                    />
                </div>
            )}

            {/* Farm Implements Form */}
            {entityType === ENTITY_TYPES.KVK_FARM_IMPLEMENTS && (
                <div className="space-y-4">
                    <FormInput
                        label="Name of Implement"
                        required
                        value={formData.implementName ?? ''}
                        onChange={(e) => setFormData({ ...formData, implementName: e.target.value })}
                        placeholder="Enter implement name"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Year of Purchase"
                            required
                            type="number"
                            value={formData.yearOfPurchase ?? ''}
                            onChange={(e) => setFormData({ ...formData, yearOfPurchase: parseInt(e.target.value) })}
                        />
                        <FormInput
                            label="Total Cost (Rs.)"
                            required
                            type="number"
                            value={formData.totalCost ?? ''}
                            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Present Status"
                            required
                            value={formData.presentStatus ?? ''}
                            onChange={(e) => setFormData({ ...formData, presentStatus: e.target.value || '' })}
                            options={enumToOptions(ImplementPresentStatusEnum)}
                        />
                        <FormInput
                            label="Source of Fund"
                            required
                            value={formData.sourceOfFund ?? ''}
                            onChange={(e) => setFormData({ ...formData, sourceOfFund: e.target.value })}
                            placeholder="Enter source of fund"
                        />
                    </div>
                </div>
            )}
            {/* Land Details Form */}
            {entityType === ENTITY_TYPES.KVK_LAND_DETAILS && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Item"
                            required
                            value={formData.item ?? ''}
                            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                            placeholder="e.g. Main Farm"
                        />
                        <FormInput
                            label="Area (Ha)"
                            type="number"
                            step="any"
                            required
                            value={formData.areaHa ?? ''}
                            onChange={(e) =>
                                setFormData({ ...formData, areaHa: e.target.value === '' ? '' : parseFloat(e.target.value) })
                            }
                            placeholder="0.00"
                        />
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.KVKS && (
                <div className="space-y-6">
                    <FormSection title="KVK General Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <FormInput
                                    label="Name of KVK"
                                    required
                                    value={formData.kvkName ?? ''}
                                    onChange={(e) => setFormData({ ...formData, kvkName: e.target.value })}
                                    placeholder="Enter KVK name"
                                />
                            </div>
                            <FormInput
                                label="Year of Sanction"
                                type="date"
                                required
                                value={formData.yearOfSanctionDate ?? (formData.yearOfSanction ? `${formData.yearOfSanction}-01-01` : '')}
                                onChange={(e) => {
                                    const raw = e.target.value
                                    const year = raw ? new Date(raw).getFullYear() : ''
                                    setFormData({
                                        ...formData,
                                        yearOfSanctionDate: raw,
                                        yearOfSanction: typeof year === 'number' && !Number.isNaN(year) ? year : '',
                                    })
                                }}
                                placeholder="Select date"
                            />
                            <div className="md:col-span-1 lg:col-span-2">
                                <FormInput
                                    label="E-mail"
                                    type="email"
                                    required
                                    value={formData.email ?? ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <FormInput
                                label="Mobile Number"
                                required
                                value={formData.mobile ?? ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, mobile: cleanIndianMobileInput(e.target.value) })
                                }
                                placeholder="10-digit mobile"
                                inputMode="numeric"
                                autoComplete="tel"
                            />
                            <FormInput
                                label="Fax"
                                value={formData.fax ?? ''}
                                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                                placeholder="Enter fax"
                            />
                            <FormInput
                                label="Landline"
                                value={formData.landline ?? ''}
                                onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                                placeholder="Enter landline"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <FormSelect
                                label="Zone"
                                required
                                value={formData.zoneId ?? ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    zoneId: parseInt(e.target.value),
                                    stateId: '',
                                    districtId: '',
                                    orgId: '',
                                    universityId: '',
                                })}
                                options={(zones as any).map((z: any) => ({ value: z.zoneId, label: z.zoneName }))}
                            />
                            <DependentDropdown
                                label="State"
                                required
                                value={formData.stateId ?? ''}
                                onChange={(value) => setFormData({
                                    ...formData,
                                    stateId: value === '' ? '' : Number(value),
                                    districtId: '',
                                    orgId: '',
                                    universityId: '',
                                })}
                                options={[]}
                                dependsOn={{ value: formData.zoneId, field: 'zoneId' }}
                                onOptionsLoad={async (zoneId, signal) => {
                                    const response = await masterDataApi.getStatesByZone(Number(zoneId), signal)
                                    return response.data.map((s: State) => ({
                                        value: s.stateId,
                                        label: s.stateName,
                                    }))
                                }}
                                cacheKey="about-kvk-states-by-zone"
                            />
                            <DependentDropdown
                                label="District"
                                required
                                value={formData.districtId ?? ''}
                                onChange={(value) => {
                                    const districtId = value === '' ? '' : Number(value)
                                    setFormData({ ...formData, districtId, orgId: '', universityId: '' })
                                }}
                                options={[]}
                                dependsOn={[
                                    { value: formData.zoneId, field: 'zoneId' },
                                    { value: formData.stateId, field: 'stateId' },
                                ]}
                                onOptionsLoad={async (dependencyValues: any, signal) => {
                                    const stateId = Number(dependencyValues?.stateId)
                                    const response = await masterDataApi.getDistrictsByState(stateId, signal)
                                    return response.data.map((d: District) => ({
                                        value: d.districtId,
                                        label: d.districtName,
                                    }))
                                }}
                                cacheKey="about-kvk-districts-by-zone-state"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <DependentDropdown
                                label="Institute"
                                required
                                value={formData.orgId ?? ''}
                                onChange={(value) => {
                                    const orgId = value === '' ? '' : Number(value)
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        orgId,
                                        org: undefined,
                                        universityId: ''
                                    }))
                                }}
                                options={
                                    formData.orgId && formData.org?.orgName
                                        ? [{ value: formData.orgId, label: formData.org.orgName }]
                                        : []
                                }
                                dependsOn={[
                                    { value: formData.zoneId, field: 'zoneId' },
                                    { value: formData.stateId, field: 'stateId' },
                                    { value: formData.districtId, field: 'districtId' },
                                ]}
                                onOptionsLoad={async (dependencyValues: any, signal) => {
                                    const districtId = Number(dependencyValues?.districtId)
                                    const response = await masterDataApi.getOrganizationsByDistrict(districtId, signal)
                                    return response.data.map((org: Organization) => ({
                                        value: org.orgId,
                                        label: org.orgName,
                                    }))
                                }}
                                cacheKey="about-kvk-organizations-by-zone-state-district"
                            />
                            <DependentDropdown
                                label="Host"
                                required
                                value={formData.universityId ?? ''}
                                onChange={(value) => setFormData((prev: any) => ({
                                    ...prev,
                                    universityId: value === '' ? '' : Number(value),
                                    university: undefined
                                }))}
                                options={
                                    formData.universityId && formData.university?.universityName
                                        ? [{ value: formData.universityId, label: formData.university.universityName }]
                                        : []
                                }
                                dependsOn={[
                                    { value: formData.zoneId, field: 'zoneId' },
                                    { value: formData.stateId, field: 'stateId' },
                                    { value: formData.districtId, field: 'districtId' },
                                    { value: formData.orgId, field: 'orgId' },
                                ]}
                                onOptionsLoad={async (dependencyValues: any, signal) => {
                                    const orgId = Number(dependencyValues?.orgId)
                                    const response = await masterDataApi.getUniversitiesByOrganization(orgId, signal)
                                    return response.data.map((u: University) => ({
                                        value: u.universityId,
                                        label: u.universityName,
                                    }))
                                }}
                                cacheKey="about-kvk-universities-by-zone-state-district-org"
                            />
                        </div>

                        <div className="mt-4">
                            <FormTextArea
                                label="KVK Address"
                                required
                                value={formData.address ?? ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                                placeholder="Enter complete address"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Host Organization Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="md:col-span-3">
                                <FormInput
                                    label="Host Organization Name"
                                    required
                                    value={formData.universityName ?? ''}
                                    onChange={() => {}}
                                    readOnly
                                    disabled
                                    helperText={!selectedUniversityId ? 'Select Host to populate host details' : undefined}
                                    placeholder="Populated from host (host organisation)"
                                />
                            </div>
                            <FormInput
                                label="Mobile Number"
                                value={formData.hostMobile ?? ''}
                                onChange={() => {}}
                                readOnly
                                disabled
                                helperText={!selectedUniversityId ? 'Select Host to populate host details' : undefined}
                                placeholder="+91"
                            />
                            <FormInput
                                label="Landline"
                                value={formData.hostLandline ?? ''}
                                onChange={() => {}}
                                readOnly
                                disabled
                                helperText={!selectedUniversityId ? 'Select Host to populate host details' : undefined}
                                placeholder="Enter landline"
                            />
                            <FormInput
                                label="Fax"
                                value={formData.hostFax ?? ''}
                                onChange={() => {}}
                                readOnly
                                disabled
                                helperText={!selectedUniversityId ? 'Select Host to populate host details' : undefined}
                                placeholder="Enter fax"
                            />
                            <div className="md:col-span-3">
                                <FormInput
                                    label="E-mail"
                                    type="email"
                                    value={formData.hostEmail ?? ''}
                                    onChange={() => {}}
                                    readOnly
                                    disabled
                                    helperText={!selectedUniversityId ? 'Select Host to populate host details' : undefined}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <FormTextArea
                                    label="Host Address"
                                    value={formData.hostAddress ?? ''}
                                    onChange={() => {}}
                                    readOnly
                                    disabled
                                    rows={2}
                                    placeholder="Enter complete address"
                                />
                            </div>
                        </div>
                    </FormSection>

                </div>
            )}
        </div>
    )
}
