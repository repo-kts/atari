import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface DigitalInformationFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const DigitalInformationForms: React.FC<DigitalInformationFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()

    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'yearId', 'yearName'),
        [years]
    )

    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleNumberChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value === '' ? '' : parseInt(e.target.value)
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData({ ...formData, reportingYearId: value, yearId: value, reportingYear: value })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. Create Details of Mobile App */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_MOBILE_APP && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Number of Mobile Apps Developed by KVK"
                            required
                            type="number"
                            value={formData.appsDeveloped || ''}
                            onChange={handleNumberChange('appsDeveloped')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Name of the Apps"
                            required
                            value={formData.appName || ''}
                            onChange={handleFieldChange('appName')}
                            placeholder="Enter app name"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Language of the Apps"
                            required
                            value={formData.appLanguage || ''}
                            onChange={handleFieldChange('appLanguage')}
                            placeholder="Enter language"
                        />

                        <FormInput
                            label="Meant for Crop/Livestock/Fishery/Others"
                            required
                            value={formData.appCategory || ''}
                            onChange={handleFieldChange('appCategory')}
                            placeholder="Enter category"
                        />
                    </div>

                    <FormInput
                        label="No. of Times Downloaded"
                        required
                        type="number"
                        value={formData.downloadCount || ''}
                        onChange={handleNumberChange('downloadCount')}
                        placeholder="Enter number"
                    />
                </div>
            )}

            {/* 2. Create Details of KVK Portal */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_WEB_PORTAL && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="No. of Visitors Visited the Portal"
                            required
                            type="number"
                            value={formData.visitorsCount || ''}
                            onChange={handleNumberChange('visitorsCount')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No. of Farmers Registered on the Portal"
                            required
                            type="number"
                            value={formData.farmersRegistered || ''}
                            onChange={handleNumberChange('farmersRegistered')}
                            placeholder="Enter number"
                        />
                    </div>
                </div>
            )}

            {/* 3. Create Details of Kisan Sarathi */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_KISAN_SARATHI && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="No. of Farmers Registered on KSP Portal"
                            required
                            type="number"
                            value={formData.farmersRegistered || ''}
                            onChange={handleNumberChange('farmersRegistered')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Phone Call Addressed"
                            required
                            type="number"
                            value={formData.phoneCallAddressed || ''}
                            onChange={handleNumberChange('phoneCallAddressed')}
                            placeholder="Enter number"
                        />
                    </div>

                    <FormInput
                        label="Phone Call Answered"
                        required
                        type="number"
                        value={formData.phoneCallAnswered || ''}
                        onChange={handleNumberChange('phoneCallAnswered')}
                        placeholder="Enter number"
                    />

                    <FormSection title="">
                        <FormInput
                            label="Crop"
                            required
                            type="number"
                            value={formData.messageCrop || ''}
                            onChange={handleNumberChange('messageCrop')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Livestock"
                            required
                            type="number"
                            value={formData.messageLivestock || ''}
                            onChange={handleNumberChange('messageLivestock')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Weather"
                            required
                            type="number"
                            value={formData.messageWeather || ''}
                            onChange={handleNumberChange('messageWeather')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Marketing"
                            required
                            type="number"
                            value={formData.messageMarketing || ''}
                            onChange={handleNumberChange('messageMarketing')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Awareness"
                            required
                            type="number"
                            value={formData.messageAwareness || ''}
                            onChange={handleNumberChange('messageAwareness')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Other Enterprises"
                            required
                            type="number"
                            value={formData.messageOtherEnterprises || ''}
                            onChange={handleNumberChange('messageOtherEnterprises')}
                            placeholder="Enter number"
                        />
                    </FormSection>
                </div>
            )}

            {/* 4. Create Kisan Mobile Advisory Services/KMAS */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_KISAN_MOBILE_ADVISORY && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="No. of Farmers Covered"
                            required
                            type="number"
                            value={formData.farmersCovered || ''}
                            onChange={handleNumberChange('farmersCovered')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No of Advisories Sent"
                            required
                            type="number"
                            value={formData.advisoriesSent || ''}
                            onChange={handleNumberChange('advisoriesSent')}
                            placeholder="Enter number"
                        />
                    </div>

                    <FormSection title="Type of Messages">
                        <FormInput
                            label="Crop"
                            required
                            type="number"
                            value={formData.messageCrop || ''}
                            onChange={handleNumberChange('messageCrop')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Livestock"
                            required
                            type="number"
                            value={formData.messageLivestock || ''}
                            onChange={handleNumberChange('messageLivestock')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Weather"
                            required
                            type="number"
                            value={formData.messageWeather || ''}
                            onChange={handleNumberChange('messageWeather')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Marketing"
                            required
                            type="number"
                            value={formData.messageMarketing || ''}
                            onChange={handleNumberChange('messageMarketing')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Awareness"
                            required
                            type="number"
                            value={formData.messageAwareness || ''}
                            onChange={handleNumberChange('messageAwareness')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Other Enterprises"
                            required
                            type="number"
                            value={formData.messageOtherEnterprises || ''}
                            onChange={handleNumberChange('messageOtherEnterprises')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Any Other"
                            required
                            type="number"
                            value={formData.messageAnyOther || ''}
                            onChange={handleNumberChange('messageAnyOther')}
                            placeholder="Enter number"
                        />
                    </FormSection>
                </div>
            )}

            {/* 5. Create Details of Messages Send Through Other Channels */}
            {entityType === ENTITY_TYPES.MISC_DIGITAL_OTHER_CHANNELS && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    {/* Advisories through Text messages */}
                    <FormSection title="Advisories through Text Messages">
                        <FormInput
                            label="No. of Farmers Covered"
                            required
                            type="number"
                            value={formData.textFarmersCovered || ''}
                            onChange={handleNumberChange('textFarmersCovered')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No of Advisories Sent"
                            required
                            type="number"
                            value={formData.textAdvisoriesSent || ''}
                            onChange={handleNumberChange('textAdvisoriesSent')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Crop"
                            required
                            type="number"
                            value={formData.textCrop || ''}
                            onChange={handleNumberChange('textCrop')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Livestock"
                            required
                            type="number"
                            value={formData.textLivestock || ''}
                            onChange={handleNumberChange('textLivestock')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Weather"
                            required
                            type="number"
                            value={formData.textWeather || ''}
                            onChange={handleNumberChange('textWeather')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Marketing"
                            required
                            type="number"
                            value={formData.textMarketing || ''}
                            onChange={handleNumberChange('textMarketing')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Awareness"
                            required
                            type="number"
                            value={formData.textAwareness || ''}
                            onChange={handleNumberChange('textAwareness')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Other Enterprises"
                            required
                            type="number"
                            value={formData.textOtherEnterprises || ''}
                            onChange={handleNumberChange('textOtherEnterprises')}
                            placeholder="Enter number"
                        />
                    </FormSection>

                    {/* Advisories through WhatsApp */}
                    <FormSection title="Advisories through WhatsApp">
                        <FormInput
                            label="No. of Farmers Covered"
                            required
                            type="number"
                            value={formData.whatsappFarmersCovered || ''}
                            onChange={handleNumberChange('whatsappFarmersCovered')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No of Advisories Sent"
                            required
                            type="number"
                            value={formData.whatsappAdvisoriesSent || ''}
                            onChange={handleNumberChange('whatsappAdvisoriesSent')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Crop"
                            required
                            type="number"
                            value={formData.whatsappCrop || ''}
                            onChange={handleNumberChange('whatsappCrop')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Livestock"
                            required
                            type="number"
                            value={formData.whatsappLivestock || ''}
                            onChange={handleNumberChange('whatsappLivestock')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Weather"
                            required
                            type="number"
                            value={formData.whatsappWeather || ''}
                            onChange={handleNumberChange('whatsappWeather')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Marketing"
                            required
                            type="number"
                            value={formData.whatsappMarketing || ''}
                            onChange={handleNumberChange('whatsappMarketing')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Awareness"
                            required
                            type="number"
                            value={formData.whatsappAwareness || ''}
                            onChange={handleNumberChange('whatsappAwareness')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Other Enterprises"
                            required
                            type="number"
                            value={formData.whatsappOtherEnterprises || ''}
                            onChange={handleNumberChange('whatsappOtherEnterprises')}
                            placeholder="Enter number"
                        />
                    </FormSection>

                    {/* Advisories through Weather Advisory Bulletin */}
                    <FormSection title="Advisories through Weather Advisory Bulletin">
                        <FormInput
                            label="No. of Farmers Covered"
                            required
                            type="number"
                            value={formData.bulletinFarmersCovered || ''}
                            onChange={handleNumberChange('bulletinFarmersCovered')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No of Advisories Sent"
                            required
                            type="number"
                            value={formData.bulletinAdvisoriesSent || ''}
                            onChange={handleNumberChange('bulletinAdvisoriesSent')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Crop"
                            required
                            type="number"
                            value={formData.bulletinCrop || ''}
                            onChange={handleNumberChange('bulletinCrop')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Livestock"
                            required
                            type="number"
                            value={formData.bulletinLivestock || ''}
                            onChange={handleNumberChange('bulletinLivestock')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Weather"
                            required
                            type="number"
                            value={formData.bulletinWeather || ''}
                            onChange={handleNumberChange('bulletinWeather')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Marketing"
                            required
                            type="number"
                            value={formData.bulletinMarketing || ''}
                            onChange={handleNumberChange('bulletinMarketing')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Awareness"
                            required
                            type="number"
                            value={formData.bulletinAwareness || ''}
                            onChange={handleNumberChange('bulletinAwareness')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Other Enterprises"
                            required
                            type="number"
                            value={formData.bulletinOtherEnterprises || ''}
                            onChange={handleNumberChange('bulletinOtherEnterprises')}
                            placeholder="Enter number"
                        />
                    </FormSection>

                    {/* Advisories through Social Media */}
                    <FormSection title="Advisories through Social Media/FB/Twitter/Instagram/Other">
                        <FormInput
                            label="No. of Farmers Covered"
                            required
                            type="number"
                            value={formData.socialFarmersCovered || ''}
                            onChange={handleNumberChange('socialFarmersCovered')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="No of Advisories Sent"
                            required
                            type="number"
                            value={formData.socialAdvisoriesSent || ''}
                            onChange={handleNumberChange('socialAdvisoriesSent')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Crop"
                            required
                            type="number"
                            value={formData.socialCrop || ''}
                            onChange={handleNumberChange('socialCrop')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Livestock"
                            required
                            type="number"
                            value={formData.socialLivestock || ''}
                            onChange={handleNumberChange('socialLivestock')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Weather"
                            required
                            type="number"
                            value={formData.socialWeather || ''}
                            onChange={handleNumberChange('socialWeather')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Marketing"
                            required
                            type="number"
                            value={formData.socialMarketing || ''}
                            onChange={handleNumberChange('socialMarketing')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Awareness"
                            required
                            type="number"
                            value={formData.socialAwareness || ''}
                            onChange={handleNumberChange('socialAwareness')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Other Enterprises"
                            required
                            type="number"
                            value={formData.socialOtherEnterprises || ''}
                            onChange={handleNumberChange('socialOtherEnterprises')}
                            placeholder="Enter number"
                        />
                    </FormSection>
                </div>
            )}
        </div>
    )
}
