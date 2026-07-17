import React from 'react'
import {
    Users,
    Shield,
    Smartphone,
    ClipboardList,
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Nehru Yuva Kendra',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Nehru Yuva Kendra (NYK) Training', path: '/forms/miscellaneous/nehru-yuva-kendra' },
        ],
    },
    {
        title: 'PPV & FRA Sensitization',
        icon: <Shield className="w-5 h-5" />,
        items: [
            { label: 'Training & Awareness Program', path: '/forms/miscellaneous/ppv-fra/training' },
            { label: 'Details of Plant Varieties', path: '/forms/miscellaneous/ppv-fra/plant-varieties' },
        ],
    },
    {
        title: 'RAWE/FET & VIP Visitors',
        icon: <ClipboardList className="w-5 h-5" />,
        items: [
            { label: 'RAWE/FET programme', path: '/forms/miscellaneous/rawe-fet' },
            { label: 'List of VIP visitors', path: '/forms/miscellaneous/vip-visitors' },
        ],
    },
    {
        title: 'Digital Information',
        icon: <Smartphone className="w-5 h-5" />,
        items: [
            { label: 'Details of Mobile App', path: '/forms/digital-information/mobile-app', moduleCode: 'digital_mobile_app' },
            { label: 'Details of Web Portal', path: '/forms/digital-information/web-portal', moduleCode: 'digital_web_portal' },
            { label: 'Details of Kisan Sarathi', path: '/forms/digital-information/kisan-sarathi', moduleCode: 'digital_kisan_sarthi' },
            { label: 'Kisan Mobile Advisory Services/KMAS', path: '/forms/digital-information/kisan-mobile-advisory', moduleCode: 'digital_kisan_advisory' },
            { label: 'Details of messages send through other channels', path: '/forms/digital-information/other-channels', moduleCode: 'digital_messages_other_channels' },
        ],
    },
]

export const MiscellaneousTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Miscellaneous"
            description="Manage prevalent diseases, programmes, and other miscellaneous information"
            sections={sections}
        />
    )
}
