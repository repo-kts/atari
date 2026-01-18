import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { KVKDetails } from '../../../types/kvk'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Edit2, Save, X } from 'lucide-react'

interface ViewKVKDetailsProps {
    onEdit?: () => void
}

export const ViewKVKDetails: React.FC<ViewKVKDetailsProps> = ({ onEdit }) => {
    const { user } = useAuthStore()
    const [kvkDetails, setKvkDetails] = useState<KVKDetails | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<KVKDetails>>({})

    useEffect(() => {
        loadKVKDetails()
    }, [user])

    const loadKVKDetails = () => {
        if (user?.kvk_id) {
            const kvks = localStorageService.getKVKDetails(user.kvk_id)
            if (kvks.length > 0) {
                setKvkDetails(kvks[0])
                setFormData(kvks[0])
            }
        }
    }

    const handleSave = () => {
        if (kvkDetails) {
            localStorageService.updateKVKDetails(kvkDetails.id, formData)
            loadKVKDetails()
            setIsEditing(false)
        }
    }

    const handleCancel = () => {
        setFormData(kvkDetails || {})
        setIsEditing(false)
    }

    const handleChange = (field: keyof KVKDetails, value: any) => {
        setFormData({ ...formData, [field]: value })
    }

    if (!kvkDetails) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-[#757575]">No KVK details found.</p>
                </CardContent>
            </Card>
        )
    }

    const renderField = (
        label: string,
        field: keyof KVKDetails,
        editable: boolean = true
    ) => {
        const value = isEditing && editable ? formData[field] : kvkDetails[field]

        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                    {label}
                </label>
                {isEditing && editable ? (
                    <input
                        type="text"
                        value={value as string || ''}
                        onChange={e => handleChange(field, e.target.value)}
                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-[#212121]"
                    />
                ) : (
                    <p className="text-[#212121] py-2">{value as string || '-'}</p>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-emerald-700">
                            KVK Details
                        </h2>
                        {!isEditing && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsEditing(true)
                                    onEdit?.()
                                }}
                                className="flex items-center"
                            >
                                <Edit2 className="w-4 h-4 mr-2 shrink-0" />
                                <span>Edit</span>
                            </Button>
                        )}
                        {isEditing && (
                            <div className="flex gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSave}
                                    className="flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2 shrink-0" />
                                    <span>Save</span>
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="flex items-center"
                                >
                                    <X className="w-4 h-4 mr-2 shrink-0" />
                                    <span>Cancel</span>
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[#212121] mb-4">
                                Basic Information
                            </h3>
                            {renderField('KVK Name', 'kvk_name')}
                            {renderField('Mobile', 'mobile')}
                            {renderField('Email', 'email')}
                            {renderField('Fax', 'fax')}
                            {renderField('Landline', 'landline')}
                            {renderField('Address', 'address')}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[#212121] mb-4">
                                Organization Information
                            </h3>
                            {renderField('Organization Name', 'org_name')}
                            {renderField('Organization Mobile', 'org_mobile')}
                            {renderField('Organization Landline', 'org_landline')}
                            {renderField('Organization Fax', 'org_fax')}
                            {renderField('Organization Email', 'org_email')}
                            {renderField('Organization Address', 'org_address')}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[#212121] mb-4">
                                Additional Information
                            </h3>
                            {renderField('Sanction Year', 'sanction_year')}
                            {renderField('Total Land', 'total_land')}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-emerald-700 mb-2">
                                    State
                                </label>
                                <p className="text-[#212121] py-2">
                                    {kvkDetails.state?.state_name || '-'}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-emerald-700 mb-2">
                                    District
                                </label>
                                <p className="text-[#212121] py-2">
                                    {kvkDetails.district?.district_name || '-'}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-emerald-700 mb-2">
                                    University
                                </label>
                                <p className="text-[#212121] py-2">
                                    {kvkDetails.university?.university_name || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
