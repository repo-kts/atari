import React from 'react'
import { Sparkles } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Swachhta Bharat Abhiyaan',
        icon: <Sparkles className="w-5 h-5" />,
        items: [
            { label: 'Swachhta hi Sewa', path: '/forms/swachhta-bharat-abhiyaan/sewa' },
            { label: 'Swachta Pakhwada', path: '/forms/swachhta-bharat-abhiyaan/pakhwada' },
            { label: 'Budget expenditure', path: '/forms/swachhta-bharat-abhiyaan/budget' },
        ],
    },
]

export const SwachhtaBharatAbhiyaanTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Swachhta Bharat Abhiyaan"
            description="Manage Swachhta Bharat Abhiyaan activities and budget expenditure"
            sections={sections}
        />
    )
}
