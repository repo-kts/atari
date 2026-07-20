import React from 'react'
import { Users, IndianRupee, Building2, Wrench } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Employee Masters',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Staff Category Master', path: '/all-master/staff-category' },
            { label: 'Sanctioned Post Master', path: '/all-master/sanctioned-post' },
            { label: 'Discipline Master', path: '/all-master/discipline' },
            { label: 'Pay Level Master', path: '/all-master/pay-level' },
            { label: 'Pay Scale Master', path: '/all-master/pay-scale' },
            { label: 'Job Type Master', path: '/all-master/job-type' },
        ],
    },
    {
        title: 'Bank Masters',
        icon: <IndianRupee className="w-5 h-5" />,
        items: [
            { label: 'Bank Account Type Master', path: '/all-master/bank-account-type' },
        ],
    },
    {
        title: 'Infrastructure Master',
        icon: <Building2 className="w-5 h-5" />,
        items: [
            { label: 'Infrastructure Master', path: '/all-master/infrastructure-master' },
            // BLA-49: Land Item Master is intentionally hidden.
            // { label: 'Land Item Master', path: '/all-master/land-item-master' },
        ],
    },
    {
        title: 'Assets & Equipment Master',
        icon: <Wrench className="w-5 h-5" />,
        items: [
            { label: 'Vehicle Type Master', path: '/all-master/vehicle-type' },
            { label: 'Equipment Type Master', path: '/all-master/equipment-type' },
            { label: 'Equipment Master', path: '/all-master/equipment-master' },
            { label: 'Asset Status Master', path: '/all-master/vehicle-present-status' },
        ],
    },
]

export const AboutKvkMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="About KVK Master"
            description="Manage employee, bank, infrastructure, and asset master data"
            sections={sections}
        />
    )
}
