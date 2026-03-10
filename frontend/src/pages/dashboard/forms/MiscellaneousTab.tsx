import React from 'react'
import {
    Bug,
    Users,
    Shield,
    GraduationCap,
    UserCircle,
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
