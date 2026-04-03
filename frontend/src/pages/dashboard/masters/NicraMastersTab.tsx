import React from 'react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'
import { Calendar } from 'lucide-react'

const sections: FeatureSection[] = [
    {
        title: 'NICRA Masters',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'NICRA Category Master', path: '/all-master/nicra-category' },
            { label: 'NICRA Sub-category Master', path: '/all-master/nicra-sub-category' },
            { label: 'NICRA Seed/Fodder Bank Master', path: '/all-master/nicra-seed-bank-fodder-bank' },
            { label: 'NICRA Dignitary Type Master', path: '/all-master/nicra-dignitary-type' },
            { label: 'NICRA PI/CO-PI Type Master', path: '/all-master/nicra-pi-type' },
        ],
    },
]

export const NicraMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="NICRA Masters"
            description="Manage NICRA project master data"
            sections={sections}
        />
    )
}

