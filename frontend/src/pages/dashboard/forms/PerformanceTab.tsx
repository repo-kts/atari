import React from 'react'
import {
    TrendingUp,
    MapPin,
    Building2,
    DollarSign,
    Link as LinkIcon,
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Impact',
        icon: <TrendingUp className="w-5 h-5" />,
        items: [
            { label: 'Impact of KVK activities', path: '/forms/performance/impact/kvk-activities' },
            { label: 'Details of Entrepreneurship', path: '/forms/performance/impact/entrepreneurship' },
            { label: 'Success Stories', path: '/forms/performance/impact/success-stories' },
        ],
    },
    {
        title: 'District and Village Performance',
        icon: <MapPin className="w-5 h-5" />,
        items: [
            { label: 'District Level Data', path: '/forms/performance/district-village/district-level' },
            { label: 'Operational Area Details', path: '/forms/performance/district-village/operational-area' },
            { label: 'Village Adoption Programme', path: '/forms/performance/district-village/village-adoption' },
            { label: 'Priority Thrust Area', path: '/forms/performance/district-village/priority-thrust' },
        ],
    },
    {
        title: 'Infrastructure Performance',
        icon: <Building2 className="w-5 h-5" />,
        items: [
            { label: 'Performance of demonstration Units', path: '/forms/performance/infrastructure/demonstration-units' },
            { label: 'Performance of Instructional Farm(crops)', path: '/forms/performance/infrastructure/instructional-farm-crops' },
            { label: 'Performance of Production Units', path: '/forms/performance/infrastructure/production-units' },
            { label: 'Performance of Instructional Farm(livestock)', path: '/forms/performance/infrastructure/instructional-farm-livestock' },
            { label: 'Utilization of Hostel Facilities Accommodation', path: '/forms/performance/infrastructure/hostel' },
            { label: 'Rain Water Harvesting structure and micro irrigation system', path: '/forms/performance/infrastructure/rainwater-harvesting' },
        ],
    },
    {
        title: 'Financial Performance',
        icon: <DollarSign className="w-5 h-5" />,
        items: [
            { label: 'Budget Details', path: '/forms/performance/financial/budget-details' },
            { label: 'Project-wise Budget Details', path: '/forms/performance/financial/project-budget' },
            { label: 'Status of revolving fund', path: '/forms/performance/financial/revolving-fund' },
            { label: 'Revenue generation', path: '/forms/performance/financial/revenue-generation' },
            { label: 'Resource Generation', path: '/forms/performance/financial/resource-generation' },
        ],
    },
    {
        title: 'Linkages',
        icon: <LinkIcon className="w-5 h-5" />,
        items: [
            { label: 'Functional Linkage with Different Organizations', path: '/forms/performance/linkages/functional-linkage' },
        ],
    },
]

export const PerformanceTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Performance Indicators"
            description="Manage impact, district and village performance, infrastructure performance, financial performance, and linkages"
            sections={sections}
        />
    )
}
