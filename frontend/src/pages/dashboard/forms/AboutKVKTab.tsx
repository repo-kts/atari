import React from 'react'
import {
    Building2,
    Truck,
    Wrench,
    FileText,
    LandPlot,
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'View KVKs',
        icon: <Building2 className="w-5 h-5" />,
        items: [
            { label: 'View KVKs', path: '/forms/about-kvk/view-kvks' },
            { label: 'Bank Account Details', path: '/forms/about-kvk/bank-account' },
        ],
    },
    {
        title: 'Basic Information',
        icon: <FileText className="w-5 h-5" />,
        items: [
            { label: 'Employee Details', path: '/forms/about-kvk/employee-details' },
            { label: 'Staff Transferred', path: '/forms/about-kvk/staff-transferred' },
        ],
    },
    {
        title: 'Infrastructure & Land Details',
        icon: <LandPlot className="w-5 h-5" />,
        items: [
            { label: 'Infrastructure Details', path: '/forms/about-kvk/infrastructure' },
            { label: 'Land Details', path: '/forms/about-kvk/land-details' },
            { label: 'Staff Quarters', path: '/forms/performance/infrastructure/staff-quarters', moduleCode: 'performance_indicators_infrastructure' },
        ],
    },
    {
        title: 'Vehicles',
        icon: <Truck className="w-5 h-5" />,
        items: [
            { label: 'View Vehicles', path: '/forms/about-kvk/vehicles' },
            { label: 'Vehicle Details', path: '/forms/about-kvk/vehicle-details' },
        ],
    },
    {
        title: 'Equipments',
        icon: <Wrench className="w-5 h-5" />,
        items: [
            { label: 'View Equipments', path: '/forms/about-kvk/equipments' },
            { label: 'Equipment Details', path: '/forms/about-kvk/equipment-details' },
        ],
    },
]

export const AboutKVKTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="About KVK"
            description="Manage KVK basic information, staff, infrastructure, vehicles, and equipments"
            sections={sections}
        />
    )
}
