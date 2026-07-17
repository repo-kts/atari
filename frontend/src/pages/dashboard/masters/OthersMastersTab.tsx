import React from 'react'
import { Calendar, IndianRupee } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Calendar & Context Masters',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'Season Master', path: '/all-master/season' },
            { label: 'Unit Master', path: '/all-master/unit' },
            { label: 'Crop Type Master', path: '/all-master/crop-type' },
        ],
    },
    {
        title: 'Funding Source Master',
        icon: <IndianRupee className="w-5 h-5" />,
        items: [
            { label: 'Funding Source Master', path: '/all-master/funding-source' },
        ],
    },
]

export const OthersMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Others Master"
            description="Manage calendar, context, and funding source master data"
            sections={sections}
        />
    )
}
