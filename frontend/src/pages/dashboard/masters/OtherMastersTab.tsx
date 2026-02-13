import React from 'react'
import { Calendar } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Other Masters',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'Season Master', path: '/all-master/season' },
            { label: 'Sanctioned Post Master', path: '/all-master/sanctioned-post' },
            { label: 'Year Master', path: '/all-master/year' },
        ],
    },
]

export const OtherMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Other Masters"
            description="Manage seasons, sanctioned posts, and years"
            sections={sections}
        />
    )
}
