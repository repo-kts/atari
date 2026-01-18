import React from 'react'
import { KVKDetails } from '../../../types/kvk'
import { Card, CardContent } from '../../ui/Card'

interface KVKInfoTabProps {
    kvk: KVKDetails
}

export const KVKInfoTab: React.FC<KVKInfoTabProps> = ({ kvk }) => {
    const renderField = (label: string, value: string | undefined | null) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-emerald-700 mb-2">
                {label}
            </label>
            <p className="text-[#212121] py-2">{value || '-'}</p>
        </div>
    )

    return (
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[#212121] mb-4">
                            Basic Information
                        </h3>
                        {renderField('KVK Name', kvk.kvk_name)}
                        {renderField('Mobile', kvk.mobile)}
                        {renderField('Email', kvk.email)}
                        {renderField('Fax', kvk.fax)}
                        {renderField('Landline', kvk.landline)}
                        {renderField('Address', kvk.address)}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-[#212121] mb-4">
                            Organization Information
                        </h3>
                        {renderField('Organization Name', kvk.org_name)}
                        {renderField('Organization Mobile', kvk.org_mobile)}
                        {renderField('Organization Landline', kvk.org_landline)}
                        {renderField('Organization Fax', kvk.org_fax)}
                        {renderField('Organization Email', kvk.org_email)}
                        {renderField('Organization Address', kvk.org_address)}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-[#212121] mb-4">
                            Additional Information
                        </h3>
                        {renderField('Sanction Year', kvk.sanction_year)}
                        {renderField('Total Land', kvk.total_land)}
                        {renderField('State', kvk.state?.state_name)}
                        {renderField('District', kvk.district?.district_name)}
                        {renderField('University', kvk.university?.university_name)}
                        {renderField('Zone', kvk.state?.zone?.zone_name)}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
