import React from 'react'
import {
    Bug,
    Users,
    Shield,
    GraduationCap,
    UserCircle,
    Smartphone,
    Sparkles,
    Calendar,
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Prevalent Diseases',
        icon: <Bug className="w-5 h-5" />,
        items: [
            { label: 'Prevalent diseases (Crops)', path: '/forms/miscellaneous/diseases/crops' },
            { label: 'Prevalent diseases (Livestock/Fishery)', path: '/forms/miscellaneous/diseases/livestock' },
        ],
    },
    {
        title: 'Nehru Yuva Kendra',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Nehru Yuva Kendra', path: '/forms/miscellaneous/nehru-yuva-kendra' },
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
        title: 'RAWE/FET Programme',
        icon: <GraduationCap className="w-5 h-5" />,
        items: [
            { label: 'RAWE/FET programme', path: '/forms/miscellaneous/rawe-fet' },
        ],
    },
    {
        title: 'VIP Visitors',
        icon: <UserCircle className="w-5 h-5" />,
        items: [
            { label: 'VIP visitors', path: '/forms/miscellaneous/vip-visitors' },
        ],
    },
    {
        title: 'Digital Information',
        icon: <Smartphone className="w-5 h-5" />,
        items: [
            { label: 'Mobile App', path: '/forms/miscellaneous/digital/mobile-app' },
            { label: 'Web Portal', path: '/forms/miscellaneous/digital/web-portal' },
            { label: 'Kisan Sarathi', path: '/forms/miscellaneous/digital/kisan-sarathi' },
            { label: 'Kisan Mobile Advisory', path: '/forms/miscellaneous/digital/kisan-mobile-advisory' },
            { label: 'Other channels', path: '/forms/miscellaneous/digital/other-channels' },
        ],
    },
    {
        title: 'Swachhta Bharat Abhiyaan',
        icon: <Sparkles className="w-5 h-5" />,
        items: [
            { label: 'Swachhta hi Sewa', path: '/forms/miscellaneous/swachhta/sewa' },
            { label: 'Swachta Pakhwada', path: '/forms/miscellaneous/swachhta/pakhwada' },
            { label: 'Budget expenditure', path: '/forms/miscellaneous/swachhta/budget' },
        ],
    },
    {
        title: 'Meetings',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'SAC Meetings', path: '/forms/miscellaneous/meetings/sac' },
            { label: 'Other meetings', path: '/forms/miscellaneous/meetings/other' },
        ],
    },
]

export const MiscellaneousTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Miscellaneous"
            description="Manage prevalent diseases, programmes, digital information, Swachhta Bharat Abhiyaan, and meetings"
            sections={sections}
        />
    )
}
