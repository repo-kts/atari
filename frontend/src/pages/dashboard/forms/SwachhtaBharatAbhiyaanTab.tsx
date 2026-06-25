import React from 'react'
import { Sparkles } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Swachhta Bharat Abhiyaan',
        icon: <Sparkles className="w-5 h-5" />,
        items: [
            { label: 'Observation of Swachhta hi Sewa SBA', path: '/forms/swachhta-bharat-abhiyaan/sewa' },
            { label: 'Observation of Swachta Pakhwada', path: '/forms/swachhta-bharat-abhiyaan/pakhwada' },
            { label: 'Details of quarterly budget expenditure on Swachh activities including SAP', path: '/forms/swachhta-bharat-abhiyaan/budget' },
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
