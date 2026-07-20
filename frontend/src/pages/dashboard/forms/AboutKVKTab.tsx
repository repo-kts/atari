import React from 'react'
import {
    Building2,
    Users,
    Map,
    Truck,
    Wrench,
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

// Groups mirror the all-reports "About KVK" taxonomy
// (src/config/reportIndexTaxonomy.ts → REPORT_INDEX_TAXONOMY.about).
const sections: FeatureSection[] = [
    {
        title: 'Basic Information',
        icon: <Building2 className="w-5 h-5" />,
        items: [
            { label: 'View KVKs', path: '/forms/about-kvk/view-kvks' },
            { label: 'Bank Account Details', path: '/forms/about-kvk/bank-account' },
        ],
    },
    {
        title: 'Employee Information',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Employee Details', path: '/forms/about-kvk/employee-details' },
            { label: 'Details of Staff Transferred', path: '/forms/about-kvk/staff-transferred' },
        ],
    },
    {
        title: 'Infrastructure Information',
        icon: <Map className="w-5 h-5" />,
        items: [
            { label: 'Infrastructure Details', path: '/forms/about-kvk/infrastructure' },
            // BLA-49: Land Details is hidden; Land Item Master remains available.
            // { label: 'Land Details', path: '/forms/about-kvk/land-details' },
            { label: 'Staff Quarters', path: '/forms/performance/infrastructure/staff-quarters', moduleCode: 'performance_indicators_staff_quarters' },
        ],
    },
    {
        title: 'Vehicles Information',
        icon: <Truck className="w-5 h-5" />,
        items: [
            { label: 'Vehicles', path: '/forms/about-kvk/vehicles' },
            { label: 'Vehicle Details', path: '/forms/about-kvk/vehicle-details' },
        ],
    },
    {
        title: 'Equipments Information',
        icon: <Wrench className="w-5 h-5" />,
        items: [
            { label: 'Equipments', path: '/forms/about-kvk/equipments' },
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
