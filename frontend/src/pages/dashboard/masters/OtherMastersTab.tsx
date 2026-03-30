import React from 'react'
import { Calendar, IndianRupee, Users } from 'lucide-react'
import { FeatureTabLayout, FeatureSection } from '../shared/FeatureTabLayout'

const sections: FeatureSection[] = [
    {
        title: 'Employee Masters',
        icon: <Users className="w-5 h-5" />,
        items: [
            { label: 'Staff Category Master', path: '/all-master/staff-category' },
            { label: 'Pay Level Master', path: '/all-master/pay-level' },
            { label: 'Sanctioned Post Master', path: '/all-master/sanctioned-post' },
            { label: 'Discipline Master', path: '/all-master/discipline' },
        ],
    },
    {
        title: 'Calendar & Context Masters',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'Season Master', path: '/all-master/season' },
            { label: 'Year Master', path: '/all-master/year' },
            { label: 'Crop Type Master', path: '/all-master/crop-type' },
            { label: 'Important Day Master', path: '/all-master/important-day' },
        ],
    },
    {
        title: 'Resource Masters',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'Infrastructure Master', path: '/all-master/infrastructure-master' },
            { label: 'Soil Water Analysis Master', path: '/all-master/soil-water-analysis' },
        ],
    },
    {
        title: 'NARI Masters',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'NARI Activity Master', path: '/all-master/nari-activity' },
            { label: 'NARI Nutrition Garden Type Master', path: '/all-master/nari-nutrition-garden-type' },
            { label: 'NARI Crop Category Master', path: '/all-master/nari-crop-category' },
        ],
    },
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
    {
        title: 'Performance Indicator Masters',
        icon: <Calendar className="w-5 h-5" />,
        items: [
            { label: 'Impact Specific Area Master', path: '/all-master/impact-specific-area' },
            { label: 'Type of Enterprise Master', path: '/all-master/enterprise-type' },
            { label: 'Account Type Master', path: '/all-master/account-type' },
            { label: 'Programme Type Master', path: '/all-master/programme-type' },
            { label: 'PPV & FRA Training Type Master', path: '/all-master/ppv-fra-training-type' },
            { label: 'VIP Dignitary Master', path: '/all-master/dignitary-type' },
        ],
    },
    {
        title: 'Project wise Budget Masters',
        icon: <IndianRupee className="w-5 h-5" />,
        items: [
            { label: 'Funding Agency Master', path: '/all-master/funding-agency' },
            { label: 'Financial Project Master', path: '/all-master/financial-project' },
        ],
    },
]

export const OtherMastersTab: React.FC = () => {
    return (
        <FeatureTabLayout
            title="Other Masters"
            description="Manage employee, training, extension, and other master data"
            sections={sections}
        />
    )
}
