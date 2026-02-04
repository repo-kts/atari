import React from 'react'
import { X } from 'lucide-react'
import { useMasterData } from '../../../hooks/useMasterData'
import type { Zone, State, EntityType } from '../../../types/masterData'
import {
    useOftSubjects,
    useSectors,
    useFldCategories,
    useFldSubcategories,
    useSeasons,
    useCropTypes,
} from '../../../hooks/useOftFldData'
import {
    useTrainingTypes,
    useTrainingAreas,
} from '../../../hooks/useTrainingExtensionEventsData'

// Extended entity type for OFT/FLD masters and Training/Extension/Events
type ExtendedEntityType = EntityType | 'oft-subjects' | 'oft-thematic-areas' | 'fld-sectors' | 'fld-thematic-areas' | 'fld-categories' | 'fld-subcategories' | 'fld-crops' | 'cfld-crops' | 'training-types' | 'training-areas' | 'training-thematic-areas' | 'extension-activities' | 'other-extension-activities' | 'events'

interface MasterDataModalProps {
    entityType: ExtendedEntityType | null
    title: string
    formData: any
    setFormData: (data: any) => void
    onSave: () => void
    onClose: () => void
}

export function MasterDataModal({
    entityType,
    title,
    formData,
    setFormData,
    onSave,
    onClose,
}: MasterDataModalProps) {
    // Basic master data hooks
    const { data: zones } = useMasterData<Zone>('zones')
    const { data: states } = useMasterData<State>('states')

    // OFT/FLD master data hooks for dropdowns
    const { data: oftSubjects = [] } = useOftSubjects()
    const { data: fldSectors = [] } = useSectors()
    const { data: fldCategories = [] } = useFldCategories()
    const { data: fldSubcategories = [] } = useFldSubcategories()
    const { data: seasons = [] } = useSeasons()
    const { data: cropTypes = [] } = useCropTypes()

    // Training, Extension & Events master data hooks for dropdowns
    const { data: trainingTypes = [] } = useTrainingTypes()
    const { data: trainingAreas = [] } = useTrainingAreas()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-[#E0E0E0]">
                    <h2 className="text-xl font-semibold text-[#212121]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#F5F5F5] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-[#757575]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {entityType === 'zones' && (
                        <div>
                            <label className="block text-sm font-medium text-[#212121] mb-2">
                                Zone Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.zoneName || ''}
                                onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                                required
                                placeholder="Enter zone name"
                                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                            />
                        </div>
                    )}

                    {entityType === 'states' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    State Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.stateName || ''}
                                    onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                                    required
                                    placeholder="Enter state name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Zone <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.zoneId || ''}
                                    onChange={(e) => setFormData({ ...formData, zoneId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.zoneId} value={zone.zoneId}>
                                            {zone.zoneName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {entityType === 'districts' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    District Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.districtName || ''}
                                    onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                                    required
                                    placeholder="Enter district name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Zone <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.zoneId || ''}
                                    onChange={(e) => {
                                        const zoneId = parseInt(e.target.value)
                                        setFormData({ ...formData, zoneId, stateId: '' })
                                    }}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.zoneId} value={zone.zoneId}>
                                            {zone.zoneName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.stateId || ''}
                                    onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                                    required
                                    disabled={!formData.zoneId}
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
                                >
                                    <option value="">Select state</option>
                                    {states
                                        .filter((state) => state.zoneId === formData.zoneId)
                                        .map((state) => (
                                            <option key={state.stateId} value={state.stateId}>
                                                {state.stateName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </>
                    )}

                    {entityType === 'organizations' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Organization Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.uniName || ''}
                                    onChange={(e) => setFormData({ ...formData, uniName: e.target.value })}
                                    required
                                    placeholder="Enter organization name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.stateId || ''}
                                    onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select state</option>
                                    {states.map((state) => (
                                        <option key={state.stateId} value={state.stateId}>
                                            {state.stateName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* OFT Masters */}
                    {entityType === 'oft-subjects' && (
                        <div>
                            <label className="block text-sm font-medium text-[#212121] mb-2">
                                Subject Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.subjectName || ''}
                                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                                required
                                placeholder="Enter subject name"
                                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                            />
                        </div>
                    )}

                    {entityType === 'oft-thematic-areas' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Thematic Area Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.thematicAreaName || ''}
                                    onChange={(e) => setFormData({ ...formData, thematicAreaName: e.target.value })}
                                    required
                                    placeholder="Enter thematic area name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.oftSubjectId || ''}
                                    onChange={(e) => setFormData({ ...formData, oftSubjectId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select subject</option>
                                    {oftSubjects.map((subject: any) => (
                                        <option key={subject.oftSubjectId} value={subject.oftSubjectId}>
                                            {subject.subjectName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* FLD Masters */}
                    {entityType === 'fld-sectors' && (
                        <div>
                            <label className="block text-sm font-medium text-[#212121] mb-2">
                                Sector Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.sectorName || ''}
                                onChange={(e) => setFormData({ ...formData, sectorName: e.target.value })}
                                required
                                placeholder="Enter sector name"
                                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                            />
                        </div>
                    )}

                    {entityType === 'fld-thematic-areas' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Thematic Area Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.thematicAreaName || ''}
                                    onChange={(e) => setFormData({ ...formData, thematicAreaName: e.target.value })}
                                    required
                                    placeholder="Enter thematic area name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Sector <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.sectorId || ''}
                                    onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select sector</option>
                                    {fldSectors.map((sector: any) => (
                                        <option key={sector.sectorId} value={sector.sectorId}>
                                            {sector.sectorName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {entityType === 'fld-categories' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.categoryName || ''}
                                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                                    required
                                    placeholder="Enter category name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Sector <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.sectorId || ''}
                                    onChange={(e) => setFormData({ ...formData, sectorId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select sector</option>
                                    {fldSectors.map((sector: any) => (
                                        <option key={sector.sectorId} value={sector.sectorId}>
                                            {sector.sectorName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}


                    {entityType === 'fld-subcategories' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Subcategory Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.subCategoryName || ''}
                                    onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
                                    required
                                    placeholder="Enter subcategory name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Sector <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.sectorId || ''}
                                    onChange={(e) => {
                                        const sectorId = parseInt(e.target.value)
                                        setFormData({ ...formData, sectorId, categoryId: '' })
                                    }}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select sector</option>
                                    {fldSectors.map((sector: any) => (
                                        <option key={sector.sectorId} value={sector.sectorId}>
                                            {sector.sectorName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.categoryId || ''}
                                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                    required
                                    disabled={!formData.sectorId}
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
                                >
                                    <option value="">Select category</option>
                                    {fldCategories
                                        .filter((category: any) => category.sectorId === formData.sectorId)
                                        .map((category: any) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </>
                    )}

                    {entityType === 'fld-crops' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Sector <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.sectorId || ''}
                                    onChange={(e) => {
                                        const sectorId = parseInt(e.target.value)
                                        setFormData({ ...formData, sectorId, categoryId: '', subCategoryId: '' })
                                    }}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select sector</option>
                                    {fldSectors.map((sector: any) => (
                                        <option key={sector.sectorId} value={sector.sectorId}>
                                            {sector.sectorName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.categoryId || ''}
                                    onChange={(e) => {
                                        const categoryId = parseInt(e.target.value)
                                        setFormData({ ...formData, categoryId, subCategoryId: '' })
                                    }}
                                    required
                                    disabled={!formData.sectorId}
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
                                >
                                    <option value="">Select category</option>
                                    {fldCategories
                                        .filter((category: any) => category.sectorId === formData.sectorId)
                                        .map((category: any) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Subcategory <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.subCategoryId || ''}
                                    onChange={(e) => setFormData({ ...formData, subCategoryId: parseInt(e.target.value) })}
                                    required
                                    disabled={!formData.categoryId}
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
                                >
                                    <option value="">Select subcategory</option>
                                    {fldSubcategories
                                        .filter((subcategory: any) => subcategory.categoryId === formData.categoryId)
                                        .map((subcategory: any) => (
                                            <option key={subcategory.subCategoryId} value={subcategory.subCategoryId}>
                                                {subcategory.subCategoryName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Crop Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.cropName || ''}
                                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                    required
                                    placeholder="Enter crop name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                        </>
                    )}

                    {entityType === 'cfld-crops' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Season <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.seasonId || ''}
                                    onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select season</option>
                                    {seasons.map((season: any) => (
                                        <option key={season.seasonId} value={season.seasonId}>
                                            {season.seasonName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.typeId || ''}
                                    onChange={(e) => setFormData({ ...formData, typeId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select type</option>
                                    {cropTypes.map((type: any) => (
                                        <option key={type.typeId} value={type.typeId}>
                                            {type.typeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Crop Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.CropName || ''}
                                    onChange={(e) => setFormData({ ...formData, CropName: e.target.value })}
                                    required
                                    placeholder="Enter crop name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                        </>
                    )}

                    {/* Training, Extension & Events Masters */}
                    {entityType === 'training-types' && (
                        <div>
                            <label className="block text-sm font-medium text-[#212121] mb-2">
                                Training Type Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.trainingTypeName || ''}
                                onChange={(e) => setFormData({ ...formData, trainingTypeName: e.target.value })}
                                required
                                placeholder="Enter training type name"
                                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                            />
                        </div>
                    )}

                    {entityType === 'training-areas' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Training Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.trainingTypeId || ''}
                                    onChange={(e) => setFormData({ ...formData, trainingTypeId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select training type</option>
                                    {trainingTypes.map((type: any) => (
                                        <option key={type.trainingTypeId} value={type.trainingTypeId}>
                                            {type.trainingTypeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Training Area Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.trainingAreaName || ''}
                                    onChange={(e) => setFormData({ ...formData, trainingAreaName: e.target.value })}
                                    required
                                    placeholder="Enter training area name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                        </>
                    )}

                    {entityType === 'training-thematic-areas' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Training Area <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.trainingAreaId || ''}
                                    onChange={(e) => setFormData({ ...formData, trainingAreaId: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                >
                                    <option value="">Select training area</option>
                                    {trainingAreas.map((area: any) => (
                                        <option key={area.trainingAreaId} value={area.trainingAreaId}>
                                            {area.trainingAreaName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">
                                    Thematic Area Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.trainingThematicAreaName || ''}
                                    onChange={(e) => setFormData({ ...formData, trainingThematicAreaName: e.target.value })}
                                    required
                                    placeholder="Enter thematic area name"
                                    className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                                />
                            </div>
                        </>
                    )}

                    {entityType === 'extension-activities' && (
                        <div>
                            <label className="block text-sm font-medium text-[#212121] mb-2">
                                Extension Activity Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.extensionName || ''}
                                onChange={(e) => setFormData({ ...formData, extensionName: e.target.value })}
                                required
                                placeholder="Enter extension activity name"
                                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                            />
                        </div>
                    )}

                    {entityType === 'other-extension-activities' && (
                        <div>
                            <label className="block text-sm font-medium text-[#212121] mb-2">
                                Other Extension Activity Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.otherExtensionName || ''}
                                onChange={(e) => setFormData({ ...formData, otherExtensionName: e.target.value })}
                                required
                                placeholder="Enter other extension activity name"
                                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                            />
                        </div>
                    )}

                    {entityType === 'events' && (
                        <div>
                            <label className="block text-sm font-medium text-[#212121] mb-2">
                                Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.eventName || ''}
                                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                                required
                                placeholder="Enter event name"
                                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                            />
                        </div>
                    )}


                    <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#757575] hover:bg-[#F5F5F5] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] transition-all shadow-sm hover:shadow-md"
                        >
                            {formData.zoneId || formData.stateId || formData.districtId || formData.orgId ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
