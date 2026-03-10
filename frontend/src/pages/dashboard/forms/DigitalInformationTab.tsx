import React from 'react'
import { Smartphone } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Digital Information',
        icon: <Smartphone className="w-5 h-5" />,
        items: [
            { label: 'Mobile App', path: '/forms/digital-information/mobile-app' },
            { label: 'Web Portal', path: '/forms/digital-information/web-portal' },
            { label: 'Kisan Sarathi', path: '/forms/digital-information/kisan-sarathi' },
            { label: 'Kisan Mobile Advisory', path: '/forms/digital-information/kisan-mobile-advisory' },
            { label: 'Other channels', path: '/forms/digital-information/other-channels' },
        ],
    },
]

export const DigitalInformationTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Digital Information"
            description="Manage digital information including mobile apps, web portals, and digital advisory services"
            sections={sections}
        />
    )
}
