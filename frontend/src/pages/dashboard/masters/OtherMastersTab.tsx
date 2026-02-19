import React from 'react'
import { Calendar, Users } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Employee Masters',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Staff Category Master', path: '/all-master/staff-category' },
            { label: 'Pay Level Master', path: '/all-master/pay-level' },
            { label: 'Sanctioned Post Master', path: '/all-master/sanctioned-post' },
            { label: 'Discipline Master', path: '/all-master/discipline' },
        ],
    },
    {
        title: 'Other Masters',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'Season Master', path: '/all-master/season' },
            { label: 'Year Master', path: '/all-master/year' },
            { label: 'Crop Type Master', path: '/all-master/crop-type' },
            { label: 'Infrastructure Master', path: '/all-master/infrastructure-master' },
            { label: 'Important Day Master', path: '/all-master/important-day' },
        ],
    },
]

export const OtherMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Other Masters"
            description="Manage employee, training, extension, and other master data"
            sections={sections}
        />
    )
}
