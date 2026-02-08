import React from 'react'
import {
    Building2,
    Truck,
    Wrench,
    FileText,
} from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'View KVKs',
        icon: <Building2 className="w-5 h-5" />,
        items: [
            { label: 'View KVKs', path: '/forms/about-kvk/view-kvks' },
        ],
    },
    {
        title: 'Basic Information',
        icon: <FileText className="w-5 h-5" />,
        items: [
            { label: 'Bank Account Details', path: '/forms/about-kvk/bank-account' },
            { label: 'Employee Details', path: '/forms/about-kvk/employee-details' },
            { label: 'Staff Transferred', path: '/forms/about-kvk/staff-transferred' },
            { label: 'Infrastructure Details', path: '/forms/about-kvk/infrastructure' },
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
    {
        title: 'Farm Implements',
        icon: <Wrench className="w-5 h-5" />,
        items: [
            { label: 'Farm Implement Details', path: '/forms/about-kvk/farm-implements' },
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
