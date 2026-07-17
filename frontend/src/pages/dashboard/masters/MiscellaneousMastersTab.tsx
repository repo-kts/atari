import React from 'react'
import { Layers } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Miscellaneous Masters',
        icon: <Layers className="w-5 h-5" />,
        items: [
            { label: 'PPV & FRA Training Type Master', path: '/all-master/ppv-fra-training-type' },
            { label: 'VIP Dignitary Master', path: '/all-master/dignitary-type' },
        ],
    },
]

export const MiscellaneousMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Miscellaneous Master"
            description="Manage PPV & FRA and VIP dignitary master data"
            sections={sections}
        />
    )
}
